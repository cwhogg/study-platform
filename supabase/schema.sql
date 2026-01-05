-- =============================================================================
-- Observational Study Platform - Database Schema
-- =============================================================================
-- This schema defines all tables for the study platform.
-- Tables are created in the 'public' schema with 'sp_' prefix.
-- Run this in Supabase SQL Editor to set up the database.
-- =============================================================================

-- =============================================================================
-- CLEANUP (drop existing objects to make schema re-runnable)
-- =============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_sp_profiles_updated_at ON sp_profiles;
DROP TRIGGER IF EXISTS update_sp_studies_updated_at ON sp_studies;
DROP TRIGGER IF EXISTS update_sp_participants_updated_at ON sp_participants;

-- Drop functions
DROP FUNCTION IF EXISTS sp_handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS sp_update_updated_at() CASCADE;

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS sp_messages CASCADE;
DROP TABLE IF EXISTS sp_alerts CASCADE;
DROP TABLE IF EXISTS sp_lab_results CASCADE;
DROP TABLE IF EXISTS sp_submissions CASCADE;
DROP TABLE IF EXISTS sp_consents CASCADE;
DROP TABLE IF EXISTS sp_participants CASCADE;
DROP TABLE IF EXISTS sp_studies CASCADE;
DROP TABLE IF EXISTS sp_profiles CASCADE;

-- Drop types
DROP TYPE IF EXISTS sp_platform_role CASCADE;
DROP TYPE IF EXISTS sp_study_status CASCADE;
DROP TYPE IF EXISTS sp_participant_status CASCADE;
DROP TYPE IF EXISTS sp_alert_type CASCADE;
DROP TYPE IF EXISTS sp_alert_status CASCADE;
DROP TYPE IF EXISTS sp_message_channel CASCADE;
DROP TYPE IF EXISTS sp_message_status CASCADE;
DROP TYPE IF EXISTS sp_message_type CASCADE;

-- =============================================================================
-- ENUMS
-- =============================================================================

-- User roles in the platform
CREATE TYPE sp_platform_role AS ENUM ('sponsor', 'participant', 'admin');

-- Study lifecycle states
CREATE TYPE sp_study_status AS ENUM ('draft', 'active', 'paused', 'completed');

-- Participant journey through a study
CREATE TYPE sp_participant_status AS ENUM (
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
CREATE TYPE sp_alert_type AS ENUM ('safety', 'non_response', 'lab_threshold');

-- Alert resolution status
CREATE TYPE sp_alert_status AS ENUM ('open', 'acknowledged', 'resolved');

-- Communication channel types
CREATE TYPE sp_message_channel AS ENUM ('email', 'sms');

-- Message delivery status
CREATE TYPE sp_message_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'bounced');

-- Types of messages sent to participants
CREATE TYPE sp_message_type AS ENUM ('reminder', 'milestone', 're_engagement');

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- sp_profiles: Extended user data (linked to Supabase auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE sp_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role sp_platform_role NOT NULL DEFAULT 'participant',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sp_profiles IS 'Extended user profiles linked to Supabase auth.users';

-- -----------------------------------------------------------------------------
-- sp_studies: Study definitions created by sponsors
-- -----------------------------------------------------------------------------
CREATE TABLE sp_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sp_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  intervention TEXT NOT NULL,
  status sp_study_status NOT NULL DEFAULT 'draft',
  protocol JSONB,
  consent_document TEXT,
  consent_data JSONB,
  comprehension_questions JSONB,
  enrollment_copy JSONB,
  message_templates JSONB,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sp_studies IS 'Study definitions created by sponsors via AI agents';

-- -----------------------------------------------------------------------------
-- sp_participants: Enrollment records linking users to studies
-- -----------------------------------------------------------------------------
CREATE TABLE sp_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES sp_studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES sp_profiles(id) ON DELETE CASCADE,
  status sp_participant_status NOT NULL DEFAULT 'invited',
  enrolled_at TIMESTAMPTZ,
  current_week INTEGER DEFAULT 0,
  screening_responses JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(study_id, user_id)
);

COMMENT ON TABLE sp_participants IS 'Tracks user participation in studies';

-- -----------------------------------------------------------------------------
-- sp_consents: Signed consent records
-- -----------------------------------------------------------------------------
CREATE TABLE sp_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES sp_participants(id) ON DELETE CASCADE,
  document_version TEXT NOT NULL,
  document_hash TEXT NOT NULL,
  signature_name TEXT NOT NULL,
  signature_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  comprehension_results JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sp_consents IS 'Immutable record of signed informed consent documents';

-- -----------------------------------------------------------------------------
-- sp_submissions: PRO survey submissions
-- -----------------------------------------------------------------------------
CREATE TABLE sp_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES sp_participants(id) ON DELETE CASCADE,
  timepoint TEXT NOT NULL,
  instrument TEXT NOT NULL,
  responses JSONB NOT NULL,
  scores JSONB,
  duration_seconds INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sp_submissions IS 'PRO (Patient-Reported Outcome) survey submissions';

-- -----------------------------------------------------------------------------
-- sp_lab_results: Lab data from external systems
-- -----------------------------------------------------------------------------
CREATE TABLE sp_lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES sp_participants(id) ON DELETE CASCADE,
  timepoint TEXT NOT NULL,
  marker TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  reference_range TEXT,
  abnormal_flag TEXT,
  collection_date DATE,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sp_lab_results IS 'Lab results from external systems';

-- -----------------------------------------------------------------------------
-- sp_alerts: Safety and operational alerts
-- -----------------------------------------------------------------------------
CREATE TABLE sp_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES sp_participants(id) ON DELETE CASCADE,
  type sp_alert_type NOT NULL,
  trigger_source TEXT NOT NULL,
  trigger_value TEXT,
  threshold TEXT,
  message TEXT NOT NULL,
  status sp_alert_status NOT NULL DEFAULT 'open',
  acknowledged_by UUID REFERENCES sp_profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sp_alerts IS 'Safety and operational alerts requiring attention';

-- -----------------------------------------------------------------------------
-- sp_messages: Sent messages log
-- -----------------------------------------------------------------------------
CREATE TABLE sp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES sp_participants(id) ON DELETE CASCADE,
  type sp_message_type NOT NULL,
  channel sp_message_channel NOT NULL,
  template_id TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  status sp_message_status NOT NULL DEFAULT 'queued',
  external_id TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE sp_messages IS 'Log of all messages sent to participants';

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_sp_studies_sponsor ON sp_studies(sponsor_id);
CREATE INDEX idx_sp_participants_study ON sp_participants(study_id);
CREATE INDEX idx_sp_participants_user ON sp_participants(user_id);
CREATE INDEX idx_sp_submissions_participant ON sp_submissions(participant_id);
CREATE INDEX idx_sp_submissions_timepoint ON sp_submissions(participant_id, timepoint);
CREATE INDEX idx_sp_lab_results_participant ON sp_lab_results(participant_id);
CREATE INDEX idx_sp_alerts_open ON sp_alerts(status) WHERE status = 'open';
CREATE INDEX idx_sp_alerts_participant ON sp_alerts(participant_id);
CREATE INDEX idx_sp_messages_participant ON sp_messages(participant_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE sp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sp_messages ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- sp_profiles policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can read own profile" ON sp_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON sp_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Enable insert for authenticated users" ON sp_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- sp_studies policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Sponsors can read own studies" ON sp_studies
  FOR SELECT USING (sponsor_id = auth.uid());

CREATE POLICY "Sponsors can create studies" ON sp_studies
  FOR INSERT WITH CHECK (sponsor_id = auth.uid());

CREATE POLICY "Sponsors can update own studies" ON sp_studies
  FOR UPDATE USING (sponsor_id = auth.uid());

CREATE POLICY "Participants can read enrolled studies" ON sp_studies
  FOR SELECT USING (
    id IN (SELECT study_id FROM sp_participants WHERE user_id = auth.uid())
  );

-- Allow reading active studies for public join page
CREATE POLICY "Anyone can read active studies" ON sp_studies
  FOR SELECT USING (status = 'active');

-- -----------------------------------------------------------------------------
-- sp_participants policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can read own participation" ON sp_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Sponsors can read study participants" ON sp_participants
  FOR SELECT USING (
    study_id IN (SELECT id FROM sp_studies WHERE sponsor_id = auth.uid())
  );

CREATE POLICY "Users can enroll in studies" ON sp_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own participation" ON sp_participants
  FOR UPDATE USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- sp_consents policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Users can read own consents" ON sp_consents
  FOR SELECT USING (
    participant_id IN (SELECT id FROM sp_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can sign consent" ON sp_consents
  FOR INSERT WITH CHECK (
    participant_id IN (SELECT id FROM sp_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Sponsors can read study consents" ON sp_consents
  FOR SELECT USING (
    participant_id IN (
      SELECT p.id FROM sp_participants p
      JOIN sp_studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- sp_submissions policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Participants can read own submissions" ON sp_submissions
  FOR SELECT USING (
    participant_id IN (SELECT id FROM sp_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Participants can submit PROs" ON sp_submissions
  FOR INSERT WITH CHECK (
    participant_id IN (SELECT id FROM sp_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Sponsors can read study submissions" ON sp_submissions
  FOR SELECT USING (
    participant_id IN (
      SELECT p.id FROM sp_participants p
      JOIN sp_studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- sp_lab_results policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Participants can read own labs" ON sp_lab_results
  FOR SELECT USING (
    participant_id IN (SELECT id FROM sp_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Sponsors can read study labs" ON sp_lab_results
  FOR SELECT USING (
    participant_id IN (
      SELECT p.id FROM sp_participants p
      JOIN sp_studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- sp_alerts policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Sponsors can read study alerts" ON sp_alerts
  FOR SELECT USING (
    participant_id IN (
      SELECT p.id FROM sp_participants p
      JOIN sp_studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

CREATE POLICY "Sponsors can update study alerts" ON sp_alerts
  FOR UPDATE USING (
    participant_id IN (
      SELECT p.id FROM sp_participants p
      JOIN sp_studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- sp_messages policies
-- -----------------------------------------------------------------------------

CREATE POLICY "Participants can read own messages" ON sp_messages
  FOR SELECT USING (
    participant_id IN (SELECT id FROM sp_participants WHERE user_id = auth.uid())
  );

CREATE POLICY "Sponsors can read study messages" ON sp_messages
  FOR SELECT USING (
    participant_id IN (
      SELECT p.id FROM sp_participants p
      JOIN sp_studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION sp_update_updated_at()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_sp_profiles_updated_at
  BEFORE UPDATE ON sp_profiles
  FOR EACH ROW EXECUTE FUNCTION sp_update_updated_at();

CREATE TRIGGER update_sp_studies_updated_at
  BEFORE UPDATE ON sp_studies
  FOR EACH ROW EXECUTE FUNCTION sp_update_updated_at();

CREATE TRIGGER update_sp_participants_updated_at
  BEFORE UPDATE ON sp_participants
  FOR EACH ROW EXECUTE FUNCTION sp_update_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION sp_handle_new_user()
RETURNS TRIGGER AS $func$
BEGIN
  INSERT INTO sp_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'participant');
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sp_handle_new_user();
