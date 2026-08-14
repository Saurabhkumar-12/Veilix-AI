/**
 * riskEngine.js
 *
 * Cybersecurity-grade Android Permission & Privacy Risk Engine.
 *
 * Scoring Philosophy:
 * - Never mark permissions as "dangerous" purely by existence.
 * - Always weigh permission intent against App Category + App Metadata (Installs, Ratings, Developer Trust).
 * - High-profile verified apps (Spotify, WhatsApp, Maps) with 100M+ installs receive contextual trust discounts.
 * - Out-of-context suspicious permissions (Calculator requesting SMS/GPS) trigger high risk scores.
 *
 * Output Schema:
 * {
 *   appName, developer, category, downloads, rating,
 *   riskScore (0-100),
 *   overallRisk ("Very Safe" | "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk"),
 *   verdict ("SAFE_TO_INSTALL" | "INSTALL_WITH_CAUTION" | "MODERATE_RISK" | "HIGH_RISK" | "AVOID"),
 *   recommendation ("Safe to Install" | "Install with Caution" | "Moderate Privacy Risk" | "High Privacy Risk" | "Avoid Installing"),
 *   summary,
 *   permissions: [ { name, purpose, status: "Essential"|"Expected"|"Optional"|"Suspicious"|"High Risk", risk: "Low"|"Medium"|"High"|"Critical", reason } ],
 *   positiveIndicators: [...],
 *   privacyConcerns: [...],
 *   negativeIndicators: [...],
 *   recommendations: [...],
 *   saferAlternatives: [...],
 *   source: "rule-engine-fallback"
 * }
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getPermissionMeta, isCriticalPermission, normalizePermissions, extractVerifiedFeatures } = require('./permissionKnowledge');
const { normalizeCategory, getCategoryProfile } = require('./categoryKnowledge');
const { saferAlternatives } = require('./categoryBaseline');

// Session-level in-memory cache
const _sessionCache = {};

// Known trusted developers (Lower base risk for legitimate apps)
const TRUSTED_DEVELOPERS = [
  'google llc', 'whatsapp llc', 'spotify ab', 'meta platforms, inc.', 'instagram', 
  'microsoft corporation', 'telegram fz-llc', 'discord inc.', 'signal foundation',
  'uber technologies, inc.', 'netflix, inc.', 'amazon mobile llc', 'adobe', 'twitter, inc.', 'x corp.'
];

const SYSTEM_REQUIRED = new Set([
  'INTERNET', 'ACCESS_NETWORK_STATE', 'ACCESS_WIFI_STATE',
  'VIBRATE', 'WAKE_LOCK', 'FOREGROUND_SERVICE',
  'RECEIVE_BOOT_COMPLETED', 'POST_NOTIFICATIONS',
  'CHANGE_NETWORK_STATE', 'CHANGE_WIFI_STATE',
  'REQUEST_INSTALL_PACKAGES', 'SCHEDULE_EXACT_ALARM',
  'USE_EXACT_ALARM'
]);

/**
 * Parses numeric installs count from string.
 */
function parseInstalls(installsStr) {
  if (!installsStr) return 0;
  const clean = installsStr.toString().replace(/[,+]/g, '').trim().toLowerCase();
  if (clean.includes('b')) return parseFloat(clean) * 1_000_000_000;
  if (clean.includes('m')) return parseFloat(clean) * 1_000_000;
  if (clean.includes('k')) return parseFloat(clean) * 1000;
  const val = parseInt(clean, 10);
  return isNaN(val) ? 0 : val;
}

/**
 * Calculates 5-tier Verdict & Recommendation from Risk Score (0-100).
 */
function generateVerdict(riskScore) {
  let overallRisk = 'Very Safe';
  let verdict = 'SAFE_TO_INSTALL';
  let recommendation = 'Safe to Install';

  if (riskScore <= 20) {
    overallRisk = 'Very Safe';
    verdict = 'SAFE_TO_INSTALL';
    recommendation = 'Safe to Install';
  } else if (riskScore <= 45) {
    overallRisk = 'Low Risk';
    verdict = 'INSTALL_WITH_CAUTION';
    recommendation = 'Install with Caution';
  } else if (riskScore <= 70) {
    overallRisk = 'Moderate Risk';
    verdict = 'MODERATE_RISK';
    recommendation = 'Moderate Privacy Risk';
  } else if (riskScore <= 85) {
    overallRisk = 'High Risk';
    verdict = 'HIGH_RISK';
    recommendation = 'High Privacy Risk';
  } else {
    overallRisk = 'Critical Risk';
    verdict = 'AVOID';
    recommendation = 'Avoid Installing';
  }

  return { overallRisk, verdict, recommendation };
}

/**
 * Maps classification string to legacy status label.
 */
function classificationToStatus(classification) {
  switch (classification) {
    case 'REQUIRED':    return 'Required';
    case 'OPTIONAL':    return 'Optional';
    case 'SUSPICIOUS':  return 'Suspicious';
    case 'DANGEROUS':   return 'High Risk';
    case 'UNKNOWN':     return 'Needs Review';
    default:            return 'Needs Review';
  }
}

/**
 * Deterministic Backend Permission Classifier.
 */
function determineClassification(permId, verifiedFeatures, categoryProfile, categoryName, sensitivity) {
  if (SYSTEM_REQUIRED.has(permId)) {
    return {
      classification: 'REQUIRED',
      confidence: 90,
      evidence: ['Standard system permission required for basic app operations.']
    };
  }

  const isExpected = categoryProfile.expected.includes(permId);
  const isOptional = categoryProfile.optional.includes(permId);
  const isSuspicious = categoryProfile.suspicious.includes(permId);

  // If description explicitly mentions matching features
  if (verifiedFeatures && verifiedFeatures.length > 0) {
    if (isSuspicious) {
      return {
        classification: 'OPTIONAL',
        confidence: 75,
        evidence: verifiedFeatures
      };
    }
    const classification = isExpected ? 'REQUIRED' : 'OPTIONAL';
    return {
      classification,
      confidence: 90,
      evidence: verifiedFeatures
    };
  }

  // If description doesn't explicitly mention features
  if (isExpected) {
    return {
      classification: 'REQUIRED',
      confidence: 85,
      evidence: [`Expected core permission for the ${categoryName} app category.`]
    };
  }

  if (isOptional) {
    return {
      classification: 'OPTIONAL',
      confidence: 70,
      evidence: [`Standard optional permission for the ${categoryName} app category.`]
    };
  }

  if (isSuspicious) {
    const classification = (sensitivity === 'HIGH' || sensitivity === 'CRITICAL') ? 'DANGEROUS' : 'SUSPICIOUS';
    return {
      classification,
      confidence: 85,
      evidence: [`Atypical permission for the ${categoryName} app category.`]
    };
  }

  // Default: not in profile
  return {
    classification: 'UNKNOWN',
    confidence: 45,
    evidence: ['Requested in AndroidManifest.xml (No explicit feature evidence in app description).']
  };
}

/**
 * Unified, reproducible Risk Scoring Algorithm.
 */
function calculateRiskScore(appMetadata, permissions) {
  const normDev = (appMetadata.developer || '').toLowerCase();
  const installCount = parseInstalls(appMetadata.installs);
  const isTrustedDev = TRUSTED_DEVELOPERS.some(td => normDev.includes(td));
  
  let baseScore = 0;
  let dangerousCount = 0;
  let suspiciousCount = 0;

  const hasCamera = permissions.some(p => p.id === 'CAMERA' || p.name === 'CAMERA');
  const hasMic = permissions.some(p => p.id === 'RECORD_AUDIO' || p.name === 'RECORD_AUDIO');
  const hasLocation = permissions.some(p => (p.id || p.name || '').includes('LOCATION'));
  const hasContacts = permissions.some(p => (p.id || p.name || '').includes('CONTACTS'));
  const hasSms = permissions.some(p => (p.id || p.name || '').includes('SMS'));

  let combinationBonus = 0;
  
  const isJustified = (pId) => {
    const p = permissions.find(x => x.id === pId || x.name === pId);
    if (!p) return false;
    const c = (p.classification || p.status || '').toUpperCase();
    return c === 'REQUIRED' || c === 'ESSENTIAL' || c === 'EXPECTED' || c === 'OPTIONAL';
  };

  if (hasCamera && hasMic && (!isJustified('CAMERA') || !isJustified('RECORD_AUDIO'))) {
    combinationBonus += 12;
  }
  if (hasLocation && hasContacts && (!isJustified('ACCESS_FINE_LOCATION') || !isJustified('READ_CONTACTS'))) {
    combinationBonus += 15;
  }
  if (hasSms && hasContacts && (!isJustified('SEND_SMS') || !isJustified('READ_CONTACTS'))) {
    combinationBonus += 18;
  }

  for (const p of permissions) {
    const permId = normalizePermissions(p.id || p.name);
    const meta = getPermissionMeta(permId);
    const sensitivity = p.sensitivity || meta.sensitivity || 'MEDIUM';
    
    const rawClass = (p.classification || p.status || '').toUpperCase();
    let classification = 'UNKNOWN';
    if (rawClass === 'REQUIRED' || rawClass === 'ESSENTIAL' || rawClass === 'EXPECTED') {
      classification = 'REQUIRED';
    } else if (rawClass === 'OPTIONAL') {
      classification = 'OPTIONAL';
    } else if (rawClass === 'SUSPICIOUS') {
      classification = 'SUSPICIOUS';
      suspiciousCount++;
    } else if (rawClass === 'DANGEROUS' || rawClass === 'HIGH RISK' || rawClass === 'POTENTIALLY EXCESSIVE' || rawClass === 'UNNECESSARY') {
      classification = 'DANGEROUS';
      dangerousCount++;
    }

    if (classification === 'REQUIRED') {
      baseScore += 0;
    } else if (classification === 'OPTIONAL') {
      baseScore += 2;
    } else if (classification === 'UNKNOWN') {
      if (sensitivity === 'CRITICAL') baseScore += 12;
      else if (sensitivity === 'HIGH') baseScore += 8;
      else if (sensitivity === 'MEDIUM') baseScore += 4;
      else baseScore += 1;
    } else if (classification === 'SUSPICIOUS' || classification === 'DANGEROUS') {
      if (sensitivity === 'CRITICAL') baseScore += 35;
      else if (sensitivity === 'HIGH') baseScore += 25;
      else if (sensitivity === 'MEDIUM') baseScore += 15;
      else baseScore += 10;
    }
  }

  baseScore += combinationBonus;

  const mismatchCount = suspiciousCount + dangerousCount;
  baseScore += mismatchCount * 10;

  if (isTrustedDev && installCount >= 100_000_000) {
    baseScore = Math.max(5, baseScore * 0.2); // 80% discount
  } else if (isTrustedDev || installCount >= 10_000_000) {
    baseScore = Math.max(10, baseScore * 0.5); // 50% discount
  } else if (installCount >= 1_000_000) {
    baseScore = Math.max(12, baseScore * 0.8); // 20% discount
  }

  return Math.min(100, Math.max(0, Math.round(baseScore)));
}

/**
 * DETERMINISTIC FALLBACK ANALYSIS ENGINE
 */
function fallbackAnalysis(category, permissions, appMetadata = {}) {
  const normCategory = normalizeCategory(category, appMetadata.appName, appMetadata.description);
  const profile = getCategoryProfile(normCategory);
  
  const normDev = (appMetadata.developer || '').toLowerCase();
  const installCount = parseInstalls(appMetadata.installs);
  const rating = parseFloat(appMetadata.score || 0);

  const isTrustedDev = TRUSTED_DEVELOPERS.some(td => normDev.includes(td));
  const isHighInstalls = installCount >= 100_000_000;
  const isGoodRating = rating >= 4.0;

  const analyzedPermissions = [];
  const positiveIndicators = [];
  const privacyConcerns = [];
  const negativeIndicators = [];

  // Positive trust signals
  if (isTrustedDev) {
    positiveIndicators.push(`Developed by verified software publisher (${appMetadata.developer})`);
  }
  if (installCount >= 1_000_000_000) {
    positiveIndicators.push(`Massive global userbase (${appMetadata.installs} installs on Google Play)`);
  } else if (installCount >= 100_000_000) {
    positiveIndicators.push(`Established application with ${appMetadata.installs} installs`);
  }
  if (isGoodRating) {
    positiveIndicators.push(`High user satisfaction score (${rating.toFixed(1)}★ rating on Play Store)`);
  }

  let suspiciousCount = 0;
  const description = appMetadata.description || '';
  const permissionsToScore = [];

  for (const rawPerm of permissions) {
    const name = normalizePermissions(rawPerm);
    const meta = getPermissionMeta(name);
    const sensitivity = meta.sensitivity || 'MEDIUM';

    const verifiedFeatures = extractVerifiedFeatures(name, description);
    const classificationResult = determineClassification(name, verifiedFeatures, profile, normCategory, sensitivity);
    const classification = classificationResult.classification;
    const confidence = classificationResult.confidence;
    const evidence = classificationResult.evidence;

    const status = classificationToStatus(classification);
    const risk = meta.defaultRisk || 'Low';

    let reason = meta.description || meta.purpose;
    if (classification === 'SUSPICIOUS' || classification === 'DANGEROUS') {
      suspiciousCount++;
      reason = `${meta.description || meta.purpose} This permission is not commonly associated with ${normCategory} apps.`;
      privacyConcerns.push(`Requests ${name} permission which is atypical for ${normCategory} apps.`);
    } else if (classification === 'REQUIRED') {
      reason = meta.description || meta.purpose;
    } else if (classification === 'OPTIONAL') {
      reason = `${meta.description || meta.purpose} You may allow it if you use related features.`;
    } else if (classification === 'UNKNOWN') {
      reason = `${meta.description || meta.purpose} available static evidence does not establish whether this app requires it.`;
    }

    analyzedPermissions.push({
      name,
      purpose: meta.purpose,
      status,
      classification,
      confidence,
      evidence,
      risk,
      reason
    });

    permissionsToScore.push({
      id: name,
      sensitivity,
      classification
    });
  }

  const riskScore = calculateRiskScore(appMetadata, permissionsToScore);
  const { overallRisk, verdict, recommendation } = generateVerdict(riskScore);

  if (suspiciousCount === 0) {
    positiveIndicators.push(`Requested permissions strictly align with standard ${normCategory} app functionality.`);
  } else {
    negativeIndicators.push(`Flagged ${suspiciousCount} permission(s) unnecessary for core ${normCategory} features.`);
  }

  const alts = saferAlternatives[normCategory] || saferAlternatives['Utility'];
  const altList = (alts || []).map(a => `${a.name} - ${a.desc}`);

  const recommendationsList = [];
  if (riskScore <= 20) {
    recommendationsList.push('This app appears safe to install based on permissions and developer reputation.');
    recommendationsList.push('Always keep your device updated to the latest Android security patch.');
  } else if (riskScore <= 45) {
    recommendationsList.push('Review optional permissions during app first launch.');
    recommendationsList.push('Grant location or camera access only while using the app.');
  } else {
    recommendationsList.push(`Consider denying ${suspiciousCount > 0 ? 'suspicious' : 'sensitive'} permissions in Android Settings.`);
    recommendationsList.push('Explore privacy-focused alternatives from F-Droid or verified publishers.');
  }

  const summary = `PermissionGuardian evaluated ${analyzedPermissions.length} requested permission(s) for ${appMetadata.appName || 'this app'} (${normCategory}). ` +
    (suspiciousCount === 0 
      ? `All requested permissions match standard expectations for an established ${normCategory} application.`
      : `Analysis identified ${suspiciousCount} permission(s) that appear unnecessary for standard ${normCategory} features.`);

  return {
    appName: appMetadata.appName || 'Unknown App',
    developer: appMetadata.developer || 'Unknown Developer',
    category: normCategory,
    downloads: appMetadata.installs || 'N/A',
    rating: appMetadata.score ? appMetadata.score.toFixed(1) : 'N/A',
    riskScore,
    overallRisk,
    verdict,
    recommendation,
    summary,
    permissions: analyzedPermissions,
    positiveIndicators,
    privacyConcerns,
    negativeIndicators,
    recommendations: recommendationsList,
    saferAlternatives: altList,
    source: 'rule-engine-fallback'
  };
}

/**
 * Clean markdown wrapper from Gemini response.
 */
function cleanJsonResponse(text) {
  let c = text.trim();
  if (c.startsWith('```')) {
    c = c.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
  }
  return c.trim();
}

/**
 * PRIMARY RISK SCORE ENTRY POINT
 */
async function getRiskScore(category, permissions, appMetadata = {}) {
  const cacheKey = appMetadata.packageId || appMetadata.appName || null;
  if (cacheKey && _sessionCache[cacheKey]) {
    console.log(`[RiskEngine] Cache hit for "${cacheKey}".`);
    return _sessionCache[cacheKey];
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[RiskEngine] Missing GEMINI_API_KEY — running rule-based fallback.');
    return fallbackAnalysis(category, permissions, appMetadata);
  }

  const normCategory = normalizeCategory(category, appMetadata.appName, appMetadata.description);
  const normalizedPermList = permissions.map(p => ({
    name: normalizePermissions(p),
    description: p.description || ''
  }));

  const shortDesc = (appMetadata.summary || appMetadata.description || '').slice(0, 350);

  const prompt = `
You are a Principal Android Security Researcher and Cybersecurity Architect evaluating app permissions.

APP DETAILS:
- Name: ${appMetadata.appName || 'Unknown'}
- Category: ${normCategory}
- Developer: ${appMetadata.developer || 'Unknown'}
- Installs: ${appMetadata.installs || 'N/A'}
- Play Store Rating: ${appMetadata.score ? appMetadata.score.toFixed(1) : 'N/A'}
- Description Summary: ${shortDesc || 'N/A'}

REQUESTED PERMISSIONS:
${JSON.stringify(normalizedPermList, null, 2)}

INSTRUCTIONS:
1. Evaluate whether each requested permission is justified by the app's real functionality.
2. DO NOT label permissions as "dangerous" purely because they exist.
3. Return strict JSON following this exact structure:

{
  "appName": "${appMetadata.appName || 'App'}",
  "developer": "${appMetadata.developer || 'Developer'}",
  "category": "${normCategory}",
  "downloads": "${appMetadata.installs || 'N/A'}",
  "rating": "${appMetadata.score ? appMetadata.score.toFixed(1) : 'N/A'}",
  "riskScore": number (0 to 100),
  "overallRisk": "Very Safe" | "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk",
  "verdict": "SAFE_TO_INSTALL" | "INSTALL_WITH_CAUTION" | "MODERATE_RISK" | "HIGH_RISK" | "AVOID",
  "recommendation": "Safe to Install" | "Install with Caution" | "Moderate Privacy Risk" | "High Privacy Risk" | "Avoid Installing",
  "summary": "Plain-language summary of privacy analysis",
  "permissions": [
    {
      "name": "Permission Short Name",
      "purpose": "What the permission allows",
      "status": "Essential" | "Expected" | "Optional" | "Suspicious" | "High Risk",
      "risk": "Low" | "Medium" | "High" | "Critical",
      "reason": "Specific plain-language explanation of why this app needs or does not need this permission"
    }
  ],
  "positiveIndicators": ["Array of positive trust signals"],
  "privacyConcerns": ["Array of specific privacy concerns or risks"],
  "negativeIndicators": ["Array of negative flags"],
  "recommendations": ["Array of actionable advice for the user"]
}
`;

  const systemInstruction = `You are an expert Android security engineer. You reason contextually about why an app requests permissions. Never output generic boilerplate like "this permission is dangerous". Always explain what feature justifies the permission or why it is suspicious. Return ONLY raw valid JSON.`;

  const apiCallPromise = (async () => {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction,
    });

    const parsed = JSON.parse(cleanJsonResponse(result.response.text()));
    
    // Ensure accurate verdict mapping
    const v = generateVerdict(parsed.riskScore);
    parsed.overallRisk = v.overallRisk;
    parsed.verdict = v.verdict;
    parsed.recommendation = v.recommendation;

    // Attach safer alternatives if needed
    const alts = saferAlternatives[normCategory] || saferAlternatives['Utility'];
    parsed.saferAlternatives = (alts || []).map(a => `${a.name} - ${a.desc}`);
    parsed.source = 'gemini-ai';

    return parsed;
  })();

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), 8500)
  );

  try {
    const res = await Promise.race([apiCallPromise, timeoutPromise]);
    if (cacheKey) _sessionCache[cacheKey] = res;
    return res;
  } catch (err) {
    console.warn(`[RiskEngine] Gemini issue (${err.message}) — executing deterministic rule engine fallback.`);
    return fallbackAnalysis(category, permissions, appMetadata);
  }
}

module.exports = {
  getRiskScore,
  normalizePermissions,
  generateVerdict,
  fallbackAnalysis,
  determineClassification,
  calculateRiskScore,
  classificationToStatus
};
