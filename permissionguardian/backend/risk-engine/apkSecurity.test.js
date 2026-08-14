const assert = require('node:assert/strict');
const { validateApkUpload } = require('../../services/fileSecurityValidator');
const { extractDeclaredPermissions } = require('../../services/permissionParser');
const { compareVersions } = require('../../services/versionComparator');

function apkWithManifest(xml) {
  const name = Buffer.from('AndroidManifest.xml'); const body = Buffer.from(xml);
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(name.length, 26);
  const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(name.length, 28); central.writeUInt32LE(body.length, 20); central.writeUInt32LE(body.length, 24);
  const offset = local.length + name.length + body.length; const eocd = Buffer.alloc(22); eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(1, 8); eocd.writeUInt16LE(1, 10); eocd.writeUInt32LE(central.length + name.length, 12); eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([local, name, body, central, name, eocd]);
}

const apk = apkWithManifest('<manifest android:permission="android.permission.CAMERA" android:name="android.permission.RECORD_AUDIO"/>');
assert.equal(validateApkUpload({ filename: 'camera.apk', contentType: 'application/octet-stream', buffer: apk }).originalName, 'camera.apk');
assert.throws(() => validateApkUpload({ filename: '../escape.apk', contentType: 'application/octet-stream', buffer: apk }));
assert.deepEqual(extractDeclaredPermissions(apk).sort(), ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO']);
const comparison = compareVersions({ analysisId: 'v1', privacyScore: 10, permissions: [{ id: 'CAMERA', sensitivity: 'HIGH' }] }, { analysisId: 'v2', privacyScore: 50, permissions: [{ id: 'CAMERA', sensitivity: 'HIGH' }, { id: 'READ_CONTACTS', sensitivity: 'HIGH' }] });
assert.equal(comparison.added[0].id, 'READ_CONTACTS');
console.log('APK security tests passed');
