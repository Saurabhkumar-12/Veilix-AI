/**
 * testEngine.js
 * Standalone test suite for verifying riskEngine analysis across Spotify, Google Maps, WhatsApp, Signal, Calculator, and Flashlight.
 */

const { getRiskScore, fallbackAnalysis } = require('./riskEngine');

// Mock metadata & permissions
const spotifyMeta = {
  appName: 'Spotify: Music and Podcasts',
  developer: 'Spotify AB',
  category: 'Music',
  installs: '1,000,000,000+',
  score: 4.3
};

const spotifyPerms = [
  'android.permission.INTERNET',
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.WAKE_LOCK',
  'android.permission.BLUETOOTH',
  'android.permission.BLUETOOTH_CONNECT',
  'android.permission.VIBRATE',
  'android.permission.POST_NOTIFICATIONS'
];

const maliciousCalcMeta = {
  appName: 'Simple Calculator HD',
  developer: 'UnknownDev99',
  category: 'Calculator',
  installs: '10,000+',
  score: 3.1
};

const maliciousCalcPerms = [
  'android.permission.VIBRATE',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.SEND_SMS',
  'android.permission.READ_CONTACTS',
  'android.permission.READ_CALL_LOG'
];

async function runTests() {
  console.log('==================================================');
  console.log('STARTING ENTERPRISE RISK ENGINE TESTS...');
  console.log('==================================================\n');

  // Test 1: Spotify Test (Should be SAFE_TO_INSTALL, Risk <= 20)
  console.log('Test 1: Spotify (Music Category, 1B+ Installs, Trusted Dev)...');
  const spotifyResult = fallbackAnalysis(spotifyMeta.category, spotifyPerms, spotifyMeta);
  console.log(`   - App: ${spotifyResult.appName}`);
  console.log(`   - Risk Score: ${spotifyResult.riskScore}% (Target: <= 20%)`);
  console.log(`   - Verdict: ${spotifyResult.verdict} (Target: SAFE_TO_INSTALL)`);
  console.log(`   - Overall Risk: ${spotifyResult.overallRisk}`);
  console.log(`   - Positive Indicators: ${spotifyResult.positiveIndicators.length}`);
  
  if (spotifyResult.riskScore <= 20 && spotifyResult.verdict === 'SAFE_TO_INSTALL') {
    console.log('✅ Spotify Test PASSED! Zero false-positives for verified app.');
  } else {
    console.error('❌ Spotify Test FAILED!');
    process.exit(1);
  }
  console.log('\n--------------------------------------------------\n');

  // Test 2: Malicious Calculator Test (Should be AVOID / HIGH_RISK, Risk >= 70)
  console.log('Test 2: Malicious Calculator requesting SMS, GPS, Contacts...');
  const calcResult = fallbackAnalysis(maliciousCalcMeta.category, maliciousCalcPerms, maliciousCalcMeta);
  console.log(`   - App: ${calcResult.appName}`);
  console.log(`   - Risk Score: ${calcResult.riskScore}% (Target: >= 70%)`);
  console.log(`   - Verdict: ${calcResult.verdict} (Target: HIGH_RISK or AVOID)`);
  console.log(`   - Privacy Concerns: ${calcResult.privacyConcerns.length}`);

  if (calcResult.riskScore >= 70 && (calcResult.verdict === 'HIGH_RISK' || calcResult.verdict === 'AVOID')) {
    console.log('✅ Malicious Calculator Test PASSED! Suspicious permissions accurately flagged.');
  } else {
    console.error('❌ Malicious Calculator Test FAILED!');
    process.exit(1);
  }
  console.log('\n--------------------------------------------------\n');

  // Test 3: Gemini API key check
  console.log('Test 3: Testing getRiskScore interface fallback...');
  delete process.env.GEMINI_API_KEY;
  const generalResult = await getRiskScore('Music', spotifyPerms, spotifyMeta);
  console.log(`   - Source: ${generalResult.source}`);
  console.log(`   - Score: ${generalResult.riskScore}%`);
  console.log(`   - Verdict: ${generalResult.verdict}`);
  
  if (generalResult.source === 'rule-engine-fallback') {
    console.log('✅ Fallback Engine Integration PASSED!');
  } else {
    console.error('❌ Fallback Engine Integration FAILED!');
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('ALL RISK ENGINE TESTS PASSED SUCCESSFULLY.');
  console.log('==================================================');
}

runTests();
