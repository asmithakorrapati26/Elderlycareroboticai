/*
# Healthcare Companion Robot - Database Schema

## Overview
This schema supports a prototype of an AI robotic healthcare companion designed for elderly care.
The system reminds patients to take medications, checks on them if they don't respond,
and escalates to emergency contacts or nearby hospitals when needed.

## Tables Created
1. `patient_profile` - Stores the elderly patient's personal and medical information
2. `medications` - Medication schedule with dosages, times, and instructions
3. `emergency_contacts` - People to contact in case of emergency (family, neighbors, doctors)
4. `hospitals` - Nearby hospitals for emergency escalation
5. `alert_log` - History of all alerts, reminders, and escalations
6. `app_settings` - Configuration for escalation timing and system behavior

## Security
- This is a single-tenant prototype with no sign-in screen
- All tables use `TO anon, authenticated` policies so the frontend can read/write data
- RLS is enabled on every table
*/

-- ============================================
-- 1. PATIENT PROFILE
-- ============================================
CREATE TABLE IF NOT EXISTS patient_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age int NOT NULL,
  gender text DEFAULT 'Not specified',
  blood_type text DEFAULT 'Unknown',
  medical_conditions text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  avatar_url text,
  room_number text,
  device_name text DEFAULT 'CareBot AI-1',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patient_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_patient_profile" ON patient_profile;
CREATE POLICY "anon_select_patient_profile" ON patient_profile FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_patient_profile" ON patient_profile;
CREATE POLICY "anon_insert_patient_profile" ON patient_profile FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_patient_profile" ON patient_profile;
CREATE POLICY "anon_update_patient_profile" ON patient_profile FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_patient_profile" ON patient_profile;
CREATE POLICY "anon_delete_patient_profile" ON patient_profile FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 2. MEDICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  dosage text NOT NULL,
  scheduled_time time NOT NULL,
  frequency text NOT NULL DEFAULT 'daily',
  instructions text,
  color text DEFAULT 'blue',
  taken_today boolean DEFAULT false,
  last_taken_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_medications" ON medications;
CREATE POLICY "anon_select_medications" ON medications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_medications" ON medications;
CREATE POLICY "anon_insert_medications" ON medications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_medications" ON medications;
CREATE POLICY "anon_update_medications" ON medications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_medications" ON medications;
CREATE POLICY "anon_delete_medications" ON medications FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 3. EMERGENCY CONTACTS
-- ============================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  priority int NOT NULL DEFAULT 1,
  is_primary boolean DEFAULT false,
  avatar_color text DEFAULT 'teal',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_emergency_contacts" ON emergency_contacts;
CREATE POLICY "anon_select_emergency_contacts" ON emergency_contacts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_emergency_contacts" ON emergency_contacts;
CREATE POLICY "anon_insert_emergency_contacts" ON emergency_contacts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_emergency_contacts" ON emergency_contacts;
CREATE POLICY "anon_update_emergency_contacts" ON emergency_contacts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_emergency_contacts" ON emergency_contacts;
CREATE POLICY "anon_delete_emergency_contacts" ON emergency_contacts FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 4. NEARBY HOSPITALS
-- ============================================
CREATE TABLE IF NOT EXISTS hospitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  distance_km numeric NOT NULL DEFAULT 0,
  phone text NOT NULL,
  address text,
  emergency_services boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_hospitals" ON hospitals;
CREATE POLICY "anon_select_hospitals" ON hospitals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_hospitals" ON hospitals;
CREATE POLICY "anon_insert_hospitals" ON hospitals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_hospitals" ON hospitals;
CREATE POLICY "anon_update_hospitals" ON hospitals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_hospitals" ON hospitals;
CREATE POLICY "anon DELETE_hospitals" ON hospitals;
CREATE POLICY "anon_delete_hospitals" ON hospitals FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 5. ALERT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'low',
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  medication_id uuid REFERENCES medications(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES emergency_contacts(id) ON DELETE SET NULL,
  hospital_id uuid REFERENCES hospitals(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE alert_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_alert_log" ON alert_log;
CREATE POLICY "anon_select_alert_log" ON alert_log FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alert_log" ON alert_log;
CREATE POLICY "anon_insert_alert_log" ON alert_log FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alert_log" ON alert_log;
CREATE POLICY "anon_update_alert_log" ON alert_log FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alert_log" ON alert_log;
CREATE POLICY "anon_delete_alert_log" ON alert_log FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- 6. APP SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_wait_seconds int NOT NULL DEFAULT 30,
  checkin_wait_seconds int NOT NULL DEFAULT 20,
  escalation_wait_seconds int NOT NULL DEFAULT 30,
  voice_enabled boolean DEFAULT true,
  auto_escalate boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_app_settings" ON app_settings;
CREATE POLICY "anon_select_app_settings" ON app_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_app_settings" ON app_settings;
CREATE POLICY "anon_insert_app_settings" ON app_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_app_settings" ON app_settings;
CREATE POLICY "anon_update_app_settings" ON app_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_app_settings" ON app_settings;
CREATE POLICY "anon_delete_app_settings" ON app_settings FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Patient profile
INSERT INTO patient_profile (name, age, gender, blood_type, medical_conditions, allergies, room_number, device_name)
SELECT 'Margaret Anderson', 78, 'Female', 'O+', 
  ARRAY['Hypertension', 'Type 2 Diabetes', 'Mild Arthritis'],
  ARRAY['Penicillin'],
  'Room 204', 'CareBot AI-1'
WHERE NOT EXISTS (SELECT 1 FROM patient_profile);

-- Medications
INSERT INTO medications (name, dosage, scheduled_time, frequency, instructions, color)
SELECT 'Lisinopril', '10 mg', '08:00', 'daily', 'Take with water before breakfast', 'blue'
WHERE NOT EXISTS (SELECT 1 FROM medications);

INSERT INTO medications (name, dosage, scheduled_time, frequency, instructions, color)
SELECT 'Metformin', '500 mg', '08:30', 'daily', 'Take with food', 'green'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Metformin');

INSERT INTO medications (name, dosage, scheduled_time, frequency, instructions, color)
SELECT 'Atorvastatin', '20 mg', '20:00', 'daily', 'Take in the evening', 'purple'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Atorvastatin');

INSERT INTO medications (name, dosage, scheduled_time, frequency, instructions, color)
SELECT 'Aspirin', '81 mg', '12:00', 'daily', 'Take after lunch', 'orange'
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE name = 'Aspirin');

-- Emergency contacts
INSERT INTO emergency_contacts (name, relationship, phone, priority, is_primary, avatar_color)
SELECT 'David Anderson', 'Son', '+1 555-0101', 1, true, 'teal'
WHERE NOT EXISTS (SELECT 1 FROM emergency_contacts);

INSERT INTO emergency_contacts (name, relationship, phone, priority, is_primary, avatar_color)
SELECT 'Sarah Anderson', 'Daughter', '+1 555-0102', 2, false, 'pink'
WHERE NOT EXISTS (SELECT 1 FROM emergency_contacts WHERE name = 'Sarah Anderson');

INSERT INTO emergency_contacts (name, relationship, phone, priority, is_primary, avatar_color)
SELECT 'Dr. James Wilson', 'Primary Doctor', '+1 555-0199', 3, false, 'blue'
WHERE NOT EXISTS (SELECT 1 FROM emergency_contacts WHERE name = 'Dr. James Wilson');

-- Hospitals
INSERT INTO hospitals (name, distance_km, phone, address, emergency_services)
SELECT 'St. Mary Medical Center', 2.3, '+1 555-9111', '123 Health Ave', true
WHERE NOT EXISTS (SELECT 1 FROM hospitals);

INSERT INTO hospitals (name, distance_km, phone, address, emergency_services)
SELECT 'Riverside General Hospital', 4.7, '+1 555-9112', '456 River Rd', true
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'Riverside General Hospital');

INSERT INTO hospitals (name, distance_km, phone, address, emergency_services)
SELECT 'Community Care Clinic', 1.1, '+1 555-9113', '789 Oak St', false
WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'Community Care Clinic');

-- App settings
INSERT INTO app_settings (reminder_wait_seconds, checkin_wait_seconds, escalation_wait_seconds)
SELECT 30, 20, 30
WHERE NOT EXISTS (SELECT 1 FROM app_settings);

-- Initial alert log entries
INSERT INTO alert_log (alert_type, severity, title, description, status)
SELECT 'system', 'info', 'System Initialized', 'CareBot AI-1 activated and monitoring patient Margaret Anderson', 'resolved'
WHERE NOT EXISTS (SELECT 1 FROM alert_log);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_medications_time ON medications(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_alert_log_created ON alert_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_priority ON emergency_contacts(priority);
