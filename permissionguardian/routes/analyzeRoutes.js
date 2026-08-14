const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/analyzeController');

// POST /api/analyze
router.post('/analyze', analyzeApp);
router.post('/analyze/playstore', analyzePlayStore);
router.post('/analyze/url', analyzeUrl);
router.post('/analyze/apk', express.raw({ type: ['application/vnd.android.package-archive', 'application/octet-stream', 'application/zip'], limit: process.env.MAX_APK_BYTES || '20mb' }), analyzeApk);

// Feature 1: Privacy Attack Simulator Routes
router.post('/simulate/privacy-impact', express.json(), simulateImpact);
router.get('/analysis/:id/attack-simulation', simulateImpact);

// Feature 2: Permission Time Machine Comparison Routes
router.post('/compare', express.json(), compare);
router.post('/compare/permissions', express.json(), compare);
router.post('/compare/versions', express.json(), compare);

// General Analysis & Assistant Routes
router.get('/analysis/:id', getAnalysis);
router.post('/analysis/:id/assistant', assistant);
router.get('/history', history);
router.delete('/history', deleteHistory);

module.exports = router;
