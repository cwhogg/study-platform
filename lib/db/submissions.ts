import { createClient } from '@/lib/supabase/server'
import type { Submission, SubmissionInsert, ProResponses, ProScores } from './types'

const SCHEMA = 'study_platform'

/**
 * Create a new PRO submission
 */
export async function createSubmission(data: SubmissionInsert): Promise<Submission> {
  const supabase = await createClient()

  const { data: submission, error } = await supabase
    .schema(SCHEMA)
    .from('submissions')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create submission: ${error.message}`)
  }

  return submission as Submission
}

/**
 * Get all submissions for a participant
 */
export async function getSubmissions(participantId: string): Promise<Submission[]> {
  const supabase = await createClient()

  const { data: submissions, error } = await supabase
    .schema(SCHEMA)
    .from('submissions')
    .select()
    .eq('participant_id', participantId)
    .order('submitted_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get submissions: ${error.message}`)
  }

  return (submissions || []) as Submission[]
}

/**
 * Get submissions for a specific timepoint
 */
export async function getSubmissionsByTimepoint(
  participantId: string,
  timepoint: string
): Promise<Submission[]> {
  const supabase = await createClient()

  const { data: submissions, error } = await supabase
    .schema(SCHEMA)
    .from('submissions')
    .select()
    .eq('participant_id', participantId)
    .eq('timepoint', timepoint)
    .order('submitted_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to get submissions for timepoint: ${error.message}`)
  }

  return (submissions || []) as Submission[]
}

/**
 * Check if a participant has completed all instruments for a timepoint
 */
export async function hasCompletedTimepoint(
  participantId: string,
  timepoint: string,
  requiredInstruments?: string[]
): Promise<boolean> {
  const submissions = await getSubmissionsByTimepoint(participantId, timepoint)

  if (!requiredInstruments || requiredInstruments.length === 0) {
    // If no specific instruments required, just check if any submission exists
    return submissions.length > 0
  }

  // Check if all required instruments have been submitted
  const submittedInstruments = new Set(submissions.map(s => s.instrument))
  return requiredInstruments.every(instrument => submittedInstruments.has(instrument))
}

/**
 * Get a specific submission by ID
 */
export async function getSubmission(id: string): Promise<Submission | null> {
  const supabase = await createClient()

  const { data: submission, error } = await supabase
    .schema(SCHEMA)
    .from('submissions')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get submission: ${error.message}`)
  }

  return submission as Submission
}

/**
 * Get submissions for a specific instrument across all timepoints
 */
export async function getSubmissionsByInstrument(
  participantId: string,
  instrument: string
): Promise<Submission[]> {
  const supabase = await createClient()

  const { data: submissions, error } = await supabase
    .schema(SCHEMA)
    .from('submissions')
    .select()
    .eq('participant_id', participantId)
    .eq('instrument', instrument)
    .order('submitted_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to get submissions for instrument: ${error.message}`)
  }

  return (submissions || []) as Submission[]
}

/**
 * Get the most recent submission for a participant
 */
export async function getLatestSubmission(participantId: string): Promise<Submission | null> {
  const supabase = await createClient()

  const { data: submission, error } = await supabase
    .schema(SCHEMA)
    .from('submissions')
    .select()
    .eq('participant_id', participantId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get latest submission: ${error.message}`)
  }

  return submission as Submission
}

/**
 * Get completed timepoints for a participant
 */
export async function getCompletedTimepoints(participantId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data: submissions, error } = await supabase
    .schema(SCHEMA)
    .from('submissions')
    .select('timepoint')
    .eq('participant_id', participantId)

  if (error) {
    throw new Error(`Failed to get completed timepoints: ${error.message}`)
  }

  // Return unique timepoints
  const timepoints = new Set((submissions || []).map(s => s.timepoint))
  return Array.from(timepoints)
}

/**
 * Save a PRO submission with calculated scores
 */
export async function saveProSubmission(
  participantId: string,
  timepoint: string,
  instrument: string,
  responses: ProResponses,
  scores?: ProScores,
  durationSeconds?: number
): Promise<Submission> {
  const data: SubmissionInsert = {
    participant_id: participantId,
    timepoint,
    instrument,
    responses,
    scores: scores || null,
    duration_seconds: durationSeconds || null,
    submitted_at: new Date().toISOString(),
  }

  return createSubmission(data)
}

/**
 * Get submission summary for a participant (counts by timepoint)
 */
export async function getSubmissionSummary(participantId: string): Promise<{
  timepoint: string
  count: number
  instruments: string[]
}[]> {
  const submissions = await getSubmissions(participantId)

  const summary = new Map<string, { count: number; instruments: Set<string> }>()

  for (const submission of submissions) {
    const existing = summary.get(submission.timepoint)
    if (existing) {
      existing.count++
      existing.instruments.add(submission.instrument)
    } else {
      summary.set(submission.timepoint, {
        count: 1,
        instruments: new Set([submission.instrument])
      })
    }
  }

  return Array.from(summary.entries()).map(([timepoint, data]) => ({
    timepoint,
    count: data.count,
    instruments: Array.from(data.instruments)
  }))
}
