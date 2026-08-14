/**
 * testGeminiKey.js
 * Verifies that the GEMINI_API_KEY in your .env file is correct and can communicate
 * with the Gemini API to analyze app permissions.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { getRiskScore } = require('./riskEngine');

const category = 'Calculator';
const mockPermissions = [
  { permission: 'android.permission.VIBRATE', permissionId: 'VIBRATE', description: 'Vibrate device' },
  { permission: 'android.permission.ACCESS_FINE_LOCATION', permissionId: 'ACCESS_FINE_LOCATION', description: 'Access GPS location' }
];

async function runTest() {
  console.log('==================================================');
  console.log('VERIFYING GEMINI API KEY INTEGRATION...');
  console.log('==================================================');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY is not defined in your .env file!');
    console.log('   Please add GEMINI_API_KEY=your_key in /permissionguardian/.env');
    process.exit(1);
  }
  
  console.log(`Key Found: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`Sending test request to gemini-1.5-flash for category: "${category}"...`);
  
  const startTime = Date.now();
  try {
    const result = await getRiskScore(category, mockPermissions);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n✅ Success! Gemini responded in ${duration} seconds.`);
    console.log('--------------------------------------------------');
    console.log(`Risk Score: ${result.risk_score}`);
    console.log(`Unnecessary Permissions Flagged: ${result.unnecessary_permissions.length}`);
    result.unnecessary_permissions.forEach(p => {
      console.log(`  * ${p.permission}: ${p.reason}`);
    });
    console.log(`Explanation: "${result.explanation}"`);
    console.log(`Alternatives: ${JSON.stringify(result.safer_alternatives)}`);
    console.log('--------------------------------------------------');
    console.log('Your Gemini API integration is 100% working!');
  } catch (err) {
    console.error('\n❌ Error communicating with Gemini API:');
    console.error(err.message);
  }
}

runTest();
