/**
 * Comprehensive Question Type System
 *
 * Supports 11 question types commonly used in PRO (Patient Reported Outcome) instruments:
 * - single_choice: Radio buttons (PHQ-9, GAD-7)
 * - multiple_choice: Checkboxes (symptom checklists)
 * - numeric_scale: Number buttons with labels (pain 0-10)
 * - likert_scale: Semantic scale buttons (agreement scales)
 * - number_input: Free numeric entry (hours of sleep)
 * - time_input: Time picker (PSQI bed time)
 * - date_input: Date picker (symptom start date)
 * - duration_input: Duration with units (episode length)
 * - text_input: Free text (open-ended)
 * - yes_no: Binary choice (screening questions)
 * - visual_analog_scale: Slider (VAS pain)
 */

// ============================================
// Base Interface
// ============================================

export interface QuestionBase {
  id: string
  text: string
  hint?: string
  required: boolean
  category?: string  // For grouping (e.g., "Sleep Quality", "Mood")
}

// ============================================
// Option Types
// ============================================

export interface SingleChoiceOption {
  value: number
  label: string
  description?: string
}

export interface MultipleChoiceOption {
  value: number | string
  label: string
  description?: string
  exclusive?: boolean  // If true, selecting this clears other selections (e.g., "None of the above")
}

// ============================================
// Question Types
// ============================================

/**
 * Single choice - radio buttons, one selection only
 * Examples: PHQ-9, GAD-7, most Likert-style questions
 */
export interface SingleChoiceQuestion extends QuestionBase {
  type: 'single_choice'
  options: SingleChoiceOption[]
}

/**
 * Multiple choice - checkboxes, multiple selections allowed
 * Examples: "Which symptoms have you experienced?" (select all that apply)
 */
export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple_choice'
  options: MultipleChoiceOption[]
  minSelections?: number  // Minimum required (default: 0)
  maxSelections?: number  // Maximum allowed (default: unlimited)
}

/**
 * Numeric scale - horizontal row of numbers with endpoint labels
 * Examples: Pain scale 0-10, Satisfaction 1-5
 */
export interface NumericScaleQuestion extends QuestionBase {
  type: 'numeric_scale'
  scale: {
    min: number
    max: number
    minLabel: string
    maxLabel: string
    step?: number  // Default: 1
  }
}

/**
 * Likert scale - semantic categories (not just numbers)
 * Examples: Frequency scales, agreement scales
 */
export interface LikertScaleQuestion extends QuestionBase {
  type: 'likert_scale'
  scale: {
    points: 3 | 4 | 5 | 6 | 7
    labels: string[]  // Must match points count
  }
}

/**
 * Number input - free numeric entry with optional constraints
 * Examples: "Hours of sleep", "Number of episodes", "Weight in lbs"
 */
export interface NumberInputQuestion extends QuestionBase {
  type: 'number_input'
  input: {
    min?: number
    max?: number
    step?: number  // For decimals, e.g., 0.1
    unit?: string  // e.g., "hours", "lbs", "mg"
    placeholder?: string
  }
}

/**
 * Time input - for time of day
 * Examples: PSQI bed time, wake time
 */
export interface TimeInputQuestion extends QuestionBase {
  type: 'time_input'
  format: '12h' | '24h'
  defaultValue?: string  // e.g., "22:00"
}

/**
 * Date input - for dates
 * Examples: "When did symptoms start?", "Date of last episode"
 */
export interface DateInputQuestion extends QuestionBase {
  type: 'date_input'
  constraints?: {
    minDate?: 'today' | string  // ISO date or relative
    maxDate?: 'today' | string
    allowPast?: boolean   // Default: true
    allowFuture?: boolean // Default: false
  }
}

/**
 * Duration input - for time spans
 * Examples: "How long did the episode last?"
 */
export interface DurationInputQuestion extends QuestionBase {
  type: 'duration_input'
  units: ('minutes' | 'hours' | 'days' | 'weeks' | 'months')[]
  allowMultipleUnits?: boolean  // Allow "2 hours 30 minutes"
}

/**
 * Text input - free text response
 * Examples: Open-ended questions, "Please describe..."
 */
export interface TextInputQuestion extends QuestionBase {
  type: 'text_input'
  multiline?: boolean
  maxLength?: number
  placeholder?: string
}

/**
 * Yes/No - simple binary choice
 * Examples: Screening questions, "Have you experienced...?"
 */
export interface YesNoQuestion extends QuestionBase {
  type: 'yes_no'
  labels?: {
    yes: string  // Default: "Yes"
    no: string   // Default: "No"
  }
}

/**
 * Visual Analog Scale - slider with continuous value
 * Examples: Pain VAS, mood rating
 */
export interface VisualAnalogScaleQuestion extends QuestionBase {
  type: 'visual_analog_scale'
  scale: {
    min: number        // Usually 0
    max: number        // Usually 100
    minLabel: string
    maxLabel: string
    showValue?: boolean  // Display numeric value while sliding
  }
}

// ============================================
// Union Type
// ============================================

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | NumericScaleQuestion
  | LikertScaleQuestion
  | NumberInputQuestion
  | TimeInputQuestion
  | DateInputQuestion
  | DurationInputQuestion
  | TextInputQuestion
  | YesNoQuestion
  | VisualAnalogScaleQuestion

// ============================================
// Response Value Types
// ============================================

export type QuestionResponseValue =
  | number                              // single_choice, numeric_scale, likert_scale, number_input, yes_no, visual_analog_scale
  | (number | string)[]                 // multiple_choice
  | string                              // time_input, date_input, text_input
  | { value: number; unit: string }     // duration_input

// ============================================
// Type Guards
// ============================================

export function isSingleChoice(q: Question): q is SingleChoiceQuestion {
  return q.type === 'single_choice'
}

export function isMultipleChoice(q: Question): q is MultipleChoiceQuestion {
  return q.type === 'multiple_choice'
}

export function isNumericScale(q: Question): q is NumericScaleQuestion {
  return q.type === 'numeric_scale'
}

export function isLikertScale(q: Question): q is LikertScaleQuestion {
  return q.type === 'likert_scale'
}

export function isNumberInput(q: Question): q is NumberInputQuestion {
  return q.type === 'number_input'
}

export function isTimeInput(q: Question): q is TimeInputQuestion {
  return q.type === 'time_input'
}

export function isDateInput(q: Question): q is DateInputQuestion {
  return q.type === 'date_input'
}

export function isDurationInput(q: Question): q is DurationInputQuestion {
  return q.type === 'duration_input'
}

export function isTextInput(q: Question): q is TextInputQuestion {
  return q.type === 'text_input'
}

export function isYesNo(q: Question): q is YesNoQuestion {
  return q.type === 'yes_no'
}

export function isVisualAnalogScale(q: Question): q is VisualAnalogScaleQuestion {
  return q.type === 'visual_analog_scale'
}

// ============================================
// Scorable Types
// ============================================

/**
 * Question types that produce numeric values for scoring
 */
export const SCORABLE_TYPES = [
  'single_choice',
  'numeric_scale',
  'likert_scale',
  'number_input',
  'yes_no',
  'visual_analog_scale',
] as const

export type ScorableQuestionType = typeof SCORABLE_TYPES[number]

export function isScorable(q: Question): boolean {
  return SCORABLE_TYPES.includes(q.type as ScorableQuestionType)
}

// ============================================
// Common Likert Scale Presets
// ============================================

export const LIKERT_PRESETS = {
  // PHQ-9, GAD-7 style
  frequency_4pt: {
    points: 4 as const,
    labels: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
  },
  // Agreement scale
  agreement_5pt: {
    points: 5 as const,
    labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']
  },
  // Frequency scale
  frequency_5pt: {
    points: 5 as const,
    labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
  },
  // Quality scale
  quality_5pt: {
    points: 5 as const,
    labels: ['Very poor', 'Poor', 'Fair', 'Good', 'Very good']
  },
  // Satisfaction scale
  satisfaction_5pt: {
    points: 5 as const,
    labels: ['Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied']
  },
  // Severity scale
  severity_5pt: {
    points: 5 as const,
    labels: ['None', 'Mild', 'Moderate', 'Severe', 'Very severe']
  },
} as const
