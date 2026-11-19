const pptxgen = require('pptxgenjs');
const path = require('node:path');
const fs = require('node:fs');

const pptx = new pptxgen();

// Set 16:9 Widescreen layout
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'ZYVO Team';
pptx.company = 'REWIRED · Track ECHO';
pptx.title = 'ZYVO — Pitch Deck';

// Palette Constants
const BG_DARK = '101211';
const CARD_BG = '171B19';
const BORDER_COLOR = '2A322D';
const MINT = '69D9AD';
const GOLD = 'DAB77A';
const TEAL = '86D5D4';
const WHITE = 'F2EFE6';
const MUTED = 'A4B0A6';

function addHeader(slide, title, category) {
  // Category badge
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.5,
    w: 5.0,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Segoe UI',
    color: MINT,
    bold: true,
    charSpacing: 2,
  });

  // Main slide title
  slide.addText(title, {
    x: 0.8,
    y: 0.8,
    w: 11.5,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Segoe UI',
    color: WHITE,
    bold: true,
  });

  // Subtle separator line
  slide.addShape(pptx.shapes.LINE, {
    x: 0.8,
    y: 1.45,
    w: 11.7,
    h: 0,
    line: { color: BORDER_COLOR, width: 1 },
  });
}

function addFooter(slide, pageNum) {
  slide.addText('ZYVO · REWIRED TRACK ECHO', {
    x: 0.8,
    y: 7.0,
    w: 6.0,
    h: 0.3,
    fontSize: 9,
    fontFace: 'Segoe UI',
    color: MUTED,
  });

  slide.addText(`0${pageNum} / 07`, {
    x: 10.5,
    y: 7.0,
    w: 2.0,
    h: 0.3,
    align: 'right',
    fontSize: 9,
    fontFace: 'Segoe UI',
    color: MINT,
    bold: true,
  });
}

// ==========================================
// SLIDE 1: TITLE & POSITIONING
// ==========================================
const slide1 = pptx.addSlide();
slide1.background = { color: BG_DARK };

// Hackathon pill badge
slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.8,
  y: 1.2,
  w: 2.6,
  h: 0.4,
  fill: { color: '202622' },
  line: { color: MINT, width: 1 },
  radius: 0.1,
});
slide1.addText('REWIRED · TRACK ECHO', {
  x: 0.8,
  y: 1.2,
  w: 2.6,
  h: 0.4,
  fontSize: 10,
  fontFace: 'Segoe UI',
  color: MINT,
  bold: true,
  align: 'center',
  valign: 'middle',
  charSpacing: 2,
});

// Title
slide1.addText('ZYVO', {
  x: 0.8,
  y: 1.8,
  w: 7.0,
  h: 1.2,
  fontSize: 64,
  fontFace: 'Segoe UI',
  color: WHITE,
  bold: true,
});

// Subtitle / Tagline
slide1.addText('One Voice Platform. Multiple Business Workflows.', {
  x: 0.8,
  y: 3.0,
  w: 7.2,
  h: 0.6,
  fontSize: 20,
  fontFace: 'Segoe UI',
  color: MINT,
  bold: true,
});

slide1.addText(
  'A multilingual, voice-first business operations platform that converts informal Indian voice notes (Hindi, Hinglish, Vernacular) into verified, dispute-grade business transactions across 5 core industries.',
  {
    x: 0.8,
    y: 3.7,
    w: 6.8,
    h: 1.4,
    fontSize: 13,
    fontFace: 'Segoe UI',
    color: MUTED,
    lineSpacing: 20,
  }
);

// Links card
slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.8,
  y: 5.3,
  w: 6.8,
  h: 1.3,
  fill: { color: CARD_BG },
  line: { color: BORDER_COLOR, width: 1 },
  radius: 0.08,
});
slide1.addText(
  [
    { text: '• Live Application: ', options: { color: MUTED, bold: true, fontSize: 11 } },
    { text: 'https://zyvo-delta.vercel.app\n', options: { color: TEAL, bold: true, fontSize: 11 } },
    { text: '• GitHub Repository: ', options: { color: MUTED, bold: true, fontSize: 11 } },
    { text: 'https://github.com/selfabhijeetkumar/ZYVO\n', options: { color: TEAL, bold: true, fontSize: 11 } },
    { text: '• Quality Verification: ', options: { color: MUTED, bold: true, fontSize: 11 } },
    { text: '12 / 12 Automated Test Suites Passing (100%)', options: { color: MINT, bold: true, fontSize: 11 } },
  ],
  {
    x: 1.0,
    y: 5.4,
    w: 6.4,
    h: 1.1,
    fontFace: 'Segoe UI',
    lineSpacing: 18,
  }
);

// Right side preview image or visual box
const thumbPath = path.join(__dirname, '..', 'artifacts', 'ZYVO_DEMO_THUMBNAIL.png');
if (fs.existsSync(thumbPath)) {
  slide1.addImage({
    path: thumbPath,
    x: 8.0,
    y: 1.5,
    w: 4.5,
    h: 4.8,
    rounding: true,
  });
} else {
  slide1.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 8.0,
    y: 1.5,
    w: 4.5,
    h: 4.8,
    fill: { color: CARD_BG },
    line: { color: MINT, width: 2 },
  });
  slide1.addText('ZYVO OBSERVATORY CORE\n3D Three.js Spatial Engine', {
    x: 8.0,
    y: 3.5,
    w: 4.5,
    h: 1.0,
    align: 'center',
    color: WHITE,
    fontSize: 16,
    bold: true,
  });
}

addFooter(slide1, 1);

// ==========================================
// SLIDE 2: THE PROBLEM
// ==========================================
const slide2 = pptx.addSlide();
slide2.background = { color: BG_DARK };
addHeader(slide2, 'Informal Commerce Runs on Voice, But Voice Cannot Execute', 'The Market Reality');

const probCards = [
  {
    title: 'Informal Voice is Dominant',
    accent: GOLD,
    desc: 'Hundreds of millions of daily commercial transactions in India (milk delivery, local groceries, mandi vegetables, doctor visits, crop harvests) occur via WhatsApp audio notes rather than software apps.',
  },
  {
    title: 'Voice Notes Create Friction',
    accent: 'F1A79C',
    desc: 'Audio files cannot execute transactions. Vendors spend 2+ hours nightly re-listening to voice notes, manually writing paper manifests, and facing regular billing disputes at month-end.',
  },
  {
    title: 'Existing Software Fails',
    accent: 'E06C75',
    desc: '• Complex Apps / ERPs: Exclude semi-literate users with dense nested forms and menus.\n• Generic Chatbots: Hold casual conversations but lack transactional cutoff rules, schema validation, and auditability.',
  },
];

probCards.forEach((c, idx) => {
  const xPos = 0.8 + idx * 4.0;
  slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: xPos,
    y: 1.8,
    w: 3.7,
    h: 4.8,
    fill: { color: CARD_BG },
    line: { color: BORDER_COLOR, width: 1 },
    radius: 0.1,
  });

  // Top accent bar
  slide2.addShape(pptx.shapes.RECTANGLE, {
    x: xPos,
    y: 1.8,
    w: 3.7,
    h: 0.1,
    fill: { color: c.accent },
    line: { width: 0 },
  });

  slide2.addText(`0${idx + 1}`, {
    x: xPos + 0.3,
    y: 2.1,
    w: 3.1,
    h: 0.4,
    fontSize: 20,
    fontFace: 'Segoe UI',
    color: c.accent,
    bold: true,
  });

  slide2.addText(c.title, {
    x: xPos + 0.3,
    y: 2.6,
    w: 3.1,
    h: 0.7,
    fontSize: 16,
    fontFace: 'Segoe UI',
    color: WHITE,
    bold: true,
  });

  slide2.addText(c.desc, {
    x: xPos + 0.3,
    y: 3.4,
    w: 3.1,
    h: 2.9,
    fontSize: 12,
    fontFace: 'Segoe UI',
    color: MUTED,
    lineSpacing: 18,
  });
});

addFooter(slide2, 2);

// ==========================================
// SLIDE 3: THE SOLUTION — TWO-PHASE PROTOCOL
// ==========================================
const slide3 = pptx.addSlide();
slide3.background = { color: BG_DARK };
addHeader(slide3, 'A Unified Indic Voice-to-Transaction Architecture', 'The ZYVO Solution');

// Left Column: Key Principles
slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.8,
  y: 1.8,
  w: 4.8,
  h: 4.8,
  fill: { color: CARD_BG },
  line: { color: BORDER_COLOR, width: 1 },
  radius: 0.1,
});

slide3.addText('Core Architectural Principles', {
  x: 1.1,
  y: 2.1,
  w: 4.2,
  h: 0.4,
  fontSize: 16,
  fontFace: 'Segoe UI',
  color: MINT,
  bold: true,
});

const principles = [
  { t: 'Two-Phase Confirmation Gate', d: 'Voice models NEVER mutate database tables directly. Unconfirmed audio produces an Action Proposal that requires explicit operator or customer confirmation.' },
  { t: 'Multi-Tier AI Routing', d: 'Primary Indic STT (Sarvam AI Saaras v4) + Multimodal Backup (Gemini) + 100% offline deterministic fallback pattern engine.' },
  { t: 'Zero Floating-Point Financials', d: 'All currency transactions are calculated and stored strictly in integer paise (₹1 = 100 paise), eliminating rounding drift.' },
  { t: 'Authentic Web Audio Capture', d: 'Real HTML5 canvas oscilloscope driven by the browser’s Web Audio API AnalyserNode during live microphone streaming.' },
];

let curY = 2.6;
principles.forEach((p) => {
  slide3.addText(`✔ ${p.t}`, {
    x: 1.1,
    y: curY,
    w: 4.2,
    h: 0.3,
    fontSize: 12,
    fontFace: 'Segoe UI',
    color: WHITE,
    bold: true,
  });
  slide3.addText(p.d, {
    x: 1.1,
    y: curY + 0.3,
    w: 4.2,
    h: 0.65,
    fontSize: 10.5,
    fontFace: 'Segoe UI',
    color: MUTED,
    lineSpacing: 14,
  });
  curY += 1.0;
});

// Right Column: Flow Steps
const flowSteps = [
  { step: '1', title: 'Multilingual Voice Ingestion', detail: 'Audio captured via WebM/WAV in Hindi, Hinglish, or English dialects.', tag: 'Web Audio API' },
  { step: '2', title: 'Structured Slot Extraction', detail: 'Sarvam/Gemini maps speech into formal domain schema (quantities, dates, units).', tag: 'Saaras v4 / Gemini' },
  { step: '3', title: 'Interactive Proposal Review', detail: 'Customer/merchant verifies parsed items, pricing in paise, and delivery dates.', tag: 'Two-Phase Gate' },
  { step: '4', title: 'Atomic Transaction Execution', detail: 'Relational SQLite commit updates manifests, stock, and dispute audit ledger.', tag: 'node:sqlite WAL' },
];

flowSteps.forEach((fs, i) => {
  const stepY = 1.8 + i * 1.25;
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.0,
    y: stepY,
    w: 6.5,
    h: 1.1,
    fill: { color: CARD_BG },
    line: { color: i === 2 ? MINT : BORDER_COLOR, width: 1 },
    radius: 0.08,
  });

  slide3.addShape(pptx.shapes.OVAL, {
    x: 6.2,
    y: stepY + 0.25,
    w: 0.6,
    h: 0.6,
    fill: { color: i === 2 ? MINT : '202622' },
    line: { width: 0 },
  });
  slide3.addText(fs.step, {
    x: 6.2,
    y: stepY + 0.25,
    w: 0.6,
    h: 0.6,
    align: 'center',
    valign: 'middle',
    color: i === 2 ? BG_DARK : WHITE,
    bold: true,
    fontSize: 14,
  });

  slide3.addText(fs.title, {
    x: 7.0,
    y: stepY + 0.18,
    w: 4.0,
    h: 0.35,
    fontSize: 13,
    fontFace: 'Segoe UI',
    color: WHITE,
    bold: true,
  });
  slide3.addText(fs.detail, {
    x: 7.0,
    y: stepY + 0.52,
    w: 4.2,
    h: 0.45,
    fontSize: 10,
    fontFace: 'Segoe UI',
    color: MUTED,
  });

  slide3.addText(fs.tag, {
    x: 10.8,
    y: stepY + 0.18,
    w: 1.5,
    h: 0.3,
    fontSize: 9,
    fontFace: 'Segoe UI',
    color: MINT,
    align: 'right',
    bold: true,
  });
});

addFooter(slide3, 3);

// ==========================================
// SLIDE 4: FIVE FUNCTIONAL BUSINESS VERTICALS
// ==========================================
const slide4 = pptx.addSlide();
slide4.background = { color: BG_DARK };
addHeader(slide4, 'One Core Platform. Five Specialized Commercial Workflows.', 'End-to-End Vertical Scope');

const verticals = [
  {
    name: 'Milk Delivery',
    accent: '69D9AD',
    features: [
      '20:00 IST Cutoff Rule enforcement',
      'Dual-Model Billing: delivery summation vs calendar reconciliation',
      'Pause, resume, and extra milk calendar overrides (199,500 paise benchmark)',
    ],
  },
  {
    name: 'Kirana Store',
    accent: 'DAB77A',
    features: [
      'Colloquial Indic alias matching (shakkar/chini -> Sugar, chawal -> Rice)',
      'Multi-item basket builder with unit validation (kg, packet, litre)',
      'Merchant bagging & fulfillment status queue (Pending -> Delivered)',
    ],
  },
  {
    name: 'Vegetable Vendor',
    accent: '86D5D4',
    features: [
      'Mandi daily spot rate sheet with fractional weights (250g, 500g, 1kg)',
      'Non-standard bundle handling (gaddi dhaniya, bundles)',
      'Aggregated vendor weighing & market procurement manifest',
    ],
  },
  {
    name: 'Clinic Appointments',
    accent: 'A4E4B5',
    features: [
      'Attending physician time dial & slot reservation',
      'Relational double-booking prevention',
      'Strict Non-Diagnostic Privacy Shield: blocks symptoms & prescriptions',
    ],
  },
  {
    name: 'Agri Procurement',
    accent: 'F1A79C',
    features: [
      'Volume conversion from kg/crates to 100 kg Quintals',
      'Official CCEA PIB MSP benchmarks (Wheat ₹2,425/q, Mustard ₹5,950/q)',
      'Farm-gate logistics, pickup scheduling & indicative payout ledger',
    ],
  },
];

// 5 vertical columns
verticals.forEach((v, idx) => {
  const colX = 0.8 + idx * 2.4;
  slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: colX,
    y: 1.8,
    w: 2.2,
    h: 4.8,
    fill: { color: CARD_BG },
    line: { color: BORDER_COLOR, width: 1 },
    radius: 0.08,
  });

  // Top color line
  slide4.addShape(pptx.shapes.RECTANGLE, {
    x: colX,
    y: 1.8,
    w: 2.2,
    h: 0.08,
    fill: { color: v.accent },
    line: { width: 0 },
  });

  slide4.addText(v.name, {
    x: colX + 0.15,
    y: 2.1,
    w: 1.9,
    h: 0.6,
    fontSize: 13,
    fontFace: 'Segoe UI',
    color: WHITE,
    bold: true,
  });

  const bulletText = v.features.map((f) => ({ text: `• ${f}\n\n`, options: { fontSize: 9.5, color: MUTED } }));
  slide4.addText(bulletText, {
    x: colX + 0.15,
    y: 2.8,
    w: 1.9,
    h: 3.6,
    fontFace: 'Segoe UI',
    lineSpacing: 13,
  });
});

addFooter(slide4, 4);

// ==========================================
// SLIDE 5: SYSTEM ARCHITECTURE & AI ENGINE
// ==========================================
const slide5 = pptx.addSlide();
slide5.background = { color: BG_DARK };
addHeader(slide5, 'Production-Grade Tech Stack & Multi-Tier AI Provider Engine', 'Technical Architecture');

const archCards = [
  {
    category: 'Speech-to-Text Pipeline',
    accent: MINT,
    items: [
      { k: 'Primary STT:', v: 'Sarvam AI (saaras:v4) codemix Indic model' },
      { k: 'Backup STT:', v: 'Google Gemini Multimodal Audio' },
      { k: 'Fallback:', v: 'Local deterministic benchmark mock evaluator' },
      { k: 'Circuit Breaker:', v: '3-failure threshold with 60s auto-cooldown' },
    ],
  },
  {
    category: 'Structured Intent Extraction',
    accent: TEAL,
    items: [
      { k: 'Primary Engine:', v: 'Google Gemini (gemini-3.5-flash-lite)' },
      { k: 'Format:', v: 'Strict JSON Schema output (responseMimeType)' },
      { k: 'Ambiguity Guard:', v: 'Detects missing slots; triggers polite clarification' },
      { k: 'Deterministic:', v: 'Local pattern extractor for guaranteed zero downtime' },
    ],
  },
  {
    category: 'Persistence & Data Layer',
    accent: GOLD,
    items: [
      { k: 'Database Engine:', v: 'node:sqlite (Node 22+ native DatabaseSync)' },
      { k: 'Journal Mode:', v: 'WAL (Write-Ahead Logging) for high concurrency' },
      { k: 'Integrity:', v: 'PRAGMA foreign_keys = ON; cascade protection' },
      { k: 'Financial Engine:', v: '100% integer paise; zero floating-point drift' },
    ],
  },
  {
    category: 'Frontend & Spatial UI',
    accent: 'A4E4B5',
    items: [
      { k: 'Framework:', v: 'Next.js 16.4.6 App Router with Turbopack' },
      { k: '3D Graphics:', v: 'Three.js 3D Voice Core with gyroscopic orbits' },
      { k: 'Oscilloscope:', v: 'Native Web Audio API (AudioContext + Analyser)' },
      { k: 'Accessibility:', v: 'Synchronized HTML switcher with aria landmarks' },
    ],
  },
];

archCards.forEach((ac, idx) => {
  const row = Math.floor(idx / 2);
  const col = idx % 2;
  const cX = 0.8 + col * 6.0;
  const cY = 1.8 + row * 2.45;

  slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: cX,
    y: cY,
    w: 5.7,
    h: 2.25,
    fill: { color: CARD_BG },
    line: { color: BORDER_COLOR, width: 1 },
    radius: 0.08,
  });

  slide5.addText(ac.category, {
    x: cX + 0.3,
    y: cY + 0.2,
    w: 5.1,
    h: 0.35,
    fontSize: 14,
    fontFace: 'Segoe UI',
    color: ac.accent,
    bold: true,
  });

  const bodyList = ac.items.map((it) => [
    { text: `${it.k} `, options: { bold: true, color: WHITE, fontSize: 10 } },
    { text: `${it.v}\n`, options: { color: MUTED, fontSize: 10 } },
  ]).flat();

  slide5.addText(bodyList, {
    x: cX + 0.3,
    y: cY + 0.6,
    w: 5.1,
    h: 1.5,
    fontFace: 'Segoe UI',
    lineSpacing: 15,
  });
});

addFooter(slide5, 5);

// ==========================================
// SLIDE 6: SECURITY, PRIVACY & DIFFERENTIATORS
// ==========================================
const slide6 = pptx.addSlide();
slide6.background = { color: BG_DARK };
addHeader(slide6, 'Enterprise Privacy Guardrails vs Industry Alternatives', 'Trust & Competitive Edge');

// Table Comparison
const rows = [
  [
    { text: 'Capability Dimension', options: { bold: true, color: WHITE, fill: '202622' } },
    { text: 'Generic Chatbots', options: { bold: true, color: MUTED, fill: '202622' } },
    { text: 'Heavyweight ERP Apps', options: { bold: true, color: MUTED, fill: '202622' } },
    { text: 'ZYVO Platform', options: { bold: true, color: MINT, fill: '172C21' } },
  ],
  [
    { text: 'Interaction Model', options: { bold: true, color: WHITE } },
    { text: 'Open-ended chat text', options: { color: MUTED } },
    { text: 'Complex nested forms', options: { color: MUTED } },
    { text: 'Voice-first + 2-phase visual review', options: { color: WHITE, bold: true } },
  ],
  [
    { text: 'Database Mutation', options: { bold: true, color: WHITE } },
    { text: 'Hallucinated actions', options: { color: MUTED } },
    { text: 'Manual typing errors', options: { color: MUTED } },
    { text: 'Atomic schema-validated commits', options: { color: WHITE, bold: true } },
  ],
  [
    { text: 'Dispute Auditability', options: { bold: true, color: WHITE } },
    { text: 'None', options: { color: MUTED } },
    { text: 'Text log only', options: { color: MUTED } },
    { text: 'Raw audio bound to audit record', options: { color: WHITE, bold: true } },
  ],
  [
    { text: 'Medical Privacy', options: { bold: true, color: WHITE } },
    { text: 'Leaks symptoms to cloud', options: { color: MUTED } },
    { text: 'Static booking', options: { color: MUTED } },
    { text: 'Clinic Non-Diagnostic Shield (zero LLM)', options: { color: MINT, bold: true } },
  ],
  [
    { text: 'Currency Precision', options: { bold: true, color: WHITE } },
    { text: 'Floating point numbers', options: { color: MUTED } },
    { text: 'Variable rounding', options: { color: MUTED } },
    { text: 'Strict integer paise (₹1 = 100p)', options: { color: GOLD, bold: true } },
  ],
];

slide6.addTable(rows, {
  x: 0.8,
  y: 1.8,
  w: 11.7,
  colW: [2.5, 3.0, 3.0, 3.2],
  rowH: 0.45,
  fill: CARD_BG,
  color: WHITE,
  fontSize: 10,
  fontFace: 'Segoe UI',
  border: { color: BORDER_COLOR, pt: 1 },
  align: 'left',
  valign: 'middle',
});

// Three key trust highlights below table
const highlights = [
  { title: 'Clinic Non-Diagnostic Shield', text: 'Patient symptoms and prescriptions are strictly rejected server-side. Zero medical data is ever passed to external LLM APIs.' },
  { title: 'Dispute-Grade Audit Trail', text: 'All state transitions (RECEIVED -> TRANSCRIBED -> PROPOSAL -> APPLIED) are written to SQLite audit_events linking the raw audio.' },
  { title: 'Government MSP Compliance', text: 'Transparently cites official PIB CCEA benchmarks (Wheat/Mustard) while strictly classifying perishables as non-MSP spot rates.' },
];

highlights.forEach((h, i) => {
  const hX = 0.8 + i * 4.0;
  slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: hX,
    y: 5.0,
    w: 3.7,
    h: 1.6,
    fill: { color: CARD_BG },
    line: { color: BORDER_COLOR, width: 1 },
    radius: 0.08,
  });

  slide6.addText(`🛡 ${h.title}`, {
    x: hX + 0.2,
    y: 5.15,
    w: 3.3,
    h: 0.35,
    fontSize: 11,
    fontFace: 'Segoe UI',
    color: MINT,
    bold: true,
  });

  slide6.addText(h.text, {
    x: hX + 0.2,
    y: 5.5,
    w: 3.3,
    h: 1.0,
    fontSize: 9.5,
    fontFace: 'Segoe UI',
    color: MUTED,
    lineSpacing: 13,
  });
});

addFooter(slide6, 6);

// ==========================================
// SLIDE 7: VERIFICATION, DEMO & ROADMAP
// ==========================================
const slide7 = pptx.addSlide();
slide7.background = { color: BG_DARK };
addHeader(slide7, 'Empirical Hackathon Verification & Next Milestones', 'Production Readiness');

// Column 1: Verification Scoreboard
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.8,
  y: 1.8,
  w: 5.6,
  h: 4.8,
  fill: { color: CARD_BG },
  line: { color: MINT, width: 1 },
  radius: 0.1,
});

slide7.addText('Empirical Quality Scoreboard', {
  x: 1.1,
  y: 2.1,
  w: 5.0,
  h: 0.4,
  fontSize: 16,
  fontFace: 'Segoe UI',
  color: MINT,
  bold: true,
});

const scoreItems = [
  { label: 'Automated Test Suites', val: '12 / 12 Passing (100% Pass Rate)' },
  { label: 'Next.js Production Build', val: '34 Static & Dynamic Routes (0 Errors)' },
  { label: 'Live Cloud Deployment', val: 'https://zyvo-delta.vercel.app' },
  { label: 'GitHub Repository', val: 'https://github.com/selfabhijeetkumar/ZYVO' },
  { label: '60-Second Demo Video', val: '1080p Full HD MP4 (artifacts/ZYVO_60_SECOND_DEMO.mp4)' },
  { label: 'Security & Secrets Audit', val: 'Clean (zero keys in repo; .env.local ignored)' },
];

let scY = 2.6;
scoreItems.forEach((si) => {
  slide7.addText(si.label, {
    x: 1.1,
    y: scY,
    w: 5.0,
    h: 0.25,
    fontSize: 10,
    fontFace: 'Segoe UI',
    color: MUTED,
  });
  slide7.addText(`✔ ${si.val}`, {
    x: 1.1,
    y: scY + 0.25,
    w: 5.0,
    h: 0.35,
    fontSize: 11,
    fontFace: 'Segoe UI',
    color: WHITE,
    bold: true,
  });
  scY += 0.65;
});

// Column 2: Commercial Roadmap
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 6.8,
  y: 1.8,
  w: 5.7,
  h: 4.8,
  fill: { color: CARD_BG },
  line: { color: BORDER_COLOR, width: 1 },
  radius: 0.1,
});

slide7.addText('Post-Hackathon Commercial Roadmap', {
  x: 7.1,
  y: 2.1,
  w: 5.1,
  h: 0.4,
  fontSize: 16,
  fontFace: 'Segoe UI',
  color: GOLD,
  bold: true,
});

const roadmap = [
  { phase: 'Phase 1 · Immediate', title: 'WhatsApp Business Cloud API Webhook', desc: 'Direct voice note forward ingestion from WhatsApp without requiring merchant web navigation.' },
  { phase: 'Phase 2 · Q1 2027', title: 'On-Device Vernacular STT (Edge AI)', desc: 'Local whisper-tiny Indic models running directly on entry-level Android devices for 100% offline environments.' },
  { phase: 'Phase 3 · Q2 2027', title: 'UPI 123PAY & Soundbox Auto-Reconciliation', desc: 'Integration with IVR-based feature phone UPI payments and real-time audio soundbox confirmation.' },
  { phase: 'Phase 4 · Q3 2027', title: 'Multi-Tenant SaaS Merchant Distribution', desc: 'White-label multi-tenant subscriptions for regional dairy federations, Mandi associations, and rural co-ops.' },
];

let rmY = 2.6;
roadmap.forEach((r) => {
  slide7.addText(`${r.phase} — ${r.title}`, {
    x: 7.1,
    y: rmY,
    w: 5.1,
    h: 0.25,
    fontSize: 11,
    fontFace: 'Segoe UI',
    color: WHITE,
    bold: true,
  });
  slide7.addText(r.desc, {
    x: 7.1,
    y: rmY + 0.25,
    w: 5.1,
    h: 0.55,
    fontSize: 10,
    fontFace: 'Segoe UI',
    color: MUTED,
    lineSpacing: 13,
  });
  rmY += 0.95;
});

addFooter(slide7, 7);

// ==========================================
// SAVE PRESENTATION
// ==========================================
const outPath = path.join(__dirname, '..', 'ZYVO_PITCH_DECK.pptx');
console.log(`Writing PowerPoint presentation to ${outPath}...`);

pptx
  .writeFile({ fileName: outPath })
  .then((fileName) => {
    console.log(`\n====================================================`);
    console.log(`   PPTX GENERATED SUCCESSFULLY: ${fileName}`);
    console.log(`====================================================`);
    // Copy to root as well
    const rootPath = path.join('C:\\MILKY WAY', 'ZYVO_PITCH_DECK.pptx');
    fs.copyFileSync(outPath, rootPath);
    console.log(`Copied to: ${rootPath}`);
  })
  .catch((err) => {
    console.error('Failed to generate presentation:', err);
    process.exit(1);
  });
