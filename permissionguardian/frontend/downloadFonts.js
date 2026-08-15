const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, 'public', 'fonts');

// Ensure directory exists
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = [
  {
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-400-normal.woff2',
    dest: 'inter-regular.woff2'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-700-normal.woff2',
    dest: 'inter-bold.woff2'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/outfit/files/outfit-latin-400-normal.woff2',
    dest: 'outfit-regular.woff2'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@fontsource/outfit/files/outfit-latin-700-normal.woff2',
    dest: 'outfit-bold.woff2'
  }
];

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${path.basename(destPath)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Downloading fonts for local self-hosting...');
  await Promise.all(
    fonts.map(async (font) => {
      const destPath = path.join(fontsDir, font.dest);
      try {
        await download(font.url, destPath);
      } catch (err) {
        console.error(`Error downloading ${font.dest}:`, err.message);
      }
    })
  );
  console.log('Fonts downloaded successfully!');
}

run();
