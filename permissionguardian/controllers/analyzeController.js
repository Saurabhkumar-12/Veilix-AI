const { scrapeAppDetails } = require('../services/scraperService');
const { analyze, saveAndDiff, getHistory, clearHistory } = require('../services/privacyAnalysisService');
const { validateApkUpload } = require('../services/fileSecurityValidator');
const { extractDeclaredPermissions } = require('../services/permissionParser');
const { answer } = require('../services/securityAssessmentService');
const { simulatePrivacyImpact } = require('../services/attackSimulationService');
const { compareVersions } = require('../services/timeMachineService');
const crypto = require('node:crypto');

const analysisStore = new Map();

function persist(report) {
  const analysisId = report.analysisId || crypto.randomUUID();
  const stored = { ...report, analysisId };
  analysisStore.set(analysisId, stored);
  return stored;
}

/**
 * Controller to handle POST /api/analyze
 */
async function analyzeApp(req, res) {
  try {
    const playStoreUrl = req.body.url || req.body.playStoreUrl;

    if (!playStoreUrl || typeof playStoreUrl !== 'string' || !playStoreUrl.trim()) {
      return res.status(400).json({
        error: true,
        message: 'Invalid request. Please provide a valid Google Play Store URL in the "url" field.'
      });
    }

    console.log(`[Analyze Controller] Analyzing app from Play Store URL: ${playStoreUrl}`);

    const appDetails = await scrapeAppDetails(playStoreUrl);
    const report = saveAndDiff(await analyze({ ...appDetails, packageId: appDetails.historyId || playStoreUrl.trim() }, { demo: Boolean(appDetails.demo) }));
    return res.status(200).json(persist(report));

  } catch (error) {
    console.error('[Analyze Controller Error]:', error.message);
    const statusCode = error.statusCode || error.status || 500;

    return res.status(statusCode).json({
      error: true,
      message: error.message || 'An unexpected error occurred while analyzing the app.'
    });
  }
}

function history(req, res) { return res.json({ scans: getHistory() }); }
function deleteHistory(req, res) { clearHistory(); return res.status(204).end(); }

async function analyzePlayStore(req, res) { return analyzeApp(req, res); }
async function analyzeUrl(req, res) {
  try {
    const value = String(req.body?.url || '').trim();
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Only HTTP(S) application URLs are accepted.');
    const filename = url.pathname.split('/').pop() || url.hostname;
    const report = await analyze({ name: filename.replace(/\.(apk|exe|dmg|msi)$/i, '') || url.hostname, developer: url.hostname, category: req.body?.category || 'Utility', description: `Static URL analysis only. No remote file was downloaded.`, permissions: [] }, { demo: false });
    return res.json(persist({ ...report, source: 'Application URL metadata only', staticAnalysis: true, retrieval: url.pathname.toLowerCase().endsWith('.apk') ? 'APK link detected. Upload the APK directly for permission extraction.' : 'No APK file was retrieved.' }));
  } catch (error) { return res.status(400).json({ error: true, message: error.message || 'Unable to analyze this URL.' }); }
}
async function analyzeApk(req, res) {
  try {
    const upload = validateApkUpload({ filename: req.get('x-file-name'), contentType: req.get('content-type'), buffer: req.body });
    const permissions = extractDeclaredPermissions(req.body);
    const report = await analyze({ name: upload.originalName.replace(/\.apk$/i, ''), developer: 'Unknown (APK manifest)', category: req.get('x-app-category') || 'Utility', description: 'Static analysis of AndroidManifest.xml. Declared permissions are not observed runtime behavior.', permissions }, { demo: false });
    return res.status(201).json(persist({ ...report, source: 'Direct APK upload', staticAnalysis: true, upload: { name: upload.originalName, size: upload.size, stored: false }, declaredPermissions: permissions }));
  } catch (error) {
    console.error('[APK Static Analysis Error]:', error.message);
    return res.status(error.statusCode || 400).json({ error: true, message: 'Unable to analyze this APK. Ensure it is a valid Android package.' });
  }
}

/**
 * FEATURE 1: Attack Simulation Endpoint
 * POST /api/simulate/privacy-impact or GET /api/analysis/:id/attack-simulation
 */
function simulateImpact(req, res) {
  try {
    const analysisId = req.params.id || req.body?.analysisId;
    let report = analysisId ? analysisStore.get(analysisId) : null;

    if (!report && req.body?.permissions) {
      report = req.body;
    }

    if (!report) {
      return res.status(404).json({ error: true, message: 'Analysis report not found. Provide a valid analysisId or report payload.' });
    }

    const simulation = simulatePrivacyImpact(report);
    return res.json(simulation);
  } catch (error) {
    console.error('[Simulation Error]:', error.message);
    return res.status(500).json({ error: true, message: error.message || 'Failed to generate privacy impact simulation.' });
  }
}

/**
 * FEATURE 2: Time Machine Comparison Endpoint
 * POST /api/compare/permissions or POST /api/compare/versions or POST /api/compare
 */
function compare(req, res) {
  try {
    let before = req.body?.beforeAnalysisId ? analysisStore.get(req.body.beforeAnalysisId) : req.body?.before;
    let after = req.body?.afterAnalysisId ? analysisStore.get(req.body.afterAnalysisId) : req.body?.after;

    if (!before || !after) {
      // Fallback lookup by packageId from scan history
      const historyList = getHistory();
      if (!before && req.body?.beforeId) before = historyList.find(h => h.id === req.body.beforeId || h.analysisId === req.body.beforeId);
      if (!after && req.body?.afterId) after = historyList.find(h => h.id === req.body.afterId || h.analysisId === req.body.afterId);
    }

    if (!before || !after) {
      return res.status(400).json({ error: true, message: 'Both before and after analysis records (or IDs) are required for version comparison.' });
    }

    const comparison = compareVersions(before, after);
    return res.json(comparison);
  } catch (error) {
    console.error('[Time Machine Compare Error]:', error.message);
    return res.status(500).json({ error: true, message: error.message || 'Failed to run version comparison.' });
  }
}

function getAnalysis(req, res) { const report = analysisStore.get(req.params.id); return report ? res.json(report) : res.status(404).json({ error: true, message: 'Analysis not found.' }); }

async function assistant(req, res) {
  try {
    const report = analysisStore.get(req.params.id);
    if (!report) return res.status(404).json({ error: true, message: 'Analysis not found.' });
    const reply = await answer(report, req.body?.question, req.body?.history);
    return res.json({
      answer: reply,
      staticAnalysis: true,
      confidence: report.securityAssessment?.confidence || 60
    });
  } catch (error) {
    console.error('[Assistant Controller Error]:', error.message);
    return res.status(500).json({ error: true, message: error.message || 'Assistant failed to process request.' });
  }
}

module.exports = { 
  analyzeApp, 
  analyzePlayStore, 
  analyzeUrl, 
  analyzeApk, 
  compare, 
  simulateImpact,
  getAnalysis, 
  assistant, 
  history, 
  deleteHistory 
};
