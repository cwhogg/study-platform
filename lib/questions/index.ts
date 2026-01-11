/**
 * Question Type System
 *
 * Exports all question types, validation, and scoring utilities.
 */

// Types
export * from './types'

// Validation
export {
  validateResponse,
  validateAllResponses,
  isEmptyResponse,
  type ValidationResult,
} from './validation'

// Scoring
export {
  calculateScore,
  getNumericScore,
  normalizeScore,
  getDefaultScoringMethod,
  type ScoringConfig,
  type ScoreResult,
  // Pre-configured scoring configs
  PHQ9_CONFIG,
  PHQ2_CONFIG,
  GAD7_CONFIG,
  IIEF5_CONFIG,
  PAIN_SCALE_CONFIG,
} from './scoring'
