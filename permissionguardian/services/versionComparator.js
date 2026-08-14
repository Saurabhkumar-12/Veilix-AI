function compareVersions(before, after) {
  const oldPermissions = new Map(before.permissions.map(permission => [permission.id, permission]));
  const newPermissions = new Map(after.permissions.map(permission => [permission.id, permission]));
  const added = [...newPermissions.keys()].filter(key => !oldPermissions.has(key)).map(key => newPermissions.get(key));
  const removed = [...oldPermissions.keys()].filter(key => !newPermissions.has(key)).map(key => oldPermissions.get(key));
  const unchanged = [...newPermissions.keys()].filter(key => oldPermissions.has(key));
  return { before: { id: before.analysisId, score: before.privacyScore }, after: { id: after.analysisId, score: after.privacyScore }, added, removed, unchanged, newlySensitive: added.filter(item => ['HIGH', 'CRITICAL'].includes(item.sensitivity)), summary: added.length ? `Version 2 introduces ${added.length} newly declared permission(s).` : 'No newly declared permissions were detected.' };
}
module.exports = { compareVersions };
