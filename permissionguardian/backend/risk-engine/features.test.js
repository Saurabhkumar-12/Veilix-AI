/**
 * features.test.js
 * 
 * Automated unit test suite for Privacy Attack Simulator and Permission Time Machine features.
 */

const assert = require('node:assert');
const { simulatePrivacyImpact } = require('../../services/attackSimulationService');
const { compareVersions } = require('../../services/timeMachineService');
const { validateApkUpload } = require('../../services/fileSecurityValidator');

console.log('==================================================');
console.log(' RUNNING PRIVACY GUARDIAN FEATURE TEST SUITE');
console.log('==================================================\n');

let totalTests = 0;
let passedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

// ── TEST GROUP 1: PRIVACY ATTACK SIMULATOR ────────────────────────────────────

console.log('--- TEST GROUP 1: Privacy Attack Simulator ---');

test('Permission simulation maps CAMERA to visual exposure & HIGH severity', () => {
  const mockReport = {
    appName: 'Test Camera App',
    category: 'Photography',
    permissions: ['CAMERA']
  };
  const sim = simulatePrivacyImpact(mockReport);
  assert.strictEqual(sim.impacts.length, 1);
  assert.strictEqual(sim.impacts[0].permission, 'Camera');
  assert.strictEqual(sim.impacts[0].potentialImpact, 'Image & Video Exposure');
  assert.strictEqual(sim.impacts[0].severity, 'HIGH');
  assert(sim.impacts[0].explanation.includes('camera access could expose visual information'));
});

test('Calculates Attack Surface Score (SAFE for minimal permissions)', () => {
  const mockReport = {
    appName: 'Simple Calculator',
    category: 'Calculator',
    permissions: ['VIBRATE']
  };
  const sim = simulatePrivacyImpact(mockReport);
  assert(sim.attackSurfaceScore <= 20, `Expected score <= 20, got ${sim.attackSurfaceScore}`);
  assert.strictEqual(sim.attackSurfaceLevel, 'SAFE');
});

test('Calculates Attack Surface Score (CRITICAL for over-permissioned Flashlight)', () => {
  const mockReport = {
    appName: 'Super Flashlight',
    category: 'Utility',
    permissions: [
      'CAMERA', 'ACCESS_FINE_LOCATION', 'ACCESS_BACKGROUND_LOCATION',
      'READ_CONTACTS', 'RECEIVE_SMS', 'SYSTEM_ALERT_WINDOW'
    ]
  };
  const sim = simulatePrivacyImpact(mockReport);
  assert(sim.attackSurfaceScore > 70, `Expected score > 70, got ${sim.attackSurfaceScore}`);
  assert.strictEqual(sim.attackSurfaceLevel, 'CRITICAL');
});

test('Combination risk detection (Camera + Microphone)', () => {
  const mockReport = {
    appName: 'Social Video',
    category: 'Social',
    permissions: ['CAMERA', 'RECORD_AUDIO']
  };
  const sim = simulatePrivacyImpact(mockReport);
  assert(sim.sensitivePermissionsCount >= 2);
  assert(sim.scenarios.length >= 2);
});

test('Handles empty permission sets gracefully', () => {
  const mockReport = {
    appName: 'Empty App',
    category: 'Utility',
    permissions: []
  };
  const sim = simulatePrivacyImpact(mockReport);
  assert.strictEqual(sim.attackSurfaceScore, 0);
  assert.strictEqual(sim.attackSurfaceLevel, 'SAFE');
  assert.strictEqual(sim.impacts.length, 0);
});

test('AI response uses cautious, non-defamatory language ("potential", "could", "may")', () => {
  const mockReport = {
    appName: 'Weather App',
    category: 'Weather',
    permissions: ['ACCESS_FINE_LOCATION', 'READ_CONTACTS']
  };
  const sim = simulatePrivacyImpact(mockReport);
  const text = sim.aiExplanation.toLowerCase();
  assert(text.includes('potential') || text.includes('could') || text.includes('may'), 'AI text must use cautious terms.');
  assert(!text.includes('stole'), 'AI text must not claim data was stolen.');
});


// ── TEST GROUP 2: PERMISSION TIME MACHINE ─────────────────────────────────────

console.log('\n--- TEST GROUP 2: Permission Time Machine ---');

test('Version comparison detects new (🆕), removed (➖), and unchanged (✓) permissions', () => {
  const v1 = {
    name: 'Test App',
    version: '1.0',
    privacyScore: 42,
    permissions: ['INTERNET', 'VIBRATE', 'READ_CALENDAR']
  };
  const v2 = {
    name: 'Test App',
    version: '2.0',
    privacyScore: 76,
    permissions: ['INTERNET', 'VIBRATE', 'ACCESS_FINE_LOCATION', 'READ_CONTACTS']
  };

  const comp = compareVersions(v1, v2);

  assert.strictEqual(comp.oldScore, 42);
  assert.strictEqual(comp.newScore, 76);
  assert.strictEqual(comp.riskChange, 34);
  assert.strictEqual(comp.riskTrend, 'INCREASED');

  assert.strictEqual(comp.addedPermissions.length, 2);
  assert.strictEqual(comp.removedPermissions.length, 1);
  assert.strictEqual(comp.unchangedPermissions.length, 2);

  assert.strictEqual(comp.removedPermissions[0].id, 'READ_CALENDAR');
});

test('New Sensitive Permission Alert triggers for new high-sensitivity permissions', () => {
  const v1 = { name: 'Chat App', version: '1.0', privacyScore: 20, permissions: ['INTERNET'] };
  const v2 = { name: 'Chat App', version: '2.0', privacyScore: 65, permissions: ['INTERNET', 'ACCESS_FINE_LOCATION', 'READ_CONTACTS'] };

  const comp = compareVersions(v1, v2);
  assert.strictEqual(comp.hasNewSensitiveAlert, true);
  assert(comp.newSensitivePermissions.length >= 2);
});

test('Generates visual timeline milestones', () => {
  const v1 = { name: 'Map App', version: '1.0', privacyScore: 30, permissions: ['INTERNET'] };
  const v2 = { name: 'Map App', version: '2.0', privacyScore: 45, permissions: ['INTERNET', 'ACCESS_FINE_LOCATION'] };

  const comp = compareVersions(v1, v2);
  assert.strictEqual(comp.timeline.length, 2);
  assert.strictEqual(comp.timeline[0].version, '1.0');
  assert.strictEqual(comp.timeline[1].version, '2.0');
});

test('AI version analysis cautious wording ("introduced", "may increase")', () => {
  const v1 = { name: 'Tool', version: '1.0', privacyScore: 10, permissions: ['INTERNET'] };
  const v2 = { name: 'Tool', version: '2.0', privacyScore: 50, permissions: ['INTERNET', 'CAMERA'] };

  const comp = compareVersions(v1, v2);
  const text = comp.aiExplanation.toLowerCase();
  assert(text.includes('introduced') || text.includes('may increase'), 'AI text must use cautious version comparison terms.');
});


// ── TEST GROUP 3: SECURITY & MALFORMED INPUT PROTECTION ────────────────────────

console.log('\n--- TEST GROUP 3: Security & Malformed Input Protection ---');

test('Rejects non-APK uploaded buffers', () => {
  const invalidBuffer = Buffer.from('NOT_A_ZIP_OR_APK_FILE');
  assert.throws(() => {
    validateApkUpload({ filename: 'test.apk', contentType: 'application/vnd.android.package-archive', buffer: invalidBuffer });
  }, /not a valid ZIP\/APK/);
});

test('Rejects non-.apk file extensions', () => {
  const validHeaderBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
  assert.throws(() => {
    validateApkUpload({ filename: 'script.exe', contentType: 'application/octet-stream', buffer: validHeaderBuffer });
  }, /Only \.apk files are accepted/);
});


console.log('\n==================================================');
console.log(` TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('==================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
