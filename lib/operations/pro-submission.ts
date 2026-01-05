/**
 * PRO Submission Handler
 *
 * Handles the complete flow when a participant submits a PRO questionnaire:
 * 1. Validate responses against instrument schema
 * 2. Calculate scores using the scoring config
 * 3. Save to submissions table
 * 4. Check safety thresholds and generate alerts
 * 5. Check if timepoint is complete
 */

import { createServiceClient } from '@/lib/supabase/server'
import type { Instrument, AlertConfig } from '@/lib/agents/types'
import { evaluateSafety, type SafetyEvaluationResult } from './safety'


export interface ProResponse {
  questionId: string
  value: number
}

export interface SubmissionResult {
  success: boolean
  submissionId?: string
  scores?: {
    total: number
    [key: string]: number
  }
  safety?: SafetyEvaluationResult
  error?: string
}

/**
 * Handle a PRO submission from a participant
 */
export async function handleProSubmission(
  participantId: string,
  timepoint: string,
  instrumentId: string,
  responses: ProResponse[],
  durationSeconds?: number
): Promise<SubmissionResult> {
  let supabase;
  try {
    supabase = createServiceClient()
  } catch (e) {
    console.error('[PRO] Failed to create service client:', e)
    return { success: false, error: `Service client error: ${e instanceof Error ? e.message : 'unknown'}` }
  }

  try {
    console.log('[PRO] Starting submission for participant:', participantId)

    // 1. Get participant and study with protocol
    const { data: participant, error: participantError } = await supabase
      
      .from('sp_participants')
      .select('id, study_id, user_id')
      .eq('id', participantId)
      .single()

    if (participantError || !participant) {
      console.error('[PRO] Participant lookup failed:', participantError)
      return { success: false, error: `Participant not found: ${participantError?.message || 'null result'}` }
    }
    console.log('[PRO] Found participant, study_id:', participant.study_id)

    // Get study protocol
    const { data: study, error: studyError } = await supabase
      
      .from('sp_studies')
      .select('id, protocol')
      .eq('id', participant.study_id)
      .single()

    if (studyError || !study) {
      console.error('[PRO] Study lookup failed:', studyError)
      return { success: false, error: `Study not found: ${studyError?.message || 'null result'}` }
    }
    console.log('[PRO] Found study, has protocol:', !!study.protocol)

    // 2. Find instrument in protocol
    const protocol = study.protocol as { instruments?: Instrument[] | Record<string, Instrument> } | null

    // Handle instruments as either array or object
    let instrument: Instrument | undefined
    if (protocol?.instruments) {
      if (Array.isArray(protocol.instruments)) {
        instrument = protocol.instruments.find(i => i.id === instrumentId)
      } else if (typeof protocol.instruments === 'object') {
        // instruments might be keyed by id
        instrument = (protocol.instruments as Record<string, Instrument>)[instrumentId]
      }
    }

    if (!instrument) {
      // Use fallback validation if instrument not in protocol
      console.warn(`[PRO] Instrument ${instrumentId} not found in protocol, using minimal validation`)
    }

    // 3. Validate responses
    const validationError = validateResponses(instrument, responses)
    if (validationError) {
      return { success: false, error: validationError }
    }

    // 4. Calculate scores
    const scores = calculateScores(instrument, responses)

    // 5. Save submission
    const responsesMap: Record<string, { value: number }> = {}
    responses.forEach(r => {
      responsesMap[r.questionId] = { value: r.value }
    })

    const { data: submission, error: submissionError } = await supabase
      
      .from('sp_submissions')
      .insert({
        participant_id: participantId,
        timepoint,
        instrument: instrumentId,
        responses: responsesMap,
        scores,
        duration_seconds: durationSeconds || null,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (submissionError) {
      console.error('[PRO] Failed to save submission:', submissionError)
      return { success: false, error: `Failed to save: ${submissionError.code} - ${submissionError.message}` }
    }

    console.log('[PRO] Submission saved:', submission.id)

    // 6. Evaluate safety and create alerts
    const safetyResult = await evaluateSafety(
      participantId,
      instrumentId,
      scores,
      responses,
      instrument?.alerts
    )

    // 7. Create alerts if needed (wrapped in try-catch to not fail submission)
    // Map safety alert types to database enum: 'safety', 'non_response', 'lab_threshold'
    if (safetyResult.alerts.length > 0) {
      for (const alert of safetyResult.alerts) {
        try {
          // All PRO-triggered alerts are 'safety' type in the database
          const { error: alertError } = await supabase
            .from('sp_alerts')
            .insert({
              participant_id: participantId,
              type: 'safety',
              trigger_source: instrumentId,
              trigger_value: String(scores.total),
              threshold: alert.condition,
              message: alert.message,
              status: 'open',
            })
          if (alertError) {
            console.error('[PRO] Failed to create alert:', alertError)
          }
        } catch (alertErr) {
          console.error('[PRO] Alert creation exception:', alertErr)
        }
      }
    }

    return {
      success: true,
      submissionId: submission.id,
      scores,
      safety: safetyResult,
    }

  } catch (error) {
    console.error('[PRO] Unexpected error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: `Unexpected: ${msg}` }
  }
}

/**
 * Validate responses against instrument schema
 */
function validateResponses(
  instrument: Instrument | undefined,
  responses: ProResponse[]
): string | null {
  if (!instrument) {
    // Minimal validation when no schema available
    if (responses.length === 0) {
      return 'No responses provided'
    }
    return null
  }

  // Convert questions to array if it's an object
  type QuestionType = { id: string; required: boolean; type: string; options?: { value: number }[]; scale?: { min: number; max: number } }
  const questions: QuestionType[] = Array.isArray(instrument.questions)
    ? instrument.questions
    : Object.values(instrument.questions || {}) as QuestionType[]

  // Check all required questions are answered
  const requiredQuestions = questions.filter(q => q.required)
  const answeredIds = new Set(responses.map(r => r.questionId))

  for (const question of requiredQuestions) {
    if (!answeredIds.has(question.id)) {
      return `Required question ${question.id} not answered`
    }
  }

  // Validate each response
  for (const response of responses) {
    const question = questions.find(q => q.id === response.questionId)
    if (!question) {
      continue // Skip unknown questions
    }

    if (question.type === 'single_choice' && question.options) {
      const validValues = question.options.map(o => o.value)
      if (!validValues.includes(response.value)) {
        return `Invalid value for question ${question.id}`
      }
    }

    if (question.type === 'numeric_scale' && question.scale) {
      if (response.value < question.scale.min || response.value > question.scale.max) {
        return `Value out of range for question ${question.id}`
      }
    }
  }

  return null
}

/**
 * Calculate scores using the instrument's scoring config
 */
function calculateScores(
  instrument: Instrument | undefined,
  responses: ProResponse[]
): { total: number; [key: string]: number } {
  const values = responses.map(r => r.value)

  if (!instrument?.scoring) {
    // Default to sum
    const total = values.reduce((sum, v) => sum + v, 0)
    return { total }
  }

  const { method } = instrument.scoring

  let total: number
  switch (method) {
    case 'sum':
      total = values.reduce((sum, v) => sum + v, 0)
      break
    case 'average':
      total = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0
      break
    case 'custom':
      // For custom scoring, default to sum
      total = values.reduce((sum, v) => sum + v, 0)
      break
    default:
      total = values.reduce((sum, v) => sum + v, 0)
  }

  // Add individual question scores
  const scores: { total: number; [key: string]: number } = { total }
  responses.forEach(r => {
    scores[r.questionId] = r.value
  })

  return scores
}

/**
 * Check if a timepoint is complete (all required instruments submitted)
 */
export async function isTimepointComplete(
  participantId: string,
  timepoint: string,
  requiredInstruments: string[]
): Promise<boolean> {
  const supabase = createServiceClient()

  const { data: submissions, error } = await supabase
    
    .from('sp_submissions')
    .select('instrument')
    .eq('participant_id', participantId)
    .eq('timepoint', timepoint)

  if (error || !submissions) {
    return false
  }

  const submittedInstruments = new Set(submissions.map(s => s.instrument))
  return requiredInstruments.every(i => submittedInstruments.has(i))
}

/**
 * Get all submissions for a participant at a timepoint
 */
export async function getTimepointSubmissions(
  participantId: string,
  timepoint: string
): Promise<{ instrument: string; scores: Record<string, number> | null }[]> {
  const supabase = createServiceClient()

  const { data: submissions, error } = await supabase
    
    .from('sp_submissions')
    .select('instrument, scores')
    .eq('participant_id', participantId)
    .eq('timepoint', timepoint)

  if (error || !submissions) {
    return []
  }

  return submissions.map(s => ({
    instrument: s.instrument,
    scores: s.scores as Record<string, number> | null,
  }))
}
