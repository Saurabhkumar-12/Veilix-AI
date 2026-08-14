const assert = require('node:assert/strict');
const { analyze } = require('../../services/privacyAnalysisService');
const { buildHonestFallback, validateAIResponse } = require('../../services/aiService');
const { determineClassification, calculateRiskScore } = require('./riskEngine');
const { getPermissionMeta } = require('./permissionKnowledge');

async function runRegressionTests() {
  console.log('==================================================');
  console.log('STARTING PERMISSIONGUARD REGRESSION & SAFETY TESTS...');
  console.log('==================================================\n');

  // --- Test Case 1: Calculator App ---
  console.log('Test 1: Calculator requesting CAMERA, Location, Contacts, SMS');
  const calcReport = await analyze({
    name: 'Advanced Calculator Plus',
    category: 'Calculator',
    developer: 'CalcLab',
    installs: '10K+',
    rating: 3.5,
    description: 'A simple mathematical calculator for everyday calculations.',
    permissions: ['android.permission.CAMERA', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.READ_CONTACTS', 'android.permission.SEND_SMS', 'android.permission.VIBRATE']
  });

  const calcCamera = calcReport.permissions.find(p => p.id === 'CAMERA');
  const calcLocation = calcReport.permissions.find(p => p.id === 'ACCESS_FINE_LOCATION');
  const calcSms = calcReport.permissions.find(p => p.id === 'SEND_SMS');
  const calcVibrate = calcReport.permissions.find(p => p.id === 'VIBRATE');

  assert.equal(calcCamera.classification, 'DANGEROUS', 'Calculator camera should be dangerous.');
  assert.equal(calcLocation.classification, 'DANGEROUS', 'Calculator location should be dangerous.');
  assert.equal(calcSms.classification, 'DANGEROUS', 'Calculator SMS should be dangerous.');
  assert.equal(calcVibrate.classification, 'REQUIRED', 'Calculator vibrate should be required (low sensitivity system).');
  assert.ok(calcReport.privacyScore >= 80, `Calculator risk score should be high, got ${calcReport.privacyScore}`);
  assert.equal(calcReport.counts.excessive, 4, 'Calculator should have 4 excessive permissions.');
  console.log('✅ Calculator Test Passed!');

  // --- Test Case 2: Maps App ---
  console.log('\nTest 2: Maps App requesting Location (Expected Core) and Camera (Optional)');
  const mapsReport = await analyze({
    name: 'CityMaps Offline Navigation',
    category: 'Maps',
    developer: 'MapMaker',
    installs: '5M+',
    rating: 4.6,
    description: 'Get turn-by-turn navigation, route mapping, and offline GPS search.',
    permissions: ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.CAMERA']
  });

  const mapsLocation = mapsReport.permissions.find(p => p.id === 'ACCESS_FINE_LOCATION');
  const mapsCamera = mapsReport.permissions.find(p => p.id === 'CAMERA');

  assert.equal(mapsLocation.classification, 'REQUIRED', 'Maps GPS must be REQUIRED, not optional.');
  assert.equal(mapsCamera.classification, 'OPTIONAL', 'Maps camera with no description evidence should still be classified as OPTIONAL.');
  assert.ok(mapsReport.privacyScore <= 35, `Maps risk score should be low, got ${mapsReport.privacyScore}`);
  console.log('✅ Maps Test Passed!');

  // --- Test Case 3: Camera App ---
  console.log('\nTest 3: Camera App requesting Camera and Microphone');
  const cameraReport = await analyze({
    name: 'ProShot Selfie Camera',
    category: 'Camera',
    developer: 'PhotoStudio',
    installs: '1M+',
    rating: 4.4,
    description: 'Capture beautiful selfies and high definition videos with professional filters.',
    permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO']
  });

  const camCamera = cameraReport.permissions.find(p => p.id === 'CAMERA');
  const camMic = cameraReport.permissions.find(p => p.id === 'RECORD_AUDIO');

  assert.equal(camCamera.classification, 'REQUIRED', 'Camera app CAMERA should be REQUIRED.');
  assert.equal(camMic.classification, 'REQUIRED', 'Camera app RECORD_AUDIO should be REQUIRED.');
  console.log('✅ Camera Test Passed!');

  // --- Test Case 4: Messaging App ---
  console.log('\nTest 4: Messaging App requesting SMS and Contacts');
  const msgReport = await analyze({
    name: 'SecureChat Messenger',
    category: 'Messaging',
    developer: 'SecureLabs',
    installs: '100K+',
    rating: 4.2,
    description: 'Send free text messages, make audio calls, and sync contacts to chat with friends.',
    permissions: ['android.permission.SEND_SMS', 'android.permission.READ_CONTACTS']
  });

  const msgSms = msgReport.permissions.find(p => p.id === 'SEND_SMS');
  const msgContacts = msgReport.permissions.find(p => p.id === 'READ_CONTACTS');

  assert.equal(msgSms.classification, 'OPTIONAL', 'Messaging SMS should be OPTIONAL.');
  assert.equal(msgContacts.classification, 'REQUIRED', 'Messaging contacts should be REQUIRED.');
  console.log('✅ Messaging Test Passed!');

  // --- Test Case 5: Browser App ---
  console.log('\nTest 5: Browser App requesting Internet and Microphone');
  const browserReport = await analyze({
    name: 'Apex Web Browser',
    category: 'Browser',
    developer: 'ApexCorp',
    installs: '10M+',
    rating: 4.5,
    description: 'Browse the fast, secure web with voice search functionality built-in.',
    permissions: ['android.permission.INTERNET', 'android.permission.RECORD_AUDIO']
  });

  const browserNet = browserReport.permissions.find(p => p.id === 'INTERNET');
  const browserMic = browserReport.permissions.find(p => p.id === 'RECORD_AUDIO');

  assert.equal(browserNet.classification, 'REQUIRED', 'Browser Internet should be REQUIRED.');
  assert.equal(browserMic.classification, 'OPTIONAL', 'Browser mic with voice search description should be OPTIONAL.');
  console.log('✅ Browser Test Passed!');

  // --- Test Case 6: Weather App ---
  console.log('\nTest 6: Weather App requesting Location');
  const weatherReport = await analyze({
    name: 'SkyForecast Local Weather',
    category: 'Weather',
    developer: 'ForecastGroup',
    installs: '500K+',
    rating: 4.1,
    description: 'Check daily local weather forecasts and severe storm alerts in your neighborhood.',
    permissions: ['android.permission.ACCESS_FINE_LOCATION']
  });

  const weatherLocation = weatherReport.permissions.find(p => p.id === 'ACCESS_FINE_LOCATION');
  assert.equal(weatherLocation.classification, 'REQUIRED', 'Weather app location should be REQUIRED.');
  console.log('✅ Weather Test Passed!');

  // --- Test Case 7: Notes App ---
  console.log('\nTest 7: Notes App requesting Microphone (Optional)');
  const notesReport = await analyze({
    name: 'KeepNotes Memo Organizer',
    category: 'Notes',
    developer: 'KeepSoft',
    installs: '100K+',
    rating: 4.3,
    description: 'Write quick checklists and record quick voice notes or audio memos on the go.',
    permissions: ['android.permission.RECORD_AUDIO']
  });

  const notesMic = notesReport.permissions.find(p => p.id === 'RECORD_AUDIO');
  assert.equal(notesMic.classification, 'OPTIONAL', 'Notes app audio recording feature should make Microphone OPTIONAL.');
  console.log('✅ Notes Test Passed!');

  // --- Test Case 8: Adversarial/Hallucination Tests (Phase 23) ---
  console.log('\nTest 8: Adversarial Input / Hallucination Checks');

  // Case A: Calculator requesting CAMERA (atypical)
  const calcCameraMeta = getPermissionMeta('CAMERA');
  const calcCategoryProfile = { expected: ['VIBRATE'], optional: [], suspicious: ['CAMERA'] };
  
  // Deterministic classification should be DANGEROUS because it has no evidence
  const calcCameraClass = determineClassification('CAMERA', [], calcCategoryProfile, 'Calculator', calcCameraMeta.sensitivity);
  assert.equal(calcCameraClass.classification, 'DANGEROUS', 'Atypical permission without evidence must be DANGEROUS.');
  assert.match(calcCameraClass.evidence[0], /Atypical permission/);

  // Case B: Maps requesting LOCATION (expected)
  const mapsLocMeta = getPermissionMeta('ACCESS_FINE_LOCATION');
  const mapsCategoryProfile = { expected: ['ACCESS_FINE_LOCATION'], optional: [], suspicious: [] };
  const mapsLocClass = determineClassification('ACCESS_FINE_LOCATION', [], mapsCategoryProfile, 'Maps', mapsLocMeta.sensitivity);
  assert.equal(mapsLocClass.classification, 'REQUIRED', 'Legitimate expected permission must be REQUIRED.');

  // Validate that risk score for legitimate Maps app is low
  const mapsScore = calculateRiskScore({ installs: '100M+', developer: 'Google LLC' }, [
    { id: 'ACCESS_FINE_LOCATION', sensitivity: 'HIGH', classification: 'REQUIRED' }
  ]);
  assert.ok(mapsScore <= 15, `Legitimate Maps app location should not be heavily penalized. Score was ${mapsScore}`);
  console.log('✅ Hallucination and Adversarial tests passed!');

  // --- Test Case 9: Edge Cases (Empty, Missing, Unknowns) ---
  console.log('\nTest 9: Edge cases (Unknown Category, Unknown Permission, Duplicate permissions)');
  const edgeReport = await analyze({
    name: 'Mystery Utility App',
    category: 'UnknownCategoryName123',
    developer: 'MysteryDev',
    installs: '1K+',
    rating: 3.0,
    description: 'This is a mystery app.',
    permissions: ['android.permission.UNKNOWN_PERM_XYZ', 'android.permission.UNKNOWN_PERM_XYZ'] // Duplicates
  });

  assert.equal(edgeReport.permissions.length, 1, 'Duplicate permissions should be deduplicated.');
  assert.equal(edgeReport.permissions[0].classification, 'UNKNOWN', 'Unknown permissions should be classified as UNKNOWN.');
  assert.equal(edgeReport.permissions[0].confidence, 45, 'Unknown permissions should have low confidence.');
  console.log('✅ Edge Case Tests Passed!');

  console.log('\n==================================================');
  console.log('ALL REGRESSION AND CORRECTNESS TESTS PASSED.');
  console.log('==================================================');
}

runRegressionTests().catch(err => {
  console.error('Regression tests FAILED:', err);
  process.exit(1);
});
