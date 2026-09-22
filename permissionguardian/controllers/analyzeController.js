const { scrapeAppDetails } = require('../services/scraperService');
const { analyze, saveAndDiff, getHistory, clearHistory } = require('../services/privacyAnalysisService');
const { validateApkUpload } = require('../services/fileSecurityValidator');
const { extractDeclaredPermissions } = require('../services/permissionParser');
const { answer } = require('../services/securityAssessmentService');
const { simulatePrivacyImpact } = require('../services/attackSimulationService');
const { compareVersions } = require('../services/timeMachineService');
const crypto = require('node:crypto');

// Session-level in-memory cache for analyses
const analysisStore = new Map();

function persist(report) {
  const analysisId = report.analysisId || crypto.randomUUID();
  const stored = { ...report, analysisId };
  
  // Prevent unbounded Map memory growth (cap at 200 items)
  if (analysisStore.size >= 200) {
    const firstKey = analysisStore.keys().next().value;
    analysisStore.delete(firstKey);
  }
  
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
        success: false,
        error: {
          code: 'INVALID_APPLICATION',
          message: 'Invalid request. Please provide a valid Google Play Store URL in the "url" field.'
        }
      });
    }

    console.log(`[Analyze Controller] Analyzing app from Play Store URL: ${playStoreUrl}`);

    const appDetails = await scrapeAppDetails(playStoreUrl);
    const report = saveAndDiff(await analyze({ ...appDetails, packageId: appDetails.historyId || playStoreUrl.trim() }, { demo: Boolean(appDetails.demo) }));
    return res.status(200).json({ success: true, data: persist(report) });

  } catch (error) {
    console.error('[Analyze Controller Error]:', error.message);
    const statusCode = error.statusCode || error.status || 500;
    const errorCode = error.statusCode === 404 ? 'INVALID_APPLICATION' : (error.statusCode === 429 ? 'RATE_LIMITED' : 'METADATA_VERIFICATION_FAILED');

    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message || 'An unexpected error occurred while analyzing the app.'
      }
    });
  }
}

function history(req, res) { 
  return res.json({ success: true, data: { scans: getHistory() } }); 
}

function deleteHistory(req, res) { 
  clearHistory(); 
  return res.status(200).json({ success: true, data: null }); 
}

async function analyzePlayStore(req, res) { 
  return analyzeApp(req, res); 
}

async function analyzeUrl(req, res) {
  try {
    const value = String(req.body?.url || '').trim();
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw Object.assign(new Error('Only HTTP(S) application URLs are accepted.'), { code: 'VALIDATION_ERROR' });
    }
    const filename = url.pathname.split('/').pop() || url.hostname;
    
    // permissions is passed as null to indicate it is unavailable
    const report = await analyze({ 
      name: filename.replace(/\.(apk|exe|dmg|msi)$/i, '') || url.hostname, 
      developer: url.hostname, 
      category: req.body?.category || 'Utility', 
      description: `Static URL analysis only. No remote file was downloaded.`, 
      permissions: null 
    }, { demo: false });

    const enrichedReport = { 
      ...report, 
      source: 'Application URL metadata only', 
      staticAnalysis: true, 
      retrieval: url.pathname.toLowerCase().endsWith('.apk') 
        ? 'APK link detected. Upload the APK directly for permission extraction.' 
        : 'No APK file was retrieved.' 
    };

    return res.json({ success: true, data: persist(enrichedReport) });
  } catch (error) { 
    return res.status(400).json({ 
      success: false, 
      error: {
        code: error.code || 'INVALID_APPLICATION',
        message: error.message || 'Unable to analyze this URL.'
      }
    }); 
  }
}

async function analyzeApk(req, res) {
  try {
    const upload = validateApkUpload({ 
      filename: req.get('x-file-name'), 
      contentType: req.get('content-type'), 
      buffer: req.body 
    });
    
    const permissions = extractDeclaredPermissions(req.body);
    const report = await analyze({ 
      name: upload.originalName.replace(/\.apk$/i, ''), 
      developer: 'Unknown (APK manifest)', 
      category: req.get('x-app-category') || 'Utility', 
      description: 'Static analysis of AndroidManifest.xml. Declared permissions are not observed runtime behavior.', 
      permissions 
    }, { demo: false });

    const enrichedReport = { 
      ...report, 
      source: 'Direct APK upload', 
      staticAnalysis: true, 
      upload: { name: upload.originalName, size: upload.size, stored: false }, 
      declaredPermissions: permissions 
    };

    return res.status(201).json({ success: true, data: persist(enrichedReport) });
  } catch (error) {
    console.error('[APK Static Analysis Error]:', error.message);
    const statusCode = error.statusCode || 400;
    const errorCode = statusCode === 413 ? 'VALIDATION_ERROR' : 'INVALID_APPLICATION';
    return res.status(statusCode).json({ 
      success: false, 
      error: {
        code: errorCode,
        message: error.message || 'Unable to analyze this APK. Ensure it is a valid Android package.' 
      }
    });
  }
}

/**
 * FEATURE 1: Attack Simulation Endpoint
 */
function simulateImpact(req, res) {
  try {
    const analysisId = req.params.id || req.body?.analysisId;
    let report = analysisId ? analysisStore.get(analysisId) : null;

    if (!report && req.body?.permissions) {
      report = req.body;
    }

    if (!report) {
      return res.status(404).json({ 
        success: false, 
        error: {
          code: 'INVALID_APPLICATION',
          message: 'Analysis report not found. Provide a valid analysisId or report payload.' 
        }
      });
    }

    const simulation = simulatePrivacyImpact(report);
    return res.json({ success: true, data: simulation });
  } catch (error) {
    console.error('[Simulation Error]:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: {
        code: 'AI_ANALYSIS_FAILED',
        message: error.message || 'Failed to generate privacy impact simulation.' 
      }
    });
  }
}

/**
 * FEATURE 2: Time Machine Comparison Endpoint
 */
function compare(req, res) {
  try {
    let before = req.body?.beforeAnalysisId ? analysisStore.get(req.body.beforeAnalysisId) : req.body?.before;
    let after = req.body?.afterAnalysisId ? analysisStore.get(req.body.afterAnalysisId) : req.body?.after;

    if (!before || !after) {
      const historyList = getHistory();
      if (!before && req.body?.beforeId) before = historyList.find(h => h.id === req.body.beforeId || h.analysisId === req.body.beforeId);
      if (!after && req.body?.afterId) after = historyList.find(h => h.id === req.body.afterId || h.analysisId === req.body.afterId);
    }

    if (!before || !after) {
      return res.status(400).json({ 
        success: false, 
        error: {
          code: 'INVALID_METADATA',
          message: 'Both before and after analysis records (or IDs) are required for version comparison.' 
        }
      });
    }

    const comparison = compareVersions(before, after);
    return res.json({ success: true, data: comparison });
  } catch (error) {
    console.error('[Time Machine Compare Error]:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: {
        code: 'INVALID_METADATA',
        message: error.message || 'Failed to run version comparison.' 
      }
    });
  }
}

function getAnalysis(req, res) { 
  const report = analysisStore.get(req.params.id); 
  return report 
    ? res.json({ success: true, data: report }) 
    : res.status(404).json({ 
        success: false, 
        error: {
          code: 'INVALID_APPLICATION',
          message: 'Analysis not found.' 
        }
      }); 
}

async function assistant(req, res) {
  try {
    const report = analysisStore.get(req.params.id);
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        error: {
          code: 'INVALID_APPLICATION',
          message: 'Analysis not found.' 
        }
      });
    }
    const reply = await answer(report, req.body?.question, req.body?.history);
    return res.json({
      success: true,
      data: {
        answer: reply,
        staticAnalysis: true,
        confidence: report.securityAssessment?.confidence || 60
      }
    });
  } catch (error) {
    console.error('[Assistant Controller Error]:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: {
        code: 'AI_ANALYSIS_FAILED',
        message: error.message || 'Assistant failed to process request.' 
      }
    });
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
