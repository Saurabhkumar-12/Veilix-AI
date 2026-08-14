/**
 * attackSimulationService.js
 * 
 * Deterministic, non-invasive Privacy Attack Simulator engine.
 * Reasons about POTENTIAL privacy impact from requested Android permissions.
 * Does NOT execute APKs, access hardware sensors, or collect user data.
 */

const { getPermissionMeta } = require('../backend/risk-engine/permissionKnowledge');

const IMPACT_MAPPINGS = {
  CAMERA: {
    label: 'Camera',
    potentialImpact: 'Image & Video Exposure',
    severity: 'HIGH',
    impactScore: 75,
    explanation: "If abused, camera access could expose visual information from the user's physical environment.",
    whyItMatters: "Photos and videos may capture sensitive personal documents, family members, or private surroundings.",
    recommendedProtection: "Only allow camera access when actively taking photos or videos in trusted features."
  },
  RECORD_AUDIO: {
    label: 'Microphone',
    potentialImpact: 'Audio & Conversation Exposure',
    severity: 'HIGH',
    impactScore: 80,
    explanation: "If abused, microphone access could record ambient audio and private conversations silently.",
    whyItMatters: "Voice recordings can capture confidential discussions, passwords spoken aloud, or acoustic environment data.",
    recommendedProtection: "Grant microphone access strictly 'Only while using the app' and revoke when unused."
  },
  ACCESS_FINE_LOCATION: {
    label: 'Fine Location',
    potentialImpact: 'Precise Movement & Location Exposure',
    severity: 'HIGH',
    impactScore: 85,
    explanation: "If abused, precise GPS access could track real-time coordinates and historical movement patterns.",
    whyItMatters: "Location history reveals home/work addresses, daily routines, medical visits, and personal relationships.",
    recommendedProtection: "Set location access to approximate or grant only when turn-by-turn navigation is required."
  },
  ACCESS_COARSE_LOCATION: {
    label: 'Coarse Location',
    potentialImpact: 'Approximate Area & City Exposure',
    severity: 'MODERATE',
    impactScore: 50,
    explanation: "If abused, network location access could determine neighborhood and city-level presence.",
    whyItMatters: "Cell tower and Wi-Fi data can still pinpoint approximate location and regional ad profiling.",
    recommendedProtection: "Limit location permissions for apps that only require basic regional features."
  },
  ACCESS_BACKGROUND_LOCATION: {
    label: 'Background Location',
    potentialImpact: 'Continuous 24/7 Location Surveillance',
    severity: 'CRITICAL',
    impactScore: 95,
    explanation: "If abused, background location access could track movement continuously without user awareness.",
    whyItMatters: "Enables non-stop trajectory logging, geofencing ad surveillance, and complete behavioral profiling.",
    recommendedProtection: "Deny background location access unless essential for emergency or safety services."
  },
  READ_CONTACTS: {
    label: 'Read Contacts',
    potentialImpact: 'Contact & Social Graph Leakage',
    severity: 'HIGH',
    impactScore: 90,
    explanation: "If abused, contacts access could harvest names, phone numbers, and email address books.",
    whyItMatters: "Exposes social connections, business contacts, and family numbers to third-party databases.",
    recommendedProtection: "Deny contact access and manually input numbers or use native system pickers instead."
  },
  WRITE_CONTACTS: {
    label: 'Write Contacts',
    potentialImpact: 'Address Book Tampering & Insertion',
    severity: 'HIGH',
    impactScore: 70,
    explanation: "If abused, write permissions could insert or modify entries in your personal address book.",
    whyItMatters: "Can inject spam contacts, alter phone numbers, or pollute contact records.",
    recommendedProtection: "Deny write access unless using dedicated contact management or CRM tools."
  },
  READ_CALL_LOG: {
    label: 'Read Call Log',
    potentialImpact: 'Call Metadata & Relationship Profiling',
    severity: 'CRITICAL',
    impactScore: 92,
    explanation: "If abused, call log access could read incoming, outgoing, and missed call history with timestamps.",
    whyItMatters: "Reveals call frequency, intimate relationships, business partners, and call durations.",
    recommendedProtection: "Strictly deny call log access unless using default dialer or verified spam blocking apps."
  },
  SEND_SMS: {
    label: 'Send SMS',
    potentialImpact: 'Unauthorized SMS & Carrier Charge Fraud',
    severity: 'CRITICAL',
    impactScore: 95,
    explanation: "If abused, SMS sending capability could send background texts to premium rate numbers or contacts.",
    whyItMatters: "Can cause unexpected financial charges and send unauthorized messages posing as you.",
    recommendedProtection: "Revoke SMS send permissions for all apps except your primary SMS messaging client."
  },
  RECEIVE_SMS: {
    label: 'Receive SMS',
    potentialImpact: '2FA & OTP Message Interception',
    severity: 'CRITICAL',
    impactScore: 98,
    explanation: "If abused, SMS receive access could intercept incoming security verification codes and 2FA tokens.",
    whyItMatters: "Enables two-factor authentication bypass and potential account takeover across banking or email.",
    recommendedProtection: "Never grant SMS read/receive permissions to utility, gaming, or flash apps."
  },
  READ_SMS: {
    label: 'Read SMS',
    potentialImpact: 'Private SMS Inbox Data Exposure',
    severity: 'CRITICAL',
    impactScore: 96,
    explanation: "If abused, full SMS reading could parse stored text conversations, financial alerts, and OTPs.",
    whyItMatters: "Text messages often contain personal conversations, bank transaction alerts, and login links.",
    recommendedProtection: "Limit SMS reading permissions to default messaging clients."
  },
  READ_PHONE_STATE: {
    label: 'Read Phone State',
    potentialImpact: 'Hardware IMEI & Device Identity Tracking',
    severity: 'HIGH',
    impactScore: 65,
    explanation: "If abused, phone state access could read hardware IDs (IMEI/SIM serial) and active call status.",
    whyItMatters: "Enables persistent cross-app device tracking that survives app uninstalls and factory resets.",
    recommendedProtection: "Deny phone state access to games, media players, and basic utilities."
  },
  READ_EXTERNAL_STORAGE: {
    label: 'Read Storage',
    potentialImpact: 'Personal File & Photo Album Exposure',
    severity: 'MODERATE',
    impactScore: 60,
    explanation: "If abused, storage read access could scan photos, videos, downloaded files, and documents.",
    whyItMatters: "Device storage frequently holds confidential documents, screenshots, tax forms, and personal media.",
    recommendedProtection: "Use Android Photo Picker to grant selective file access instead of full storage read."
  },
  WRITE_EXTERNAL_STORAGE: {
    label: 'Write Storage',
    potentialImpact: 'File System Modification & Payload Storage',
    severity: 'MODERATE',
    impactScore: 55,
    explanation: "If abused, storage write access could modify existing files or store unverified secondary payloads.",
    whyItMatters: "Allows creating or altering files on shared storage accessible by other applications.",
    recommendedProtection: "Deny storage write access to apps that do not generate media downloads."
  },
  MANAGE_EXTERNAL_STORAGE: {
    label: 'Manage Storage',
    potentialImpact: 'Total Device File System Access',
    severity: 'CRITICAL',
    impactScore: 95,
    explanation: "If abused, all-files-management permission grants complete access to every document on disk.",
    whyItMatters: "Full disk visibility allows unrestricted indexing and reading of all private user content.",
    recommendedProtection: "Reserve this permission strictly for dedicated file managers and backup tools."
  },
  SYSTEM_ALERT_WINDOW: {
    label: 'System Overlay',
    potentialImpact: 'Screen Overlay & UI Clickjacking',
    severity: 'CRITICAL',
    impactScore: 90,
    explanation: "If abused, overlay permissions could draw invisible or fake login screens on top of other apps.",
    whyItMatters: "Clickjacking overlays can trick users into entering passwords or granting dangerous permissions.",
    recommendedProtection: "Revoke 'Display over other apps' permission for all non-essential utilities."
  },
  BIND_ACCESSIBILITY_SERVICE: {
    label: 'Accessibility Service',
    potentialImpact: 'Full UI Control & Password Extraction',
    severity: 'CRITICAL',
    impactScore: 100,
    explanation: "If abused, accessibility service grants total control over touch events and screen reading.",
    whyItMatters: "Can read passwords as typed, bypass security prompts, and click buttons autonomously.",
    recommendedProtection: "Never grant Accessibility permissions unless required for assistive technology."
  },
  BLUETOOTH_SCAN: {
    label: 'Bluetooth Scan',
    potentialImpact: 'Nearby Device Scan & Proximity Tracking',
    severity: 'MODERATE',
    impactScore: 50,
    explanation: "If abused, Bluetooth scanning can map surrounding smart devices and infer physical location.",
    whyItMatters: "Bluetooth beacon networks allow tracking user location without enabling GPS.",
    recommendedProtection: "Turn off Bluetooth scanning when not actively pairing new hardware."
  }
};

/**
 * Normalizes a permission key for impact matching
 */
function normalizePermKey(rawKey) {
  if (!rawKey) return '';
  const key = String(rawKey).toUpperCase().trim().replace('ANDROID.PERMISSION.', '');
  if (IMPACT_MAPPINGS[key]) return key;
  if (key.includes('CAMERA')) return 'CAMERA';
  if (key.includes('AUDIO') || key.includes('MICROPHONE')) return 'RECORD_AUDIO';
  if (key.includes('FINE_LOCATION') || key.includes('GPS')) return 'ACCESS_FINE_LOCATION';
  if (key.includes('BACKGROUND_LOCATION')) return 'ACCESS_BACKGROUND_LOCATION';
  if (key.includes('COARSE_LOCATION') || key.includes('LOCATION')) return 'ACCESS_COARSE_LOCATION';
  if (key.includes('READ_CONTACTS') || key.includes('CONTACTS')) return 'READ_CONTACTS';
  if (key.includes('WRITE_CONTACTS')) return 'WRITE_CONTACTS';
  if (key.includes('CALL_LOG')) return 'READ_CALL_LOG';
  if (key.includes('SEND_SMS')) return 'SEND_SMS';
  if (key.includes('RECEIVE_SMS')) return 'RECEIVE_SMS';
  if (key.includes('READ_SMS') || key.includes('SMS')) return 'READ_SMS';
  if (key.includes('PHONE_STATE')) return 'READ_PHONE_STATE';
  if (key.includes('MANAGE_EXTERNAL_STORAGE')) return 'MANAGE_EXTERNAL_STORAGE';
  if (key.includes('READ_EXTERNAL_STORAGE') || key.includes('STORAGE')) return 'READ_EXTERNAL_STORAGE';
  if (key.includes('WRITE_EXTERNAL_STORAGE')) return 'WRITE_EXTERNAL_STORAGE';
  if (key.includes('SYSTEM_ALERT_WINDOW')) return 'SYSTEM_ALERT_WINDOW';
  if (key.includes('ACCESSIBILITY')) return 'BIND_ACCESSIBILITY_SERVICE';
  if (key.includes('BLUETOOTH')) return 'BLUETOOTH_SCAN';
  return key;
}

/**
 * Pretty-formats raw permission strings
 */
function formatPrettyLabel(rawName, key) {
  if (IMPACT_MAPPINGS[key]?.label) return IMPACT_MAPPINGS[key].label;
  if (typeof rawName === 'string' && rawName.length > 0 && !rawName.includes('_')) return rawName;
  return key.split('_').map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

/**
 * Generates an Attack Simulation report based on extracted permissions & metadata.
 */
function simulatePrivacyImpact(appReport) {
  const appName = appReport.name || appReport.appName || 'Target Application';
  const category = appReport.category || 'General';
  const permissionsList = appReport.permissions || [];

  const impacts = [];
  const scenarios = [];
  const chartData = [];

  let sensitiveCount = 0;
  let criticalCount = 0;
  let totalScore = 0;

  permissionsList.forEach(item => {
    const rawName = typeof item === 'string' ? item : (item.permission || item.id || item.name);
    const key = normalizePermKey(rawName);
    const label = formatPrettyLabel(rawName, key);
    const meta = getPermissionMeta(key);

    const mapped = IMPACT_MAPPINGS[key] || {
      label,
      potentialImpact: `${label} System Access`,
      severity: meta.sensitivity === 'CRITICAL' ? 'CRITICAL' : meta.sensitivity === 'HIGH' ? 'HIGH' : meta.sensitivity === 'MEDIUM' ? 'MODERATE' : 'LOW',
      impactScore: meta.sensitivity === 'CRITICAL' ? 90 : meta.sensitivity === 'HIGH' ? 70 : meta.sensitivity === 'MEDIUM' ? 45 : 20,
      explanation: `If abused, ${label} access could grant capabilities related to ${meta.purpose.toLowerCase()}.`,
      whyItMatters: `System permissions expand the app's access to device resources beyond standard sandbox isolation.`,
      recommendedProtection: `Review whether ${label} is required for your use case and revoke if unneeded.`
    };

    if (mapped.severity === 'HIGH' || mapped.severity === 'CRITICAL') {
      sensitiveCount++;
      if (mapped.severity === 'CRITICAL') criticalCount++;
    }

    totalScore += mapped.impactScore;

    const impactEntry = {
      permission: label,
      permissionId: key,
      potentialImpact: mapped.potentialImpact,
      severity: mapped.severity,
      impactScore: mapped.impactScore,
      explanation: mapped.explanation,
      whyItMatters: mapped.whyItMatters,
      recommendedProtection: mapped.recommendedProtection,
      purposeStatus: typeof item === 'object' ? (item.status || 'Needs Review') : 'Needs Review'
    };

    impacts.push(impactEntry);

    // Build scenario flow for visualization
    scenarios.push({
      appName,
      permission: label,
      potentialExposure: mapped.potentialImpact,
      severity: mapped.severity,
      flow: [appName, label, mapped.potentialImpact, `${mapped.severity} PRIVACY IMPACT`]
    });

    // Chart entry
    chartData.push({
      permission: label,
      impactScore: mapped.impactScore,
      severity: mapped.severity
    });
  });

  // Calculate Attack Surface Score (0 - 100)
  const hasCamera = impacts.some(i => i.permissionId === 'CAMERA');
  const hasMic = impacts.some(i => i.permissionId === 'RECORD_AUDIO');
  const hasLocation = impacts.some(i => i.permissionId.includes('LOCATION'));
  const hasContacts = impacts.some(i => i.permissionId.includes('CONTACTS'));
  const hasSms = impacts.some(i => i.permissionId.includes('SMS'));

  let combinationBonus = 0;
  if (hasCamera && hasMic) combinationBonus += 12;
  if (hasLocation && hasContacts) combinationBonus += 15;
  if (hasSms && hasContacts) combinationBonus += 18;

  const excessiveCount = impacts.filter(i => i.purposeStatus === 'Potentially Excessive' || i.purposeStatus === 'Suspicious').length;
  const mismatchBonus = excessiveCount * 15;

  const baseSurface = impacts.length > 0 ? (totalScore / (impacts.length * 100)) * 60 : 0;
  const rawAttackSurface = Math.min(100, Math.round(baseSurface + (sensitiveCount * 8) + (criticalCount * 12) + combinationBonus + mismatchBonus));

  let attackSurfaceLevel = 'SAFE';
  if (rawAttackSurface > 70) {
    attackSurfaceLevel = 'CRITICAL';
  } else if (rawAttackSurface > 45) {
    attackSurfaceLevel = 'HIGH';
  } else if (rawAttackSurface > 20) {
    attackSurfaceLevel = 'MODERATE';
  }

  const sensitiveLabels = impacts
    .filter(i => i.severity === 'HIGH' || i.severity === 'CRITICAL')
    .map(i => i.permission)
    .join(', ');

  const aiExplanation = sensitiveCount > 0
    ? `Based on static permission analysis, "${appName}" exposes a potentially ${attackSurfaceLevel.toLowerCase()} privacy attack surface because it requests ${sensitiveCount} sensitive permission(s) (${sensitiveLabels || 'various capabilities'}). If abused, these access rights could expose personal data or environmental context. This is a static risk simulation and does not confirm actual data exfiltration.`
    : `Based on static permission analysis, "${appName}" maintains a low privacy attack surface. The requested permissions align with standard utility capabilities and pose minimal potential privacy risk under normal operation.`;

  return {
    appName,
    category,
    attackSurfaceScore: rawAttackSurface,
    attackSurfaceLevel,
    totalPermissions: permissionsList.length,
    sensitivePermissionsCount: sensitiveCount,
    criticalPermissionsCount: criticalCount,
    impacts,
    scenarios,
    chartData: chartData.sort((a, b) => b.impactScore - a.impactScore),
    aiExplanation,
    simulatedAt: new Date().toISOString(),
    staticNotice: "This is a static risk simulation based strictly on AndroidManifest permissions. No actual APK code execution, hardware access, or real user data collection was performed."
  };
}

module.exports = {
  simulatePrivacyImpact,
  IMPACT_MAPPINGS
};
