/**
 * privacyAnalysisService.js
 *
 * Orchestrates the full permission analysis pipeline:
 *
 *   1. Risk Engine (riskEngine.js)
 *      → Calculates overall risk score, verdict, and summary
 *      → Also produces initial per-permission classification used as a reference
 *
 *   2. Evidence Collector (evidenceCollector.js)
 *      → Backend collects ALL facts: official descriptions, verified features, real sources
 *      → AI receives only this pre-assembled bundle
 *
 *   3. AI Service (aiService.js)
 *      → Gemini reasons over the evidence bundle
 *      → Returns classification (REQUIRED/OPTIONAL/UNNECESSARY), reason, ai_confidence
 *      → Does NOT generate sources or invent features
 *
 *   4. Merge
 *      → what_it_does  from knowledge base (fact)
 *      → evidence[]    from backend evidence collector (fact)
 *      → sources[]     from backend evidence collector (fact)
 *      → classification, reason, ai_confidence from AI (reasoning)
 *      → recommendation computed from classification
 *
 * The merged permission object is the authoritative final result.
 */

const { fallbackAnalysis, normalizePermissions } = require('../backend/risk-engine/riskEngine');
const { getPermissionMeta }                       = require('../backend/risk-engine/permissionKnowledge');
const { assess, permissionRisk }                  = require('./securityAssessmentService');
const { collectEvidence }                         = require('./evidenceCollector');
const { analyzePermissionsWithAI, classificationToRecommendation } = require('./aiService');

const scanHistory = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a permission ID to a human-readable label */
function label(permission) {
  return permission
    .toLowerCase()
    .split('_')
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Maps AI classification → legacy status for backward compat with
 * existing frontend code that reads p.status.
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
 * Generates the "if denied" impact copy for a permission.
 * Uses classification (not legacy status) for accuracy.
 */
function denialImpact(permissionId, classification) {
  if (permissionId === 'VIBRATE') {
    return {
      ifDenied: 'Alerts, messages, and incoming calls will not trigger device vibration. Visual and audio notifications will still function normally.',
      coreAvailability: 'Mostly available',
      accessMode: 'Allow if you want tactile vibration alerts for notifications',
      androidSteps: ['Settings', 'Apps', 'App name', 'Permissions', 'Vibrate', 'Allow'],
    };
  }
  if (permissionId === 'POST_NOTIFICATIONS') {
    return {
      ifDenied: 'The app will be blocked from sending any status updates, message alerts, or push notifications.',
      coreAvailability: 'Mostly available',
      accessMode: 'Allow if you want to receive notification banners',
      androidSteps: ['Settings', 'Apps', 'App name', 'Notifications', 'Allow notifications'],
    };
  }

  const isCore = classification === 'REQUIRED';
  return {
    ifDenied: isCore
      ? `The related core feature may be unavailable until ${label(permissionId)} is allowed.`
      : `Core app functionality should remain available. Any feature that specifically uses ${label(permissionId)} may not work.`,
    coreAvailability: isCore ? 'Partially available' : 'Mostly available',
    accessMode: isCore
      ? 'Allow only while using the app'
      : 'Deny unless you use the related feature',
    androidSteps: ['Settings', 'Apps', 'App name', 'Permissions', label(permissionId), "Don't allow"],
  };
}

/** Detect third-party SDK signals from the app description */
function sdkSignals(description = '') {
  const text  = description.toLowerCase();
  const rules = [
    ['firebase',          'Firebase',         'Analytics / crash reporting'],
    ['google analytics',  'Google Analytics', 'Analytics'],
    ['facebook',          'Meta SDK',         'Social / analytics'],
    ['crashlytics',       'Crashlytics',      'Crash reporting'],
  ];
  return rules
    .filter(([needle]) => text.includes(needle))
    .map(([, name, type]) => ({ name, type, verified: false }));
}

// ─── Main Analyze Function ─────────────────────────────────────────────────────

/**
 * Analyzes an app's permissions using the full pipeline.
 * This function is now ASYNC because it calls the AI service.
 *
 * @param {object} app     - App details from scraper { name, category, permissions, ... }
 * @param {object} options - { demo: boolean }
 * @returns {Promise<object>} - Full analysis report
 */
async function analyze(app, { demo = false } = {}) {
  const uniquePerms = [...new Set((app.permissions || []).map(p => {
    if (typeof p === 'string') return p.trim();
    return (p.permission || p.permissionId || '').trim();
  }))].filter(Boolean);

  // ── Step 1: Risk engine for overall score & verdict ───────────────────────
  const riskResult = fallbackAnalysis(app.category, uniquePerms, {
    appName: app.name, developer: app.developer,
    installs: app.installs, score: app.rating,
    description: app.description,
  });

  // ── Step 2: Collect backend evidence bundle ───────────────────────────────
  const evidenceBundle = collectEvidence({
    ...app,
    permissions: uniquePerms,
    packageId: app.packageId || app.historyId || null,
  });

  // ── Step 3: AI analysis over evidence ────────────────────────────────────
  let aiResults = [];
  try {
    aiResults = await analyzePermissionsWithAI(evidenceBundle);
  } catch (err) {
    console.error('[Privacy Analysis] AI service error:', err.message, '— using fallback for all.');
    aiResults = [];
  }

  // Build lookup: permissionId → AI result
  const aiMap = {};
  for (const r of aiResults) {
    aiMap[r.permission] = r;
  }

  // Build lookup: permissionId → evidence bundle entry
  const evidenceMap = {};
  for (const e of evidenceBundle.permissions) {
    evidenceMap[e.permission_id] = e;
  }

  // ── Step 4: Merge per-permission data ─────────────────────────────────────
  const permissions = riskResult.permissions.map(riskPerm => {
    const permId = normalizePermissions(riskPerm.name);
    const meta   = getPermissionMeta(permId);
    const aiItem = aiMap[permId];
    const evItem = evidenceMap[permId];

    // Classification: ALWAYS calculate and enforce backend deterministic classification
    const classification = riskPerm.classification || 'UNKNOWN';

    // what_it_does: ALWAYS from the trusted knowledge base, never from AI
    const what_it_does = evItem?.official_description || meta.description || meta.purpose ||
      `Allows the app to use ${label(permId).toLowerCase()}.`;

    // reason: from AI if available, otherwise from fallback
    const reason = aiItem?.reason || riskPerm.reason || what_it_does;

    // evidence[]: from backend evidence collector — keyword matches in description
    const evidence = riskPerm.evidence || evItem?.verified_features || [];

    // sources[]: from backend evidence collector — real, constructable URLs only
    const sources = evItem?.sources || [];

    // ai_confidence: from AI or computed
    const ai_confidence = aiItem?.ai_confidence || (classification === 'UNKNOWN' ? 'low' : 'medium');

    // confidence: numeric confidence
    const confidence = riskPerm.confidence || (classification === 'UNKNOWN' ? 45 : classification === 'REQUIRED' || classification === 'OPTIONAL' ? 75 : 85);

    // source: where classification came from
    const analysisSource = aiItem ? 'gemini-ai' : 'knowledge-base-fallback';

    return {
      id:             permId,
      permission:     label(permId),
      // Legacy status field (backward compat)
      status:         classificationToStatus(classification),
      // New structured fields
      classification,
      recommendation: classificationToRecommendation(classification),
      what_it_does,
      reason,
      evidence,
      sources,
      ai_confidence,
      confidence,
      analysisSource,
      // Technical fields
      risk:           riskPerm.risk,
      sensitivity:    meta.sensitivity,
      riskScore:      permissionRisk({ id: permId, sensitivity: meta.sensitivity, classification, status: classificationToStatus(classification) }),
      purposeRelevance: classification === 'REQUIRED' ? 'Strong'
                      : classification === 'OPTIONAL'  ? 'Feature dependent'
                      : 'Weak',
      privacyImpact:  meta.potentialAbuse,
      impact:         denialImpact(permId, classification),
    };
  });

  // ── Step 5: Build counts & metrics ───────────────────────────────────────
  const counts = {
    total:     permissions.length,
    required:  permissions.filter(p => p.classification === 'REQUIRED').length,
    optional:  permissions.filter(p => p.classification === 'OPTIONAL').length,
    excessive: permissions.filter(p => ['SUSPICIOUS', 'DANGEROUS'].includes(p.classification)).length,
    review:    permissions.filter(p => p.classification === 'UNKNOWN').length,
  };

  const sensitive = permissions.filter(p => ['HIGH', 'CRITICAL'].includes(p.sensitivity)).length;
  const surface   = Math.min(100, Math.round(
    sensitive * 18 +
    counts.excessive * 25 +
    permissions.filter(p => p.id.includes('BACKGROUND')).length * 14 +
    sdkSignals(app.description).length * 5
  ));

  // ── Step 6: Assemble report ───────────────────────────────────────────────
  const report = {
    id:          app.packageId || app.historyId || app.name.toLowerCase().replace(/\W+/g, '-'),
    name:        app.name,
    developer:   app.developer,
    category:    riskResult.category,
    description: app.description || '',
    rating:      app.rating,
    installs:    app.installs,
    icon:        app.icon || '',
    analyzedAt:  new Date().toISOString(),
    dataSource:  demo ? 'Demo dataset' : 'Google Play metadata',
    demo,

    // Risk summary (from risk engine)
    privacyScore: riskResult.riskScore,
    overallRisk:  riskResult.overallRisk,
    summary:      riskResult.summary,

    // Permission analysis (merged)
    counts,
    permissions,
    minimumPermissionSet: permissions.filter(p => p.classification === 'REQUIRED'),
    exposureReduction: counts.total
      ? Math.round(((counts.optional + counts.excessive) / counts.total) * 100)
      : 0,

    riskBreakdown: {
      permissionExposure: Math.min(100, permissions.length * 10),
      dataSensitivity:    Math.min(100, sensitive * 28),
      purposeAlignment:   Math.max(0, 100 - counts.excessive * 35),
      excessiveAccess:    Math.min(100, counts.excessive * 45),
    },
    attackSurface: {
      sensitivePermissions: sensitive,
      potentiallyExcessive: counts.excessive,
      backgroundAccess:     permissions.filter(p => p.id.includes('BACKGROUND')).length,
      thirdPartySdks:       sdkSignals(app.description).length,
      exposureLevel:        surface,
    },
    sdkSignals: sdkSignals(app.description),

    // Transparency
    methodology:  aiResults.some(r => r.source === 'gemini-ai')
      ? 'AI-assisted permission analysis. Each permission is classified using app metadata, trusted permission descriptions, and verified evidence. The AI reasons only over provided evidence.'
      : 'Deterministic knowledge-base analysis. AI analysis was unavailable. Classifications are based on trusted permission data and app category.',
    limitations:  'Assessment is based on declared permissions and available metadata. It cannot inspect runtime behavior or server-side data practices.',
  };

  return { ...report, securityAssessment: assess(report) };
}

// ─── Diff & History ───────────────────────────────────────────────────────────

function saveAndDiff(report) {
  const prior   = scanHistory.get(report.id);
  const previous = prior?.permissions?.map(p => p.id) || [];
  const current  = report.permissions.map(p => p.id);
  const added    = current.filter(p => !previous.includes(p));
  const removed  = previous.filter(p => !current.includes(p));
  scanHistory.set(report.id, report);
  return {
    ...report,
    drift: prior
      ? { previousScore: prior.privacyScore, currentScore: report.privacyScore, added, removed, changed: added.length > 0 || removed.length > 0 }
      : null,
  };
}

function getHistory()   { return [...scanHistory.values()].sort((a, b) => b.analyzedAt.localeCompare(a.analyzedAt)); }
function clearHistory() { scanHistory.clear(); }

module.exports = { analyze, saveAndDiff, getHistory, clearHistory };
