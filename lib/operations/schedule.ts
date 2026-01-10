/**
 * Schedule Engine
 *
 * Manages study schedules for participants:
 * - Calculate timepoint dates from enrollment
 * - Determine what assessments are due
 * - Track completion status
 */

import { createServiceClient } from '@/lib/supabase/server'
import type { ScheduleTimepoint } from '@/lib/agents/types'


export interface ScheduledTimepoint {
  timepoint: string
  week: number
  dueDate: Date
  windowStart: Date
  windowEnd: Date
  instruments: string[]
  labs?: string[]
  status: 'upcoming' | 'due' | 'overdue' | 'completed' | 'missed'
  completedInstruments: string[]
}

export interface ParticipantSchedule {
  participantId: string
  enrolledAt: Date
  currentWeek: number
  timepoints: ScheduledTimepoint[]
}

/**
 * Calculate the full schedule for a participant based on enrollment date and protocol
 */
export async function getParticipantSchedule(
  participantId: string
): Promise<ParticipantSchedule | null> {
  const supabase = createServiceClient()

  // Get participant with enrollment date
  const { data: participant, error: participantError } = await supabase
    
    .from('sp_participants')
    .select('id, study_id, enrolled_at, current_week')
    .eq('id', participantId)
    .single()

  if (participantError || !participant || !participant.enrolled_at) {
    return null
  }

  // Get study protocol
  const { data: study, error: studyError } = await supabase
    
    .from('sp_studies')
    .select('protocol')
    .eq('id', participant.study_id)
    .single()

  if (studyError || !study?.protocol) {
    return null
  }

  const protocol = study.protocol as { schedule?: ScheduleTimepoint[] }
  const schedule = protocol.schedule || []

  // Get all submissions for this participant
  const { data: submissions } = await supabase
    
    .from('sp_submissions')
    .select('timepoint, instrument')
    .eq('participant_id', participantId)

  const submissionsByTimepoint = new Map<string, Set<string>>()
  submissions?.forEach(s => {
    if (!submissionsByTimepoint.has(s.timepoint)) {
      submissionsByTimepoint.set(s.timepoint, new Set())
    }
    submissionsByTimepoint.get(s.timepoint)!.add(s.instrument)
  })

  const enrolledAt = new Date(participant.enrolled_at)
  const now = new Date()

  // Calculate timepoint dates and status
  const timepoints: ScheduledTimepoint[] = schedule.map(tp => {
    const dueDate = new Date(enrolledAt)
    dueDate.setDate(dueDate.getDate() + tp.week * 7)

    const windowDays = tp.windowDays ?? 7
    const windowStart = new Date(dueDate)
    windowStart.setDate(windowStart.getDate() - Math.floor(windowDays / 2))
    const windowEnd = new Date(dueDate)
    windowEnd.setDate(windowEnd.getDate() + Math.ceil(windowDays / 2))

    const completedInstruments = Array.from(
      submissionsByTimepoint.get(tp.timepoint) || []
    )
    const allCompleted = tp.instruments.every(i => completedInstruments.includes(i))

    let status: ScheduledTimepoint['status']
    if (allCompleted) {
      status = 'completed'
    } else if (now > windowEnd) {
      status = 'missed'
    } else if (now >= windowStart && now <= windowEnd) {
      status = 'due'
    } else if (now < windowStart) {
      status = 'upcoming'
    } else {
      status = 'overdue'
    }

    return {
      timepoint: tp.timepoint,
      week: tp.week,
      dueDate,
      windowStart,
      windowEnd,
      instruments: tp.instruments,
      labs: tp.labs,
      status,
      completedInstruments,
    }
  })

  return {
    participantId,
    enrolledAt,
    currentWeek: participant.current_week,
    timepoints,
  }
}

/**
 * Get assessments that are currently due for a participant
 */
export async function getDueAssessments(
  participantId: string
): Promise<ScheduledTimepoint[]> {
  const schedule = await getParticipantSchedule(participantId)
  if (!schedule) return []

  return schedule.timepoints.filter(tp => tp.status === 'due')
}

/**
 * Get upcoming assessments for a participant (next 3)
 */
export async function getUpcomingAssessments(
  participantId: string,
  limit: number = 3
): Promise<ScheduledTimepoint[]> {
  const schedule = await getParticipantSchedule(participantId)
  if (!schedule) return []

  return schedule.timepoints
    .filter(tp => tp.status === 'upcoming' || tp.status === 'due')
    .slice(0, limit)
}

/**
 * Check if all required instruments for a timepoint are complete
 */
export async function isTimepointComplete(
  participantId: string,
  timepoint: string
): Promise<boolean> {
  const schedule = await getParticipantSchedule(participantId)
  if (!schedule) return false

  const tp = schedule.timepoints.find(t => t.timepoint === timepoint)
  return tp?.status === 'completed'
}

/**
 * Get missing instruments for a timepoint
 */
export async function getMissingInstruments(
  participantId: string,
  timepoint: string
): Promise<string[]> {
  const schedule = await getParticipantSchedule(participantId)
  if (!schedule) return []

  const tp = schedule.timepoints.find(t => t.timepoint === timepoint)
  if (!tp) return []

  return tp.instruments.filter(i => !tp.completedInstruments.includes(i))
}

/**
 * Get completion percentage for a participant
 */
export async function getCompletionPercentage(
  participantId: string
): Promise<number> {
  const schedule = await getParticipantSchedule(participantId)
  if (!schedule || schedule.timepoints.length === 0) return 0

  const totalInstruments = schedule.timepoints.reduce(
    (sum, tp) => sum + tp.instruments.length,
    0
  )
  const completedInstruments = schedule.timepoints.reduce(
    (sum, tp) => sum + tp.completedInstruments.length,
    0
  )

  return Math.round((completedInstruments / totalInstruments) * 100)
}

/**
 * Get schedule summary for display
 */
export async function getScheduleSummary(participantId: string): Promise<{
  totalTimepoints: number
  completedTimepoints: number
  dueTimepoints: number
  missedTimepoints: number
  upcomingTimepoints: number
  nextDue: ScheduledTimepoint | null
  percentComplete: number
}> {
  const schedule = await getParticipantSchedule(participantId)
  if (!schedule) {
    return {
      totalTimepoints: 0,
      completedTimepoints: 0,
      dueTimepoints: 0,
      missedTimepoints: 0,
      upcomingTimepoints: 0,
      nextDue: null,
      percentComplete: 0,
    }
  }

  const completed = schedule.timepoints.filter(tp => tp.status === 'completed').length
  const due = schedule.timepoints.filter(tp => tp.status === 'due').length
  const missed = schedule.timepoints.filter(tp => tp.status === 'missed').length
  const upcoming = schedule.timepoints.filter(tp => tp.status === 'upcoming').length

  const nextDue = schedule.timepoints.find(
    tp => tp.status === 'due' || tp.status === 'upcoming'
  ) || null

  return {
    totalTimepoints: schedule.timepoints.length,
    completedTimepoints: completed,
    dueTimepoints: due,
    missedTimepoints: missed,
    upcomingTimepoints: upcoming,
    nextDue,
    percentComplete: await getCompletionPercentage(participantId),
  }
}

/**
 * For demo: calculate current week based on time difference
 */
export function calculateCurrentWeek(enrolledAt: Date, now: Date = new Date()): number {
  const diffMs = now.getTime() - enrolledAt.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.floor(diffDays / 7)
}

// Note: generateDefaultSchedule has been moved to @/lib/study/schedule for client-side compatibility
