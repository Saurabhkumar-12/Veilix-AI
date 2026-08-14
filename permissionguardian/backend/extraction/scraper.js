/**
 * scraper.js
 * Scrapes metadata and permissions from Google Play Store.
 * Includes resilient fallbacks for rate-limited/blocked IP environments.
 */

const gplay = require('google-play-scraper');

// Built-in fallback database for popular demo apps in case Google Play blocks automated scraping
const KNOWN_MOCK_APPS = {
  'com.spotify.music': {
    appName: 'Spotify: Music and Podcasts',
    packageId: 'com.spotify.music',
    category: 'Music',
    developer: 'Spotify AB',
    installs: '1,000,000,000+',
    score: 4.3,
    ratings: 32000000,
    trustTier: 'ESTABLISHED',
    icon: 'https://play-lh.googleusercontent.com/cSh2-pdZ9gV5BXYwECAYIHxRcdYyZX_yAOi7k2gQyH8_g0',
    description: 'Listen to music, podcasts, and audiobooks on Spotify.',
    permissions: [
      { permission: 'android.permission.INTERNET', permissionId: 'INTERNET', description: 'Network access' },
      { permission: 'android.permission.ACCESS_NETWORK_STATE', permissionId: 'ACCESS_NETWORK_STATE', description: 'Network state' },
      { permission: 'android.permission.WAKE_LOCK', permissionId: 'WAKE_LOCK', description: 'Background playback' },
      { permission: 'android.permission.BLUETOOTH', permissionId: 'BLUETOOTH', description: 'Connect audio accessories' },
      { permission: 'android.permission.BLUETOOTH_CONNECT', permissionId: 'BLUETOOTH_CONNECT', description: 'Connect Bluetooth headphones' },
      { permission: 'android.permission.VIBRATE', permissionId: 'VIBRATE', description: 'Haptic feedback' },
      { permission: 'android.permission.POST_NOTIFICATIONS', permissionId: 'POST_NOTIFICATIONS', description: 'Playback controls' },
    ]
  },
  'com.google.android.apps.maps': {
    appName: 'Google Maps',
    packageId: 'com.google.android.apps.maps',
    category: 'Maps',
    developer: 'Google LLC',
    installs: '10,000,000,000+',
    score: 4.4,
    ratings: 18000000,
    trustTier: 'ESTABLISHED',
    icon: '',
    description: 'Real-time GPS navigation, traffic, transit, and local places.',
    permissions: [
      { permission: 'android.permission.ACCESS_FINE_LOCATION', permissionId: 'ACCESS_FINE_LOCATION', description: 'GPS navigation' },
      { permission: 'android.permission.ACCESS_COARSE_LOCATION', permissionId: 'ACCESS_COARSE_LOCATION', description: 'Approximate location' },
      { permission: 'android.permission.INTERNET', permissionId: 'INTERNET', description: 'Map data streaming' },
      { permission: 'android.permission.ACCESS_NETWORK_STATE', permissionId: 'ACCESS_NETWORK_STATE', description: 'Connection status' },
      { permission: 'android.permission.BLUETOOTH', permissionId: 'BLUETOOTH', description: 'Car audio navigation' },
      { permission: 'android.permission.VIBRATE', permissionId: 'VIBRATE', description: 'Turn alerts' }
    ]
  },
  'com.whatsapp': {
    appName: 'WhatsApp Messenger',
    packageId: 'com.whatsapp',
    category: 'Messaging',
    developer: 'WhatsApp LLC',
    installs: '5,000,000,000+',
    score: 4.3,
    ratings: 175000000,
    trustTier: 'ESTABLISHED',
    icon: '',
    description: 'Simple. Reliable. Private messaging and calling.',
    permissions: [
      { permission: 'android.permission.CAMERA', permissionId: 'CAMERA', description: 'Photos and video calls' },
      { permission: 'android.permission.RECORD_AUDIO', permissionId: 'RECORD_AUDIO', description: 'Voice notes and calls' },
      { permission: 'android.permission.READ_CONTACTS', permissionId: 'READ_CONTACTS', description: 'Sync contacts' },
      { permission: 'android.permission.WRITE_CONTACTS', permissionId: 'WRITE_CONTACTS', description: 'Add contacts' },
      { permission: 'android.permission.READ_EXTERNAL_STORAGE', permissionId: 'READ_EXTERNAL_STORAGE', description: 'Media gallery' },
      { permission: 'android.permission.WRITE_EXTERNAL_STORAGE', permissionId: 'WRITE_EXTERNAL_STORAGE', description: 'Save photos' },
      { permission: 'android.permission.INTERNET', permissionId: 'INTERNET', description: 'Send and receive messages' }
    ]
  }
};

/**
 * Parses install string (e.g. "10,000,000+" or "50B+") into a numeric value.
 */
function parseInstallString(installsStr) {
  if (!installsStr) return 0;
  const cleanStr = installsStr.replace(/[,+]/g, '').trim().toLowerCase();
  if (cleanStr.includes('b')) return parseFloat(cleanStr.replace('b', '')) * 1_000_000_000;
  if (cleanStr.includes('m')) return parseFloat(cleanStr.replace('m', '')) * 1_000_000;
  if (cleanStr.includes('k')) return parseFloat(cleanStr.replace('k', '')) * 1000;
  const val = parseInt(cleanStr, 10);
  return isNaN(val) ? 0 : val;
}

/**
 * Computes the trust tier for the app based on installs and ratings.
 */
function getTrustTier(installs, score, ratings) {
  const installCount = parseInstallString(installs);
  if (installCount >= 100_000_000 && score >= 4.0) return "ESTABLISHED";
  if (installCount >= 1_000_000 && score >= 3.5) return "COMMON";
  return "LIMITED_TRACK_RECORD";
}

/**
 * Normalises a scraped app category.
 */
function determineCategory(title, description, genre) {
  const searchable = `${title || ''} ${description || ''} ${genre || ''}`.toLowerCase();

  if (searchable.includes('music') || searchable.includes('audio')) return 'Music';
  if (searchable.includes('map') || searchable.includes('navigation')) return 'Maps';
  if (searchable.includes('messenger') || searchable.includes('chat') || searchable.includes('sms')) return 'Messaging';
  if (searchable.includes('calculator')) return 'Calculator';
  if (searchable.includes('flashlight') || searchable.includes('torch')) return 'Flashlight';
  if (searchable.includes('weather')) return 'Weather';
  if (searchable.includes('notes') || searchable.includes('memo')) return 'Notes';
  if (searchable.includes('photo')) return 'Photo Editor';
  if (searchable.includes('camera')) return 'Camera';
  if (searchable.includes('wallpaper')) return 'Wallpaper';
  if (searchable.includes('qr') || searchable.includes('scanner')) return 'QR Scanner';

  return 'Utility';
}

/**
 * Extracts the appId (package name) from a Google Play Store URL.
 */
function extractAppId(playStoreUrl) {
  if (!playStoreUrl) return null;
  
  try {
    const trimmed = playStoreUrl.trim();
    const packageRegex = /^[a-zA-Z0-9._]+$/;
    if (packageRegex.test(trimmed) && trimmed.includes('.')) {
      return trimmed;
    }

    const urlObj = new URL(trimmed);
    const id = urlObj.searchParams.get('id');
    if (id) return id;

    const regex = /(?:id=)([a-zA-Z0-9._]+)/i;
    const match = trimmed.match(regex);
    if (match && match[1]) return match[1];
  } catch (e) {
    const regex = /(?:id=)([a-zA-Z0-9._]+)/i;
    const match = playStoreUrl.match(regex);
    if (match && match[1]) return match[1];
  }
  return null;
}

/**
 * Fetches app data and permissions from Google Play.
 */
async function getAppPermissions(playStoreUrl) {
  const appId = extractAppId(playStoreUrl);
  if (!appId) {
    const err = new Error('Invalid Play Store URL. Could not extract Android Package ID.');
    err.status = 400;
    throw err;
  }

  try {
    const [appDetail, appPerms] = await Promise.all([
      gplay.app({ appId }),
      gplay.permissions({ appId }).catch(() => [])
    ]);

    const category = determineCategory(appDetail.title, appDetail.description, appDetail.genre);
    
    const permissions = appPerms.map(p => ({
      permission: p.permission || '',
      permissionId: p.permissionId || '',
      description: p.description || ''
    }));

    const trustTier = getTrustTier(appDetail.installs, appDetail.score, appDetail.ratings);

    return {
      appName: appDetail.title || appId,
      packageId: appId,
      category,
      permissions,
      developer: appDetail.developer || 'Unknown Developer',
      developerId: appDetail.developerId || '',
      installs: appDetail.installs || '0+',
      description: appDetail.description || '',
      summary: appDetail.summary || '',
      icon: appDetail.icon || '',
      score: appDetail.score || 0,
      ratings: appDetail.ratings || 0,
      released: appDetail.released || 'Unknown',
      trustTier,
      reviews: []
    };
  } catch (error) {
    console.error('google-play-scraper error:', error.message);

    // If scraping failed but package is in our known mock database, return it gracefully
    if (KNOWN_MOCK_APPS[appId]) {
      console.log(`[Scraper] Using cached fallback metadata for known package "${appId}"`);
      return KNOWN_MOCK_APPS[appId];
    }
    
    let errMsg = 'Unable to reach Google Play Store (scraping blocked by rate limit). Please use manual entry below.';
    let status = 500;

    if (error.message.includes('not found') || error.message.includes('404')) {
      errMsg = 'Application not found on Google Play Store. Please verify the package ID.';
      status = 400;
    }

    const err = new Error(errMsg);
    err.status = status;
    err.fallbackAvailable = true;
    throw err;
  }
}

/**
 * Fallback parser for manual permissions list
 */
function getPermissionsFromManualList(permissionsArray, category) {
  const cleanPermissions = (permissionsArray || []).map(p => {
    const parts = p.split('.');
    const permissionId = parts[parts.length - 1] || p;
    return {
      permission: p,
      permissionId: permissionId,
      description: `Manually declared access to ${permissionId}`
    };
  });

  return {
    appName: 'Manual Entry',
    category: category || 'Utility',
    permissions: cleanPermissions,
    developer: 'Self-Declared',
    developerId: '',
    installs: 'N/A',
    description: 'Manually entered permissions list.',
    summary: 'Manually entered permissions list.',
    icon: '',
    score: 0,
    ratings: 0,
    released: 'N/A',
    trustTier: 'LIMITED_TRACK_RECORD',
    reviews: []
  };
}

module.exports = {
  determineCategory,
  extractAppId,
  getAppPermissions,
  getPermissionsFromManualList
};
