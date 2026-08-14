/**
 * categoryBaseline.js
 * Ground truth baselines for common app categories and warning mappings.
 */

const baselines = {
  Calculator: [
    'android.permission.VIBRATE',
    'VIBRATE'
  ],
  Flashlight: [
    'android.permission.CAMERA',
    'android.permission.VIBRATE',
    'CAMERA',
    'VIBRATE'
  ],
  Notes: [
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE',
    'android.permission.RECORD_AUDIO',
    'READ_EXTERNAL_STORAGE',
    'WRITE_EXTERNAL_STORAGE',
    'RECORD_AUDIO',
    'Storage',
    'Microphone'
  ],
  'QR Scanner': [
    'android.permission.CAMERA',
    'android.permission.VIBRATE',
    'CAMERA',
    'VIBRATE'
  ],
  Wallpaper: [
    'android.permission.SET_WALLPAPER',
    'android.permission.SET_WALLPAPER_HINTS',
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.READ_EXTERNAL_STORAGE',
    'SET_WALLPAPER',
    'SET_WALLPAPER_HINTS',
    'INTERNET',
    'ACCESS_NETWORK_STATE',
    'READ_EXTERNAL_STORAGE',
    'Storage',
    'Internet'
  ],
  Camera: [
    'android.permission.CAMERA',
    'android.permission.RECORD_AUDIO',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'CAMERA',
    'RECORD_AUDIO',
    'READ_EXTERNAL_STORAGE',
    'WRITE_EXTERNAL_STORAGE',
    'ACCESS_FINE_LOCATION',
    'ACCESS_COARSE_LOCATION',
    'Location',
    'Microphone',
    'Storage'
  ],
  'Photo Editor': [
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE',
    'android.permission.CAMERA',
    'READ_EXTERNAL_STORAGE',
    'WRITE_EXTERNAL_STORAGE',
    'CAMERA',
    'Storage',
    'Camera'
  ],
  Weather: [
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'ACCESS_FINE_LOCATION',
    'ACCESS_COARSE_LOCATION',
    'INTERNET',
    'ACCESS_NETWORK_STATE',
    'Location',
    'Internet'
  ],
  Messaging: [
    'android.permission.READ_CONTACTS',
    'android.permission.WRITE_CONTACTS',
    'android.permission.SEND_SMS',
    'android.permission.RECEIVE_SMS',
    'android.permission.READ_SMS',
    'android.permission.RECEIVE_MMS',
    'android.permission.READ_PHONE_STATE',
    'android.permission.CALL_PHONE',
    'android.permission.CAMERA',
    'android.permission.RECORD_AUDIO',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.ACCESS_COARSE_LOCATION',
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'READ_CONTACTS',
    'WRITE_CONTACTS',
    'SEND_SMS',
    'RECEIVE_SMS',
    'READ_SMS',
    'RECEIVE_MMS',
    'READ_PHONE_STATE',
    'CALL_PHONE',
    'CAMERA',
    'RECORD_AUDIO',
    'READ_EXTERNAL_STORAGE',
    'WRITE_EXTERNAL_STORAGE',
    'ACCESS_FINE_LOCATION',
    'ACCESS_COARSE_LOCATION',
    'INTERNET',
    'ACCESS_NETWORK_STATE',
    'Contacts',
    'SMS',
    'Phone',
    'Camera',
    'Microphone',
    'Storage',
    'Location',
    'Internet'
  ],
  Utility: [
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'INTERNET',
    'ACCESS_NETWORK_STATE',
    'Internet'
  ]
};

// Warning map for ~15 common permissions
const warningMap = {
  'CAMERA': 'Allows the app to record videos and take photos, potentially violating visual privacy.',
  'android.permission.CAMERA': 'Allows the app to record videos and take photos, potentially violating visual privacy.',
  
  'ACCESS_FINE_LOCATION': 'Allows the app to track your precise GPS location, enabling movement profiling.',
  'android.permission.ACCESS_FINE_LOCATION': 'Allows the app to track your precise GPS location, enabling movement profiling.',
  
  'ACCESS_COARSE_LOCATION': 'Allows tracking your approximate location via cellular towers/WiFi networks.',
  'android.permission.ACCESS_COARSE_LOCATION': 'Allows tracking your approximate location via cellular towers/WiFi networks.',
  
  'RECORD_AUDIO': 'Grants permission to record environmental sounds or conversations through the microphone.',
  'android.permission.RECORD_AUDIO': 'Grants permission to record environmental sounds or conversations through the microphone.',
  
  'READ_CONTACTS': 'Allows the app to read your contact list, risking exposure of your social network database.',
  'android.permission.READ_CONTACTS': 'Allows the app to read your contact list, risking exposure of your social network database.',
  
  'WRITE_CONTACTS': 'Allows creating or editing contacts without your direct intervention.',
  'android.permission.WRITE_CONTACTS': 'Allows creating or editing contacts without your direct intervention.',
  
  'SEND_SMS': 'Allows sending SMS messages, which could incur charges or be used to leak data.',
  'android.permission.SEND_SMS': 'Allows sending SMS messages, which could incur charges or be used to leak data.',
  
  'RECEIVE_SMS': 'Allows intercepting incoming SMS messages, potentially exposing 2FA tokens.',
  'android.permission.RECEIVE_SMS': 'Allows intercepting incoming SMS messages, potentially exposing 2FA tokens.',
  
  'READ_SMS': 'Allows reading your stored SMS messages, risking exposure of private conversations and verification codes.',
  'android.permission.READ_SMS': 'Allows reading your stored SMS messages, risking exposure of private conversations and verification codes.',
  
  'READ_PHONE_STATE': 'Allows reading device IDs, phone numbers, and call status, enabling hardware tracking.',
  'android.permission.READ_PHONE_STATE': 'Allows reading device IDs, phone numbers, and call status, enabling hardware tracking.',
  
  'CALL_PHONE': 'Allows initiating phone calls directly, potentially incurring unexpected charges.',
  'android.permission.CALL_PHONE': 'Allows initiating phone calls directly, potentially incurring unexpected charges.',
  
  'READ_EXTERNAL_STORAGE': 'Grants access to photos, media, and documents stored on your device.',
  'android.permission.READ_EXTERNAL_STORAGE': 'Grants access to photos, media, and documents stored on your device.',
  
  'WRITE_EXTERNAL_STORAGE': 'Allows modifying or deleting files stored on your device.',
  'android.permission.WRITE_EXTERNAL_STORAGE': 'Allows modifying or deleting files stored on your device.',
  
  'GET_ACCOUNTS': 'Allows access to the list of accounts known by the system (e.g. Google accounts).',
  'android.permission.GET_ACCOUNTS': 'Allows access to the list of accounts known by the system (e.g. Google accounts).',
  
  'READ_CALL_LOG': 'Allows access to your call history list, exposing communication metadata.',
  'android.permission.READ_CALL_LOG': 'Allows access to your call history list, exposing communication metadata.',
  
  'WRITE_CALL_LOG': 'Allows deleting or modifying call logs without user interaction.',
  'android.permission.WRITE_CALL_LOG': 'Allows deleting or modifying call logs without user interaction.',
  
  'SYSTEM_ALERT_WINDOW': 'Allows drawing overlays on top of other apps, which can be hijacked for clickjacking.',
  'android.permission.SYSTEM_ALERT_WINDOW': 'Allows drawing overlays on top of other apps, which can be hijacked for clickjacking.',
  
  'ACCESS_WIFI_STATE': 'Lets the app view and change your Wi-Fi connection without asking each time.',
  'android.permission.ACCESS_WIFI_STATE': 'Lets the app view and change your Wi-Fi connection without asking each time.',
  'CHANGE_WIFI_STATE': 'Lets the app view and change your Wi-Fi connection without asking each time.',
  'android.permission.CHANGE_WIFI_STATE': 'Lets the app view and change your Wi-Fi connection without asking each time.',
  
  'DISABLE_KEYGUARD': 'Lets the app turn off your screen lock, reducing your phone\'s security.',
  'android.permission.DISABLE_KEYGUARD': 'Lets the app turn off your screen lock, reducing your phone\'s security.',
  
  'RECEIVE_BOOT_COMPLETED': 'Lets the app start running automatically every time you turn your phone on, even if you never opened it.',
  'android.permission.RECEIVE_BOOT_COMPLETED': 'Lets the app start running automatically every time you turn your phone on, even if you never opened it.',
  
  'VIBRATE': 'Controls your phone\'s vibration — low risk, but unusual if the app has no clear reason to use it.',
  'android.permission.VIBRATE': 'Controls your phone\'s vibration — low risk, but unusual if the app has no clear reason to use it.',
  
  'BLUETOOTH': 'Lets the app discover and connect to nearby Bluetooth devices without your confirmation each time.',
  'android.permission.BLUETOOTH': 'Lets the app discover and connect to nearby Bluetooth devices without your confirmation each time.',
  'BLUETOOTH_ADMIN': 'Lets the app discover and connect to nearby Bluetooth devices without your confirmation each time.',
  'android.permission.BLUETOOTH_ADMIN': 'Lets the app discover and connect to nearby Bluetooth devices without your confirmation each time.',
  'BLUETOOTH_CONNECT': 'Lets the app discover and connect to nearby Bluetooth devices without your confirmation each time.',
  'android.permission.BLUETOOTH_CONNECT': 'Lets the app discover and connect to nearby Bluetooth devices without your confirmation each time.',
  
  'NFC': 'Lets the app read or interact with NFC tags and contactless payment hardware.',
  'android.permission.NFC': 'Lets the app read or interact with NFC tags and contactless payment hardware.',
  
  'CHANGE_NETWORK_STATE': 'Lets the app control your device\'s network connections.',
  'android.permission.CHANGE_NETWORK_STATE': 'Lets the app control your device\'s network connections.',
  
  'WAKE_LOCK': 'Lets the app keep your screen or processor awake in the background, which can drain battery.',
  'android.permission.WAKE_LOCK': 'Lets the app keep your screen or processor awake in the background, which can drain battery.',
  
  'FOREGROUND_SERVICE': 'Lets the app run an ongoing background process that stays active even when you\'re not using it.',
  'android.permission.FOREGROUND_SERVICE': 'Lets the app run an ongoing background process that stays active even when you\'re not using it.',
  
  'GET_TASKS': 'Lets the app see what other apps you currently have running.',
  'android.permission.GET_TASKS': 'Lets the app see what other apps you currently have running.',
  'REAL_GET_TASKS': 'Lets the app see what other apps you currently have running.',
  'android.permission.REAL_GET_TASKS': 'Lets the app see what other apps you currently have running.'
};

// 3 Predefined safer alternatives per category
const saferAlternatives = {
  Calculator: [
    { name: 'OpenCalc', desc: 'A minimalist, open-source calculator requiring absolutely zero permissions. Fast, lightweight, and fully offline.', badge: 'F-Droid / Play Store' },
    { name: 'Qalculate!', desc: 'Powerful open-source multi-functional calculator that processes expressions locally without internet trackers.', badge: 'GitHub Release' },
    { name: 'Simple Calculator', desc: 'Part of the Simple Mobile Tools suite. Offline calculator with no ads, trackers, or unnecessary permissions.', badge: 'F-Droid' }
  ],
  Flashlight: [
    { name: 'Built-in System Torch', desc: 'Use your phone\'s native quick-settings toggle. It requires zero third-party software permissions and is built directly into Android.', badge: 'System Native' },
    { name: 'Simple Flashlight', desc: 'Open-source flashlight that requires only camera flash permissions on legacy APIs, with zero ads or tracking.', badge: 'F-Droid' },
    { name: 'Privacy Flashlight', desc: 'A light-weight app designed specifically to run without network or location permissions, using minimum hardware access.', badge: 'GitHub' }
  ],
  Notes: [
    { name: 'Standard Notes', desc: 'Secure, end-to-end encrypted note-taking app. Your notes are encrypted locally and cannot be read by anyone else.', badge: 'Play Store' },
    { name: 'Joplin', desc: 'Open-source notes application with support for rich markdown, attachments, and offline-first encryption.', badge: 'F-Droid' },
    { name: 'Simplenote', desc: 'A clean, simple notes app by Automattic. Syncs across platforms with minimal permissions and clear data policy.', badge: 'Play Store' }
  ],
  'QR Scanner': [
    { name: 'Binary Eye', desc: 'Open-source QR & Barcode scanner that requires only camera permissions. Offline scanning, clean interface, zero analytics.', badge: 'F-Droid' },
    { name: 'SecScanQR', desc: 'Privacy-focused QR code reader. Shows scanned URLs and text before opening them, keeping you safe from malicious links.', badge: 'GitHub' },
    { name: 'QR & Barcode Scanner (F-Droid)', desc: 'Extremely lightweight, does not require access to contacts or storage to scan.', badge: 'F-Droid' }
  ],
  Wallpaper: [
    { name: 'Muzei Live Wallpaper', desc: 'Open-source live wallpaper that gently refreshes your home screen daily with famous works of art. Zero spyware.', badge: 'Play Store' },
    { name: 'Wallpapers by Google', desc: 'Clean, reliable wallpaper service providing beautiful curated collections with minimal system overhead.', badge: 'Play Store' },
    { name: 'Kustom LWP', desc: 'Highly customizable live wallpaper creator. Runs sandboxed locally with permissions strictly scoped to rendering.', badge: 'Play Store' }
  ],
  Camera: [
    { name: 'Open Camera', desc: 'Fully featured and completely free open-source camera app. Does not track you, show ads, or force online backups.', badge: 'F-Droid / Play Store' },
    { name: 'Simple Camera', desc: 'Clean camera layout from the Simple Mobile Tools suite. Restricts photo capture to local-only storage.', badge: 'F-Droid' },
    { name: 'Secure Camera (GrapheneOS)', desc: 'Privacy-focused camera app developed for GrapheneOS. Stripped of metadata leaks and tracking code.', badge: 'GitHub' }
  ],
  'Photo Editor': [
    { name: 'Snapseed (Offline)', desc: 'Professional photo editor by Google. Works fully offline without requiring account sign-ins or network access.', badge: 'Play Store' },
    { name: 'Pocket Paint', desc: 'Open-source image editor developed by Catrobat. Simple interface for drawing and editing with zero tracking.', badge: 'F-Droid' },
    { name: 'Photo Editor (F-Droid)', desc: 'Privacy-friendly editor focusing on resizing, cropping, and color correction entirely local to the device.', badge: 'F-Droid' }
  ],
  Weather: [
    { name: 'Breezy Weather', desc: 'Open-source weather app fetching data from public sources (DWD, Met.no). Requires zero tracking and works with manual location input.', badge: 'F-Droid' },
    { name: 'Privacy Friendly Weather', desc: 'Developed by SECUSO research group. Only requests coarse location or manual cities, storing all weather info locally.', badge: 'F-Droid' },
    { name: 'Geometric Weather', desc: 'Lightweight, modern weather application offering accurate forecasts without hidden telemetry or location leakage.', badge: 'GitHub' }
  ],
  Messaging: [
    { name: 'Signal Private Messenger', desc: 'State-of-the-art end-to-end encrypted messaging. Fully open-source client and server, keeping conversations secure.', badge: 'Play Store' },
    { name: 'Session', desc: 'Decentralized messenger requiring no phone number or email to register. Operates on a user-operated onion routing network.', badge: 'F-Droid' },
    { name: 'Threema', desc: 'Anonymous messaging service built in Switzerland. Can be used completely anonymously without linking contacts.', badge: 'Threema Store' }
  ],
  Utility: [
    { name: 'Simple Tools Suite', desc: 'A collection of privacy-focused utility tools (dialer, calendar, file manager) operating entirely offline.', badge: 'F-Droid' },
    { name: 'Kore Reader', desc: 'Open-source document and ebook viewer requiring zero internet connections or account sync permissions.', badge: 'F-Droid' },
    { name: 'Amaze File Manager', desc: 'Open-source, secure file explorer with clean Material Design and local-only access controls.', badge: 'Play Store' }
  ]
};

module.exports = {
  baselines,
  warningMap,
  saferAlternatives
};
