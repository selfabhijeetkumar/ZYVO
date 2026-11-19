const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ffmpegPath = 'C:\\Users\\Abhijeet\\.antigravity\\extensions\\kilocode.kilo-code-7.3.54-win32-x64\\bin\\ffmpeg.exe';
const fontPath = 'C\\:/Windows/Fonts/segoeui.ttf';
const artifactsDir = path.join(__dirname, '..', 'artifacts');

const segments = [
  {
    id: 1,
    image: 'scene_01_hero.png',
    duration: 5,
    badge: 'ZYVO PLATFORM · REWIRED TRACK ECHO',
    title: 'One Voice Platform. Five Industries.',
    subtitle: 'Multilingual Voice-First Operations for Indian Commerce',
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
    title: 'Precise Quantities for Fresh Produce',
    subtitle: 'Mandi Daily Spot Rates · Fractional Weights (g/bundles/kg) · Prep Manifests',
  },
  {
    id: 5,
    image: 'scene_05_clinic.png',
    duration: 9,
    badge: 'VERTICAL 04 · OUTPATIENT CLINIC',
    title: 'Simple and Reliable Appointment Scheduling',
    subtitle: 'Physician Slot Reservation · Strict Non-Diagnostic Privacy Shield',
  },
  {
    id: 6,
    image: 'scene_06_agri.png',
    duration: 9,
    badge: 'VERTICAL 05 · AGRICULTURE PROCUREMENT',
    title: 'Connecting Harvest Requests with Procurement Workflows',
    subtitle: 'CCEA PIB MSP Benchmarks · Quintal Conversion · Farm-Gate Logistics',
  },
  {
    id: 7,
    image: 'scene_07_activity.png',
    duration: 6,
    badge: 'UNIFIED LEDGER · AUDIT TRAIL',
    title: 'One Platform. Industry-Specific Business Intelligence.',
    subtitle: 'Two-Phase Confirmation Protocol · Grounded Audio Audit Trail',
  },
  {
    id: 8,
    image: 'scene_08_closing.png',
    duration: 4,
    badge: 'REWIRED · OFFICIAL TRACK ECHO HACKATHON',
    title: 'ZYVO — Making Business Operations as Simple as Speaking',
    subtitle: 'Operational Observatory · Live on GitHub & Vercel',
  },
];

console.log('====================================================');
console.log('   ZYVO 60-SECOND DEMONSTRATION VIDEO BUILDER');
console.log('====================================================\n');

const segmentFiles = [];

for (const seg of segments) {
  const inputImg = path.join(artifactsDir, seg.image);
  const outSeg = path.join(artifactsDir, `seg_${String(seg.id).padStart(2, '0')}.mp4`);
  segmentFiles.push(outSeg);

  console.log(`Rendering Segment ${seg.id} (${seg.duration}s): ${seg.title}...`);

  // Escape single quotes for drawtext filter
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

// Write concat list file
const listFile = path.join(artifactsDir, 'concat_list.txt');
const listContent = segmentFiles.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n');
fs.writeFileSync(listFile, listContent);

const finalMp4 = path.join(artifactsDir, 'ZYVO_60_SECOND_DEMO.mp4');
console.log(`\nConcatenating segments into ${finalMp4}...`);

const concatCmd = `"${ffmpegPath}" -y -f concat -safe 0 -i "${listFile}" -c copy "${finalMp4}"`;
execSync(concatCmd, { stdio: 'pipe' });

// Cleanup segment files and concat list
for (const f of segmentFiles) {
  if (fs.existsSync(f)) fs.unlinkSync(f);
}
if (fs.existsSync(listFile)) fs.unlinkSync(listFile);
const testClip = path.join(artifactsDir, 'test_clip.mp4');
if (fs.existsSync(testClip)) fs.unlinkSync(testClip);

console.log('\n====================================================');
console.log('   60-SECOND DEMO VIDEO CREATED SUCCESSFULLY!');
console.log('====================================================');
console.log(`Output File: ${finalMp4}`);
const stat = fs.statSync(finalMp4);
console.log(`File Size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB (${stat.size} bytes)`);
