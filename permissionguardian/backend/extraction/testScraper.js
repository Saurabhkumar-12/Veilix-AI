/**
 * testScraper.js
 * Standalone test runner for google-play-scraper and category classification.
 */

const { getAppPermissions } = require('./scraper');

const TEST_URLS = [
  // 1. Simple Calculator (Calculator)
  {
    name: 'Simple Calculator',
    url: 'https://play.google.com/store/apps/details?id=com.simplemobiletools.calculator'
  },
  // 2. Weather App (Weather)
  {
    name: 'Yahoo Weather',
    url: 'https://play.google.com/store/apps/details?id=com.yahoo.mobile.client.android.weather'
  },
  // 3. QR Scanner (QR Scanner)
  {
    name: 'QR & Barcode Scanner',
    url: 'https://play.google.com/store/apps/details?id=com.gamma.scan'
  },
  // 4. Invalid App ID
  {
    name: 'Invalid App',
    url: 'https://play.google.com/store/apps/details?id=com.invalid.app.does.not.exist.permissionguardian'
  }
];

async function runTests() {
  console.log('==================================================');
  console.log('STARTING SCRAPER INTEGRATION TESTS...');
  console.log('==================================================\n');

  for (const test of TEST_URLS) {
    console.log(`Testing: ${test.name}`);
    console.log(`URL: ${test.url}`);
    try {
      const result = await getAppPermissions(test.url);
      console.log('✅ Scraper Success!');
      console.log(`   - App Name:  "${result.appName}"`);
      console.log(`   - Category:  ${result.category}`);
      console.log(`   - Permissions Count: ${result.permissions.length}`);
      if (result.permissions.length > 0) {
        console.log('   - Top 5 Scraped Permissions:');
        result.permissions.slice(0, 5).forEach(p => {
          console.log(`     * ${p.permission} (${p.permissionId}): ${p.description.substring(0, 50)}...`);
        });
      } else {
        console.log('   - No permissions requested.');
      }
    } catch (err) {
      console.log(`❌ Scraper Expected Error for ${test.name}:`);
      console.log(`   - Status:  ${err.status}`);
      console.log(`   - Message: ${err.message}`);
      console.log(`   - Fallback Available: ${err.fallbackAvailable}`);
    }
    console.log('\n--------------------------------------------------\n');
  }
}

runTests();
