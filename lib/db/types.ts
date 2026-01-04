// =============================================================================
// Database Types for Study Platform
// =============================================================================
// Generated from supabase/schema.sql
// All tables are in the 'study_platform' schema
// =============================================================================

// =============================================================================
// ENUMS
// =============================================================================

export type PlatformRole = 'sponsor' | 'participant' | 'admin'

export type StudyStatus = 'draft' | 'active' | 'paused' | 'completed'

export type ParticipantStatus =
  | 'invited'
  | 'registered'
  | 'consented'
  | 'screening'
  | 'enrolled'
  | 'active'
  | 'completed'
  | 'withdrawn'
  | 'ineligible'

export type AlertType = 'safety' | 'non_response' | 'lab_threshold'

export type AlertStatus = 'open' | 'acknowledged' | 'resolved'

export type MessageChannel = 'email' | 'sms'

export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced'

export type MessageType = 'reminder' | 'milestone' | 're_engagement'

// =============================================================================
// JSON TYPES (for JSONB columns)
// =============================================================================

export interface ProtocolEndpoint {
  name: string
  timepoint?: string
}

export interface ProtocolCriterion {
  criterion: string
  rationale: string
  assessmentMethod: string
}

export interface StudyProtocol {
  population?: string
  treatment_stage?: string
  primary_endpoint?: ProtocolEndpoint
  secondary_endpoints?: string[]
  duration_weeks?: number
  inclusion_criteria?: ProtocolCriterion[]
  exclusion_criteria?: ProtocolCriterion[]
  instruments?: Record<string, unknown>
  schedule?: Record<string, unknown>
  safety_thresholds?: Record<string, unknown>
}

export interface ComprehensionQuestion {
  id: number
  question: string
  correctAnswer: string
  options?: string[]
}

export interface MessageTemplate {
  id: string
  type: MessageType
  subject?: string
  body: string
  variables?: string[]
}

export interface StudyConfig {
  duration_weeks?: number
  target_enrollment?: number
  [key: string]: unknown
}

export interface ScreeningResponse {
  questionId: string
  answer: string | boolean | number
}

export interface ParticipantMetadata {
  [key: string]: unknown
}

export interface ProResponse {
  value: number
  label?: string
}

export interface ProResponses {
  [questionId: string]: ProResponse
}

export interface ProScores {
  total?: number
  subscales?: Record<string, number>
}

export interface ComprehensionResult {
  questionId: number
  answer: string
  correct: boolean
}

// =============================================================================
// TABLE TYPES
// =============================================================================

// -----------------------------------------------------------------------------
// profiles
// -----------------------------------------------------------------------------

export interface Profile {
  id: string
  email: string
  role: PlatformRole
  first_name: string | null
  last_name: string | null
  phone: string | null
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface ProfileInsert {
  id: string
  email: string
  role?: PlatformRole
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  email_verified?: boolean
}

export interface ProfileUpdate {
  email?: string
  role?: PlatformRole
  first_name?: string | null
  last_name?: string | null
  phone?: string | null
  email_verified?: boolean
}

// -----------------------------------------------------------------------------
// studies
// -----------------------------------------------------------------------------

export interface Study {
  id: string
  sponsor_id: string
  name: string
  intervention: string
  status: StudyStatus
  protocol: StudyProtocol | null
  consent_document: string | null
  comprehension_questions: ComprehensionQuestion[] | null
  message_templates: MessageTemplate[] | null
  config: StudyConfig | null
  created_at: string
  updated_at: string
}

export interface StudyInsert {
  id?: string
  sponsor_id: string
  name: string
  intervention: string
  status?: StudyStatus
  protocol?: StudyProtocol | null
  consent_document?: string | null
  comprehension_questions?: ComprehensionQuestion[] | null
  message_templates?: MessageTemplate[] | null
  config?: StudyConfig | null
}

export interface StudyUpdate {
  name?: string
  intervention?: string
  status?: StudyStatus
  protocol?: StudyProtocol | null
  consent_document?: string | null
  comprehension_questions?: ComprehensionQuestion[] | null
  message_templates?: MessageTemplate[] | null
  config?: StudyConfig | null
}

// -----------------------------------------------------------------------------
// participants
// -----------------------------------------------------------------------------

export interface Participant {
  id: string
  study_id: string
  user_id: string
  status: ParticipantStatus
  enrolled_at: string | null
  current_week: number
  screening_responses: ScreeningResponse[] | null
  metadata: ParticipantMetadata | null
  created_at: string
  updated_at: string
}

export interface ParticipantInsert {
  id?: string
  study_id: string
  user_id: string
  status?: ParticipantStatus
  enrolled_at?: string | null
  current_week?: number
  screening_responses?: ScreeningResponse[] | null
  metadata?: ParticipantMetadata | null
}

export interface ParticipantUpdate {
  status?: ParticipantStatus
  enrolled_at?: string | null
  current_week?: number
  screening_responses?: ScreeningResponse[] | null
  metadata?: ParticipantMetadata | null
}

// -----------------------------------------------------------------------------
// consents
// -----------------------------------------------------------------------------

export interface Consent {
  id: string
  participant_id: string
  document_version: string
  document_hash: string
  signature_name: string
  signature_timestamp: string
  ip_address: string | null
  user_agent: string | null
  comprehension_results: ComprehensionResult[] | null
  created_at: string
}

export interface ConsentInsert {
  id?: string
  participant_id: string
  document_version: string
  document_hash: string
  signature_name: string
  signature_timestamp?: string
  ip_address?: string | null
  user_agent?: string | null
  comprehension_results?: ComprehensionResult[] | null
}

// Consents are immutable, no update type

// -----------------------------------------------------------------------------
// submissions
// -----------------------------------------------------------------------------

export interface Submission {
  id: string
  participant_id: string
  timepoint: string
  instrument: string
  responses: ProResponses
  scores: ProScores | null
  duration_seconds: number | null
  submitted_at: string
  created_at: string
}

export interface SubmissionInsert {
  id?: string
  participant_id: string
  timepoint: string
  instrument: string
  responses: ProResponses
  scores?: ProScores | null
  duration_seconds?: number | null
  submitted_at?: string
}

// Submissions are immutable, no update type

// -----------------------------------------------------------------------------
// lab_results
// -----------------------------------------------------------------------------

export interface LabResult {
  id: string
  participant_id: string
  timepoint: string
  marker: string
  value: number
  unit: string
  reference_range: string | null
  abnormal_flag: string | null
  collection_date: string | null
  received_at: string
  created_at: string
}

export interface LabResultInsert {
  id?: string
  participant_id: string
  timepoint: string
  marker: string
  value: number
  unit: string
  reference_range?: string | null
  abnormal_flag?: string | null
  collection_date?: string | null
  received_at?: string
}

// Lab results are immutable, no update type

// -----------------------------------------------------------------------------
// alerts
// -----------------------------------------------------------------------------

export interface Alert {
  id: string
  participant_id: string
  type: AlertType
  trigger_source: string
  trigger_value: string | null
  threshold: string | null
  message: string
  status: AlertStatus
  acknowledged_by: string | null
  acknowledged_at: string | null
  resolution_notes: string | null
  resolved_at: string | null
  created_at: string
}

export interface AlertInsert {
  id?: string
  participant_id: string
  type: AlertType
  trigger_source: string
  trigger_value?: string | null
  threshold?: string | null
  message: string
  status?: AlertStatus
}

export interface AlertUpdate {
  status?: AlertStatus
  acknowledged_by?: string | null
  acknowledged_at?: string | null
  resolution_notes?: string | null
  resolved_at?: string | null
}

// -----------------------------------------------------------------------------
// messages
// -----------------------------------------------------------------------------

export interface Message {
  id: string
  participant_id: string
  type: MessageType
  channel: MessageChannel
  template_id: string | null
  subject: string | null
  body: string
  status: MessageStatus
  external_id: string | null
  sent_at: string | null
  delivered_at: string | null
  created_at: string
}

export interface MessageInsert {
  id?: string
  participant_id: string
  type: MessageType
  channel: MessageChannel
  template_id?: string | null
  subject?: string | null
  body: string
  status?: MessageStatus
  external_id?: string | null
  sent_at?: string | null
  delivered_at?: string | null
}

export interface MessageUpdate {
  status?: MessageStatus
  external_id?: string | null
  sent_at?: string | null
  delivered_at?: string | null
}

// =============================================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// =============================================================================

export interface Database {
  study_platform: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      studies: {
        Row: Study
        Insert: StudyInsert
        Update: StudyUpdate
      }
      participants: {
        Row: Participant
        Insert: ParticipantInsert
        Update: ParticipantUpdate
      }
      consents: {
        Row: Consent
        Insert: ConsentInsert
        Update: never
      }
      submissions: {
        Row: Submission
        Insert: SubmissionInsert
        Update: never
      }
      lab_results: {
        Row: LabResult
        Insert: LabResultInsert
        Update: never
      }
      alerts: {
        Row: Alert
        Insert: AlertInsert
        Update: AlertUpdate
      }
      messages: {
        Row: Message
        Insert: MessageInsert
        Update: MessageUpdate
      }
    }
    Enums: {
      platform_role: PlatformRole
      study_status: StudyStatus
      participant_status: ParticipantStatus
      alert_type: AlertType
      alert_status: AlertStatus
      message_channel: MessageChannel
      message_status: MessageStatus
      message_type: MessageType
    }
  }
}
