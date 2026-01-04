-- =============================================================================
-- Observational Study Platform - Database Schema
-- =============================================================================
-- This schema defines all tables for the study platform.
-- All objects are created in the 'study_platform' schema to avoid conflicts.
-- Run this in Supabase SQL Editor to set up the database.
-- =============================================================================

-- =============================================================================
-- SCHEMA SETUP
-- =============================================================================

-- Create dedicated schema for this application
CREATE SCHEMA IF NOT EXISTS study_platform;

-- Set search path for this session (all objects created in study_platform)
SET search_path TO study_platform, public;

-- =============================================================================
-- CLEANUP (drop existing objects to make schema re-runnable)
-- =============================================================================

-- Drop trigger on auth.users first (this one always exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the entire schema and recreate (cleanest approach)
DROP SCHEMA IF EXISTS study_platform CASCADE;
CREATE SCHEMA study_platform;

-- =============================================================================
-- ENUMS
-- =============================================================================

-- User roles in the platform
CREATE TYPE platform_role AS ENUM ('sponsor', 'participant', 'admin');

-- Study lifecycle states
CREATE TYPE study_status AS ENUM ('draft', 'active', 'paused', 'completed');

-- Participant journey through a study
CREATE TYPE participant_status AS ENUM (
  'invited',      -- Received invitation, not yet registered
  'registered',   -- Created account, not yet consented
  'consented',    -- Signed consent, not yet screened
  'screening',    -- In screening process
  'enrolled',     -- Passed screening, ready to start
  'active',       -- Actively participating in study
  'completed',    -- Finished all study activities
  'withdrawn',    -- Voluntarily withdrew
  'ineligible'    -- Failed screening criteria
);

-- Types of safety/operational alerts
CREATE TYPE alert_type AS ENUM ('safety', 'non_response', 'lab_threshold');

-- Alert resolution status
CREATE TYPE alert_status AS ENUM ('open', 'acknowledged', 'resolved');

-- Communication channel types
CREATE TYPE message_channel AS ENUM ('email', 'sms');

-- Message delivery status
CREATE TYPE message_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'bounced');

-- Types of messages sent to participants
CREATE TYPE message_type AS ENUM ('reminder', 'milestone', 're_engagement');

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles: Extended user data (linked to Supabase auth.users)
-- -----------------------------------------------------------------------------
-- This table extends Supabase's built-in auth.users with application-specific
-- fields. The id matches auth.users.id for easy joins.
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role platform_role NOT NULL DEFAULT 'participant',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Extended user profiles linked to Supabase auth.users';
COMMENT ON COLUMN profiles.role IS 'User role: sponsor (creates studies), participant (joins studies), admin (platform admin)';
COMMENT ON COLUMN profiles.phone IS 'Phone number for SMS notifications';

-- -----------------------------------------------------------------------------
-- studies: Study definitions created by sponsors
-- -----------------------------------------------------------------------------
-- Contains the full study configuration including AI-generated protocol,
-- consent documents, and message templates.
CREATE TABLE studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  intervention TEXT NOT NULL,
  status study_status NOT NULL DEFAULT 'draft',
  protocol JSONB,                    -- Full protocol specification (see DATA_MODEL.md)
  consent_document TEXT,             -- Generated consent (markdown)
  comprehension_questions JSONB,     -- Questions with correct answers for consent
  message_templates JSONB,           -- Generated reminder/milestone templates
  config JSONB,                      -- Study configuration (duration, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE studies IS 'Study definitions created by sponsors via AI agents';
COMMENT ON COLUMN studies.intervention IS 'The intervention being studied (e.g., TRT, GLP-1)';
COMMENT ON COLUMN studies.protocol IS 'Full protocol JSON: population, endpoints, instruments, schedule, safety thresholds';
COMMENT ON COLUMN studies.consent_document IS 'AI-generated informed consent document in markdown';
COMMENT ON COLUMN studies.comprehension_questions IS 'Questions to verify participant understands consent';
COMMENT ON COLUMN studies.message_templates IS 'Templates for reminders, milestones, re-engagement messages';

-- -----------------------------------------------------------------------------
-- participants: Enrollment records linking users to studies
-- -----------------------------------------------------------------------------
-- Tracks a user's participation in a specific study, including their
-- current status and progress through the study timeline.
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status participant_status NOT NULL DEFAULT 'invited',
  enrolled_at TIMESTAMPTZ,           -- When enrollment completed
  current_week INTEGER DEFAULT 0,    -- Current study week (for demo time compression)
  screening_responses JSONB,         -- I/E screening answers
  metadata JSONB,                    -- Additional participant data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(study_id, user_id)          -- One enrollment per user per study
);

COMMENT ON TABLE participants IS 'Tracks user participation in studies';
COMMENT ON COLUMN participants.current_week IS 'Current study week - can be advanced for demo purposes';
COMMENT ON COLUMN participants.screening_responses IS 'Answers to inclusion/exclusion screening questions';

-- -----------------------------------------------------------------------------
-- consents: Signed consent records
-- -----------------------------------------------------------------------------
-- Immutable audit trail of informed consent signatures.
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  document_version TEXT NOT NULL,    -- Version of consent document signed
  document_hash TEXT NOT NULL,       -- SHA256 hash of document content
  signature_name TEXT NOT NULL,      -- Typed signature
  signature_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,                   -- IP address at signing
  user_agent TEXT,                   -- Browser/device at signing
  comprehension_results JSONB,       -- Answers to comprehension questions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE consents IS 'Immutable record of signed informed consent documents';
COMMENT ON COLUMN consents.document_hash IS 'SHA256 hash to verify document integrity';
COMMENT ON COLUMN consents.comprehension_results IS 'Participant answers to consent comprehension questions';

-- -----------------------------------------------------------------------------
-- submissions: PRO survey submissions
-- -----------------------------------------------------------------------------
-- Stores all Patient-Reported Outcome questionnaire responses.
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  timepoint TEXT NOT NULL,           -- e.g., 'baseline', 'week_2', 'week_4'
  instrument TEXT NOT NULL,          -- e.g., 'qADAM', 'IIEF-5', 'PHQ-2'
  responses JSONB NOT NULL,          -- Question-by-question responses
  scores JSONB,                      -- Calculated scores (total, subscales)
  duration_seconds INTEGER,          -- Time to complete survey
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE submissions IS 'PRO (Patient-Reported Outcome) survey submissions';
COMMENT ON COLUMN submissions.timepoint IS 'Study timepoint: baseline, week_2, week_4, etc.';
COMMENT ON COLUMN submissions.instrument IS 'PRO instrument name: qADAM, IIEF-5, PHQ-2, etc.';
COMMENT ON COLUMN submissions.responses IS 'JSON object with question IDs and selected values/labels';
COMMENT ON COLUMN submissions.scores IS 'Calculated total and subscale scores';

-- -----------------------------------------------------------------------------
-- lab_results: Lab data from external systems
-- -----------------------------------------------------------------------------
-- Lab results received via webhook (simulated in demo mode).
CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  timepoint TEXT NOT NULL,           -- e.g., 'baseline', 'week_6'
  marker TEXT NOT NULL,              -- e.g., 'testosterone', 'hematocrit', 'psa'
  value NUMERIC NOT NULL,            -- Lab value
  unit TEXT NOT NULL,                -- e.g., 'ng/dL', '%'
  reference_range TEXT,              -- e.g., '300-1000'
  abnormal_flag TEXT,                -- 'H' (high), 'L' (low), or null
  collection_date DATE,              -- When blood was drawn
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE lab_results IS 'Lab results from external systems (simulated via webhook in demo)';
COMMENT ON COLUMN lab_results.marker IS 'Lab marker name: testosterone, hematocrit, PSA, etc.';
COMMENT ON COLUMN lab_results.abnormal_flag IS 'H for high, L for low, null for normal';

-- -----------------------------------------------------------------------------
-- alerts: Safety and operational alerts
-- -----------------------------------------------------------------------------
-- Triggered when safety thresholds are exceeded or participants need attention.
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  type alert_type NOT NULL,
  trigger_source TEXT NOT NULL,      -- What triggered (e.g., 'PHQ-2', 'hematocrit')
  trigger_value TEXT,                -- The value that triggered
  threshold TEXT,                    -- The threshold that was exceeded
  message TEXT NOT NULL,             -- Alert description
  status alert_status NOT NULL DEFAULT 'open',
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE alerts IS 'Safety and operational alerts requiring attention';
COMMENT ON COLUMN alerts.trigger_source IS 'The PRO instrument or lab marker that triggered the alert';
COMMENT ON COLUMN alerts.type IS 'safety (immediate concern), non_response (missed surveys), lab_threshold (abnormal labs)';

-- -----------------------------------------------------------------------------
-- messages: Sent messages log
-- -----------------------------------------------------------------------------
-- Audit trail of all messages sent to participants.
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  type message_type NOT NULL,
  channel message_channel NOT NULL,
  template_id TEXT,                  -- Which template was used
  subject TEXT,                      -- Email subject (if email)
  body TEXT NOT NULL,                -- Message content
  status message_status NOT NULL DEFAULT 'queued',
  external_id TEXT,                  -- ID from Resend/Twilio
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE messages IS 'Log of all messages sent to participants';
COMMENT ON COLUMN messages.type IS 'reminder (survey due), milestone (achievement), re_engagement (missed activity)';
COMMENT ON COLUMN messages.external_id IS 'Message ID from email/SMS provider for tracking';

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Fast lookup of studies by sponsor
CREATE INDEX idx_studies_sponsor ON studies(sponsor_id);

-- Fast lookup of participants by study
CREATE INDEX idx_participants_study ON participants(study_id);

-- Fast lookup of participants by user
CREATE INDEX idx_participants_user ON participants(user_id);

-- Fast lookup of submissions by participant
CREATE INDEX idx_submissions_participant ON submissions(participant_id);

-- Fast lookup of submissions by participant and timepoint
CREATE INDEX idx_submissions_timepoint ON submissions(participant_id, timepoint);

-- Fast lookup of lab results by participant
CREATE INDEX idx_lab_results_participant ON lab_results(participant_id);

-- Fast lookup of open alerts
CREATE INDEX idx_alerts_open ON alerts(status) WHERE status = 'open';

-- Fast lookup of alerts by participant
CREATE INDEX idx_alerts_participant ON alerts(participant_id);

-- Fast lookup of messages by participant
CREATE INDEX idx_messages_participant ON messages(participant_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- profiles policies
-- -----------------------------------------------------------------------------

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Allow insert during signup (handled by trigger, but needed for completeness)
CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- studies policies
-- -----------------------------------------------------------------------------

-- Sponsors can read their own studies
CREATE POLICY "Sponsors can read own studies" ON studies
  FOR SELECT USING (sponsor_id = auth.uid());

-- Sponsors can create studies
CREATE POLICY "Sponsors can create studies" ON studies
  FOR INSERT WITH CHECK (sponsor_id = auth.uid());

-- Sponsors can update their own studies
CREATE POLICY "Sponsors can update own studies" ON studies
  FOR UPDATE USING (sponsor_id = auth.uid());

-- Participants can read studies they're enrolled in
CREATE POLICY "Participants can read enrolled studies" ON studies
  FOR SELECT USING (
    id IN (SELECT study_id FROM participants WHERE user_id = auth.uid())
  );

-- -----------------------------------------------------------------------------
-- participants policies
-- -----------------------------------------------------------------------------

-- Users can read their own participant records
CREATE POLICY "Users can read own participation" ON participants
  FOR SELECT USING (user_id = auth.uid());

-- Sponsors can read participants in their studies
CREATE POLICY "Sponsors can read study participants" ON participants
  FOR SELECT USING (
    study_id IN (SELECT id FROM studies WHERE sponsor_id = auth.uid())
  );

-- Users can insert their own participant record (enrollment)
CREATE POLICY "Users can enroll in studies" ON participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own participant record
CREATE POLICY "Users can update own participation" ON participants
  FOR UPDATE USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- consents policies
-- -----------------------------------------------------------------------------

-- Users can read their own consents
CREATE POLICY "Users can read own consents" ON consents
  FOR SELECT USING (
    participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())
  );

-- Users can insert their own consent
CREATE POLICY "Users can sign consent" ON consents
  FOR INSERT WITH CHECK (
    participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())
  );

-- Sponsors can read consents for their studies
CREATE POLICY "Sponsors can read study consents" ON consents
  FOR SELECT USING (
    participant_id IN (
      SELECT p.id FROM participants p
      JOIN studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- submissions policies
-- -----------------------------------------------------------------------------

-- Participants can read their own submissions
CREATE POLICY "Participants can read own submissions" ON submissions
  FOR SELECT USING (
    participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())
  );

-- Participants can insert their own submissions
CREATE POLICY "Participants can submit PROs" ON submissions
  FOR INSERT WITH CHECK (
    participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())
  );

-- Sponsors can read submissions for their studies
CREATE POLICY "Sponsors can read study submissions" ON submissions
  FOR SELECT USING (
    participant_id IN (
      SELECT p.id FROM participants p
      JOIN studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- lab_results policies
-- -----------------------------------------------------------------------------

-- Participants can read their own lab results
CREATE POLICY "Participants can read own labs" ON lab_results
  FOR SELECT USING (
    participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())
  );

-- Sponsors can read lab results for their studies
CREATE POLICY "Sponsors can read study labs" ON lab_results
  FOR SELECT USING (
    participant_id IN (
      SELECT p.id FROM participants p
      JOIN studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- alerts policies
-- -----------------------------------------------------------------------------

-- Sponsors can read alerts for their studies
CREATE POLICY "Sponsors can read study alerts" ON alerts
  FOR SELECT USING (
    participant_id IN (
      SELECT p.id FROM participants p
      JOIN studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

-- Sponsors can update alerts for their studies
CREATE POLICY "Sponsors can update study alerts" ON alerts
  FOR UPDATE USING (
    participant_id IN (
      SELECT p.id FROM participants p
      JOIN studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- messages policies
-- -----------------------------------------------------------------------------

-- Participants can read their own messages
CREATE POLICY "Participants can read own messages" ON messages
  FOR SELECT USING (
    participant_id IN (SELECT id FROM participants WHERE user_id = auth.uid())
  );

-- Sponsors can read messages for their studies
CREATE POLICY "Sponsors can read study messages" ON messages
  FOR SELECT USING (
    participant_id IN (
      SELECT p.id FROM participants p
      JOIN studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_studies_updated_at
  BEFORE UPDATE ON studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO study_platform.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'participant');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION study_platform.handle_new_user();

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================
-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA study_platform TO authenticated;
GRANT USAGE ON SCHEMA study_platform TO anon;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA study_platform TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA study_platform TO anon;

-- Grant sequence permissions (for auto-generated IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA study_platform TO authenticated;
