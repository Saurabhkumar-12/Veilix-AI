/**
 * aiService.js
 *
 * AI-based permission analysis service.
 *
 * Architecture:
 *   Backend provides ALL facts → AI reasons over those facts → UI shows result
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getPermissionMeta } = require('../backend/risk-engine/permissionKnowledge');
const { getCategoryProfile, normalizeCategory } = require('../backend/risk-engine/categoryKnowledge');
const { determineClassification, classificationToStatus } = require('../backend/risk-engine/riskEngine');

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_CLASSIFICATIONS = ['REQUIRED', 'OPTIONAL', 'SUSPICIOUS', 'DANGEROUS', 'UNKNOWN'];
const VALID_CONFIDENCE      = ['high', 'medium', 'low'];
const AI_TIMEOUT_MS         = 10000;

// ─── Classification → User Recommendation ────────────────────────────────────

/**
 * Converts an AI classification into a user-facing recommendation string.
 */
function classificationToRecommendation(classification) {
  switch (classification) {
    case 'REQUIRED':    return 'YES — You may allow';
    case 'OPTIONAL':    return 'YES — You may allow if you need this feature';
    case 'SUSPICIOUS':  return 'NO — Better not to allow';
    case 'DANGEROUS':   return 'NO — Better not to allow';
    case 'UNKNOWN':     return 'NO — You do not need to allow this yet';
    default:            return 'NO — You do not need to allow this yet';
  }
}

// ─── Schema Validator ─────────────────────────────────────────────────────────

/**
 * Validates a single AI-returned permission entry.
 */
function validateEntry(entry, allowedPermissions) {
  if (!entry || typeof entry !== 'object') {
    return { valid: false, error: 'Entry is not an object' };
  }

  const perm = (entry.permission || '').trim().toUpperCase();
  if (!perm) {
    return { valid: false, error: 'Missing "permission" field' };
  }

  // Reject any permission the backend did not send — AI cannot invent new ones
  if (allowedPermissions.length > 0 && !allowedPermissions.includes(perm)) {
    return { valid: false, error: `AI returned permission "${perm}" that was not in the input list` };
  }

  if (!VALID_CLASSIFICATIONS.includes(entry.classification)) {
    return { valid: false, error: `Invalid classification "${entry.classification}"` };
  }

  if (typeof entry.reason !== 'string' || entry.reason.trim().length < 8) {
    return { valid: false, error: 'Missing or too-short "reason" field' };
  }

  const confidence = entry.ai_confidence || 'medium';
  if (!VALID_CONFIDENCE.includes(confidence)) {
    return { valid: false, error: `Invalid ai_confidence "${confidence}"` };
  }

  return {
    valid: true,
    item: {
      permission:     perm,
      classification: entry.classification,
      reason:         entry.reason.trim(),
      ai_confidence:  confidence,
    }
  };
}

/**
 * Validates the full AI response array.
 */
function validateAIResponse(parsed, allowedPermissions) {
  if (!Array.isArray(parsed)) {
    return { valid: false, results: [], errors: ['AI response is not a JSON array'] };
  }

  const errors  = [];
  const results = [];
  const seen    = new Set();

  for (const entry of parsed) {
    const check = validateEntry(entry, allowedPermissions);
    if (!check.valid) {
      errors.push(check.error);
      continue;
    }

    if (seen.has(check.item.permission)) {
      errors.push(`Duplicate entry for permission "${check.item.permission}" — skipping`);
      continue;
    }

    seen.add(check.item.permission);
    results.push(check.item);
  }

  if (results.length === 0) {
    return { valid: false, results: [], errors: ['No valid entries in AI response', ...errors] };
  }

  return { valid: true, results, errors };
}

// ─── Honest Fallback ──────────────────────────────────────────────────────────

/**
 * Generates a deterministic, knowledge-base-derived fallback for a single permission.
 */
function buildHonestFallback(permEvidence, appContext) {
  const { permission_id, official_description, typical_categories, verified_features, sensitivity } = permEvidence;
  const normCategory = normalizeCategory(appContext.category, appContext.name, appContext.description_excerpt);
  const profile = getCategoryProfile(normCategory);

  const classificationResult = determineClassification(permission_id, verified_features, profile, normCategory, sensitivity);
  const classification = classificationResult.classification;
  const confidence = classificationResult.confidence;
  const evidence = classificationResult.evidence;

  let reason = official_description;
  if (classification === 'REQUIRED') {
    reason = `${official_description} This permission is standard and expected for this category of application.`;
  } else if (classification === 'OPTIONAL') {
    if (verified_features.length > 0) {
      reason = `${official_description} The app description mentions a related feature: ${verified_features.join(', ')}. You may allow it if you use this feature.`;
    } else {
      reason = `${official_description} This permission is typical for this category. You may allow it if you use related features.`;
    }
  } else if (classification === 'SUSPICIOUS' || classification === 'DANGEROUS') {
    reason = `${official_description} This permission does not appear to be necessary for the stated purpose. No related feature was found in the app description.`;
  } else if (classification === 'UNKNOWN') {
    reason = `${official_description} Static evidence is insufficient to determine whether this permission is required or optional.`;
  }

  return {
    permission:     permission_id,
    classification,
    reason,
    ai_confidence:  classification === 'UNKNOWN' ? 'low' : classification === 'REQUIRED' || classification === 'OPTIONAL' ? 'medium' : 'high',
    source:         'knowledge-base-fallback',
  };
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

/**
 * Builds the Gemini prompt from the pre-assembled evidence bundle.
 */
function buildPrompt(evidenceBundle) {
  const { app_context, permissions } = evidenceBundle;

  return `You are an evidence-based application permission security analyst.
Your job is to generate a concise, user-friendly explanation and recommendation for each requested permission based ONLY on the supplied evidence.

═══ APP INFORMATION (provided by backend — treat as facts) ═══
Name:        ${app_context.name}
Category:    ${app_context.category}
Developer:   ${app_context.developer}
Installs:    ${app_context.installs}
Rating:      ${app_context.rating}
Description: ${app_context.description_excerpt}

═══ PERMISSION EVIDENCE BUNDLES (provided by backend — treat as facts) ═══
${JSON.stringify(permissions, null, 2)}

═══ STRICT ANALYSIS RULES ═══
1. Use ONLY the supplied evidence.
2. Never invent application features, functionalities, or services.
3. Never invent runtime behaviors (e.g. do NOT claim "the app secretly records microphone data" or "steals contacts" unless explicit evidence exists). Use phrasing like "Static analysis cannot determine whether it is actively used" or "could expose contacts if granted".
4. Never invent vulnerabilities, malware claims, or security incidents.
5. Never invent permission requirements.
6. Never override the supplied permission metadata (such as the backend-calculated classification).
7. If the evidence is insufficient to determine why a permission is needed, return classification "UNKNOWN" and explain this uncertainty honestly (e.g. "Static metadata does not provide enough evidence to determine whether this feature is core or optional").
8. Do not call an app malicious based solely on static permissions.
9. Every explanation and recommendation must be grounded in and directly reference the supplied evidence.
10. Return exactly ${permissions.length} entries — one per permission in the bundle.

═══ RESPONSE FORMAT ═══
Return ONLY a valid JSON array. No markdown, no commentary, no code fences.

[
  {
    "permission": "EXACT_PERMISSION_ID_FROM_THE_BUNDLE",
    "classification": "REQUIRED" | "OPTIONAL" | "SUSPICIOUS" | "DANGEROUS" | "UNKNOWN",
    "reason": "1-2 sentence explanation grounded strictly in the supplied evidence. If classification is UNKNOWN, explain the uncertainty.",
    "ai_confidence": "high" | "medium" | "low"
  }
]
`;
}

// ─── Main AI Analyzer ─────────────────────────────────────────────────────────

/**
 * Calls Gemini with the pre-assembled evidence bundle and returns validated results.
 */
async function analyzePermissionsWithAI(evidenceBundle) {
  const apiKey = process.env.GEMINI_API_KEY;
  const { permissions, app_context } = evidenceBundle;

  if (!permissions || permissions.length === 0) {
    return [];
  }

  const allowedPermissions = permissions.map(p => p.permission_id);

  // ── No valid API key → fall back immediately ─────────────────────────────
  const keyMissing = !apiKey ||
    apiKey.trim() === '' ||
    apiKey.includes('YOUR_GEMINI') ||
    apiKey.includes('your_key') ||
    apiKey.length < 20;

  if (keyMissing) {
    console.warn('[AI Service] No valid GEMINI_API_KEY found — using knowledge-base fallback.');
    return permissions.map(p => buildHonestFallback(p, app_context));
  }

  const prompt = buildPrompt(evidenceBundle);

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

  const systemInstruction = `You are an evidence-based application permission security analyst. You analyze Android app permissions strictly based on the evidence provided to you. You never invent application features, URLs, or claims not present in the evidence. You return only valid JSON arrays with no markdown wrapping.`;

  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const result = await model.generateContent(
        {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction,
        },
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      const rawText   = result.response.text();
      const cleanText = rawText
        .replace(/^```[a-zA-Z]*\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();

      const parsed     = JSON.parse(cleanText);
      const validation = validateAIResponse(parsed, allowedPermissions);

      if (validation.errors.length > 0) {
        console.warn('[AI Service] Validation warnings:', validation.errors.join('; '));
      }

      if (validation.valid) {
        console.log(`[AI Service] Gemini returned valid analysis for ${validation.results.length}/${allowedPermissions.length} permissions.`);

        const aiMap = {};
        for (const r of validation.results) {
          aiMap[r.permission] = r;
        }

        return allowedPermissions.map(pid => {
          if (aiMap[pid]) {
            return { ...aiMap[pid], source: 'gemini-ai' };
          }
          console.warn(`[AI Service] AI did not return result for permission "${pid}" — using fallback.`);
          const evidenceEntry = permissions.find(p => p.permission_id === pid);
          return buildHonestFallback(evidenceEntry, app_context);
        });
      }

      lastError = new Error(`AI response schema invalid: ${validation.errors.join('; ')}`);
      console.warn(`[AI Service] Attempt ${attempt} failed schema validation:`, lastError.message);

    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;

      if (err.name === 'AbortError' || err.message === 'AI_TIMEOUT') {
        console.warn(`[AI Service] Request timed out on attempt ${attempt}.`);
        break;
      }

      const isPermanentError = err.message && (
        err.message.includes('404') ||
        err.message.includes('no longer available') ||
        err.message.includes('403') ||
        err.message.includes('API_KEY_INVALID')
      );
      if (isPermanentError) {
        console.warn(`[AI Service] Permanent API error — not retrying.`);
        break;
      }

      if (attempt < 2) {
        console.warn(`[AI Service] Attempt ${attempt} failed (${err.message}) — retrying once.`);
        await new Promise(r => setTimeout(r, 800));
      } else {
        console.warn(`[AI Service] Attempt ${attempt} failed (${err.message}) — falling back.`);
      }
    }
  }

  clearTimeout(timeoutId);
  console.warn('[AI Service] Using knowledge-base fallback after AI failure.');
  return permissions.map(p => buildHonestFallback(p, app_context));
}

module.exports = {
  analyzePermissionsWithAI,
  classificationToRecommendation,
  validateAIResponse,
  buildHonestFallback,
};
