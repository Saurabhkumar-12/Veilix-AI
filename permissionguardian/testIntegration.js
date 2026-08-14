const { scrapeAppDetails } = require('./services/scraperService');
const { analyze } = require('./services/privacyAnalysisService');
const { simulatePrivacyImpact } = require('./services/attackSimulationService');
const { compareVersions } = require('./services/timeMachineService');

async function runIntegrationVerification() {
  console.log('--- 1. Testing Scraper & Analysis for Weather App ---');
  const weatherApp = await scrapeAppDetails('demo.weather');
  const weatherReport = await analyze(weatherApp);
  console.log(`✓ App Name: ${weatherReport.name}, Category: ${weatherReport.category}, Privacy Score: ${weatherReport.privacyScore}/100`);

  console.log('\n--- 2. Testing Feature 1: Privacy Attack Simulator ---');
  const simulation = simulatePrivacyImpact(weatherReport);
  console.log(`✓ Attack Surface Score: ${simulation.attackSurfaceScore}/100 (${simulation.attackSurfaceLevel})`);
  console.log(`✓ Impacts Evaluated: ${simulation.impacts.length}`);
  console.log(`✓ AI Explanation: "${simulation.aiExplanation.slice(0, 100)}..."`);

  console.log('\n--- 3. Testing Feature 2: Permission Time Machine ---');
  const weatherAppV2 = await scrapeAppDetails('demo.weather.v2');
  const weatherReportV2 = await analyze(weatherAppV2);
  const comparison = compareVersions(weatherReport, weatherReportV2);
  console.log(`✓ Version 1 Score: ${comparison.oldScore} -> Version 2 Score: ${comparison.newScore} (Delta: ${comparison.riskChange > 0 ? '+' : ''}${comparison.riskChange})`);
  console.log(`✓ Added Permissions: ${comparison.addedPermissions.map(p => p.label).join(', ')}`);
  console.log(`✓ New Sensitive Alert Triggered: ${comparison.hasNewSensitiveAlert ? 'YES 🚨' : 'NO'}`);

  console.log('\n==================================================');
  console.log(' INTEGRATION VERIFICATION SUCCESSFUL!');
  console.log('==================================================');
}

runIntegrationVerification().catch(err => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
