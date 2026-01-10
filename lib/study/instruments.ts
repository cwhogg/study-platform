/**
 * Instrument Validation and Baseline Helpers
 *
 * Pure functions for validating PRO instruments and extracting
 * baseline instruments from study protocols.
 */

export interface Option {
  value: number
  label: string
}

export interface Question {
  id: string
  text: string
  type: 'single_choice' | 'numeric_scale' | 'text'
  options?: Option[]
  scale?: {
    min: number
    max: number
    minLabel: string
    maxLabel: string
  }
  required: boolean
}

export interface Instrument {
  id: string
  name: string
  description?: string
  instructions: string
  estimatedMinutes?: number
  questions: Question[]
}

export interface ScheduleTimepoint {
  timepoint: string
  week: number
  instruments: string[]
}

export interface Protocol {
  instruments?: Instrument[]
  schedule?: ScheduleTimepoint[]
}

/**
 * Validate that an instrument has properly formatted questions
 */
export function isValidInstrument(instrument: Instrument): boolean {
  if (!instrument.questions || !Array.isArray(instrument.questions) || instrument.questions.length === 0) {
    return false
  }

  // Check if questions have required fields
  return instrument.questions.every(q =>
    q && typeof q === 'object' && q.id && q.text && q.type
  )
}

/**
 * Get baseline instruments from a protocol
 * Returns only instruments scheduled for baseline (week 0) with valid questions
 */
export function getBaselineInstruments(protocol: Protocol | null | undefined): Instrument[] {
  if (!protocol?.instruments || protocol.instruments.length === 0) {
    return []
  }

  // Find baseline timepoint to know which instruments to use
  const baselineTimepoint = protocol.schedule?.find(
    tp => tp.timepoint === 'baseline' || tp.week === 0
  )

  let candidateInstruments = protocol.instruments

  if (baselineTimepoint?.instruments) {
    // Get only instruments scheduled for baseline
    candidateInstruments = protocol.instruments.filter(
      inst => baselineTimepoint.instruments.includes(inst.id)
    )
  }

  // Filter to only instruments that have valid questions
  return candidateInstruments.filter(isValidInstrument)
}

/**
 * Get instruments for a specific timepoint
 */
export function getTimepointInstruments(
  protocol: Protocol | null | undefined,
  timepoint: string
): Instrument[] {
  if (!protocol?.instruments || protocol.instruments.length === 0) {
    return []
  }

  const tp = protocol.schedule?.find(t => t.timepoint === timepoint)
  if (!tp?.instruments) {
    return []
  }

  return protocol.instruments
    .filter(inst => tp.instruments.includes(inst.id))
    .filter(isValidInstrument)
}

/**
 * Group answers by instrument for submission
 */
export function groupAnswersByInstrument(
  answers: Record<string, number>,
  questions: Array<{ id: string; instrumentId: string }>
): Map<string, Array<{ questionId: string; value: number }>> {
  const answersByInstrument = new Map<string, Array<{ questionId: string; value: number }>>()

  for (const q of questions) {
    const value = answers[q.id]
    if (value !== undefined) {
      if (!answersByInstrument.has(q.instrumentId)) {
        answersByInstrument.set(q.instrumentId, [])
      }
      answersByInstrument.get(q.instrumentId)!.push({
        questionId: q.id,
        value
      })
    }
  }

  return answersByInstrument
}

/**
 * Fallback instruments if none in protocol
 */
export const FALLBACK_INSTRUMENTS: Instrument[] = [
  {
    id: 'phq-2',
    name: 'PHQ-2',
    instructions: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    questions: [
      {
        id: 'phq2_q1',
        text: 'Little interest or pleasure in doing things',
        type: 'single_choice',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ],
        required: true
      },
      {
        id: 'phq2_q2',
        text: 'Feeling down, depressed, or hopeless',
        type: 'single_choice',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'qol',
    name: 'Quality of Life',
    instructions: 'Please answer the following question about your overall quality of life.',
    questions: [
      {
        id: 'qol_q1',
        text: 'In general, how would you rate your overall quality of life?',
        type: 'single_choice',
        options: [
          { value: 1, label: 'Very poor' },
          { value: 2, label: 'Poor' },
          { value: 3, label: 'Fair' },
          { value: 4, label: 'Good' },
          { value: 5, label: 'Excellent' }
        ],
        required: true
      }
    ]
  }
]
