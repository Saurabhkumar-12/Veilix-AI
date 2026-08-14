/**
 * securityAssessmentService.js
 *
 * Provides final safety assessment calculations, findings, and assistant answers.
 */

const { calculateRiskScore, normalizePermissions } = require('../backend/risk-engine/riskEngine');
const { getPermissionMeta } = require('../backend/risk-engine/permissionKnowledge');

function permissionRisk(permission) {
  const sensitivity = { LOW: 12, MEDIUM: 32, HIGH: 65, CRITICAL: 90 }[permission.sensitivity] || 25;
  const c = (permission.classification || permission.status || '').toUpperCase();
  let mismatch = 0;
  if (c === 'OPTIONAL') mismatch = 4;
  else if (c === 'UNKNOWN' || c === 'NEEDS REVIEW') mismatch = 10;
  else if (c === 'SUSPICIOUS') mismatch = 20;
  else if (c === 'DANGEROUS' || c === 'POTENTIALLY EXCESSIVE' || c === 'HIGH RISK' || c === 'UNNECESSARY') mismatch = 30;
  return Math.min(100, sensitivity + mismatch + (permission.id.includes('BACKGROUND') ? 12 : 0));
}

function levelFor(score) {
  return score <= 20 ? 'SAFE' : score <= 45 ? 'MODERATE' : score <= 70 ? 'HIGH' : 'CRITICAL';
}

function assess(report) {
  const permissions = Array.isArray(report.permissions) ? report.permissions : [];
  const scored = permissions.map(permission => ({
    ...permission,
    riskScore: permissionRisk(permission)
  }));

  const score = calculateRiskScore(report, scored);
  const level = levelFor(score);

  const sensitive = scored.filter(item => ['HIGH', 'CRITICAL'].includes(item.sensitivity));
  const mismatches = scored.filter(item => ['SUSPICIOUS', 'DANGEROUS'].includes(item.classification));
  const critical = scored.filter(item => item.sensitivity === 'CRITICAL');

  const majorRisks = [...scored]
    .sort((a, b) => b.riskScore - a.riskScore)
    .filter(item => item.riskScore >= 45)
    .slice(0, 3);

  const recommendations = majorRisks.length
    ? majorRisks.map(item => `${item.permission}: ${item.impact.accessMode}.`)
    : ['No high-risk declared permissions were identified. Review optional permissions before granting them.'];

  // Average confidence of permissions
  const confidence = permissions.length
    ? Math.round(permissions.reduce((sum, item) => sum + (item.confidence || 60), 0) / permissions.length)
    : 45;

  const explanation = score <= 20
    ? 'Declared permissions closely align with the stated purpose.'
    : `${sensitive.length} sensitive declared permission(s) and ${mismatches.length} apparent purpose mismatch(es) drive this score.`;

  // Generate evidence-based findings (Phase 11)
  const findings = [];
  scored.forEach(p => {
    if (p.classification === 'SUSPICIOUS' || p.classification === 'DANGEROUS') {
      findings.push({
        finding: 'Purpose/permission mismatch',
        severity: p.sensitivity === 'CRITICAL' || p.sensitivity === 'HIGH' ? 'High' : 'Medium',
        evidence: [
          `Application category: ${report.category}`,
          `Requested permission: ${p.id}`
        ],
        reason: `${p.permission} access has weak relevance to basic ${report.category} functionality.`,
        confidence: p.confidence >= 80 ? 'HIGH' : p.confidence >= 60 ? 'MEDIUM' : 'LOW',
        recommendation: `Review whether ${p.permission.toLowerCase()}-dependent functionality exists before granting access.`
      });
    }
  });

  return {
    score,
    level,
    permissionSummary: {
      total: permissions.length,
      required: report.counts.required,
      optional: report.counts.optional,
      suspicious: mismatches.length,
      dangerous: critical.length,
      sensitive: sensitive.length
    },
    majorRisks,
    mismatchSummary: mismatches.length
      ? `${mismatches.length} declared permission(s) have weak relevance to the ${report.category} purpose.`
      : `No strong purpose-permission mismatch was found for the stated ${report.category} purpose.`,
    privacyImpact: sensitive.length
      ? 'Sensitive data or device capabilities could be exposed if these declared permissions are granted.'
      : 'Limited privacy impact based on declared permissions.',
    recommendations,
    confidence,
    explanation,
    findings,
    staticAnalysisNotice: 'This is a static assessment of declared permissions; it does not observe runtime behavior.'
  };
}

const { GoogleGenerativeAI } = require('@google/generative-ai');

function validateAssistantAnswer(reply, report) {
  const replyLower = reply.toLowerCase();
  const declaredPerms = (report.permissions || []).map(p => p.permission.toLowerCase());
  const declaredIds = (report.permissions || []).map(p => p.id.toLowerCase());
  
  const ALL_KNOWN_PERMS = [
    { label: 'camera', id: 'camera' },
    { label: 'microphone', id: 'record_audio' },
    { label: 'location', id: 'location' },
    { label: 'contacts', id: 'contacts' },
    { label: 'sms', id: 'sms' },
    { label: 'storage', id: 'storage' },
    { label: 'bluetooth', id: 'bluetooth' },
    { label: 'notification', id: 'notification' },
    { label: 'phone state', id: 'phone_state' },
    { label: 'calendar', id: 'calendar' },
    { label: 'body sensors', id: 'body_sensors' }
  ];

  for (const kp of ALL_KNOWN_PERMS) {
    const isMentioned = replyLower.includes(kp.label) || replyLower.includes(kp.id.replace(/_/g, ' '));
    if (isMentioned) {
      const isDeclared = declaredPerms.some(dp => dp.includes(kp.label)) || 
                         declaredIds.some(di => di.includes(kp.id));
      if (!isDeclared) {
        const claimsAccess = new RegExp(`(requests|needs|uses|accesses|declares|requires|has access to|asks for)\\b.*\\b(${kp.label}|${kp.id})`, 'i').test(replyLower) ||
                             new RegExp(`\\b(${kp.label}|${kp.id})\\b.*\\b(permission|access|request|need|require)`, 'i').test(replyLower);
        if (claimsAccess) {
          console.warn(`[Assistant Validation] AI response hallucinated access to undeclared permission: ${kp.label}`);
          return false;
        }
      }
    }
  }
  return true;
}

async function answer(report, question, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  const q = String(question || '').trim();
  const qLower = q.toLowerCase();

  const assessment = report.securityAssessment || assess(report);
  const risks = assessment.majorRisks || [];

  // Parse target permission from history if pronouns are used in fallback or query mapping
  let lastPermissionFromHistory = null;
  if (Array.isArray(history) && history.length > 0) {
    for (let i = history.length - 1; i >= 0; i--) {
      const msgLower = (history[i].text || '').toLowerCase();
      const found = (report.permissions || []).find(p => 
        msgLower.includes(p.permission.toLowerCase()) ||
        msgLower.includes(p.id.toLowerCase().replace(/_/g, ' '))
      );
      if (found) {
        lastPermissionFromHistory = found;
        break;
      }
    }
  }

  // ── No valid API key -> use deterministic rule-based fallback ────────────────
  const keyMissing = !apiKey ||
    apiKey.trim() === '' ||
    apiKey.includes('YOUR_GEMINI') ||
    apiKey.includes('your_key') ||
    apiKey.length < 20;

  if (keyMissing) {
    console.log('[Security Assistant] No API key — using rule-based answering.');
    return runFallbackAnswering(report, assessment, risks, qLower, history, lastPermissionFromHistory);
  }

  // ── Call Gemini API for rich contextual response ───────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const systemInstruction = `You are the Veilix AI Security Assistant.
You answer questions using ONLY the supplied application analysis evidence.

Rules:
1. Answer the user's actual question. Do not just output a generic analysis summary unless the user specifically asks for it.
2. Use the supplied app analysis context and the conversation history context.
3. Never invent facts, permissions, vulnerabilities, or claim runtime behaviors from static analysis.
4. If the evidence is insufficient to answer the question, say: "The current static analysis does not provide enough evidence to determine that."
5. Be concise, professional, and directly address the user's inquiry.
6. For safety/risk questions (e.g. "Is this app safe?", "Why is it risky?"), structure your response as:
Overall assessment:
[level] permission risk ([score]/100)

Why:
- [actual factor from findings or mismatched permissions]
- [actual factor]

Limitations:
Static analysis of declared permissions cannot confirm runtime behavior.

7. For permission-specific questions (e.g. "why does it need camera?"):
Permission:
[Permission Label]

Risk:
[Sensitivity or risk level]

Why:
[Grounded reason from evidence]

Evidence:
[Supplied description evidence or 'None found']

Recommendation:
[Action Mode recommendation]`;

    let historyContext = '';
    if (Array.isArray(history) && history.length > 0) {
      historyContext = '\n═══ CONVERSATION HISTORY ═══\n' +
        history.slice(-6).map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n') + '\n';
    }

    const prompt = `═══ APP ANALYSIS DETAILS ═══
App Name:       ${report.name}
Category:       ${report.category}
Risk Score:     ${report.privacyScore || report.securityAssessment?.score || 0}/100 (${report.overallRisk || report.securityAssessment?.level || 'Low Risk'})
Summary:        ${report.summary || report.securityAssessment?.explanation || 'No summary available.'}

Permissions:
${JSON.stringify((report.permissions || []).map(p => ({
  name: p.permission,
  id: p.id,
  classification: p.classification,
  what_it_does: p.what_it_does,
  reason: p.reason,
  sensitivity: p.sensitivity,
  evidence: p.evidence,
  recommendation: p.recommendation
})), null, 2)}

Findings:
${JSON.stringify((report.securityAssessment?.findings || []), null, 2)}
${historyContext}
═══ USER QUESTION ═══
"${q}"

Provide a direct, helpful, and concise answer based only on the facts and conversation history.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction,
    });

    const reply = result.response.text().trim();
    if (reply.length > 5) {
      if (validateAssistantAnswer(reply, report)) {
        return reply;
      }
      console.warn('[Security Assistant] AI response failed permission validation — using fallback.');
    }
    throw new Error('Invalid AI response');
  } catch (err) {
    console.warn('[Security Assistant] API failed or rejected — using fallback:', err.message);
    return runFallbackAnswering(report, assessment, risks, qLower, history, lastPermissionFromHistory);
  }
}

/** Rule-based fallback answering when AI is offline or fails validation */
function runFallbackAnswering(report, assessment, risks, qLower, history = [], lastPermissionFromHistory = null) {
  // A. Overall safety / Trust
  if (qLower.includes('safe') || qLower.includes('trust') || qLower.includes('install')) {
    const listWhy = (assessment.findings || []).map(f => `- ${f.reason}`).join('\n') || 
                    (risks.length ? risks.map(r => `- Declared permission ${r.permission} presents high risk (${r.riskScore}/100)`).join('\n') : '- No significant permission risks detected.');
    return `Overall assessment:
${assessment.level} permission risk (${assessment.score}/100)

Why:
${listWhy}

Limitations:
This assessment is based on static analysis of declared permissions and available app metadata. It does not confirm runtime behavior.`;
  }

  // B. Privacy risks
  if (qLower.includes('spy') || qLower.includes('track') || qLower.includes('record') || qLower.includes('privacy')) {
    return `Static permission analysis cannot establish whether the application is spying on you or tracking you. It can show which sensitive capabilities the application requests. The privacy risk score for this app is ${assessment.score}/100.`;
  }

  // C. Most dangerous permission
  if (qLower.includes('biggest') || qLower.includes('risky') || qLower.includes('concern') || qLower.includes('most dangerous') || qLower.includes('worst')) {
    return risks.length 
      ? `The highest-risk declared permission is ${risks[0].permission} (${risks[0].riskScore || permissionRisk(risks[0])}/100): ${risks[0].reason}` 
      : 'No high-risk declared permission was identified from the available analysis.';
  }

  // D. Recommendations / Deny
  if (qLower.includes('deny') || qLower.includes('unnecessary') || qLower.includes('block') || qLower.includes('should i allow')) {
    if (risks.length > 0) {
      return `Based on analysis, you should review or deny: ${risks.map(r => r.permission).join(', ')}. Actionable recommendation: ${assessment.recommendations.join(' ')}`;
    }
    return `No critical permission denials are recommended. Actionable recommendation: ${assessment.recommendations.join(' ')}`;
  }

  // E. Risk explanation / why is score high
  if (qLower.includes('why') && (qLower.includes('score') || qLower.includes('high') || qLower.includes('risky'))) {
    return `The score is ${assessment.score}/100 mainly because:
1. ${assessment.explanation}
2. This is based on category ${report.category || 'Utility'} expectations.`;
  }

  // F. General product questions
  if (qLower.includes('veilix') || qLower.includes('what do you do') || qLower.includes('what is this') || qLower.includes('permissionguard')) {
    return 'Veilix AI is an advanced application privacy scanner. It performs static analysis on declared AndroidManifest.xml permissions, cross-references Play Store metadata descriptions to verify features, and uses a deterministic risk engine to detect suspicious permission mismatches.';
  }

  // G. Permission-specific lookup (checks current question or resolved history)
  let matching = (report.permissions || []).find(item => 
    qLower.includes(item.permission.toLowerCase()) || 
    qLower.includes(item.id.toLowerCase().replace(/_/g, ' '))
  );

  if (!matching && lastPermissionFromHistory) {
    if (qLower.includes('it') || qLower.includes('this') || qLower.includes('allow') || qLower.includes('deny') || qLower.includes('why') || qLower.includes('need')) {
      matching = lastPermissionFromHistory;
    }
  }

  if (matching) {
    const hasEv = Array.isArray(matching.evidence) && matching.evidence.length > 0;
    return `Permission:
${matching.permission}

Risk:
${matching.sensitivity}

Why:
${matching.reason}

Evidence:
${hasEv ? matching.evidence.join(', ') : 'None found (Requested in AndroidManifest.xml only)'}

Recommendation:
${matching.impact?.accessMode || 'Deny access if you do not use features requiring it'}`;
  }

  return `Based on the currently displayed static analysis, ${assessment.explanation} Top review items: ${risks.map(item => item.permission).join(', ') || 'none'}. ${assessment.staticAnalysisNotice}`;
}

module.exports = { assess, answer, permissionRisk, levelFor, validateAssistantAnswer };

