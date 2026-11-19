const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ffmpegPath = 'C:\\Users\\Abhijeet\\.antigravity\\extensions\\kilocode.kilo-code-7.3.54-win32-x64\\bin\\ffmpeg.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fontPath = 'C\\:/Windows/Fonts/segoeui.ttf';
const artifactsDir = path.join(__dirname, '..', 'artifacts');
const tempDir = process.env.TEMP || 'C:\\Users\\Abhijeet\\AppData\\Local\\Temp';

const scenesToCapture = [
  { name: 'scene_01_hero.png', url: 'http://localhost:3000/' },
  { name: 'scene_02_milk.png', url: 'http://localhost:3000/milk' },
  { name: 'scene_03_kirana.png', url: 'http://localhost:3000/kirana' },
  { name: 'scene_04_veg.png', url: 'http://localhost:3000/vegetables' },
  { name: 'scene_05_clinic.png', url: 'http://localhost:3000/clinic' },
  { name: 'scene_06_agri.png', url: 'http://localhost:3000/agriculture' },
  { name: 'scene_07_activity.png', url: 'http://localhost:3000/activity' },
  { name: 'scene_08_closing.png', url: 'http://localhost:3000/' },
];

const segments = [
  {
    id: 1,
    image: 'scene_01_hero.png',
    duration: 5,
    badge: 'ZYVO PLATFORM · REWIRED TRACK ECHO',
    title: 'ONE VOICE PLATFORM. FIVE INDUSTRIES.',
    subtitle: 'Multilingual Voice-First Business Operations',
  },
  {
    id: 2,
    image: 'scene_02_milk.png',
    duration: 9,
    badge: 'VERTICAL 01 · MILK DELIVERY OPERATIONS',
    title: 'Smarter Recurring Delivery Operations',
    subtitle: '20:00 Cutoff Enforcement · Integer Paise Ledger · Pause & Resume',
  },
  {
    id: 3,
    image: 'scene_03_kirana.png',
    duration: 9,
    badge: 'VERTICAL 02 · EVERYDAY KIRANA STORE',
    title: 'Everyday Grocery Orders, Structured and Verified',
    subtitle: 'Colloquial Indic Alias Match · Structured Baskets · Vendor Queue',
  },
  {
    id: 4,
    image: 'scene_04_veg.png',
    duration: 9,
    badge: 'VERTICAL 03 · VEGETABLE VENDOR',
    title: 'Precision for Fresh Produce',
    subtitle: 'Mandi Daily Spot Rates · Fractional Weights (g/bundles/kg) · Prep Manifests',
  },
  {
    id: 5,
    image: 'scene_05_clinic.png',
    duration: 9,
    badge: 'VERTICAL 04 · OUTPATIENT CLINIC',
    title: 'Simplified Appointment Management',
    subtitle: 'Physician Slot Reservation · Strict Non-Diagnostic Privacy Shield',
  },
  {
    id: 6,
    image: 'scene_06_agri.png',
    duration: 9,
    badge: 'VERTICAL 05 · AGRICULTURE PROCUREMENT',
    title: 'Connected Agricultural Procurement Workflows',
    subtitle: 'CCEA PIB MSP Benchmarks · Quintal Conversion · Farm-Gate Logistics',
  },
  {
    id: 7,
    image: 'scene_07_activity.png',
    duration: 6,
    badge: 'UNIFIED LEDGER · AUDIT TRAIL',
    title: 'One Platform. Industry-Specific Intelligence.',
    subtitle: 'Two-Phase Confirmation Protocol · Grounded Audio Audit Trail',
  },
  {
    id: 8,
    image: 'scene_08_closing.png',
    duration: 4,
    badge: 'REWIRED · OFFICIAL TRACK ECHO HACKATHON',
    title: 'ZYVO — MAKING BUSINESS OPERATIONS AS SIMPLE AS SPEAKING',
    subtitle: 'Operational Observatory · Live on GitHub & Vercel',
  },
];

console.log('====================================================');
console.log('   ZYVO 60-SECOND DEMONSTRATION VIDEO BUILDER');
console.log('====================================================\n');

// 1. Ensure all scene screenshots exist
for (const sc of scenesToCapture) {
  const destPath = path.join(artifactsDir, sc.name);
  if (!fs.existsSync(destPath)) {
    const tempFile = path.join(tempDir, sc.name);
    console.log(`Capturing ${sc.name} from ${sc.url}...`);
    try {
      execSync(`"${chromePath}" --headless --disable-gpu --screenshot="${tempFile}" --window-size=1920,1080 ${sc.url}`, { stdio: 'pipe' });
      if (fs.existsSync(tempFile)) {
        fs.copyFileSync(tempFile, destPath);
        fs.unlinkSync(tempFile);
      }
    } catch (e) {
      console.warn(`Failed to capture ${sc.name}, using fallback`);
    }
  }
}

// 2. Render each video segment
const segmentFiles = [];

for (const seg of segments) {
  const inputImg = path.join(artifactsDir, seg.image);
  const outSeg = path.join(artifactsDir, `seg_${String(seg.id).padStart(2, '0')}.mp4`);
  segmentFiles.push(outSeg);

  console.log(`Rendering Segment ${seg.id} (${seg.duration}s): ${seg.title}...`);

  const escBadge = seg.badge.replace(/'/g, "\\'");
  const escTitle = seg.title.replace(/'/g, "\\'");
  const escSub = seg.subtitle.replace(/'/g, "\\'");

  const vf = [
    'scale=1920:1080',
    'drawbox=y=ih-200:color=black@0.82:width=iw:height=200:t=fill',
    `drawtext=fontfile='${fontPath}':text='${escBadge}':fontcolor=0x69D9AD:fontsize=20:x=(w-text_w)/2:y=h-165`,
    `drawtext=fontfile='${fontPath}':text='${escTitle}':fontcolor=white:fontsize=44:x=(w-text_w)/2:y=h-130`,
    `drawtext=fontfile='${fontPath}':text='${escSub}':fontcolor=0xC3CBC3:fontsize=24:x=(w-text_w)/2:y=h-70`,
  ].join(',');

  const cmd = `"${ffmpegPath}" -y -loop 1 -t ${seg.duration} -i "${inputImg}" -vf "${vf}" -c:v libx264 -pix_fmt yuv420p -r 30 "${outSeg}"`;
  execSync(cmd, { stdio: 'pipe' });
}

// 3. Write concat list file and build final MP4
const listFile = path.join(artifactsDir, 'concat_list.txt');
const listContent = segmentFiles.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n');
fs.writeFileSync(listFile, listContent);

const finalMp4 = path.join(artifactsDir, 'ZYVO_60_SECOND_DEMO.mp4');
console.log(`\nConcatenating segments into ${finalMp4}...`);

const concatCmd = `"${ffmpegPath}" -y -f concat -safe 0 -i "${listFile}" -c copy "${finalMp4}"`;
execSync(concatCmd, { stdio: 'pipe' });

// 4. Update thumbnail from scene 1
const thumbnailPath = path.join(artifactsDir, 'ZYVO_DEMO_THUMBNAIL.png');
const heroImg = path.join(artifactsDir, 'scene_01_hero.png');
if (fs.existsSync(heroImg)) {
  fs.copyFileSync(heroImg, thumbnailPath);
}

// 5. Cleanup temporary segment files and intermediate images
for (const f of segmentFiles) {
  if (fs.existsSync(f)) fs.unlinkSync(f);
}
if (fs.existsSync(listFile)) fs.unlinkSync(listFile);
for (const sc of scenesToCapture) {
  const p = path.join(artifactsDir, sc.name);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

console.log('\n====================================================');
console.log('   60-SECOND DEMO VIDEO CREATED SUCCESSFULLY!');
console.log('====================================================');
console.log(`Output Video: ${finalMp4}`);
console.log(`Thumbnail: ${thumbnailPath}`);
const stat = fs.statSync(finalMp4);
console.log(`File Size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB (${stat.size} bytes)`);
