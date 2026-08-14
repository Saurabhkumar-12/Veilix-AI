/**
 * permissionKnowledge.js
 *
 * Authoritative metadata database for Android permissions.
 * Each entry describes what the permission does, its sensitivity,
 * default risk level, potential for abuse, and which app categories
 * legitimately need it.
 *
 * Sensitivity levels: LOW | MEDIUM | HIGH | CRITICAL
 * Risk levels:        Low | Medium | High | Critical
 */

const PERMISSION_DB = {
  // ── Camera & Microphone ────────────────────────────────────────────────────
  CAMERA: {
    purpose: 'Access device camera to take photos or record video',
    sensitivity: 'HIGH',
    defaultRisk: 'Medium',
    description: 'Allows the app to open and use the device camera. When active the camera hardware is engaged and can capture photos or video.',
    typicalCategories: ['Camera', 'Video Call', 'Social', 'Messaging', 'QR Scanner', 'Shopping', 'Photo Editor', 'Fitness'],
    potentialAbuse: 'Silent recording of environment, capturing images without user awareness',
    examples: ['WhatsApp video calls', 'Instagram stories', 'Google Lens scanning'],
  },
  RECORD_AUDIO: {
    purpose: 'Access microphone to record audio or voice',
    sensitivity: 'HIGH',
    defaultRisk: 'Medium',
    description: 'Allows the app to record audio through the device microphone. This includes voice, ambient sounds, and any audio in range.',
    typicalCategories: ['Video Call', 'Messaging', 'Music', 'Fitness', 'Notes', 'Education', 'Voice Assistant'],
    potentialAbuse: 'Covert audio recording, voice profiling, eavesdropping',
    examples: ['Zoom meetings', 'Voice notes in Google Keep', 'Shazam music recognition'],
  },

  // ── Location ───────────────────────────────────────────────────────────────
  ACCESS_FINE_LOCATION: {
    purpose: 'Access precise GPS location (within meters)',
    sensitivity: 'HIGH',
    defaultRisk: 'Medium',
    description: 'Provides GPS-level precision of the device location. Apps can track movement and build detailed location history.',
    typicalCategories: ['Maps', 'Navigation', 'Transportation', 'Fitness', 'Weather', 'Travel', 'Dating', 'Food Delivery'],
    potentialAbuse: 'Persistent location tracking, movement profiling, selling location data to advertisers',
    examples: ['Google Maps navigation', 'Uber driver tracking', 'Strava run tracking'],
  },
  ACCESS_COARSE_LOCATION: {
    purpose: 'Access approximate location (via Wi-Fi/cell towers, ~100–1000m accuracy)',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Determines approximate location using network signals. Less precise than GPS but still enables neighborhood-level tracking.',
    typicalCategories: ['Maps', 'Weather', 'News', 'Shopping', 'Social', 'Navigation', 'Food Delivery'],
    potentialAbuse: 'City-level location tracking, targeted advertising based on area',
    examples: ['Weather apps showing local forecast', 'News apps showing regional stories'],
  },
  ACCESS_BACKGROUND_LOCATION: {
    purpose: 'Access location even when the app is not in use (background)',
    sensitivity: 'CRITICAL',
    defaultRisk: 'High',
    description: 'Allows the app to access location continuously in the background, even when closed. Requires explicit user approval on Android 10+.',
    typicalCategories: ['Maps', 'Navigation', 'Fitness', 'Transportation', 'Family Safety'],
    potentialAbuse: 'Continuous 24/7 location surveillance, geofencing for ad targeting, building detailed movement profiles',
    examples: ['Google Maps location sharing', 'Life360 family tracking'],
  },

  // ── Contacts & Communication ───────────────────────────────────────────────
  READ_CONTACTS: {
    purpose: 'Read user contacts list including names, phone numbers, and emails',
    sensitivity: 'HIGH',
    defaultRisk: 'Medium',
    description: 'Provides read access to all contacts stored on the device. This includes names, phone numbers, email addresses, and organization data.',
    typicalCategories: ['Messaging', 'Video Call', 'Social', 'Email', 'Phone', 'UPI', 'Banking'],
    potentialAbuse: 'Bulk contact harvesting, spam targeting, selling contact lists, social graph mapping',
    examples: ['WhatsApp finding existing users', 'Gmail autocomplete addresses'],
  },
  WRITE_CONTACTS: {
    purpose: 'Create or modify contacts on the device',
    sensitivity: 'HIGH',
    defaultRisk: 'Medium',
    description: 'Allows creating, editing, and deleting contacts. This can modify the user\'s personal address book without explicit interaction.',
    typicalCategories: ['Messaging', 'Email', 'Social', 'Phone', 'CRM'],
    potentialAbuse: 'Injecting fake contacts, modifying existing contacts, deleting contact entries',
    examples: ['CRM apps syncing business contacts', 'Social apps linking accounts to contacts'],
  },
  READ_CALL_LOG: {
    purpose: 'Read the device call history (incoming, outgoing, missed calls)',
    sensitivity: 'CRITICAL',
    defaultRisk: 'High',
    description: 'Provides access to the complete call log including call times, durations, and all numbers called or received.',
    typicalCategories: ['Phone', 'Call Blocker', 'Enterprise'],
    potentialAbuse: 'Building communication profiles, identifying relationships, exposing sensitive business calls',
    examples: ['Call blocker apps filtering spam calls', 'Business phone managers'],
  },
  WRITE_CALL_LOG: {
    purpose: 'Modify or delete call history entries',
    sensitivity: 'CRITICAL',
    defaultRisk: 'High',
    description: 'Allows modifying or deleting entries from the call log. Very few legitimate apps need this.',
    typicalCategories: ['Phone'],
    potentialAbuse: 'Hiding communication records, evidence tampering',
    examples: ['Phone app itself'],
  },

  // ── SMS & Messaging ────────────────────────────────────────────────────────
  SEND_SMS: {
    purpose: 'Send SMS text messages from the device',
    sensitivity: 'CRITICAL',
    defaultRisk: 'High',
    description: 'Allows sending SMS messages which can incur carrier charges. Can be used to send messages to premium numbers.',
    typicalCategories: ['Messaging', 'Phone', 'Banking', 'UPI'],
    potentialAbuse: 'Sending spam SMS, premium number fraud, silently sending user data via SMS',
    examples: ['WhatsApp SMS verification', 'Banking OTP apps'],
  },
  RECEIVE_SMS: {
    purpose: 'Intercept and read incoming SMS messages',
    sensitivity: 'CRITICAL',
    defaultRisk: 'High',
    description: 'Allows the app to receive and read all incoming SMS messages before the default SMS app. Can intercept OTP/2FA codes.',
    typicalCategories: ['Messaging', 'Phone', 'Banking', 'UPI'],
    potentialAbuse: 'Stealing 2FA codes, reading banking OTPs, intercepting private messages',
    examples: ['Auto-reading OTP codes in banking apps'],
  },
  READ_SMS: {
    purpose: 'Read stored SMS and MMS messages from device inbox',
    sensitivity: 'CRITICAL',
    defaultRisk: 'High',
    description: 'Provides access to the complete SMS inbox, outbox, and drafts. Exposes all text message conversations.',
    typicalCategories: ['Messaging', 'Phone', 'Banking'],
    potentialAbuse: 'Reading private conversations, extracting OTP codes, accessing banking messages',
    examples: ['Default SMS apps', 'Banking apps auto-reading OTP'],
  },
  RECEIVE_MMS: {
    purpose: 'Receive multimedia MMS messages',
    sensitivity: 'HIGH',
    defaultRisk: 'Medium',
    description: 'Allows the app to receive MMS messages containing images, audio, and video.',
    typicalCategories: ['Messaging', 'Phone'],
    potentialAbuse: 'Receiving and storing multimedia from unknown sources',
    examples: ['Default SMS/MMS apps', 'Messaging apps'],
  },

  // ── Phone & Device Identity ────────────────────────────────────────────────
  READ_PHONE_STATE: {
    purpose: 'Read device identity, phone number, and call status',
    sensitivity: 'HIGH',
    defaultRisk: 'Medium',
    description: 'Provides access to device IMEI, phone number, SIM info, and whether a call is active. Used for device identification.',
    typicalCategories: ['Messaging', 'Banking', 'UPI', 'Phone', 'Enterprise'],
    potentialAbuse: 'Hardware fingerprinting, persistent device tracking even after factory reset (IMEI)',
    examples: ['Banking apps verifying device identity', 'WhatsApp device verification'],
  },
  CALL_PHONE: {
    purpose: 'Initiate phone calls directly without user confirmation',
    sensitivity: 'HIGH',
    defaultRisk: 'Medium',
    description: 'Allows the app to dial and initiate phone calls without showing the dial pad for user confirmation.',
    typicalCategories: ['Phone', 'Business', 'Enterprise', 'Transportation'],
    potentialAbuse: 'Calling premium numbers without user knowledge, unauthorized calls',
    examples: ['Uber driver calling passenger', 'Business phone apps'],
  },
  READ_PHONE_NUMBERS: {
    purpose: 'Read phone numbers associated with this device',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Allows reading the phone number(s) assigned to the device SIM cards.',
    typicalCategories: ['Messaging', 'Banking', 'UPI'],
    potentialAbuse: 'Harvesting device phone numbers without explicit user input',
    examples: ['WhatsApp auto-filling registration number'],
  },

  // ── Storage ────────────────────────────────────────────────────────────────
  READ_EXTERNAL_STORAGE: {
    purpose: 'Read files and media stored on device storage',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Provides read access to all files on device storage including photos, videos, documents, and downloads.',
    typicalCategories: ['Photo Editor', 'Gallery', 'Social', 'Messaging', 'File Manager', 'Music', 'Video'],
    potentialAbuse: 'Reading private documents, scanning for sensitive files, exfiltrating photos',
    examples: ['WhatsApp sending photos', 'Spotify loading local music files'],
  },
  WRITE_EXTERNAL_STORAGE: {
    purpose: 'Write, modify, or delete files on device storage',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Allows creating, modifying, and deleting files on device storage.',
    typicalCategories: ['Photo Editor', 'Camera', 'Social', 'Messaging', 'File Manager', 'Music', 'Video', 'Downloader'],
    potentialAbuse: 'Writing malicious files, modifying existing files, filling storage to cause denial of service',
    examples: ['Camera apps saving photos', 'Music apps downloading tracks'],
  },
  MANAGE_EXTERNAL_STORAGE: {
    purpose: 'Broad access to all files on device (All Files Access)',
    sensitivity: 'CRITICAL',
    defaultRisk: 'High',
    description: 'Grants access to all files on the device including system directories. This is a restricted permission requiring Play Store policy compliance review.',
    typicalCategories: ['File Manager', 'Backup', 'Antivirus'],
    potentialAbuse: 'Complete device file system access, exfiltration of all personal data',
    examples: ['Solid Explorer file manager', 'Phone backup utilities'],
  },

  // ── Network & Connectivity ─────────────────────────────────────────────────
  INTERNET: {
    purpose: 'Open network connections and access the internet',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Allows the app to create network connections. Required by virtually any app that syncs data, loads content, or communicates with servers.',
    typicalCategories: ['*'],
    potentialAbuse: 'Sending device data to remote servers without disclosure',
    examples: ['Any app that loads data from the internet'],
  },
  ACCESS_NETWORK_STATE: {
    purpose: 'Check if network connectivity is available (Wi-Fi, mobile data)',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Read-only access to network connectivity status. Very common — used to check if online before making network requests.',
    typicalCategories: ['*'],
    potentialAbuse: 'Monitoring when user connects to public Wi-Fi',
    examples: ['All networked apps checking connectivity'],
  },
  ACCESS_WIFI_STATE: {
    purpose: 'Read Wi-Fi network information (SSID, connection state)',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Allows reading Wi-Fi network name (SSID), whether connected, and signal strength. Can be used for location approximation.',
    typicalCategories: ['Smart Home', 'Gaming', 'Developer Tools', 'Maps'],
    potentialAbuse: 'Location tracking via known Wi-Fi networks, Wi-Fi fingerprinting',
    examples: ['Smart home apps detecting home network', 'Gaming apps preferring Wi-Fi'],
  },
  CHANGE_WIFI_STATE: {
    purpose: 'Connect to or disconnect from Wi-Fi networks',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Medium',
    description: 'Allows the app to enable/disable Wi-Fi and connect to specific networks.',
    typicalCategories: ['Smart Home', 'Enterprise', 'VPN'],
    potentialAbuse: 'Disconnecting device from Wi-Fi, forcing expensive mobile data usage',
    examples: ['Enterprise MDM apps managing network connectivity'],
  },
  CHANGE_NETWORK_STATE: {
    purpose: 'Change network connectivity settings',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Medium',
    description: 'Allows controlling the device\'s network connectivity.',
    typicalCategories: ['Enterprise', 'VPN', 'Developer Tools'],
    potentialAbuse: 'Cutting off network access, forcing specific connections',
    examples: ['VPN apps managing network routing'],
  },

  // ── Bluetooth ──────────────────────────────────────────────────────────────
  BLUETOOTH: {
    purpose: 'Connect to paired Bluetooth devices',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Allows the app to communicate with already-paired Bluetooth devices. Common for audio accessories and IoT.',
    typicalCategories: ['Music', 'Fitness', 'Smart Home', 'Gaming', 'Enterprise'],
    potentialAbuse: 'Scanning for nearby Bluetooth devices to build location profile',
    examples: ['Spotify connecting to Bluetooth speakers', 'Fitness trackers syncing data'],
  },
  BLUETOOTH_ADMIN: {
    purpose: 'Discover and pair new Bluetooth devices',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Allows initiating Bluetooth discovery and managing the pairing process.',
    typicalCategories: ['Music', 'Fitness', 'Smart Home', 'Gaming'],
    potentialAbuse: 'Scanning for nearby devices, building proximity profiles',
    examples: ['Headphone companion apps', 'Fitness tracker setup'],
  },
  BLUETOOTH_CONNECT: {
    purpose: 'Connect to Bluetooth devices (Android 12+)',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Android 12+ granular Bluetooth permission for connecting to paired devices.',
    typicalCategories: ['Music', 'Fitness', 'Smart Home', 'Gaming', 'Messaging'],
    potentialAbuse: 'Low abuse potential for paired devices only',
    examples: ['Spotify, YouTube Music, fitness apps'],
  },
  BLUETOOTH_SCAN: {
    purpose: 'Scan for nearby Bluetooth devices',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Medium',
    description: 'Android 12+ permission to scan for nearby Bluetooth devices. Can be used for location without GPS permission.',
    typicalCategories: ['Smart Home', 'Fitness', 'Gaming'],
    potentialAbuse: 'Location inference via Bluetooth beacons, proximity tracking',
    examples: ['Smart home apps finding devices', 'Fitness trackers'],
  },

  // ── Background & System ────────────────────────────────────────────────────
  RECEIVE_BOOT_COMPLETED: {
    purpose: 'Start automatically when device boots up',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Allows the app to launch a background service every time the device starts. This means the app runs even if you never open it.',
    typicalCategories: ['Messaging', 'Email', 'Alarm', 'Fitness', 'Banking', 'Social', 'Security'],
    potentialAbuse: 'Always-on background data collection, battery drain, persistent surveillance',
    examples: ['WhatsApp receiving messages in background', 'Alarm apps', 'Email clients'],
  },
  WAKE_LOCK: {
    purpose: 'Prevent processor from sleeping to continue background processing',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Keeps CPU awake to finish background tasks. Legitimate for media playback and messaging but can cause battery drain.',
    typicalCategories: ['Music', 'Video', 'Messaging', 'Navigation', 'Fitness'],
    potentialAbuse: 'Keeping malicious background processes alive, draining battery',
    examples: ['Spotify playing music with screen off', 'Maps navigation'],
  },
  FOREGROUND_SERVICE: {
    purpose: 'Run a persistent visible background service (with notification)',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Allows running a background service that shows a persistent notification. User is aware the app is active.',
    typicalCategories: ['Music', 'Navigation', 'Fitness', 'Messaging', 'VPN', 'Download Manager'],
    potentialAbuse: 'Running persistent background processes under the guise of a service',
    examples: ['Spotify media notification', 'Maps navigation notification', 'VPN connection'],
  },
  SYSTEM_ALERT_WINDOW: {
    purpose: 'Draw overlays on top of other apps (appear over apps)',
    sensitivity: 'HIGH',
    defaultRisk: 'High',
    description: 'Allows the app to display content over other apps. This is a powerful permission that can hide UI or perform clickjacking.',
    typicalCategories: ['Messaging', 'Accessibility', 'Phone', 'Password Manager'],
    potentialAbuse: 'Clickjacking attacks, overlaying fake UI to steal credentials, hiding malicious activity',
    examples: ['Facebook Messenger chat heads', 'Screen overlay apps'],
  },
  DISABLE_KEYGUARD: {
    purpose: 'Dismiss or disable the device screen lock',
    sensitivity: 'HIGH',
    defaultRisk: 'High',
    description: 'Allows the app to disable or bypass the screen lock mechanism.',
    typicalCategories: ['Alarm', 'Phone'],
    potentialAbuse: 'Bypassing device security, allowing physical access without PIN/pattern',
    examples: ['Alarm apps dismissing lock screen when alarm fires'],
  },

  // ── Accounts & Identity ────────────────────────────────────────────────────
  GET_ACCOUNTS: {
    purpose: 'Access the list of accounts registered on the device (Google, etc.)',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Lists all account names (email addresses) registered on the device. Often used to auto-fill account selection.',
    typicalCategories: ['Social', 'Email', 'Productivity', 'Shopping', 'Banking'],
    potentialAbuse: 'Harvesting email addresses, identifying user accounts for targeting',
    examples: ['Google apps showing account switcher', 'Apps offering Google sign-in'],
  },
  USE_BIOMETRIC: {
    purpose: 'Use fingerprint or face authentication',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Allows the app to prompt biometric authentication. The biometric data never leaves the device secure enclave.',
    typicalCategories: ['Banking', 'Password Manager', 'Finance', 'Enterprise'],
    potentialAbuse: 'Very low risk — biometric data is not accessible to the app',
    examples: ['Banking apps using fingerprint to approve payments'],
  },
  USE_FINGERPRINT: {
    purpose: 'Use fingerprint authentication (older API)',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Legacy version of biometric authentication. Same security model — fingerprint data stays in secure enclave.',
    typicalCategories: ['Banking', 'Password Manager', 'Finance', 'Enterprise'],
    potentialAbuse: 'Very low risk',
    examples: ['Banking apps, password managers'],
  },

  // ── Vibration & Notifications ──────────────────────────────────────────────
  VIBRATE: {
    purpose: 'Control device vibration motor',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Allows triggering the vibration motor. Used for haptic feedback and notification vibrations. Very low risk.',
    typicalCategories: ['*'],
    potentialAbuse: 'Minimal — can drain battery slightly with excessive vibration',
    examples: ['Messaging notifications', 'Game haptic feedback'],
  },
  POST_NOTIFICATIONS: {
    purpose: 'Show notifications to the user',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Required on Android 13+ to show any notifications. Standard for all apps that communicate with users.',
    typicalCategories: ['*'],
    potentialAbuse: 'Excessive notification spam, misleading notification content',
    examples: ['Messaging apps, news apps, all apps with alerts'],
  },

  // ── Special / High-Risk System ─────────────────────────────────────────────
  BIND_ACCESSIBILITY_SERVICE: {
    purpose: 'Run as an accessibility service (full UI control and observation)',
    sensitivity: 'CRITICAL',
    defaultRisk: 'Critical',
    description: 'Grants nearly complete control over the UI — can read all screen content, simulate touches, and interact with other apps.',
    typicalCategories: ['Accessibility', 'Password Manager', 'Enterprise MDM'],
    potentialAbuse: 'Reading banking credentials from screens, automating account takeover, complete device monitoring',
    examples: ['LastPass autofill', 'Screen readers', 'Switch access'],
  },
  DEVICE_ADMIN: {
    purpose: 'Device administrator privileges (remote wipe, lock enforcement)',
    sensitivity: 'CRITICAL',
    defaultRisk: 'Critical',
    description: 'Provides highest privilege level — can remotely wipe device, enforce password policies, and disable device features.',
    typicalCategories: ['Enterprise MDM', 'Security', 'Device Manager'],
    potentialAbuse: 'Ransomware, unauthorized remote wipe, locking user out of their own device',
    examples: ['Microsoft Intune MDM', 'Enterprise device management'],
  },
  INSTALL_PACKAGES: {
    purpose: 'Install additional APK packages on the device',
    sensitivity: 'CRITICAL',
    defaultRisk: 'Critical',
    description: 'Allows the app to silently install other applications. This is how malware propagates.',
    typicalCategories: ['App Store', 'Enterprise', 'Developer Tools'],
    potentialAbuse: 'Installing malware, installing unwanted apps, self-replication',
    examples: ['F-Droid (alternative app store)', 'Enterprise MDM'],
  },
  REQUEST_INSTALL_PACKAGES: {
    purpose: 'Request permission to install packages from unknown sources',
    sensitivity: 'CRITICAL',
    defaultRisk: 'Critical',
    description: 'Allows prompting the user to install APKs from outside the Play Store. High-risk vector for sideloading malware.',
    typicalCategories: ['App Store', 'Developer Tools'],
    potentialAbuse: 'Distributing malicious APKs, bypassing Play Protect',
    examples: ['APKPure, APKMirror, enterprise app distribution'],
  },
  NFC: {
    purpose: 'Read and write NFC tags and communicate with NFC devices',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Allows the app to use the NFC hardware for contactless communication. Required for mobile payments.',
    typicalCategories: ['Banking', 'UPI', 'Wallet', 'Transportation', 'Smart Home'],
    potentialAbuse: 'Reading NFC cards at close range, relay attacks on NFC payments',
    examples: ['Google Pay contactless payments', 'Transit card readers'],
  },
  BODY_SENSORS: {
    purpose: 'Access heart rate, step count, and other body sensors',
    sensitivity: 'HIGH',
    defaultRisk: 'Medium',
    description: 'Provides access to wearable health sensors including heart rate monitors.',
    typicalCategories: ['Fitness', 'Healthcare', 'Wearable'],
    potentialAbuse: 'Building health profiles, inferring medical conditions, insurance discrimination',
    examples: ['Fitbit, Samsung Health, Garmin Connect'],
  },
  ACTIVITY_RECOGNITION: {
    purpose: 'Detect physical activity (walking, running, driving)',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Uses accelerometer and ML to detect physical activity type without requiring location.',
    typicalCategories: ['Fitness', 'Healthcare', 'Maps', 'Transportation'],
    potentialAbuse: 'Building movement patterns, inferring daily routines',
    examples: ['Google Fit activity detection', 'Maps detecting transit mode'],
  },
  USE_EXACT_ALARM: {
    purpose: 'Schedule precise alarms that fire at exact times',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Allows scheduling alarms that fire at specific times. Required for time-sensitive features like reminders and calendars.',
    typicalCategories: ['Productivity', 'Calendar', 'Alarm', 'Fitness', 'Banking'],
    potentialAbuse: 'Very low risk',
    examples: ['Alarm clock apps', 'Calendar reminders', 'Banking scheduled transfers'],
  },

  // ── Additional Common Permissions ──────────────────────────────────────────
  SET_WALLPAPER: {
    purpose: 'Set the home screen or lock screen wallpaper',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Allows changing the device wallpaper.',
    typicalCategories: ['Wallpaper', 'Gallery', 'Social', 'Launcher'],
    potentialAbuse: 'Very low risk',
    examples: ['Wallpaper apps', 'Google Photos'],
  },
  SET_WALLPAPER_HINTS: {
    purpose: 'Provide wallpaper size hints to the launcher',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Provides wallpaper dimensions to ensure correct display.',
    typicalCategories: ['Wallpaper', 'Launcher'],
    potentialAbuse: 'Very low risk',
    examples: ['Wallpaper apps'],
  },
  SCHEDULE_EXACT_ALARM: {
    purpose: 'Schedule exact alarms (Android 12+)',
    sensitivity: 'LOW',
    defaultRisk: 'Low',
    description: 'Android 12+ version of exact alarm scheduling.',
    typicalCategories: ['Productivity', 'Calendar', 'Alarm', 'Fitness'],
    potentialAbuse: 'Very low risk',
    examples: ['Calendar apps, alarm apps'],
  },
  CHANGE_CONFIGURATION: {
    purpose: 'Change device configuration (language, orientation)',
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: 'Allows changing device-wide configurations.',
    typicalCategories: ['Launcher', 'Accessibility', 'Enterprise'],
    potentialAbuse: 'Changing device settings without user knowledge',
    examples: ['Launcher apps, accessibility apps'],
  },
  GET_TASKS: {
    purpose: 'View list of currently running apps',
    sensitivity: 'HIGH',
    defaultRisk: 'Medium',
    description: 'Allows the app to see what other apps are currently running.',
    typicalCategories: ['Security', 'Antivirus', 'Task Manager'],
    potentialAbuse: 'Spying on user app usage patterns, detecting banking apps',
    examples: ['Task manager apps, antivirus apps'],
  },
  RECEIVE_WAP_PUSH: {
    purpose: 'Receive WAP push messages',
    sensitivity: 'HIGH',
    defaultRisk: 'Medium',
    description: 'Allows receiving WAP push messages, an older mobile internet technology.',
    typicalCategories: ['Messaging', 'Phone'],
    potentialAbuse: 'Receiving unwanted push content',
    examples: ['Default messaging apps'],
  },
};

/**
 * Look up metadata for a given permission name.
 * Falls back to a generic entry if the permission is unknown.
 * @param {string} permissionName  Normalized permission name (e.g. 'CAMERA')
 * @returns {object}
 */
function getPermissionMeta(permissionName) {
  const key = permissionName.toUpperCase().replace('ANDROID.PERMISSION.', '');
  return PERMISSION_DB[key] || {
    purpose: `Access to ${key} system capability`,
    sensitivity: 'MEDIUM',
    defaultRisk: 'Low',
    description: `Grants the app access to the ${key} Android system capability.`,
    typicalCategories: [],
    potentialAbuse: 'Unknown — verify this permission is relevant to the app\'s stated purpose.',
    examples: [],
  };
}

/**
 * Returns true if a permission is considered high-sensitivity (High or Critical).
 * @param {string} permissionName
 * @returns {boolean}
 */
function isHighSensitivity(permissionName) {
  const meta = getPermissionMeta(permissionName);
  return meta.sensitivity === 'HIGH' || meta.sensitivity === 'CRITICAL';
}

/**
 * Returns true if a permission is considered critical.
 * @param {string} permissionName
 * @returns {boolean}
 */
function isCriticalPermission(permissionName) {
  const meta = getPermissionMeta(permissionName);
  return meta.sensitivity === 'CRITICAL';
}

/**
 * Normalises a permission string to standard uppercase short name.
 */
function normalizePermissions(perm) {
  if (!perm) return '';
  const pStr = (typeof perm === 'string' ? perm : perm.permission || perm.permissionId || '').trim().toLowerCase();
  if (!pStr) return '';

  if (pStr.includes('android.permission.')) {
    return pStr.replace('android.permission.', '').trim().toUpperCase();
  }

  const upperStr = pStr.toUpperCase();
  const knownShortNames = [
    'CAMERA', 'RECORD_AUDIO', 'READ_CONTACTS', 'WRITE_CONTACTS',
    'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION',
    'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'MANAGE_EXTERNAL_STORAGE',
    'SEND_SMS', 'RECEIVE_SMS', 'READ_SMS', 'RECEIVE_MMS',
    'READ_PHONE_STATE', 'CALL_PHONE', 'READ_CALL_LOG', 'WRITE_CALL_LOG',
    'GET_ACCOUNTS', 'SYSTEM_ALERT_WINDOW', 'SET_WALLPAPER', 'SET_WALLPAPER_HINTS',
    'INTERNET', 'ACCESS_NETWORK_STATE', 'ACCESS_WIFI_STATE', 'CHANGE_WIFI_STATE',
    'VIBRATE', 'BLUETOOTH', 'BLUETOOTH_ADMIN', 'BLUETOOTH_CONNECT', 'BLUETOOTH_SCAN',
    'RECEIVE_BOOT_COMPLETED', 'WAKE_LOCK', 'FOREGROUND_SERVICE', 'NFC',
    'BIND_ACCESSIBILITY_SERVICE', 'DEVICE_ADMIN', 'POST_NOTIFICATIONS'
  ];
  if (knownShortNames.includes(upperStr)) return upperStr;

  // Heuristic matching — Android system permission names
  if (pStr.includes('camera') || pStr.includes('take photo')) return 'CAMERA';
  if (pStr.includes('record audio') || pStr.includes('microphone') || pStr.includes('mic')) return 'RECORD_AUDIO';
  if (pStr.includes('precise location') || pStr.includes('gps')) return 'ACCESS_FINE_LOCATION';
  if (pStr.includes('approximate location') || pStr.includes('coarse location')) return 'ACCESS_COARSE_LOCATION';
  if (pStr.includes('background location')) return 'ACCESS_BACKGROUND_LOCATION';
  if (pStr.includes('modify or delete') || pStr.includes('write external')) return 'WRITE_EXTERNAL_STORAGE';
  if (pStr.includes('read external') || pStr.includes('read storage')) return 'READ_EXTERNAL_STORAGE';
  if (pStr.includes('send sms')) return 'SEND_SMS';
  if (pStr.includes('receive sms')) return 'RECEIVE_SMS';
  if (pStr.includes('read sms')) return 'READ_SMS';
  if (pStr.includes('contacts')) return 'READ_CONTACTS';
  if (pStr.includes('phone state') || pStr.includes('phone status')) return 'READ_PHONE_STATE';
  if (pStr.includes('call phone') || pStr.includes('make calls')) return 'CALL_PHONE';
  if (pStr.includes('vibration') || pStr.includes('vibrate') || pStr === 'haptic feedback') return 'VIBRATE';
  if (pStr.includes('full network') || pStr.includes('internet access')) return 'INTERNET';

  // Human-readable labels from the scraper (formatPermissionLabel output)
  if (pStr === 'network access' || pStr.includes('network access')) return 'INTERNET';
  if (pStr === 'storage' || pStr === 'media')                        return 'READ_EXTERNAL_STORAGE';
  if (pStr === 'location')                                           return 'ACCESS_FINE_LOCATION';
  if (pStr === 'sms messages')                                       return 'SEND_SMS';
  if (pStr === 'phone state')                                        return 'READ_PHONE_STATE';
  if (pStr === 'bluetooth')                                          return 'BLUETOOTH';
  if (pStr === 'calendar')                                           return 'READ_CALENDAR';
  if (pStr === 'body sensors')                                       return 'BODY_SENSORS';
  if (pStr === 'notifications')                                      return 'POST_NOTIFICATIONS';
  if (pStr === 'background operation')                               return 'WAKE_LOCK';

  return upperStr;
}

const PERMISSION_FEATURE_MAP = {
  CAMERA: [
    { feature: 'taking photos or videos',         keywords: ['take photo', 'take picture', 'take selfie', 'capture photo', 'snapshot'] },
    { feature: 'video calls or video chat',        keywords: ['video call', 'video chat', 'video conference', 'video meeting', 'face-to-face call'] },
    { feature: 'QR code or barcode scanning',      keywords: ['qr code', 'scan qr', 'barcode', 'scan barcode', 'qr scanner'] },
    { feature: 'augmented reality',                keywords: ['augmented reality', 'ar filter', 'ar feature', 'ar effect'] },
    { feature: 'document or receipt scanning',     keywords: ['scan document', 'document scan', 'scan receipt', 'scan check', 'digitize document'] },
    { feature: 'live camera feed',                 keywords: ['live camera', 'camera stream', 'camera preview'] },
  ],
  RECORD_AUDIO: [
    { feature: 'voice or audio calls',             keywords: ['voice call', 'audio call', 'voice chat', 'call feature', 'make a call'] },
    { feature: 'voice messages',                   keywords: ['voice message', 'voice note', 'audio message', 'voice memo', 'send voice'] },
    { feature: 'audio recording',                  keywords: ['record audio', 'audio recording', 'voice recorder', 'record sound', 'voice recording'] },
    { feature: 'music or audio recognition',       keywords: ['music recognition', 'identify song', 'sound recognition', 'song identify'] },
    { feature: 'speech-to-text',                   keywords: ['speech to text', 'voice to text', 'dictate', 'voice typing', 'speech recognition', 'voice input'] },
    { feature: 'voice search',                     keywords: ['voice search', 'search by voice', 'speak to search'] },
    { feature: 'podcast creation',                 keywords: ['record podcast', 'create podcast', 'podcast recording'] },
  ],
  ACCESS_FINE_LOCATION: [
    { feature: 'navigation or directions',         keywords: ['navigation', 'turn-by-turn', 'get directions', 'route', 'navigate'] },
    { feature: 'location-based features',          keywords: ['location-based', 'location services', 'gps tracking', 'geolocation'] },
    { feature: 'delivery or ride tracking',        keywords: ['delivery tracking', 'track driver', 'track delivery', 'live tracking', 'track order'] },
    { feature: 'fitness or route tracking',        keywords: ['run tracking', 'route tracking', 'fitness tracking', 'track workout', 'track run', 'track activity'] },
    { feature: 'live location sharing',            keywords: ['share location', 'live location', 'location sharing', 'family tracking', 'share my location'] },
    { feature: 'nearby places or search',          keywords: ['find nearby', 'places nearby', 'nearby restaurants', 'nearby stores', 'search nearby'] },
  ],
  ACCESS_COARSE_LOCATION: [
    { feature: 'local weather forecast',           keywords: ['local weather', 'weather forecast', 'local forecast', 'weather conditions'] },
    { feature: 'local news or content',            keywords: ['local news', 'local content', 'regional news', 'news near me'] },
    { feature: 'location-based features',          keywords: ['location-based', 'nearby', 'local services'] },
  ],
  ACCESS_BACKGROUND_LOCATION: [
    { feature: 'continuous background tracking',   keywords: ['background location', 'always-on location', 'continuous tracking', 'live location', 'family tracking', 'location sharing in background'] },
  ],
  READ_CONTACTS: [
    { feature: 'finding friends in the app',       keywords: ['find friends', 'find contacts', 'invite contacts', 'connect with contacts', 'discover friends'] },
    { feature: 'syncing or managing contacts',     keywords: ['sync contacts', 'contact sync', 'manage contacts', 'import contacts', 'address book sync'] },
  ],
  WRITE_CONTACTS: [
    { feature: 'saving or modifying contacts',     keywords: ['save contact', 'add contact', 'create contact', 'edit contact', 'update contact'] },
    { feature: 'syncing contacts',                 keywords: ['sync contacts', 'contact sync', 'sync address book'] },
  ],
  SEND_SMS: [
    { feature: 'sending SMS messages',             keywords: ['send sms', 'send text', 'text message', 'sms messaging'] },
    { feature: 'OTP or verification codes',        keywords: ['otp', 'verification code', 'sms verification', 'two-factor', '2fa via sms'] },
  ],
  RECEIVE_SMS: [
    { feature: 'auto-reading OTP codes',           keywords: ['auto-read otp', 'autofill otp', 'auto fill otp', 'auto-fill otp', 'read otp automatically', 'otp auto detection'] },
  ],
  READ_SMS: [
    { feature: 'reading SMS inbox',                keywords: ['read sms', 'sms inbox', 'message history', 'access messages'] },
    { feature: 'OTP auto-fill',                    keywords: ['auto-fill otp', 'autofill otp', 'otp detection', 'auto read otp'] },
  ],
  BLUETOOTH:         [{ feature: 'Bluetooth audio or device connectivity', keywords: ['bluetooth', 'wireless speaker', 'headphones', 'earbuds', 'car audio', 'wearable', 'hearing aid'] }],
  BLUETOOTH_CONNECT: [{ feature: 'connecting to Bluetooth devices',        keywords: ['bluetooth', 'wireless speaker', 'headphones', 'earbuds', 'wearable'] }],
  BLUETOOTH_SCAN:    [{ feature: 'scanning for nearby Bluetooth devices',  keywords: ['bluetooth', 'scan bluetooth', 'discover devices', 'pair devices'] }],
  READ_EXTERNAL_STORAGE:  [{ feature: 'accessing local photos, media, or files', keywords: ['photos', 'gallery', 'local music', 'local files', 'documents', 'media library'] }],
  WRITE_EXTERNAL_STORAGE: [{ feature: 'saving or downloading files',              keywords: ['save photo', 'download file', 'export', 'save offline', 'download music', 'save document'] }],
  READ_PHONE_STATE: [
    { feature: 'device or SIM verification',       keywords: ['device verification', 'phone verification', 'sim verification', 'device identity'] },
    { feature: 'pausing on incoming calls',        keywords: ['pause on call', 'pause during call', 'call interruption', 'detect incoming call'] },
  ],
  CALL_PHONE: [
    { feature: 'making phone calls',               keywords: ['make calls', 'phone call', 'dial', 'calling feature', 'call contacts'] },
  ],
  NFC: [
    { feature: 'NFC payments or data exchange',    keywords: ['nfc', 'contactless payment', 'tap to pay', 'nfc tag', 'nfc transfer'] },
  ],
  BODY_SENSORS: [
    { feature: 'health or fitness tracking',       keywords: ['heart rate', 'step count', 'health data', 'fitness data', 'body sensor', 'health monitor'] },
  ],
};

function extractVerifiedFeatures(permissionId, descriptionText) {
  const featureList = PERMISSION_FEATURE_MAP[permissionId] || [];
  const descLower   = (descriptionText || '').toLowerCase();
  const found       = [];
  const seenFeatures = new Set();

  for (const { feature, keywords } of featureList) {
    if (seenFeatures.has(feature)) continue;
    for (const kw of keywords) {
      if (descLower.includes(kw)) {
        found.push(`App description mentions "${feature}"`);
        seenFeatures.add(feature);
        break;
      }
    }
  }

  return found;
}

module.exports = {
  PERMISSION_DB,
  getPermissionMeta,
  isHighSensitivity,
  isCriticalPermission,
  normalizePermissions,
  extractVerifiedFeatures
};

