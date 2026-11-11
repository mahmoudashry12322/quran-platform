import fs from 'fs';
import path from 'path';

const TARGET_DIR = '/var/www/quran.mahmoudashry.site/public/audio/mossad';
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const surahs = ['019', '023', '029', '032', '049', '073', '078', '087', '088', '100', '107'];

async function downloadAll() {
  for (const s of surahs) {
    const dest = path.join(TARGET_DIR, `${s}.mp3`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100000) {
      console.log(`Skipping ${s}, already exists`);
      continue;
    }
    console.log(`Downloading ${s}...`);
    try {
      const url = `https://archive.org/download/010_20221110/${s}.mp3`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Failed ${s}: HTTP ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`Saved ${s} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);
    } catch (e) {
      console.error(`Error downloading ${s}:`, e.message);
    }
  }
  console.log('Finished downloading all available surahs for Sheikh Abdul Rahman Mossad!');
}

downloadAll();
