/**
 * Question Scoring Logic
 *
 * Handles score calculation for PRO instruments.
 * Only certain question types produce numeric scores.
 */

import type { Question, QuestionResponseValue, SCORABLE_TYPES } from './types'
import { isScorable } from './types'

// ============================================
// Scoring Configuration
// ============================================

export interface ScoringConfig {
  method: 'sum' | 'average' | 'weighted_sum' | 'none'

  // For weighted scoring
  weights?: Record<string, number>

  // Interpretation
  interpretation?: 'higher_better' | 'lower_better' | 'neutral'

  // Score range (for display/normalization)
  range?: {
    min: number
    max: number
  }

  // Severity thresholds (e.g., PHQ-9 cutoffs)
  thresholds?: Array<{
    value: number
    label: string
    severity?: 'none' | 'mild' | 'moderate' | 'moderately_severe' | 'severe'
  }>

  // Questions to exclude from scoring
  excludeQuestions?: string[]

  // Subscale definitions
  subscales?: Record<string, {
    questionIds: string[]
    method: 'sum' | 'average'
    label?: string
  }>
}

// ============================================
// Score Extraction
// ============================================

/**
 * Extracts a numeric score from a response value based on question type.
 * Returns null for non-scorable question types.
 */
export function getNumericScore(question: Question, value: unknown): number | null {
  if (!isScorable(question)) {
    return null
  }

  switch (question.type) {
    case 'single_choice':
      return typeof value === 'number' ? value : null

    case 'numeric_scale':
      return typeof value === 'number' ? value : null

    case 'likert_scale':
      return typeof value === 'number' ? value : null

    case 'number_input':
      return typeof value === 'number' ? value : null

    case 'yes_no':
      // 1 = yes, 0 = no
      return value === 1 || value === 0 ? (value as number) : null

    case 'visual_analog_scale':
      return typeof value === 'number' ? value : null

    default:
      return null
  }
}

// ============================================
// Score Calculation
// ============================================

export interface ScoreResult {
  total: number
  individual: Record<string, number>
  subscales?: Record<string, number>
  answeredCount: number
  totalQuestions: number
  interpretation?: string
  severity?: string
}

/**
 * Calculates scores for an instrument/question set
 */
export function calculateScore(
  questions: Question[],
  responses: Record<string, QuestionResponseValue>,
  config?: ScoringConfig
): ScoreResult {
  const individual: Record<string, number> = {}
  const scores: number[] = []
  let weightedSum = 0

  // Calculate individual question scores
  for (const question of questions) {
    // Skip excluded questions
    if (config?.excludeQuestions?.includes(question.id)) {
      continue
    }

    const value = responses[question.id]
    const score = getNumericScore(question, value)

    if (score !== null) {
      individual[question.id] = score
      scores.push(score)

      if (config?.method === 'weighted_sum' && config.weights) {
        const weight = config.weights[question.id] ?? 1
        weightedSum += score * weight
      }
    }
  }

  // Calculate total based on method
  let total: number
  const method = config?.method ?? 'sum'

  switch (method) {
    case 'sum':
      total = scores.reduce((sum, s) => sum + s, 0)
      break
    case 'average':
      total = scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0
      break
    case 'weighted_sum':
      total = weightedSum
      break
    case 'none':
      total = 0
      break
    default:
      total = scores.reduce((sum, s) => sum + s, 0)
  }

  // Calculate subscales
  let subscales: Record<string, number> | undefined
  if (config?.subscales) {
    subscales = {}
    for (const [name, subscale] of Object.entries(config.subscales)) {
      const subscaleScores: number[] = []
      for (const qId of subscale.questionIds) {
        const score = individual[qId]
        if (score !== undefined) {
          subscaleScores.push(score)
        }
      }

      if (subscaleScores.length > 0) {
        if (subscale.method === 'average') {
          subscales[name] = subscaleScores.reduce((sum, s) => sum + s, 0) / subscaleScores.length
        } else {
          subscales[name] = subscaleScores.reduce((sum, s) => sum + s, 0)
        }
      }
    }
  }

  // Determine interpretation based on thresholds
  let interpretation: string | undefined
  let severity: string | undefined
  if (config?.thresholds) {
    // Sort thresholds in descending order
    const sortedThresholds = [...config.thresholds].sort((a, b) => b.value - a.value)
    for (const threshold of sortedThresholds) {
      if (total >= threshold.value) {
        interpretation = threshold.label
        severity = threshold.severity
        break
      }
    }
  }

  return {
    total: Math.round(total * 100) / 100, // Round to 2 decimal places
    individual,
    subscales,
    answeredCount: scores.length,
    totalQuestions: questions.filter(q => isScorable(q)).length,
    interpretation,
    severity,
  }
}

// ============================================
// Common Instrument Scoring Configs
// ============================================

/**
 * PHQ-9 Depression Screening
 * 9 questions, 0-3 scale each (0-27 total)
 */
export const PHQ9_CONFIG: ScoringConfig = {
  method: 'sum',
  interpretation: 'lower_better',
  range: { min: 0, max: 27 },
  thresholds: [
    { value: 20, label: 'Severe depression', severity: 'severe' },
    { value: 15, label: 'Moderately severe depression', severity: 'moderately_severe' },
    { value: 10, label: 'Moderate depression', severity: 'moderate' },
    { value: 5, label: 'Mild depression', severity: 'mild' },
    { value: 0, label: 'Minimal depression', severity: 'none' },
  ],
}

/**
 * PHQ-2 Depression Screening (short form)
 * 2 questions, 0-3 scale each (0-6 total)
 */
export const PHQ2_CONFIG: ScoringConfig = {
  method: 'sum',
  interpretation: 'lower_better',
  range: { min: 0, max: 6 },
  thresholds: [
    { value: 3, label: 'Positive screen - consider PHQ-9', severity: 'moderate' },
    { value: 0, label: 'Negative screen', severity: 'none' },
  ],
}

/**
 * GAD-7 Anxiety Screening
 * 7 questions, 0-3 scale each (0-21 total)
 */
export const GAD7_CONFIG: ScoringConfig = {
  method: 'sum',
  interpretation: 'lower_better',
  range: { min: 0, max: 21 },
  thresholds: [
    { value: 15, label: 'Severe anxiety', severity: 'severe' },
    { value: 10, label: 'Moderate anxiety', severity: 'moderate' },
    { value: 5, label: 'Mild anxiety', severity: 'mild' },
    { value: 0, label: 'Minimal anxiety', severity: 'none' },
  ],
}

/**
 * IIEF-5 Sexual Function (for erectile dysfunction)
 * 5 questions, 1-5 scale each (5-25 total)
 */
export const IIEF5_CONFIG: ScoringConfig = {
  method: 'sum',
  interpretation: 'higher_better',
  range: { min: 5, max: 25 },
  thresholds: [
    { value: 22, label: 'No erectile dysfunction', severity: 'none' },
    { value: 17, label: 'Mild erectile dysfunction', severity: 'mild' },
    { value: 12, label: 'Mild to moderate erectile dysfunction', severity: 'moderate' },
    { value: 8, label: 'Moderate erectile dysfunction', severity: 'moderately_severe' },
    { value: 5, label: 'Severe erectile dysfunction', severity: 'severe' },
  ],
}

/**
 * Numeric Pain Scale (0-10)
 */
export const PAIN_SCALE_CONFIG: ScoringConfig = {
  method: 'average',
  interpretation: 'lower_better',
  range: { min: 0, max: 10 },
  thresholds: [
    { value: 7, label: 'Severe pain', severity: 'severe' },
    { value: 4, label: 'Moderate pain', severity: 'moderate' },
    { value: 1, label: 'Mild pain', severity: 'mild' },
    { value: 0, label: 'No pain', severity: 'none' },
  ],
}

// ============================================
// Utility Functions
// ============================================

/**
 * Returns the default scoring method for a question type
 */
export function getDefaultScoringMethod(questionType: string): 'sum' | 'average' | 'none' {
  switch (questionType) {
    case 'single_choice':
    case 'likert_scale':
    case 'yes_no':
      return 'sum'
    case 'numeric_scale':
    case 'visual_analog_scale':
    case 'number_input':
      return 'average'
    default:
      return 'none'
  }
}

/**
 * Normalizes a score to a 0-100 scale
 */
export function normalizeScore(score: number, min: number, max: number): number {
  if (max === min) return 0
  const normalized = ((score - min) / (max - min)) * 100
  return Math.round(normalized * 100) / 100
}
