/**
 * Agent Types
 *
 * TypeScript types for agent inputs/outputs, including PRO instrument schemas.
 */

// =============================================================================
// Instrument Types (PRO questionnaires)
// =============================================================================

export interface Option {
  value: number
  label: string
}

export interface Question {
  id: string                    // e.g., "q1", "q2"
  text: string                  // The exact question text
  type: 'single_choice' | 'numeric_scale' | 'text'
  options?: Option[]            // For single_choice
  scale?: {                     // For numeric_scale
    min: number
    max: number
    minLabel: string
    maxLabel: string
  }
  required: boolean
}

export interface ScoringConfig {
  method: 'sum' | 'average' | 'custom'
  range: { min: number; max: number }
  interpretation: 'higher_better' | 'lower_better'
  thresholds?: { value: number; label: string }[]
}

export interface AlertConfig {
  condition: string             // e.g., "total >= 3", "q9 > 0"
  type: 'trigger_instrument' | 'coordinator_alert' | 'urgent_alert' | 'crisis_resources'
  target?: string               // For trigger_instrument, which instrument ID
  urgency?: string              // e.g., "24hr", "4hr", "immediate"
  message?: string              // Alert message for coordinators
}

export interface TriggerConfig {
  instrumentId: string
  condition: string
}

export interface Instrument {
  id: string                    // e.g., "phq-2", "iief-5", "qadam"
  name: string                  // e.g., "PHQ-2 (Patient Health Questionnaire)"
  description: string           // Brief description of what it measures
  instructions: string          // Instructions shown to participant before questions
  estimatedMinutes: number      // Time to complete
  questions: Question[]
  scoring: ScoringConfig
  alerts?: AlertConfig[]
  triggeredBy?: TriggerConfig   // If this instrument is conditionally triggered
}

// =============================================================================
// Clinical Protocol Agent Types
// =============================================================================

// Call 1: Study Discovery
export interface DiscoveryInput {
  task: 'discover'
  intervention: string
}

export interface EndpointOption {
  name: string
  domain: string
  suggestedInstrument: string
  confidence: 'high' | 'moderate' | 'low'
  rationale: string
}

export interface PopulationOption {
  name: string
  description: string
}

export interface TreatmentStageOption {
  name: string
  description: string
}

// Risk Assessment Types
export interface RiskItem {
  risk: string
  severity: 'high' | 'moderate' | 'low'
  frequency?: string  // e.g., "common", "rare", "1 in 1000"
  mitigation?: string
}

export interface RiskAssessment {
  interventionCategory: 'pharmacological' | 'non_pharmacological'
  // For pharmacological interventions: FDA approval status
  fdaApprovalStatus?: {
    approved: boolean
    approvedForStudiedIndication: boolean  // Is it approved for the SPECIFIC condition being studied?
    indications?: string[]  // What it's FDA-approved for (may differ from studied use)
    studiedIndication?: string  // The condition/use being studied
    approvalYear?: number
  }
  regulatoryDisclaimer?: string  // Required for non-FDA-approved or off-label pharmacological interventions
  knownRisks: RiskItem[]
  contraindications?: string[]
  warnings?: string[]  // For FDA-approved: boxed warnings, key label warnings
  communityReportedRisks?: RiskItem[]  // For non-FDA pharmacological: from forums, Reddit, etc.
  overallRiskLevel: 'high' | 'moderate' | 'low' | 'minimal'
  riskSummary: string  // Plain language summary for participants
  dataSources: string[]  // Where the risk information came from
}

export interface DiscoveryOutput {
  intervention: string
  suggestedStudyName?: string  // AI-generated specific study name
  studyDescription?: string     // 1-2 sentence description of study purpose
  summary: string
  endpoints: EndpointOption[]
  populations: PopulationOption[]
  treatmentStages: TreatmentStageOption[]
  recommendedDuration: {
    weeks: number
    rationale: string
  }
  riskAssessment: RiskAssessment
  safetyConsiderations: string[]  // Kept for backward compatibility
  dataSources: string[]
}

// Call 2: Protocol Generation
export interface ProtocolGenerationInput {
  task: 'generate'
  intervention: string
  population: string
  treatmentStage: string
  primaryEndpoint: string
  secondaryEndpoints: string[]
  durationWeeks: number
}

export interface InclusionCriterion {
  criterion: string
  rationale: string
  assessmentMethod: string
}

export interface ExclusionCriterion {
  criterion: string
  rationale: string
  assessmentMethod: string
}

export interface ScheduleTimepoint {
  timepoint: string
  week: number
  instruments: string[]
  labs?: string[]
  windowDays?: number
}

export interface LabThreshold {
  marker: string
  threshold: string
  action: string
}

export interface ProAlert {
  instrument: string
  condition: string
  action: string
}

export interface SafetyMonitoring {
  labThresholds: LabThreshold[]
  proAlerts: ProAlert[]
}

export interface ProtocolGenerationOutput {
  summary: string
  inclusionCriteria: InclusionCriterion[]
  exclusionCriteria: ExclusionCriterion[]
  instruments: Instrument[]
  schedule: ScheduleTimepoint[]
  safetyMonitoring: SafetyMonitoring
}

// =============================================================================
// Consent & Compliance Agent Types
// =============================================================================

export interface ConsentGenerationInput {
  protocol: ProtocolGenerationOutput
  studyName: string
  intervention: string
  durationWeeks: number
  riskAssessment?: RiskAssessment  // From discovery phase
}

// Consent document section (displayed one at a time on mobile)
export interface ConsentSection {
  id: string
  title: string
  content: string  // Markdown content
}

// Consent document structure
export interface ConsentDocument {
  title: string
  version: string
  sections: ConsentSection[]
}

// Comprehension question with multiple choice options
export interface ComprehensionQuestionOption {
  text: string
  correct: boolean
}

export interface ComprehensionQuestion {
  id: string
  question: string
  options: ComprehensionQuestionOption[]
  explanation: string  // Shown if answered incorrectly
}

// Summary card shown before full consent
export interface ConsentSummary {
  title: string
  bullets: string[]
}

// Full consent generation output
export interface ConsentGenerationOutput {
  document: ConsentDocument
  comprehensionQuestions: ComprehensionQuestion[]
  summary: ConsentSummary
}

// =============================================================================
// Enrollment Agent Types
// =============================================================================

export interface EnrollmentCopyInput {
  studyName: string
  intervention: string
  sponsor: string
  durationWeeks: number
  proceduresSummary: string
  estimatedTimePerAssessment: string
  primaryBenefit: string
}

// Welcome screen copy
export interface WelcomeCopy {
  headline: string
  subheadline: string
  bullets: string[]
  buttonText: string
  footerNote: string
}

// Registration screen copy
export interface RegistrationCopy {
  headline: string
  emailLabel: string
  emailHelp: string
  passwordLabel: string
  passwordHelp: string
  confirmPasswordLabel: string
  buttonText: string
  errors: {
    emailInvalid: string
    passwordTooShort: string
    passwordMismatch: string
  }
}

// Email verification screen copy
export interface VerificationCopy {
  headline: string
  body: string
  inputLabel: string
  buttonText: string
  resendText: string
  errors: {
    invalidCode: string
    expiredCode: string
  }
}

// Pre-consent overview section
export interface PreConsentSection {
  icon: string
  title: string
  body: string
}

// Pre-consent screen copy
export interface PreConsentCopy {
  headline: string
  sections: PreConsentSection[]
  buttonText: string
}

// Consent guidance copy
export interface ConsentGuidanceCopy {
  sectionIntros: {
    introduction: string
    procedures: string
    risks: string
    benefits: string
    confidentiality: string
    voluntary: string
  }
  encouragement: {
    halfway: string
    almostDone: string
  }
}

// Comprehension quiz copy
export interface ComprehensionQuizCopy {
  headline: string
  intro: string
  correctFeedback: string
  incorrectFeedback: string
  continueButton: string
}

// Signature screen copy
export interface SignatureCopy {
  headline: string
  instruction: string
  inputLabel: string
  checkboxLabel: string
  dateLabel: string
  buttonText: string
  errors: {
    nameRequired: string
    checkboxRequired: string
  }
}

// Screening screen copy
export interface ScreeningCopy {
  headline: string
  intro: string
  buttonText: string
}

// Eligible screen copy
export interface EligibleCopy {
  headline: string
  body: string
  subtext: string
  buttonText: string
  estimatedTime: string
}

// Ineligible screen copy
export interface IneligibleCopy {
  headline: string
  body: string
  reassurance: string
  nextSteps: string
  buttonText: string
}

// Enrollment complete screen copy
export interface EnrollmentCompleteNextStep {
  icon: string
  title: string
  body: string
}

export interface EnrollmentCompleteCopy {
  headline: string
  celebration: string
  body: string
  nextSteps: {
    headline: string
    items: EnrollmentCompleteNextStep[]
  }
  buttonText: string
}

// Full enrollment copy output
export interface EnrollmentCopyOutput {
  welcome: WelcomeCopy
  registration: RegistrationCopy
  verification: VerificationCopy
  preConsent: PreConsentCopy
  consentGuidance: ConsentGuidanceCopy
  comprehensionQuiz: ComprehensionQuizCopy
  signature: SignatureCopy
  screening: ScreeningCopy
  eligible: EligibleCopy
  ineligible: IneligibleCopy
  enrollmentComplete: EnrollmentCompleteCopy
}

// =============================================================================
// Patient Communication Agent Types
// =============================================================================

export interface MessageTemplateInput {
  studyName: string
  sponsor: string
  schedule: { timepoint: string; week: number }[]
  durationWeeks: number
  assessmentMinutes: number
}

// Email template structure
export interface EmailTemplate {
  subject: string
  body: string
}

// SMS and Email combined message
export interface MessageVariant {
  sms: string
  email: EmailTemplate
}

// Assessment reminder levels
export interface AssessmentReminders {
  initial: MessageVariant
  followUp: MessageVariant
  final: MessageVariant
}

// Lab reminder levels
export interface LabReminders {
  initial: MessageVariant
  followUp: MessageVariant
}

// All reminder templates
export interface ReminderTemplates {
  assessment: AssessmentReminders
  lab: LabReminders
}

// Milestone message templates
export interface MilestoneTemplates {
  enrolled: MessageVariant
  week4: MessageVariant
  halfway: MessageVariant
  finalReminder: MessageVariant
  complete: MessageVariant
}

// Re-engagement templates
export interface ReEngagementTemplates {
  missedOne: MessageVariant
  missedMultiple: MessageVariant
  atRisk: MessageVariant
}

// Full message templates output
export interface MessageTemplatesOutput {
  reminders: ReminderTemplates
  milestones: MilestoneTemplates
  reEngagement: ReEngagementTemplates
}

// =============================================================================
// Safety Agent Types
// =============================================================================

export interface SafetyGenerationInput {
  intervention: string
  interventionCategory: 'pharmacological' | 'non_pharmacological'
  instruments: Instrument[]
  riskAssessment?: RiskAssessment
  labMarkers?: string[]
}

export interface SafetyProAlert {
  instrumentId: string
  condition: string  // e.g., "total >= 3", "q9 > 0"
  type: 'trigger_instrument' | 'coordinator_alert' | 'urgent_alert' | 'crisis_resources'
  target?: string | null  // For trigger_instrument, which instrument ID
  urgency?: string | null  // e.g., "1hr", "4hr", "24hr"
  message: string
}

export interface SafetyLabThreshold {
  marker: string
  operator: '>' | '<' | '>=' | '<=' | '==' | '!='
  value: number
  unit: string
  type: 'coordinator_alert' | 'urgent_alert'
  urgency: string
  action: string
}

export interface CrisisProtocol {
  triggers: string[]
  resources: {
    title: string
    hotlines: Array<{ name: string; number?: string; value?: string }>
    followUp: string
  }
}

export interface AdverseEventMonitoring {
  enabled: boolean
  severityThresholds: {
    coordinatorAlert: number
    urgentAlert: number
  }
}

export interface SafetyGenerationOutput {
  proAlerts: SafetyProAlert[]
  labThresholds: SafetyLabThreshold[]
  crisisProtocol: CrisisProtocol
  adverseEventMonitoring: AdverseEventMonitoring
}

// =============================================================================
// Agent Call Types
// =============================================================================

export type AgentName = 'clinical-protocol' | 'consent-compliance' | 'enrollment' | 'patient-communication' | 'safety'

export type AgentModel = 'gpt-4o' | 'o1-mini'

export interface AgentCallOptions {
  model?: AgentModel
  temperature?: number
}

export interface AgentDebugInfo {
  agentName: string
  model: string
  systemPromptLength: number
  userMessage: string  // The full input JSON
  rawResponse?: string  // The raw response from OpenAI
  elapsedMs?: number
}

export interface AgentResult<T> {
  success: boolean
  data?: T
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  debug?: AgentDebugInfo  // Prompt details for client-side logging
}
