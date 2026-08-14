/**
 * categoryKnowledge.js
 *
 * Defines standard expected, optional, and suspicious permissions across 30+ Android app categories.
 * Used for context-aware risk scoring and fallback evaluations.
 */

const CATEGORIES = {
  Music: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'WAKE_LOCK', 'FOREGROUND_SERVICE', 'BLUETOOTH', 'BLUETOOTH_CONNECT', 'VIBRATE'],
    optional: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'], // Location for local radio/concerts, Mic for audio search
    suspicious: ['READ_CONTACTS', 'WRITE_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW', 'CAMERA'],
  },
  Video: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'WAKE_LOCK', 'FOREGROUND_SERVICE', 'BLUETOOTH', 'BLUETOOTH_CONNECT', 'VIBRATE'],
    optional: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'CAMERA', 'RECORD_AUDIO'],
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'ACCESS_FINE_LOCATION'],
  },
  Streaming: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'WAKE_LOCK', 'FOREGROUND_SERVICE', 'BLUETOOTH_CONNECT'],
    optional: ['READ_EXTERNAL_STORAGE', 'CAMERA', 'RECORD_AUDIO'],
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW'],
  },
  Maps: {
    expected: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION', 'INTERNET', 'ACCESS_NETWORK_STATE', 'ACCESS_WIFI_STATE', 'FOREGROUND_SERVICE', 'WAKE_LOCK', 'VIBRATE'],
    optional: ['CAMERA', 'RECORD_AUDIO', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'BLUETOOTH_CONNECT'], // Camera/Audio for AR & search
    suspicious: ['READ_SMS', 'SEND_SMS', 'READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW'],
  },
  Navigation: {
    expected: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION', 'INTERNET', 'ACCESS_NETWORK_STATE', 'FOREGROUND_SERVICE', 'WAKE_LOCK', 'VIBRATE', 'BLUETOOTH_CONNECT'],
    optional: ['RECORD_AUDIO', 'CAMERA', 'READ_CONTACTS'], // Mic for voice search, contacts for navigating to friend's address
    suspicious: ['READ_SMS', 'SEND_SMS', 'READ_CALL_LOG'],
  },
  Shopping: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'VIBRATE', 'POST_NOTIFICATIONS'],
    optional: ['CAMERA', 'ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'], // Camera for barcode/AR try-on, location for delivery
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW'],
  },
  Social: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'CAMERA', 'RECORD_AUDIO', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'READ_CONTACTS', 'VIBRATE', 'POST_NOTIFICATIONS', 'WAKE_LOCK'],
    optional: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'BLUETOOTH_CONNECT'],
    suspicious: ['READ_CALL_LOG', 'SEND_SMS', 'READ_SMS', 'SYSTEM_ALERT_WINDOW'],
  },
  Messaging: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'READ_CONTACTS', 'WRITE_CONTACTS', 'CAMERA', 'RECORD_AUDIO', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'VIBRATE', 'WAKE_LOCK', 'POST_NOTIFICATIONS', 'FOREGROUND_SERVICE'],
    optional: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'SEND_SMS', 'RECEIVE_SMS', 'READ_SMS', 'RECEIVE_MMS', 'READ_PHONE_STATE', 'CALL_PHONE'],
    suspicious: ['READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW', 'DEVICE_ADMIN'],
  },
  'Video Call': {
    expected: ['CAMERA', 'RECORD_AUDIO', 'INTERNET', 'ACCESS_NETWORK_STATE', 'BLUETOOTH', 'BLUETOOTH_CONNECT', 'WAKE_LOCK', 'FOREGROUND_SERVICE', 'READ_CONTACTS', 'VIBRATE', 'POST_NOTIFICATIONS'],
    optional: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'ACCESS_FINE_LOCATION'],
    suspicious: ['SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW'],
  },
  Email: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'READ_CONTACTS', 'WRITE_CONTACTS', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'VIBRATE', 'POST_NOTIFICATIONS', 'WAKE_LOCK', 'FOREGROUND_SERVICE'],
    optional: ['CAMERA', 'RECORD_AUDIO'],
    suspicious: ['ACCESS_FINE_LOCATION', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG'],
  },
  Banking: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'READ_PHONE_STATE', 'USE_BIOMETRIC', 'USE_FINGERPRINT', 'VIBRATE', 'POST_NOTIFICATIONS'],
    optional: ['CAMERA', 'RECEIVE_SMS', 'READ_SMS', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'READ_CONTACTS'], // Camera for check deposit/QR, SMS for OTP auto-read, Location for ATM finder
    suspicious: ['READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW', 'RECORD_AUDIO', 'READ_EXTERNAL_STORAGE'],
  },
  UPI: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'READ_PHONE_STATE', 'SEND_SMS', 'RECEIVE_SMS', 'READ_SMS', 'CAMERA', 'READ_CONTACTS', 'USE_BIOMETRIC', 'USE_FINGERPRINT', 'VIBRATE', 'POST_NOTIFICATIONS'],
    optional: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    suspicious: ['READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW', 'RECORD_AUDIO'],
  },
  Wallet: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'READ_PHONE_STATE', 'NFC', 'USE_BIOMETRIC', 'CAMERA', 'VIBRATE', 'POST_NOTIFICATIONS'],
    optional: ['ACCESS_FINE_LOCATION', 'READ_CONTACTS', 'RECEIVE_SMS', 'READ_SMS'],
    suspicious: ['READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW', 'RECORD_AUDIO'],
  },
  Healthcare: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'CAMERA', 'POST_NOTIFICATIONS'],
    optional: ['ACCESS_FINE_LOCATION', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'BODY_SENSORS', 'RECORD_AUDIO'],
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW'],
  },
  Fitness: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'BODY_SENSORS', 'ACTIVITY_RECOGNITION', 'BLUETOOTH', 'BLUETOOTH_CONNECT', 'VIBRATE', 'POST_NOTIFICATIONS'],
    optional: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'READ_CONTACTS'],
    suspicious: ['READ_SMS', 'SEND_SMS', 'READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW'],
  },
  Camera: {
    expected: ['CAMERA', 'RECORD_AUDIO', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'VIBRATE'],
    optional: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'], // Geotagging photos
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'INTERNET', 'SYSTEM_ALERT_WINDOW'],
  },
  Gallery: {
    expected: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'SET_WALLPAPER', 'VIBRATE'],
    optional: ['INTERNET', 'CAMERA', 'ACCESS_COARSE_LOCATION'], // Cloud sync, photo editing
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'RECORD_AUDIO'],
  },
  Browser: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'VIBRATE', 'POST_NOTIFICATIONS'],
    optional: ['CAMERA', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'], // Web apps requesting access dynamically
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW'],
  },
  VPN: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'FOREGROUND_SERVICE', 'CHANGE_NETWORK_STATE', 'POST_NOTIFICATIONS'],
    optional: ['VIBRATE'],
    suspicious: ['CAMERA', 'RECORD_AUDIO', 'READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'ACCESS_FINE_LOCATION', 'READ_CALL_LOG'],
  },
  'Developer Tools': {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'ACCESS_WIFI_STATE', 'GET_TASKS'],
    optional: ['SYSTEM_ALERT_WINDOW', 'PACKAGE_USAGE_STATS'],
    suspicious: ['SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'READ_CONTACTS'],
  },
  Notes: {
    expected: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'VIBRATE'],
    optional: ['INTERNET', 'ACCESS_NETWORK_STATE', 'RECORD_AUDIO', 'CAMERA'], // Cloud sync, voice notes, photo attachments
    suspicious: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG'],
  },
  Education: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'POST_NOTIFICATIONS'],
    optional: ['CAMERA', 'RECORD_AUDIO', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'ACCESS_FINE_LOCATION'],
  },
  Gaming: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'VIBRATE', 'WAKE_LOCK'],
    optional: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'RECORD_AUDIO', 'BLUETOOTH_CONNECT'], // Voice chat in multiplayer
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'ACCESS_FINE_LOCATION', 'SYSTEM_ALERT_WINDOW'],
  },
  News: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'POST_NOTIFICATIONS', 'VIBRATE'],
    optional: ['ACCESS_COARSE_LOCATION', 'READ_EXTERNAL_STORAGE'], // Local news
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'CAMERA', 'RECORD_AUDIO'],
  },
  Productivity: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'VIBRATE', 'POST_NOTIFICATIONS'],
    optional: ['CAMERA', 'RECORD_AUDIO', 'READ_CONTACTS', 'SCHEDULE_EXACT_ALARM'],
    suspicious: ['ACCESS_FINE_LOCATION', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG'],
  },
  Weather: {
    expected: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'INTERNET', 'ACCESS_NETWORK_STATE', 'VIBRATE', 'POST_NOTIFICATIONS'],
    optional: ['ACCESS_BACKGROUND_LOCATION'], // Periodic weather warnings
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'CAMERA', 'RECORD_AUDIO'],
  },
  Travel: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'POST_NOTIFICATIONS', 'VIBRATE'],
    optional: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'READ_CONTACTS'], // QR check-in, saving tickets
    suspicious: ['SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW'],
  },
  Transportation: {
    expected: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'INTERNET', 'ACCESS_NETWORK_STATE', 'FOREGROUND_SERVICE', 'VIBRATE', 'POST_NOTIFICATIONS'],
    optional: ['CALL_PHONE', 'READ_CONTACTS'], // Calling ride driver
    suspicious: ['SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW', 'CAMERA'],
  },
  Finance: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'USE_BIOMETRIC', 'USE_FINGERPRINT', 'VIBRATE', 'POST_NOTIFICATIONS'],
    optional: ['CAMERA', 'READ_SMS', 'RECEIVE_SMS', 'READ_CONTACTS'],
    suspicious: ['READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION'],
  },
  Government: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'USE_BIOMETRIC', 'CAMERA', 'READ_EXTERNAL_STORAGE', 'POST_NOTIFICATIONS'],
    optional: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'READ_PHONE_STATE'],
    suspicious: ['READ_CALL_LOG', 'SYSTEM_ALERT_WINDOW', 'SEND_SMS', 'READ_SMS'],
  },
  Enterprise: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'READ_CONTACTS', 'WRITE_CONTACTS', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'POST_NOTIFICATIONS', 'USE_BIOMETRIC'],
    optional: ['DEVICE_ADMIN', 'CAMERA', 'RECORD_AUDIO'],
    suspicious: ['SEND_SMS', 'READ_SMS', 'READ_CALL_LOG'],
  },
  Calculator: {
    expected: ['VIBRATE'],
    optional: [],
    suspicious: ['INTERNET', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'CAMERA', 'RECORD_AUDIO', 'SYSTEM_ALERT_WINDOW'],
  },
  Flashlight: {
    expected: ['CAMERA', 'VIBRATE'],
    optional: [],
    suspicious: ['INTERNET', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'RECORD_AUDIO', 'SYSTEM_ALERT_WINDOW'],
  },
  Wallpaper: {
    expected: ['SET_WALLPAPER', 'SET_WALLPAPER_HINTS', 'INTERNET', 'ACCESS_NETWORK_STATE', 'READ_EXTERNAL_STORAGE'],
    optional: ['WRITE_EXTERNAL_STORAGE'],
    suspicious: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'CAMERA', 'RECORD_AUDIO', 'SYSTEM_ALERT_WINDOW'],
  },
  'QR Scanner': {
    expected: ['CAMERA', 'VIBRATE'],
    optional: ['INTERNET', 'READ_EXTERNAL_STORAGE'], // Opening scanned links, scanning images from gallery
    suspicious: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'RECORD_AUDIO', 'SYSTEM_ALERT_WINDOW'],
  },
  'Photo Editor': {
    expected: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'CAMERA', 'VIBRATE'],
    optional: ['INTERNET'], // Downloading filters
    suspicious: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'RECORD_AUDIO', 'SYSTEM_ALERT_WINDOW'],
  },
  Utility: {
    expected: ['INTERNET', 'ACCESS_NETWORK_STATE', 'VIBRATE'],
    optional: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
    suspicious: ['READ_CONTACTS', 'SEND_SMS', 'READ_SMS', 'READ_CALL_LOG', 'ACCESS_FINE_LOCATION', 'SYSTEM_ALERT_WINDOW'],
  },
};

/**
 * Normalizes an incoming category string to match our category knowledge base.
 */
function normalizeCategory(rawCategory, title = '', description = '') {
  if (!rawCategory) rawCategory = '';
  
  // Exact case-insensitive match against known categories
  const knownKeys = Object.keys(CATEGORIES);
  const foundKey = knownKeys.find(k => k.toLowerCase() === rawCategory.toLowerCase().trim());
  if (foundKey) return foundKey;

  const searchStr = `${rawCategory} ${title} ${description}`.toLowerCase();

  if (searchStr.includes('music') || searchStr.includes('audio') || searchStr.includes('podcast')) return 'Music';
  if (searchStr.includes('video player') || searchStr.includes('media player')) return 'Video';
  if (searchStr.includes('stream') || searchStr.includes('ott') || searchStr.includes('netflix') || searchStr.includes('youtube')) return 'Streaming';
  if (searchStr.includes('map') || searchStr.includes('gps')) return 'Maps';
  if (searchStr.includes('navigate') || searchStr.includes('navigation')) return 'Navigation';
  if (searchStr.includes('shopping') || searchStr.includes('e-commerce') || searchStr.includes('store') || searchStr.includes('buy')) return 'Shopping';
  if (searchStr.includes('social') || searchStr.includes('community')) return 'Social';
  if (searchStr.includes('messenger') || searchStr.includes('messaging') || searchStr.includes('chat') || searchStr.includes('sms')) return 'Messaging';
  if (searchStr.includes('video call') || searchStr.includes('conference') || searchStr.includes('zoom') || searchStr.includes('meet')) return 'Video Call';
  if (searchStr.includes('email') || searchStr.includes('mail')) return 'Email';
  if (searchStr.includes('upi') || searchStr.includes('gpay') || searchStr.includes('phonepe') || searchStr.includes('paytm')) return 'UPI';
  if (searchStr.includes('wallet')) return 'Wallet';
  if (searchStr.includes('bank') || searchStr.includes('banking')) return 'Banking';
  if (searchStr.includes('finance') || searchStr.includes('invest') || searchStr.includes('stock')) return 'Finance';
  if (searchStr.includes('health') || searchStr.includes('medical') || searchStr.includes('doctor')) return 'Healthcare';
  if (searchStr.includes('fitness') || searchStr.includes('workout') || searchStr.includes('gym') || searchStr.includes('run')) return 'Fitness';
  if (searchStr.includes('camera') || searchStr.includes('photo capture')) return 'Camera';
  if (searchStr.includes('gallery') || searchStr.includes('photos')) return 'Gallery';
  if (searchStr.includes('browser') || searchStr.includes('web')) return 'Browser';
  if (searchStr.includes('vpn') || searchStr.includes('proxy')) return 'VPN';
  if (searchStr.includes('developer') || searchStr.includes('adb') || searchStr.includes('logcat')) return 'Developer Tools';
  if (searchStr.includes('note') || searchStr.includes('memo') || searchStr.includes('notepad')) return 'Notes';
  if (searchStr.includes('education') || searchStr.includes('learn') || searchStr.includes('study')) return 'Education';
  if (searchStr.includes('game') || searchStr.includes('gaming') || searchStr.includes('arcade') || searchStr.includes('puzzle')) return 'Gaming';
  if (searchStr.includes('news') || searchStr.includes('magazine')) return 'News';
  if (searchStr.includes('productiv') || searchStr.includes('office') || searchStr.includes('document')) return 'Productivity';
  if (searchStr.includes('weather') || searchStr.includes('forecast')) return 'Weather';
  if (searchStr.includes('travel') || searchStr.includes('hotel') || searchStr.includes('flight')) return 'Travel';
  if (searchStr.includes('transport') || searchStr.includes('taxi') || searchStr.includes('cab') || searchStr.includes('ride') || searchStr.includes('uber')) return 'Transportation';
  if (searchStr.includes('gov') || searchStr.includes('passport') || searchStr.includes('aadhaar')) return 'Government';
  if (searchStr.includes('enterprise') || searchStr.includes('mdm') || searchStr.includes('corporate')) return 'Enterprise';
  if (searchStr.includes('calculator') || searchStr.includes('calc')) return 'Calculator';
  if (searchStr.includes('flashlight') || searchStr.includes('torch')) return 'Flashlight';
  if (searchStr.includes('wallpaper')) return 'Wallpaper';
  if (searchStr.includes('qr') || searchStr.includes('barcode') || searchStr.includes('scanner')) return 'QR Scanner';
  if (searchStr.includes('photo edit') || searchStr.includes('filter')) return 'Photo Editor';

  return 'Utility';
}

/**
 * Returns expected, optional, and suspicious lists for a category.
 */
function getCategoryProfile(category) {
  return CATEGORIES[category] || CATEGORIES['Utility'];
}

module.exports = {
  CATEGORIES,
  normalizeCategory,
  getCategoryProfile,
};
