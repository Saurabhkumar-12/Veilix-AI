const assert = require('node:assert/strict');
const { recommendationFor } = require('../../services/permissionRecommendationService');
assert.equal(recommendationFor({ id: 'ACCESS_FINE_LOCATION', permission: 'Location', status: 'Required', sensitivity: 'HIGH', purpose: 'navigation', category: 'Maps' }).decision, 'ALLOW IT WHEN NEEDED');
assert.equal(recommendationFor({ id: 'ACCESS_FINE_LOCATION', permission: 'Location', status: 'Potentially Excessive', sensitivity: 'HIGH', purpose: 'location', category: 'Calculator' }).decision, 'DON’T ALLOW IT');
assert.equal(recommendationFor({ id: 'RECORD_AUDIO', permission: 'Microphone', status: 'Optional', sensitivity: 'HIGH', purpose: 'voice input', category: 'Music' }).decision, 'ALLOW ONLY IF NEEDED');
console.log('permission recommendation tests passed');
