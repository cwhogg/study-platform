/**
 * Study Domain Logic
 *
 * Pure functions for study-related operations that are independent of UI.
 * All exports are client-safe (no server-only dependencies).
 */

// Consent
export {
  generateConsentSections,
  generateConsentDocument,
  type ConsentSection,
  type ConsentDocument,
} from './consent'

// Screening
export {
  inclusionToQuestion,
  exclusionToQuestion,
  generateParticipationQuestion,
  generateDobQuestion,
  getFallbackQuestions,
  buildScreeningQuestions,
  calculateAge,
  checkEligibility,
  type ScreeningQuestion,
  type InclusionCriterion,
  type ExclusionCriterion,
  type Protocol as ScreeningProtocol,
} from './screening'

// Instruments
export {
  isValidInstrument,
  getBaselineInstruments,
  getTimepointInstruments,
  groupAnswersByInstrument,
  FALLBACK_INSTRUMENTS,
  type Option,
  type Question,
  type Instrument,
  type ScheduleTimepoint as InstrumentScheduleTimepoint,
  type Protocol as InstrumentProtocol,
} from './instruments'

// Schedule
export {
  generateDefaultSchedule,
  type ScheduleTimepoint,
} from './schedule'
