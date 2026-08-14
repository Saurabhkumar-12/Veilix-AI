const zlib = require('node:zlib');

function getManifest(apk) {
  const eocd = apk.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0 || eocd + 22 > apk.length) throw new Error('APK ZIP central directory was not found.');
  const entries = apk.readUInt16LE(eocd + 10); const offset = apk.readUInt32LE(eocd + 16);
  let pos = offset;
  for (let index = 0; index < Math.min(entries, 10_000); index += 1) {
    if (apk.readUInt32LE(pos) !== 0x02014b50) break;
    const method = apk.readUInt16LE(pos + 10); const compressed = apk.readUInt32LE(pos + 20); const uncompressed = apk.readUInt32LE(pos + 24);
    const nameLength = apk.readUInt16LE(pos + 28); const extraLength = apk.readUInt16LE(pos + 30); const commentLength = apk.readUInt16LE(pos + 32); const localOffset = apk.readUInt32LE(pos + 42);
    const name = apk.subarray(pos + 46, pos + 46 + nameLength).toString('utf8');
    if (name === 'AndroidManifest.xml') {
      if (uncompressed > 2 * 1024 * 1024 || localOffset + 30 > apk.length || apk.readUInt32LE(localOffset) !== 0x04034b50) throw new Error('APK manifest is invalid or exceeds the analysis limit.');
      const localName = apk.readUInt16LE(localOffset + 26); const localExtra = apk.readUInt16LE(localOffset + 28); const data = apk.subarray(localOffset + 30 + localName + localExtra, localOffset + 30 + localName + localExtra + compressed);
      if (data.length !== compressed) throw new Error('APK manifest data is truncated.');
      return method === 0 ? data : method === 8 ? zlib.inflateRawSync(data, { maxOutputLength: 2 * 1024 * 1024 }) : (() => { throw new Error('Unsupported APK manifest compression.'); })();
    }
    pos += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error('AndroidManifest.xml was not found in this APK.');
}

function extractDeclaredPermissions(apk) {
  const manifest = getManifest(apk);
  const values = new Set();
  for (const text of [manifest.toString('utf8'), manifest.toString('utf16le')]) {
    for (const match of text.matchAll(/android\.permission\.[A-Z0-9_]+/g)) values.add(match[0]);
  }
  return [...values];
}

module.exports = { extractDeclaredPermissions };
