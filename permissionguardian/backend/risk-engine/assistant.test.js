const assert = require('node:assert/strict');
const { analyze } = require('../../services/privacyAnalysisService');
const { answer, assess } = require('../../services/securityAssessmentService');
const { validateApkUpload } = require('../../services/fileSecurityValidator');

async function runAssistantTests() {
  console.log('==================================================');
  console.log('STARTING AI SECURITY ASSISTANT VALIDATION TESTS...');
  console.log('==================================================\n');

  // Set up mock reports
  const weatherReport = await analyze({
    name: 'Weather Forecast Pro',
    category: 'Weather',
    developer: 'WeatherGroup',
    installs: '500K+',
    rating: 4.3,
    description: 'Get local forecasts, radar, and severe weather alerts. Access location for local weather forecast.',
    permissions: ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.CAMERA']
  });

  const calcReport = await analyze({
    name: 'Advanced Calculator Plus',
    category: 'Calculator',
    developer: 'CalcLab',
    installs: '10K+',
    rating: 3.5,
    description: 'A simple mathematical calculator for everyday calculations.',
    permissions: ['android.permission.CAMERA', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.READ_CONTACTS', 'android.permission.SEND_SMS']
  });

  // --- Test Case 1: Overall Safety Question ---
  console.log('Test 1: Overall safety question');
  const safeAns = await answer(calcReport, 'Is this app safe?');
  assert.match(safeAns, /Overall assessment|permission risk/i);
  assert.match(safeAns, /Why:/i);
  assert.match(safeAns, /Limitations:/i);
  console.log('✅ Test 1 Passed!');

  // --- Test Case 2: Most Dangerous Permission ---
  console.log('\nTest 2: Most dangerous permission');
  const dangerAns = await answer(calcReport, 'Which permission is most dangerous?');
  assert.match(dangerAns, /highest-risk|ACCESS_FINE_LOCATION|CAMERA|SEND_SMS/i);
  console.log('✅ Test 2 Passed!');

  // --- Test Case 3: Why Camera is needed ---
  console.log('\nTest 3: Why does it need camera?');
  const cameraAns = await answer(calcReport, 'Why does it need camera?');
  assert.match(cameraAns, /Permission:|CAMERA/i);
  console.log('✅ Test 3 Passed!');

  // --- Test Case 4: Why Location is needed ---
  console.log('\nTest 4: Why does it need location?');
  const locationAns = await answer(weatherReport, 'Why does it need location?');
  assert.match(locationAns, /Permission:|ACCESS_FINE_LOCATION|Location/i);
  console.log('✅ Test 4 Passed!');

  // --- Test Case 5: Should I allow Contacts ---
  console.log('\nTest 5: Should I allow contacts?');
  const contactsAns = await answer(calcReport, 'Should I allow contacts?');
  assert.match(contactsAns, /contacts|deny/i);
  console.log('✅ Test 5 Passed!');

  // --- Test Case 6: Why is score high ---
  console.log('\nTest 6: Why is the score high?');
  const scoreAns = await answer(calcReport, 'Why is the score high?');
  assert.match(scoreAns, /score|because/i);
  console.log('✅ Test 6 Passed!');

  // --- Test Case 7: Privacy risks ---
  console.log('\nTest 7: What are the privacy risks?');
  const privacyAns = await answer(calcReport, 'What are the privacy risks?');
  assert.match(privacyAns, /privacy|score/i);
  console.log('✅ Test 7 Passed!');

  // --- Test Case 8: Which permissions should I deny ---
  console.log('\nTest 8: Which permissions should I deny?');
  const denyAns = await answer(calcReport, 'Which permissions should I deny?');
  assert.match(denyAns, /deny|recommendation/i);
  console.log('✅ Test 8 Passed!');

  // --- Test Case 9 & 10: Follow-up conversational memory ---
  console.log('\nTest 9 & 10: Conversational memory follow-ups');
  const chatHistory = [
    { role: 'user', text: 'Why does it need location?' },
    { role: 'assistant', text: 'Location is expected for weather apps to retrieve local forecasts.' }
  ];
  
  // Follow-up 1
  const followUp1 = await answer(weatherReport, 'What about camera?', chatHistory);
  assert.match(followUp1, /Camera|Permission/i);

  // Follow-up 2 with pronoun 'it' referring to location in history
  const followUp2 = await answer(weatherReport, 'Should I allow it?', chatHistory);
  assert.match(followUp2, /Permission:|ACCESS_FINE_LOCATION|Location/i);
  console.log('✅ Conversational Memory Tests Passed!');

  // --- Test Case 11: General Product Information ---
  console.log('\nTest 11: General product question');
  const prodAns = await answer(calcReport, 'What does Veilix AI do?');
  assert.match(prodAns, /Veilix/i);
  console.log('✅ General Product Test Passed!');

  // --- Test Case 12: Empty Analysis ---
  console.log('\nTest 12: Empty analysis input');
  const emptyReport = await analyze({ name: 'Empty', category: 'Utility', permissions: [] });
  const emptyAns = await answer(emptyReport, 'Is this app safe?');
  assert.match(emptyAns, /Overall assessment|permission risk/i);
  console.log('✅ Empty Analysis Test Passed!');

  // --- Test Case 13: Hallucination protection validation ---
  console.log('\nTest 13: Hallucination protection validation');
  // If we try to validate an AI response that mentions microphone for weatherReport (which has no microphone), it should return false
  const { validateAssistantAnswer } = require('../../services/securityAssessmentService');
  const invalidAIResponse = "This app requests the MICROPHONE permission to record calls.";
  const isValid = validateAssistantAnswer(invalidAIResponse, weatherReport);
  assert.equal(isValid, false, 'Should reject AI response that invents microphone permission.');
  console.log('✅ Hallucination validation passed!');

  console.log('\n==================================================');
  console.log('ALL AI ASSISTANT FUNCTIONAL & MEMORY TESTS PASSED.');
  console.log('==================================================');
}

runAssistantTests().catch(err => {
  console.error('Assistant tests failed:', err);
  process.exit(1);
});
