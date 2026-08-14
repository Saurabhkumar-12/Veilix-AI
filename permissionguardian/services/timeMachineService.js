/**
 * timeMachineService.js
 * 
 * Permission Time Machine engine.
 * Compares two APK/App analysis versions, computes score deltas,
 * categorizes added/removed/unchanged permissions, highlights new sensitive access alerts,
 * generates a visual timeline, and provides a cautious AI explanation.
 */

const { getPermissionMeta, isHighSensitivity } = require('../backend/risk-engine/permissionKnowledge');

/**
 * Normalizes permission object or string to standard label and key
 */
function toPermObj(perm) {
  if (!perm) return { id: 'UNKNOWN', label: 'Unknown Permission', sensitivity: 'LOW' };
  if (typeof perm === 'string') {
    const meta = getPermissionMeta(perm);
    return {
      id: perm,
      label: perm,
      sensitivity: meta.sensitivity || 'MEDIUM',
      purpose: meta.purpose
    };
  }
  const id = perm.id || perm.permission || perm.name || 'UNKNOWN';
  const label = perm.permission || perm.name || id;
  const meta = getPermissionMeta(id);
  return {
    id,
    label,
    sensitivity: perm.sensitivity || meta.sensitivity || 'MEDIUM',
    purpose: perm.purpose || meta.purpose,
    status: perm.status || 'Needs Review',
    riskScore: perm.riskScore || 30
  };
}

/**
 * Main function to compare two app/APK analysis reports.
 */
function compareVersions(beforeReport, afterReport) {
  const oldScore = typeof beforeReport.privacyScore === 'number'
    ? beforeReport.privacyScore
    : (beforeReport.securityAssessment?.score || beforeReport.riskScore || 50);

  const newScore = typeof afterReport.privacyScore === 'number'
    ? afterReport.privacyScore
    : (afterReport.securityAssessment?.score || afterReport.riskScore || 50);

  const riskChange = newScore - oldScore;
  const riskTrend = riskChange > 0 ? 'INCREASED' : riskChange < 0 ? 'DECREASED' : 'UNCHANGED';

  const beforePerms = (beforeReport.permissions || []).map(toPermObj);
  const afterPerms = (afterReport.permissions || []).map(toPermObj);

  const beforeMap = new Map(beforePerms.map(p => [p.id.toUpperCase(), p]));
  const afterMap = new Map(afterPerms.map(p => [p.id.toUpperCase(), p]));

  const addedPermissions = [];
  const removedPermissions = [];
  const unchangedPermissions = [];
  const newSensitivePermissions = [];

  afterMap.forEach((perm, key) => {
    if (!beforeMap.has(key)) {
      addedPermissions.push(perm);
      if (isHighSensitivity(key) || perm.sensitivity === 'HIGH' || perm.sensitivity === 'CRITICAL') {
        newSensitivePermissions.push(perm);
      }
    } else {
      unchangedPermissions.push(perm);
    }
  });

  beforeMap.forEach((perm, key) => {
    if (!afterMap.has(key)) {
      removedPermissions.push(perm);
    }
  });

  const oldVersionLabel = beforeReport.version || beforeReport.versionName || 'Version 1.0';
  const newVersionLabel = afterReport.version || afterReport.versionName || 'Version 2.0';

  // Build Visual Timeline
  const timeline = [
    {
      version: oldVersionLabel,
      score: oldScore,
      permissionsCount: beforePerms.length,
      note: 'Baseline version'
    },
    {
      version: newVersionLabel,
      score: newScore,
      permissionsCount: afterPerms.length,
      delta: riskChange > 0 ? `+${riskChange}` : `${riskChange}`,
      addedCount: addedPermissions.length,
      removedCount: removedPermissions.length,
      newSensitiveCount: newSensitivePermissions.length,
      note: riskChange > 0 ? `Risk increased by ${riskChange} points` : riskChange < 0 ? `Risk decreased by ${Math.abs(riskChange)} points` : 'Risk level unchanged'
    }
  ];

  // Build Cautious AI Explanation
  let aiExplanation = '';
  if (addedPermissions.length > 0) {
    const addedNames = addedPermissions.map(p => p.label).join(', ');
    aiExplanation = `${newVersionLabel} introduced ${addedPermissions.length} new permission(s) (${addedNames}). `;
    if (newSensitivePermissions.length > 0) {
      const sensitiveNames = newSensitivePermissions.map(p => p.label).join(', ');
      aiExplanation += `Among these, ${newSensitivePermissions.length} high-sensitivity access right(s) (${sensitiveNames}) were added, which may increase the application's privacy risk score by ${Math.abs(riskChange)} points. `;
    } else {
      aiExplanation += `These additional permissions contribute to a net risk change of ${riskChange > 0 ? '+' : ''}${riskChange} points. `;
    }
  } else if (removedPermissions.length > 0) {
    const removedNames = removedPermissions.map(p => p.label).join(', ');
    aiExplanation = `${newVersionLabel} removed ${removedPermissions.length} permission(s) (${removedNames}), reducing the privacy risk score by ${Math.abs(riskChange)} points. `;
  } else {
    aiExplanation = `No permission changes were detected between ${oldVersionLabel} and ${newVersionLabel}. The privacy risk profile remains identical. `;
  }

  aiExplanation += `This static version comparison highlights permission delta between builds and does not infer malicious intent.`;

  return {
    appName: afterReport.name || beforeReport.name || 'Application',
    oldVersion: oldVersionLabel,
    newVersion: newVersionLabel,
    oldScore,
    newScore,
    riskChange,
    riskTrend,
    addedPermissions,
    removedPermissions,
    unchangedPermissions,
    newSensitivePermissions,
    hasNewSensitiveAlert: newSensitivePermissions.length > 0,
    timeline,
    aiExplanation,
    comparedAt: new Date().toISOString()
  };
}

module.exports = {
  compareVersions
};
