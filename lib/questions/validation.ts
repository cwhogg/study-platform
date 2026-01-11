/**
 * Question Response Validation
 *
 * Validates responses based on question type and constraints.
 */

import type {
  Question,
  QuestionResponseValue,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  NumericScaleQuestion,
  LikertScaleQuestion,
  NumberInputQuestion,
  TimeInputQuestion,
  DateInputQuestion,
  DurationInputQuestion,
  TextInputQuestion,
  YesNoQuestion,
  VisualAnalogScaleQuestion,
} from './types'

// ============================================
// Validation Result
// ============================================

export interface ValidationResult {
  valid: boolean
  error?: string
}

const VALID: ValidationResult = { valid: true }

function invalid(error: string): ValidationResult {
  return { valid: false, error }
}

// ============================================
// Type-specific Validators
// ============================================

function validateSingleChoice(q: SingleChoiceQuestion, value: unknown): ValidationResult {
  if (typeof value !== 'number') {
    return invalid('Please select an option')
  }
  const validValues = q.options.map(o => o.value)
  if (!validValues.includes(value)) {
    return invalid('Invalid option selected')
  }
  return VALID
}

function validateMultipleChoice(q: MultipleChoiceQuestion, value: unknown): ValidationResult {
  if (!Array.isArray(value)) {
    return invalid('Please select at least one option')
  }

  if (q.minSelections !== undefined && value.length < q.minSelections) {
    return invalid(`Please select at least ${q.minSelections} option${q.minSelections > 1 ? 's' : ''}`)
  }

  if (q.maxSelections !== undefined && value.length > q.maxSelections) {
    return invalid(`Please select at most ${q.maxSelections} option${q.maxSelections > 1 ? 's' : ''}`)
  }

  const validValues = q.options.map(o => o.value)
  for (const v of value) {
    if (!validValues.includes(v as number | string)) {
      return invalid('Invalid option selected')
    }
  }

  return VALID
}

function validateNumericScale(q: NumericScaleQuestion, value: unknown): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return invalid('Please select a value')
  }
  if (value < q.scale.min || value > q.scale.max) {
    return invalid(`Value must be between ${q.scale.min} and ${q.scale.max}`)
  }
  return VALID
}

function validateLikertScale(q: LikertScaleQuestion, value: unknown): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return invalid('Please select an option')
  }
  if (value < 0 || value >= q.scale.points) {
    return invalid('Invalid selection')
  }
  return VALID
}

function validateNumberInput(q: NumberInputQuestion, value: unknown): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return invalid('Please enter a valid number')
  }
  if (q.input.min !== undefined && value < q.input.min) {
    return invalid(`Value must be at least ${q.input.min}${q.input.unit ? ` ${q.input.unit}` : ''}`)
  }
  if (q.input.max !== undefined && value > q.input.max) {
    return invalid(`Value must be at most ${q.input.max}${q.input.unit ? ` ${q.input.unit}` : ''}`)
  }
  return VALID
}

function validateTimeInput(q: TimeInputQuestion, value: unknown): ValidationResult {
  if (typeof value !== 'string') {
    return invalid('Please enter a time')
  }
  // Accept HH:MM format (24h) or h:mm AM/PM format (12h)
  const time24hPattern = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/
  const time12hPattern = /^(1[0-2]|0?[1-9]):([0-5][0-9])\s?(AM|PM|am|pm)$/

  if (!time24hPattern.test(value) && !time12hPattern.test(value)) {
    return invalid('Please enter a valid time')
  }
  return VALID
}

function validateDateInput(q: DateInputQuestion, value: unknown): ValidationResult {
  if (typeof value !== 'string') {
    return invalid('Please enter a date')
  }

  // Accept YYYY-MM-DD format
  const datePattern = /^\d{4}-\d{2}-\d{2}$/
  if (!datePattern.test(value)) {
    return invalid('Please enter a valid date')
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return invalid('Please enter a valid date')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (q.constraints) {
    if (q.constraints.allowPast === false && date < today) {
      return invalid('Date cannot be in the past')
    }
    if (q.constraints.allowFuture === false && date > today) {
      return invalid('Date cannot be in the future')
    }
    // Additional minDate/maxDate validation could be added here
  }

  return VALID
}

function validateDurationInput(q: DurationInputQuestion, value: unknown): ValidationResult {
  if (typeof value !== 'object' || value === null) {
    return invalid('Please enter a duration')
  }

  const durationValue = value as { value?: number; unit?: string }

  if (typeof durationValue.value !== 'number' || isNaN(durationValue.value)) {
    return invalid('Please enter a valid duration')
  }

  if (durationValue.value < 0) {
    return invalid('Duration cannot be negative')
  }

  if (!durationValue.unit || !q.units.includes(durationValue.unit as typeof q.units[number])) {
    return invalid('Please select a valid unit')
  }

  return VALID
}

function validateTextInput(q: TextInputQuestion, value: unknown): ValidationResult {
  if (typeof value !== 'string') {
    return invalid('Please enter text')
  }

  if (q.maxLength !== undefined && value.length > q.maxLength) {
    return invalid(`Response must be ${q.maxLength} characters or less`)
  }

  return VALID
}

function validateYesNo(q: YesNoQuestion, value: unknown): ValidationResult {
  if (value !== 0 && value !== 1) {
    return invalid('Please select Yes or No')
  }
  return VALID
}

function validateVisualAnalogScale(q: VisualAnalogScaleQuestion, value: unknown): ValidationResult {
  if (typeof value !== 'number' || isNaN(value)) {
    return invalid('Please select a value')
  }
  if (value < q.scale.min || value > q.scale.max) {
    return invalid(`Value must be between ${q.scale.min} and ${q.scale.max}`)
  }
  return VALID
}

// ============================================
// Main Validation Function
// ============================================

/**
 * Validates a response value against a question's type and constraints
 */
export function validateResponse(question: Question, value: unknown): ValidationResult {
  // Required check (empty values)
  const isEmpty =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)

  if (question.required && isEmpty) {
    return invalid('This question is required')
  }

  // If not required and empty, it's valid
  if (isEmpty) {
    return VALID
  }

  // Type-specific validation
  switch (question.type) {
    case 'single_choice':
      return validateSingleChoice(question, value)

    case 'multiple_choice':
      return validateMultipleChoice(question, value)

    case 'numeric_scale':
      return validateNumericScale(question, value)

    case 'likert_scale':
      return validateLikertScale(question, value)

    case 'number_input':
      return validateNumberInput(question, value)

    case 'time_input':
      return validateTimeInput(question, value)

    case 'date_input':
      return validateDateInput(question, value)

    case 'duration_input':
      return validateDurationInput(question, value)

    case 'text_input':
      return validateTextInput(question, value)

    case 'yes_no':
      return validateYesNo(question, value)

    case 'visual_analog_scale':
      return validateVisualAnalogScale(question, value)

    default:
      // Unknown question type
      return invalid('Unknown question type')
  }
}

/**
 * Validates all responses for a set of questions
 */
export function validateAllResponses(
  questions: Question[],
  responses: Record<string, QuestionResponseValue>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  let valid = true

  for (const question of questions) {
    const value = responses[question.id]
    const result = validateResponse(question, value)

    if (!result.valid) {
      valid = false
      errors[question.id] = result.error || 'Invalid response'
    }
  }

  return { valid, errors }
}

/**
 * Checks if a response value is empty/unanswered
 */
export function isEmptyResponse(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}
