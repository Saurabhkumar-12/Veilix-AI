const assert = require('node:assert/strict');
const { analyze } = require('../../services/privacyAnalysisService');
const { answer, levelFor } = require('../../services/securityAssessmentService');

(async () => {
  const report = await analyze({ name: 'Weather Demo', category: 'Weather', developer: 'Demo', permissions: ['ACCESS_FINE_LOCATION', 'CAMERA', 'RECORD_AUDIO'] }, { demo: true });
  assert.equal(report.counts.required, 1);
  assert.equal(report.counts.excessive, 2);
  assert.equal(report.minimumPermissionSet[0].id, 'ACCESS_FINE_LOCATION');
  assert.ok(report.permissions.every(item => item.confidence >= 62 && item.impact.ifDenied));
  assert.equal(report.securityAssessment.level, 'CRITICAL');
  assert.equal(levelFor(0), 'SAFE');
  assert.ok(report.securityAssessment.majorRisks.length > 0);
  assert.match(await answer(report, 'Which permission should I deny?'), /Camera|Record Audio/);
  try {
    await analyze({ name: 'Empty', category: 'Utility', developer: 'Demo', permissions: [] });
  } catch (err) {
    assert.fail(`Should not throw error: ${err.message}`);
  }
  console.log('privacyAnalysis tests passed');
})().catch(err => {
  console.error('privacyAnalysis tests failed:', err);
  process.exit(1);
});

