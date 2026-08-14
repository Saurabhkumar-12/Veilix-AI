const path = require('node:path');
const crypto = require('node:crypto');

const MAX_APK_BYTES = Number(process.env.MAX_APK_BYTES || 20 * 1024 * 1024);
const ACCEPTED_TYPES = new Set(['application/vnd.android.package-archive', 'application/octet-stream', 'application/zip']);

function validateApkUpload({ filename, contentType, buffer }) {
  const safeName = path.basename(String(filename || ''));
  if (!safeName || safeName !== filename || !safeName.toLowerCase().endsWith('.apk')) throw Object.assign(new Error('Only .apk files are accepted.'), { statusCode: 400 });
  if (contentType && !ACCEPTED_TYPES.has(contentType.split(';')[0].toLowerCase())) throw Object.assign(new Error('Unsupported APK content type.'), { statusCode: 415 });
  if (!Buffer.isBuffer(buffer) || buffer.length < 4 || buffer.length > MAX_APK_BYTES) throw Object.assign(new Error(`APK must be between 4 bytes and ${MAX_APK_BYTES} bytes.`), { statusCode: 413 });
  if (buffer.readUInt32LE(0) !== 0x04034b50) throw Object.assign(new Error('The upload is not a valid ZIP/APK signature.'), { statusCode: 400 });
  return { originalName: safeName, internalName: `${crypto.randomUUID()}.apk`, size: buffer.length };
}

module.exports = { validateApkUpload, MAX_APK_BYTES };
