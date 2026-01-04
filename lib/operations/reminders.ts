/**
 * Reminder Processing
 *
 * Processes reminders for participants with due assessments.
 * Implements the escalation strategy:
 * - Day 0: Initial SMS
 * - Day 1: Initial Email
 * - Day 2: Follow-up SMS
 * - Day 4: Follow-up Email
 * - Day 6: Final SMS
 * - Day 7: Final Email
 */

import { createClient } from '@/lib/supabase/server'
import { getDueAssessments, type ScheduledTimepoint } from './schedule'
import { sendEmail } from '@/lib/email/client'
import { buildEmail, type TemplateVariables } from '@/lib/email/templates'

const SCHEMA = 'study_platform'

export interface ReminderResult {
  participantId: string
  participantName: string
  timepoint: string
  reminderType: 'initial' | 'followUp' | 'final'
  channel: 'sms' | 'email'
  sent: boolean
  error?: string
}

export interface ProcessRemindersResult {
  processed: number
  sent: number
  skipped: number
  errors: number
  results: ReminderResult[]
}

/**
 * Process reminders for all active participants
 */
export async function processReminders(): Promise<ProcessRemindersResult> {
  const supabase = await createClient()
  const results: ReminderResult[] = []
  let sent = 0
  let skipped = 0
  let errors = 0

  // Get all active participants
  const { data: participants, error: participantsError } = await supabase
    .schema(SCHEMA)
    .from('participants')
    .select(`
      id,
      study_id,
      user_id,
      status,
      enrolled_at
    `)
    .eq('status', 'enrolled')

  if (participantsError || !participants) {
    console.error('[Reminders] Failed to get participants:', participantsError)
    return { processed: 0, sent: 0, skipped: 0, errors: 1, results: [] }
  }

  console.log(`[Reminders] Processing ${participants.length} active participants`)

  for (const participant of participants) {
    // Get due assessments
    const dueAssessments = await getDueAssessments(participant.id)

    for (const assessment of dueAssessments) {
      // Skip if already completed
      if (assessment.status === 'completed') {
        skipped++
        continue
      }

      // Determine reminder stage based on days since due
      const daysSinceDue = Math.floor(
        (Date.now() - assessment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      const reminderInfo = getReminderType(daysSinceDue)
      if (!reminderInfo) {
        skipped++
        continue
      }

      // Check if we already sent this reminder today
      const alreadySent = await checkReminderSentToday(
        participant.id,
        assessment.timepoint,
        reminderInfo.type,
        reminderInfo.channel
      )

      if (alreadySent) {
        skipped++
        continue
      }

      // Get participant profile
      const { data: profile } = await supabase
        .schema(SCHEMA)
        .from('profiles')
        .select('first_name, email')
        .eq('id', participant.user_id)
        .single()

      if (!profile) {
        errors++
        results.push({
          participantId: participant.id,
          participantName: 'Unknown',
          timepoint: assessment.timepoint,
          reminderType: reminderInfo.type,
          channel: reminderInfo.channel,
          sent: false,
          error: 'Profile not found',
        })
        continue
      }

      // Get study for templates
      const { data: study } = await supabase
        .schema(SCHEMA)
        .from('studies')
        .select('id, name, message_templates')
        .eq('id', participant.study_id)
        .single()

      // Send reminder
      const result = await sendReminder(
        participant.id,
        profile.email,
        profile.first_name || 'there',
        study?.name || 'Study',
        assessment,
        reminderInfo,
        study?.message_templates
      )

      if (result.sent) {
        sent++
      } else {
        errors++
      }

      results.push({
        participantId: participant.id,
        participantName: profile.first_name || 'Unknown',
        timepoint: assessment.timepoint,
        reminderType: reminderInfo.type,
        channel: reminderInfo.channel,
        sent: result.sent,
        error: result.error,
      })
    }
  }

  return {
    processed: participants.length,
    sent,
    skipped,
    errors,
    results,
  }
}

/**
 * Determine reminder type based on days since due
 */
function getReminderType(
  daysSinceDue: number
): { type: 'initial' | 'followUp' | 'final'; channel: 'sms' | 'email' } | null {
  // Escalation schedule:
  // Day 0: Initial SMS
  // Day 1: Initial Email
  // Day 2: Follow-up SMS
  // Day 4: Follow-up Email
  // Day 6: Final SMS
  // Day 7: Final Email

  if (daysSinceDue === 0) {
    return { type: 'initial', channel: 'sms' }
  } else if (daysSinceDue === 1) {
    return { type: 'initial', channel: 'email' }
  } else if (daysSinceDue === 2) {
    return { type: 'followUp', channel: 'sms' }
  } else if (daysSinceDue === 4) {
    return { type: 'followUp', channel: 'email' }
  } else if (daysSinceDue === 6) {
    return { type: 'final', channel: 'sms' }
  } else if (daysSinceDue === 7) {
    return { type: 'final', channel: 'email' }
  }

  return null
}

/**
 * Check if a reminder was already sent today
 */
async function checkReminderSentToday(
  participantId: string,
  timepoint: string,
  reminderType: string,
  channel: string
): Promise<boolean> {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: messages } = await supabase
    .schema(SCHEMA)
    .from('messages')
    .select('id')
    .eq('participant_id', participantId)
    .eq('template_id', `${reminderType}_${timepoint}`)
    .eq('channel', channel)
    .gte('created_at', today.toISOString())
    .limit(1)

  return (messages?.length ?? 0) > 0
}

/**
 * Send a reminder to a participant
 */
async function sendReminder(
  participantId: string,
  email: string,
  firstName: string,
  studyName: string,
  assessment: ScheduledTimepoint,
  reminderInfo: { type: 'initial' | 'followUp' | 'final'; channel: 'sms' | 'email' },
  messageTemplates: unknown
): Promise<{ sent: boolean; error?: string }> {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Build variables
  const variables: TemplateVariables = {
    firstName,
    studyName,
    timepoint: formatTimepoint(assessment.timepoint),
    link: `${baseUrl}/study/assessment/${assessment.timepoint}`,
    daysRemaining: String(
      Math.max(0, Math.ceil((assessment.windowEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    ),
  }

  if (reminderInfo.channel === 'email') {
    // Get email template
    const templates = messageTemplates as {
      reminders?: {
        assessment?: {
          [key: string]: { email?: { subject: string; body: string } }
        }
      }
    } | null

    const template = templates?.reminders?.assessment?.[reminderInfo.type]?.email

    // Use template or default
    const subject = template?.subject
      ? template.subject.replace(/\{\{(\w+)\}\}/g, (_, key) => String(variables[key] || ''))
      : `Your ${variables.timepoint} check-in is ready`

    const body = template?.body
      ? template.body.replace(/\{\{(\w+)\}\}/g, (_, key) => String(variables[key] || ''))
      : `Hi ${firstName},\n\nIt's time for your ${variables.timepoint} check-in for ${studyName}.\n\nThis quick survey takes about 5 minutes.`

    const { subject: renderedSubject, html } = buildEmail(
      subject,
      body,
      variables,
      'Complete Check-in',
      variables.link
    )

    const result = await sendEmail({
      to: email,
      subject: renderedSubject,
      html,
    })

    // Log message
    await supabase
      .schema(SCHEMA)
      .from('messages')
      .insert({
        participant_id: participantId,
        type: 'reminder',
        channel: 'email',
        template_id: `${reminderInfo.type}_${assessment.timepoint}`,
        subject: renderedSubject,
        body,
        status: result.success ? 'sent' : 'failed',
        external_id: result.id || null,
        sent_at: result.success ? new Date().toISOString() : null,
      })

    return { sent: result.success, error: result.error }
  } else {
    // SMS - log only (would integrate with Twilio in production)
    const templates = messageTemplates as {
      reminders?: {
        assessment?: {
          [key: string]: { sms?: string }
        }
      }
    } | null

    const smsTemplate = templates?.reminders?.assessment?.[reminderInfo.type]?.sms
    const smsBody = smsTemplate
      ? smsTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => String(variables[key] || ''))
      : `Hi ${firstName}! Your ${variables.timepoint} check-in is ready: ${variables.link}`

    // Log SMS (not actually sending in demo)
    await supabase
      .schema(SCHEMA)
      .from('messages')
      .insert({
        participant_id: participantId,
        type: 'reminder',
        channel: 'sms',
        template_id: `${reminderInfo.type}_${assessment.timepoint}`,
        body: smsBody,
        status: 'sent', // In demo, always mark as sent
        sent_at: new Date().toISOString(),
      })

    console.log(`[Reminders] SMS (demo): ${smsBody}`)
    return { sent: true }
  }
}

/**
 * Format timepoint for display
 */
function formatTimepoint(timepoint: string): string {
  if (timepoint === 'baseline') return 'Baseline'
  const match = timepoint.match(/week_?(\d+)/i)
  if (match) return `Week ${match[1]}`
  return timepoint.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Send a single reminder (for manual triggering)
 */
export async function sendSingleReminder(
  participantId: string,
  timepoint: string,
  channel: 'sms' | 'email' = 'email'
): Promise<{ sent: boolean; error?: string }> {
  const supabase = await createClient()

  // Get participant
  const { data: participant } = await supabase
    .schema(SCHEMA)
    .from('participants')
    .select('id, study_id, user_id')
    .eq('id', participantId)
    .single()

  if (!participant) {
    return { sent: false, error: 'Participant not found' }
  }

  // Get profile
  const { data: profile } = await supabase
    .schema(SCHEMA)
    .from('profiles')
    .select('first_name, email')
    .eq('id', participant.user_id)
    .single()

  if (!profile) {
    return { sent: false, error: 'Profile not found' }
  }

  // Get study
  const { data: study } = await supabase
    .schema(SCHEMA)
    .from('studies')
    .select('id, name, message_templates')
    .eq('id', participant.study_id)
    .single()

  // Create mock assessment
  const mockAssessment: ScheduledTimepoint = {
    timepoint,
    week: 0,
    dueDate: new Date(),
    windowStart: new Date(),
    windowEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    instruments: [],
    status: 'due',
    completedInstruments: [],
  }

  return sendReminder(
    participantId,
    profile.email,
    profile.first_name || 'there',
    study?.name || 'Study',
    mockAssessment,
    { type: 'initial', channel },
    study?.message_templates
  )
}
