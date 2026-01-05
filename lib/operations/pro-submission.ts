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

import { createClient } from '@/lib/supabase/server'
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
  try {
    const supabase = await createClient()

    // 1. Get participant and study with protocol
    const { data: participant, error: participantError } = await supabase
      
      .from('sp_participants')
      .select('id, study_id, user_id')
      .eq('id', participantId)
      .single()

    if (participantError || !participant) {
      return { success: false, error: 'Participant not found' }
    }

    // Get study protocol
    const { data: study, error: studyError } = await supabase
      
      .from('sp_studies')
      .select('id, protocol')
      .eq('id', participant.study_id)
      .single()

    if (studyError || !study) {
      return { success: false, error: 'Study not found' }
    }

    // 2. Find instrument in protocol
    const protocol = study.protocol as { instruments?: Instrument[] } | null
    const instrument = protocol?.instruments?.find(i => i.id === instrumentId)

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
      return { success: false, error: 'Failed to save submission' }
    }

    // 6. Evaluate safety and create alerts
    const safetyResult = await evaluateSafety(
      participantId,
      instrumentId,
      scores,
      responses,
      instrument?.alerts
    )

    // 7. Create alerts if needed
    if (safetyResult.alerts.length > 0) {
      for (const alert of safetyResult.alerts) {
        await supabase
          
          .from('sp_alerts')
          .insert({
            participant_id: participantId,
            type: alert.type,
            trigger_source: instrumentId,
            trigger_value: String(scores.total),
            threshold: alert.condition,
            message: alert.message,
            status: 'pending',
          })
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
    return { success: false, error: 'An unexpected error occurred' }
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

  // Check all required questions are answered
  const requiredQuestions = instrument.questions.filter(q => q.required)
  const answeredIds = new Set(responses.map(r => r.questionId))

  for (const question of requiredQuestions) {
    if (!answeredIds.has(question.id)) {
      return `Required question ${question.id} not answered`
    }
  }

  // Validate each response
  for (const response of responses) {
    const question = instrument.questions.find(q => q.id === response.questionId)
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
  const supabase = await createClient()

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
  const supabase = await createClient()

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
