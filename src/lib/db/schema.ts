// ZYVO Multi-Vertical Database DDL Schema and Seed Initializer
// Powered by Node.js standard library built-in node:sqlite (Database class)

export const SCHEMA_SQL = `
-- Platform Core Tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  vertical_type TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_memberships (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS voice_submissions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  vertical_type TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  received_at TEXT NOT NULL,
  audio_file_path TEXT NOT NULL,
  audio_mime_type TEXT NOT NULL,
  transcript_raw TEXT,
  detected_language TEXT,
  state TEXT NOT NULL,
  status TEXT,
  status_reason TEXT,
  needs_clarification INTEGER DEFAULT 0,
  confidence_score REAL,
  processed_at TEXT,
  applied_at TEXT,
  proposal_json TEXT,
  clarification_prompt TEXT,
  confirmed_at TEXT,
  confirmed_by TEXT,
  idempotency_key TEXT,
  rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id),
  submission_id TEXT NOT NULL REFERENCES voice_submissions(id),
  user_id TEXT REFERENCES users(id),
  actor_id TEXT REFERENCES users(id),
  vertical_type TEXT,
  event_timestamp TEXT,
  created_at TEXT,
  transcript_span TEXT,
  span_start_char INTEGER,
  span_end_char INTEGER,
  action_type TEXT NOT NULL,
  prior_state_json TEXT,
  new_state_json TEXT,
  prior_state TEXT,
  new_state TEXT NOT NULL,
  confirmed_by TEXT
);

-- Module 1: Milk Delivery Entities
CREATE TABLE IF NOT EXISTS milk_vendor_cutoffs (
  vendor_id TEXT PRIMARY KEY REFERENCES workspaces(id),
  cutoff_time TEXT NOT NULL DEFAULT '20:00:00',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata'
);

CREATE TABLE IF NOT EXISTS milk_customer_subscriptions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  customer_id TEXT NOT NULL REFERENCES users(id),
  product_name TEXT NOT NULL DEFAULT 'Cow Milk',
  base_quantity_ml INTEGER NOT NULL DEFAULT 1000,
  unit_rate_paise INTEGER NOT NULL DEFAULT 7000,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS milk_delivery_calendar (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  customer_id TEXT NOT NULL REFERENCES users(id),
  delivery_date TEXT NOT NULL,
  product_name TEXT NOT NULL DEFAULT 'Cow Milk',
  scheduled_quantity_ml INTEGER NOT NULL DEFAULT 1000,
  quantity_ml INTEGER DEFAULT 1000,
  effective_rate_paise INTEGER NOT NULL DEFAULT 7000,
  status TEXT NOT NULL,
  source_submission_id TEXT REFERENCES voice_submissions(id),
  voice_submission_id TEXT REFERENCES voice_submissions(id),
  reason TEXT,
  updated_at TEXT,
  UNIQUE(workspace_id, customer_id, delivery_date)
);

-- Module 2: Kirana Store Entities
CREATE TABLE IF NOT EXISTS kirana_product_catalog (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_price_paise INTEGER NOT NULL,
  is_available INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS kirana_product_aliases (
  id TEXT PRIMARY KEY,
  catalog_id TEXT NOT NULL REFERENCES kirana_product_catalog(id) ON DELETE CASCADE,
  alias_term TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'hi'
);

CREATE TABLE IF NOT EXISTS kirana_grocery_orders (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  customer_id TEXT NOT NULL REFERENCES users(id),
  order_status TEXT NOT NULL,
  total_amount_paise INTEGER NOT NULL,
  delivery_address TEXT DEFAULT 'Default Customer Address',
  source_submission_id TEXT REFERENCES voice_submissions(id),
  voice_submission_id TEXT REFERENCES voice_submissions(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kirana_grocery_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES kirana_grocery_orders(id) ON DELETE CASCADE,
  catalog_id TEXT REFERENCES kirana_product_catalog(id),
  item_name TEXT NOT NULL,
  requested_item_name TEXT,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  unit_price_paise INTEGER NOT NULL,
  subtotal_paise INTEGER NOT NULL
);

-- Module 3: Vegetable Vendor Entities
CREATE TABLE IF NOT EXISTS vegetable_produce_catalog (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  supported_units TEXT NOT NULL,
  daily_rate_paise INTEGER NOT NULL,
  is_in_stock INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS vegetable_produce_aliases (
  id TEXT PRIMARY KEY,
  produce_id TEXT NOT NULL REFERENCES vegetable_produce_catalog(id) ON DELETE CASCADE,
  alias_term TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'hi'
);

CREATE TABLE IF NOT EXISTS vegetable_orders (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  customer_id TEXT NOT NULL REFERENCES users(id),
  order_status TEXT NOT NULL,
  status TEXT,
  total_amount_paise INTEGER NOT NULL,
  estimated_total_paise INTEGER,
  delivery_date TEXT,
  delivery_address TEXT DEFAULT 'Doorstep Drop',
  source_submission_id TEXT REFERENCES voice_submissions(id),
  voice_submission_id TEXT REFERENCES voice_submissions(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vegetable_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES vegetable_orders(id) ON DELETE CASCADE,
  produce_id TEXT REFERENCES vegetable_produce_catalog(id),
  produce_name TEXT NOT NULL,
  requested_item_name TEXT,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  unit_price_paise INTEGER NOT NULL,
  unit_rate_paise INTEGER,
  subtotal_paise INTEGER NOT NULL,
  estimated_item_paise INTEGER
);

-- Module 4: Clinic Appointments Entities
CREATE TABLE IF NOT EXISTS clinic_doctors (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  consultation_fee_paise INTEGER NOT NULL,
  available_days TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clinic_appointment_slots (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  doctor_id TEXT NOT NULL REFERENCES clinic_doctors(id) ON DELETE CASCADE,
  slot_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_booked INTEGER NOT NULL DEFAULT 0,
  max_capacity INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS clinic_appointments (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  patient_id TEXT NOT NULL REFERENCES users(id),
  doctor_id TEXT NOT NULL REFERENCES clinic_doctors(id),
  slot_id TEXT REFERENCES clinic_appointment_slots(id),
  appointment_date TEXT NOT NULL,
  time_slot TEXT DEFAULT '10:00 AM',
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  source_submission_id TEXT REFERENCES voice_submissions(id),
  voice_submission_id TEXT REFERENCES voice_submissions(id),
  created_at TEXT NOT NULL
);

-- Module 5: Agriculture Produce Procurement Entities
CREATE TABLE IF NOT EXISTS agri_crop_catalog (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  crop_name TEXT NOT NULL,
  variety TEXT NOT NULL,
  indicative_rate_paise_per_quintal INTEGER NOT NULL,
  procurement_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS agri_procurement_requests (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  farmer_id TEXT NOT NULL REFERENCES users(id),
  crop_id TEXT REFERENCES agri_crop_catalog(id),
  variety TEXT,
  estimated_volume_quintals REAL,
  offered_rate_paise_per_quintal INTEGER,
  total_estimated_payout_paise INTEGER,
  request_status TEXT NOT NULL DEFAULT 'REGISTERED',
  status TEXT DEFAULT 'REGISTERED',
  total_indicative_value_paise INTEGER DEFAULT 0,
  pickup_date TEXT,
  source_submission_id TEXT REFERENCES voice_submissions(id),
  voice_submission_id TEXT REFERENCES voice_submissions(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agri_procurement_items (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES agri_procurement_requests(id) ON DELETE CASCADE,
  crop_id TEXT NOT NULL REFERENCES agri_crop_catalog(id),
  crop_name TEXT NOT NULL,
  quantity_quintals REAL NOT NULL,
  unit TEXT NOT NULL,
  grade_quality TEXT NOT NULL DEFAULT 'Standard',
  rate_paise_per_quintal INTEGER NOT NULL,
  subtotal_paise INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS agri_pickup_schedules (
  id TEXT PRIMARY KEY,
  workspace_id TEXT REFERENCES workspaces(id),
  request_id TEXT NOT NULL REFERENCES agri_procurement_requests(id) ON DELETE CASCADE,
  pickup_date TEXT,
  scheduled_pickup_date TEXT,
  pickup_location TEXT,
  pickup_status TEXT NOT NULL DEFAULT 'SCHEDULED',
  logistics_notes TEXT
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON workspace_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_ws ON voice_submissions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_sub ON audit_events(submission_id);
CREATE INDEX IF NOT EXISTS idx_milk_cal ON milk_delivery_calendar(customer_id, delivery_date);
`;

export function seedInitialData(db: any) {
  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount && userCount.count > 0) {
    return;
  }

  const now = new Date().toISOString();

  // 1. Seed Users
  const insertUser = db.prepare('INSERT INTO users (id, name, phone, email, role, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  insertUser.run('user_operator_01', 'Kumar Operator', '+919876543210', 'kumar@zyvo.local', 'operator', now);
  insertUser.run('user_customer_01', 'Ramesh Sharma', '+919876543211', 'sharma@zyvo.local', 'member', now);

  // 2. Seed Workspaces for all 5 Verticals
  const insertWs = db.prepare('INSERT INTO workspaces (id, name, vertical_type, owner_id, created_at) VALUES (?, ?, ?, ?, ?)');
  insertWs.run('ws_milk_01', 'Kumar Dairy Milk Booth', 'milk_delivery', 'user_operator_01', now);
  insertWs.run('ws_kirana_01', 'Gupta Kirana & General Store', 'kirana', 'user_operator_01', now);
  insertWs.run('ws_veg_01', 'Subhash Fresh Vegetable Market', 'vegetable_vendor', 'user_operator_01', now);
  insertWs.run('ws_clinic_01', 'Arogya Community Health Clinic', 'clinic', 'user_operator_01', now);
  insertWs.run('ws_agri_01', 'Kisan Samriddhi Agri Procurement', 'agriculture', 'user_operator_01', now);

  // 3. Seed Memberships
  const insertMem = db.prepare('INSERT INTO workspace_memberships (id, workspace_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)');
  // Operator owns all 5
  insertMem.run('mem_op_milk', 'ws_milk_01', 'user_operator_01', 'operator', now);
  insertMem.run('mem_op_kirana', 'ws_kirana_01', 'user_operator_01', 'operator', now);
  insertMem.run('mem_op_veg', 'ws_veg_01', 'user_operator_01', 'operator', now);
  insertMem.run('mem_op_clinic', 'ws_clinic_01', 'user_operator_01', 'operator', now);
  insertMem.run('mem_op_agri', 'ws_agri_01', 'user_operator_01', 'operator', now);

  // Sharma is member/customer in all 5
  insertMem.run('mem_sharma_milk', 'ws_milk_01', 'user_customer_01', 'customer', now);
  insertMem.run('mem_sharma_kirana', 'ws_kirana_01', 'user_customer_01', 'customer', now);
  insertMem.run('mem_sharma_veg', 'ws_veg_01', 'user_customer_01', 'customer', now);
  insertMem.run('mem_sharma_clinic', 'ws_clinic_01', 'user_customer_01', 'patient', now);
  insertMem.run('mem_sharma_agri', 'ws_agri_01', 'user_customer_01', 'farmer', now);

  // 4. Seed Milk Subscriptions & Cutoff
  db.prepare('INSERT INTO milk_vendor_cutoffs (vendor_id, cutoff_time, timezone) VALUES (?, ?, ?)').run('ws_milk_01', '20:00:00', 'Asia/Kolkata');
  db.prepare('INSERT INTO milk_customer_subscriptions (id, workspace_id, customer_id, product_name, base_quantity_ml, unit_rate_paise, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    'sub_milk_sharma', 'ws_milk_01', 'user_customer_01', 'Cow Milk', 1000, 7000, 1
  );

  // 5. Seed Kirana Catalog & Aliases
  const insertKiranaProd = db.prepare('INSERT INTO kirana_product_catalog (id, workspace_id, name, category, unit, unit_price_paise, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertKiranaProd.run('k_prod_01', 'ws_kirana_01', 'Maggi 2-Minute Noodles', 'Packaged Food', 'packet', 1400, 1);
  insertKiranaProd.run('k_prod_02', 'ws_kirana_01', 'Basmati Rice (Tukda)', 'Grains & Staples', 'kg', 6000, 1);
  insertKiranaProd.run('k_prod_03', 'ws_kirana_01', 'Refined Sugar', 'Grains & Staples', 'kg', 4400, 1);
  insertKiranaProd.run('k_prod_04', 'ws_kirana_01', 'Tata Salt 1kg', 'Grains & Staples', 'packet', 2800, 1);
  insertKiranaProd.run('k_prod_05', 'ws_kirana_01', 'Fortune Sunflower Oil 1L', 'Oils & Ghee', 'litre', 13500, 1);

  const insertKiranaAlias = db.prepare('INSERT INTO kirana_product_aliases (id, catalog_id, alias_term, language) VALUES (?, ?, ?, ?)');
  insertKiranaAlias.run('ka_01', 'k_prod_01', 'maggi', 'hi');
  insertKiranaAlias.run('ka_02', 'k_prod_02', 'chawal', 'hi');
  insertKiranaAlias.run('ka_03', 'k_prod_02', 'rice', 'en');
  insertKiranaAlias.run('ka_04', 'k_prod_03', 'chini', 'hi');
  insertKiranaAlias.run('ka_05', 'k_prod_03', 'shakkar', 'hi');
  insertKiranaAlias.run('ka_06', 'k_prod_03', 'sugar', 'en');
  insertKiranaAlias.run('ka_07', 'k_prod_04', 'namak', 'hi');
  insertKiranaAlias.run('ka_08', 'k_prod_04', 'salt', 'en');

  // 6. Seed Vegetable Catalog & Aliases
  const insertVegProd = db.prepare('INSERT INTO vegetable_produce_catalog (id, workspace_id, name, category, supported_units, daily_rate_paise, is_in_stock) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertVegProd.run('v_prod_01', 'ws_veg_01', 'Potato (Aloo)', 'Root Vegetables', 'kg,grams', 3000, 1);
  insertVegProd.run('v_prod_02', 'ws_veg_01', 'Tomato (Desi Tamatar)', 'Daily Vegetables', 'kg,grams', 4000, 1);
  insertVegProd.run('v_prod_03', 'ws_veg_01', 'Onion (Pyaaz)', 'Root Vegetables', 'kg,grams', 3500, 1);
  insertVegProd.run('v_prod_04', 'ws_veg_01', 'Fresh Coriander (Dhaniya)', 'Leafy Greens', 'bundles,pieces', 1500, 1);
  insertVegProd.run('v_prod_05', 'ws_veg_01', 'Ginger (Adrak)', 'Root Vegetables', 'grams,kg', 12000, 1);

  const insertVegAlias = db.prepare('INSERT INTO vegetable_produce_aliases (id, produce_id, alias_term, language) VALUES (?, ?, ?, ?)');
  insertVegAlias.run('va_01', 'v_prod_01', 'aloo', 'hi');
  insertVegAlias.run('va_02', 'v_prod_01', 'batata', 'hi');
  insertVegAlias.run('va_03', 'v_prod_02', 'tamatar', 'hi');
  insertVegAlias.run('va_04', 'v_prod_02', 'tomato', 'en');
  insertVegAlias.run('va_05', 'v_prod_03', 'pyaaz', 'hi');
  insertVegAlias.run('va_06', 'v_prod_03', 'kanda', 'hi');
  insertVegAlias.run('va_07', 'v_prod_04', 'dhaniya', 'hi');
  insertVegAlias.run('va_08', 'v_prod_04', 'gaddi dhaniya', 'hi');

  // 7. Seed Clinic Doctors & Slots
  const insertDoc = db.prepare('INSERT INTO clinic_doctors (id, workspace_id, name, department, consultation_fee_paise, available_days, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertDoc.run('doc_01', 'ws_clinic_01', 'Dr. Ramesh Rao, MBBS', 'General Medicine', 30000, 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', '09:00:00', '14:00:00');
  insertDoc.run('doc_02', 'ws_clinic_01', 'Dr. Sneha Verma, MD', 'Pediatrics & Child Care', 40000, 'Monday,Wednesday,Friday', '16:00:00', '20:00:00');

  const insertSlot = db.prepare('INSERT INTO clinic_appointment_slots (id, workspace_id, doctor_id, slot_date, start_time, end_time, is_booked, max_capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  insertSlot.run('slot_01', 'ws_clinic_01', 'doc_01', '2026-11-20', '10:00:00', '10:30:00', 0, 1);
  insertSlot.run('slot_02', 'ws_clinic_01', 'doc_01', '2026-11-20', '10:30:00', '11:00:00', 0, 1);
  insertSlot.run('slot_03', 'ws_clinic_01', 'doc_01', '2026-11-20', '11:00:00', '11:30:00', 0, 1);

  // 8. Seed Agri Crop Catalog
  const insertCrop = db.prepare('INSERT INTO agri_crop_catalog (id, workspace_id, crop_name, variety, indicative_rate_paise_per_quintal, procurement_active) VALUES (?, ?, ?, ?, ?, ?)');
  insertCrop.run('crop_01', 'ws_agri_01', 'Tomato', 'Hybrid Red', 120000, 1); // ₹1,200/quintal
  insertCrop.run('crop_02', 'ws_agri_01', 'Wheat', 'Sharbati A-Grade', 245000, 1); // ₹2,450/quintal
  insertCrop.run('crop_03', 'ws_agri_01', 'Mustard Seed (Sarson)', 'Standard Yellow', 520000, 1); // ₹5,200/quintal
  insertCrop.run('crop_04', 'ws_agri_01', 'Potato', 'Jyoti Khada', 95000, 1); // ₹950/quintal
}
