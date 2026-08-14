const TEMPORARY_PERMISSIONS = new Set(['CAMERA', 'RECORD_AUDIO', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION', 'READ_CONTACTS', 'READ_MEDIA_IMAGES', 'READ_EXTERNAL_STORAGE']);

function recommendationFor({ id, permission, status, sensitivity, purpose, category }) {
  const temporary = TEMPORARY_PERMISSIONS.has(id);
  const normalizedStatus = (status || '').toUpperCase();

  if (normalizedStatus === 'REQUIRED') {
    return {
      decision: temporary ? 'ALLOW IT WHEN NEEDED' : 'ALLOW IT',
      label: temporary ? 'YES — You may allow when needed' : 'YES — You may allow',
      summary: `${permission} is relevant to the stated ${category} purpose. It supports ${purpose ? purpose.toLowerCase() : 'app functionality'}.`,
      action: temporary ? 'Allow it when you use the related feature, then keep it turned off.' : 'You may allow it for the normal app experience.',
      tone: 'allow'
    };
  }

  if (normalizedStatus === 'OPTIONAL') {
    return {
      decision: 'ALLOW ONLY IF NEEDED',
      label: 'YES — You may allow, if you need this feature',
      summary: `${permission} can support an extra feature, but it is not required for the main ${category} experience.`,
      action: temporary ? `Allow it only while you use a feature that needs ${permission.toLowerCase()}. Otherwise, keep it turned off.` : `Allow it if you use the related feature. Otherwise, you can deny it.`,
      tone: 'conditional'
    };
  }

  if (normalizedStatus === 'POTENTIALLY EXCESSIVE' || normalizedStatus === 'SUSPICIOUS' || normalizedStatus === 'DANGEROUS') {
    return {
      decision: 'DON’T ALLOW IT',
      label: 'NO — Better not to allow',
      summary: `${permission} does not appear necessary for the stated ${category} purpose and could expose sensitive information or device capabilities.`,
      action: 'Keep it turned off unless you know about a specific feature that requires it.',
      tone: 'deny'
    };
  }

  return {
    decision: 'REVIEW BEFORE ALLOWING',
    label: 'NO — You do not need to allow this yet',
    summary: `There is not enough information to confirm why this ${category} app needs ${permission}.`,
    action: 'Keep it turned off unless the app explains the feature that requires it.',
    tone: 'review'
  };
}

module.exports = { recommendationFor };
