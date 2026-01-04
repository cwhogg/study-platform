/**
 * Demo Operations
 *
 * Functions for demo time advancement and simulated data.
 * These features allow sponsors to test the full study flow
 * without waiting for real time to pass.
 */

import { createClient } from '@/lib/supabase/server'
import { getParticipantSchedule, type ScheduledTimepoint } from './schedule'

const SCHEMA = 'study_platform'

export interface AdvanceTimeResult {
  success: boolean
  previousWeek: number
  currentWeek: number
  schedule: ScheduledTimepoint[] | null
  error?: string
}

/**
 * Advance a participant to a specific week in the study
 * This updates their current_week and recalculates what's due
 */
export async function advanceParticipantTime(
  participantId: string,
  toWeek: number
): Promise<AdvanceTimeResult> {
  const supabase = await createClient()

  // Get current participant state
  const { data: participant, error: participantError } = await supabase
    .schema(SCHEMA)
    .from('participants')
    .select('id, current_week, enrolled_at, status')
    .eq('id', participantId)
    .single()

  if (participantError || !participant) {
    return {
      success: false,
      previousWeek: 0,
      currentWeek: 0,
      schedule: null,
      error: 'Participant not found',
    }
  }

  // Validate target week
  if (toWeek < 0) {
    return {
      success: false,
      previousWeek: participant.current_week,
      currentWeek: participant.current_week,
      schedule: null,
      error: 'Week cannot be negative',
    }
  }

  if (toWeek <= participant.current_week) {
    return {
      success: false,
      previousWeek: participant.current_week,
      currentWeek: participant.current_week,
      schedule: null,
      error: 'Cannot advance to a past or current week',
    }
  }

  // Update participant's current week
  const { error: updateError } = await supabase
    .schema(SCHEMA)
    .from('participants')
    .update({ current_week: toWeek })
    .eq('id', participantId)

  if (updateError) {
    return {
      success: false,
      previousWeek: participant.current_week,
      currentWeek: participant.current_week,
      schedule: null,
      error: `Failed to update participant: ${updateError.message}`,
    }
  }

  // If participant hasn't been enrolled yet, also set their enrollment date
  // to allow schedule calculations
  if (!participant.enrolled_at && (participant.status === 'enrolled' || participant.status === 'active')) {
    await supabase
      .schema(SCHEMA)
      .from('participants')
      .update({ enrolled_at: new Date().toISOString() })
      .eq('id', participantId)
  }

  // Get updated schedule
  const schedule = await getParticipantSchedule(participantId)

  console.log(`[Demo] Advanced participant ${participantId} from week ${participant.current_week} to week ${toWeek}`)

  return {
    success: true,
    previousWeek: participant.current_week,
    currentWeek: toWeek,
    schedule: schedule?.timepoints || null,
  }
}

/**
 * Simulate lab results for a participant at a specific timepoint
 * Creates mock lab values within normal ranges with some variation
 */
export async function simulateLabResults(
  participantId: string,
  timepoint: string
): Promise<{ success: boolean; labIds: string[]; alerts?: { created: number; alerts: string[] }; error?: string }> {
  const supabase = await createClient()

  // Get participant to verify they exist
  const { data: participant, error: participantError } = await supabase
    .schema(SCHEMA)
    .from('participants')
    .select('id, study_id')
    .eq('id', participantId)
    .single()

  if (participantError || !participant) {
    return { success: false, labIds: [], error: 'Participant not found' }
  }

  // Get study to check if it has lab requirements
  const { data: study } = await supabase
    .schema(SCHEMA)
    .from('studies')
    .select('protocol')
    .eq('id', participant.study_id)
    .single()

  // Define simulated lab markers (TRT-focused for demo)
  // Values simulate post-TRT levels within normal therapeutic range
  const labMarkers = [
    {
      marker: 'testosterone_total',
      generateValue: () => 450 + Math.random() * 200, // 450-650 ng/dL (post-TRT)
      unit: 'ng/dL',
      referenceRange: '300-1000',
    },
    {
      marker: 'testosterone_free',
      generateValue: () => 10 + Math.random() * 15, // 10-25 pg/mL
      unit: 'pg/mL',
      referenceRange: '9-30',
    },
    {
      marker: 'hematocrit',
      generateValue: () => 42 + Math.random() * 6, // 42-48%
      unit: '%',
      referenceRange: '38-50',
    },
    {
      marker: 'psa',
      generateValue: () => 0.5 + Math.random() * 2, // 0.5-2.5 ng/mL
      unit: 'ng/mL',
      referenceRange: '0-4',
    },
    {
      marker: 'estradiol',
      generateValue: () => 20 + Math.random() * 20, // 20-40 pg/mL
      unit: 'pg/mL',
      referenceRange: '10-40',
    },
  ]

  // Check which labs are needed from protocol
  const protocol = study?.protocol as { schedule?: { labs?: string[] }[] } | null
  const scheduledLabs = protocol?.schedule?.find(
    (s: { timepoint?: string; labs?: string[] }) =>
      s.timepoint === timepoint
  )?.labs

  // Use scheduled labs or default to all markers
  const markersToSimulate = scheduledLabs
    ? labMarkers.filter(m => scheduledLabs.includes(m.marker))
    : labMarkers

  const labIds: string[] = []
  const collectionDate = new Date().toISOString()

  for (const labMarker of markersToSimulate) {
    const value = Number(labMarker.generateValue().toFixed(2))

    // Determine if value is abnormal
    const [min, max] = labMarker.referenceRange.split('-').map(Number)
    let abnormalFlag: string | null = null
    if (value < min) abnormalFlag = 'L'
    else if (value > max) abnormalFlag = 'H'

    const { data: lab, error: labError } = await supabase
      .schema(SCHEMA)
      .from('lab_results')
      .insert({
        participant_id: participantId,
        timepoint,
        marker: labMarker.marker,
        value,
        unit: labMarker.unit,
        reference_range: labMarker.referenceRange,
        abnormal_flag: abnormalFlag,
        collection_date: collectionDate,
        received_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (!labError && lab) {
      labIds.push(lab.id)
    }
  }

  console.log(`[Demo] Simulated ${labIds.length} lab results for participant ${participantId} at ${timepoint}`)

  // Run safety evaluation for lab results
  const alerts = await evaluateLabSafety(participantId, timepoint, labIds)

  return { success: true, labIds, alerts }
}

/**
 * Evaluate lab results against safety thresholds
 * Creates alerts for abnormal values
 */
async function evaluateLabSafety(
  participantId: string,
  timepoint: string,
  labIds: string[]
): Promise<{ created: number; alerts: string[] }> {
  const supabase = await createClient()
  const alertMessages: string[] = []

  // Get the lab results we just created
  const { data: labs } = await supabase
    .schema(SCHEMA)
    .from('lab_results')
    .select('marker, value, unit, abnormal_flag')
    .in('id', labIds)

  if (!labs) return { created: 0, alerts: [] }

  // Define lab safety thresholds (TRT-specific)
  const labThresholds: Record<string, { high?: number; low?: number; action: string }> = {
    hematocrit: {
      high: 54, // >54% requires dose adjustment
      action: 'Hematocrit elevated - consider dose reduction or phlebotomy',
    },
    psa: {
      high: 4.0, // PSA >4 requires follow-up
      action: 'PSA elevated - recommend urological evaluation',
    },
    testosterone_total: {
      high: 1000, // Supratherapeutic
      low: 300, // Subtherapeutic
      action: 'Testosterone outside therapeutic range - consider dose adjustment',
    },
  }

  for (const lab of labs) {
    const threshold = labThresholds[lab.marker]
    if (!threshold) continue

    let shouldAlert = false
    let alertMessage = threshold.action

    if (threshold.high && lab.value > threshold.high) {
      shouldAlert = true
      alertMessage = `${lab.marker.replace('_', ' ')} HIGH (${lab.value} ${lab.unit}): ${threshold.action}`
    } else if (threshold.low && lab.value < threshold.low) {
      shouldAlert = true
      alertMessage = `${lab.marker.replace('_', ' ')} LOW (${lab.value} ${lab.unit}): ${threshold.action}`
    }

    if (shouldAlert) {
      // Create alert in database
      await supabase
        .schema(SCHEMA)
        .from('alerts')
        .insert({
          participant_id: participantId,
          type: 'lab_threshold',
          trigger_source: lab.marker,
          trigger_value: String(lab.value),
          threshold: threshold.high ? `>${threshold.high}` : `<${threshold.low}`,
          message: alertMessage,
          status: 'open',
        })

      alertMessages.push(alertMessage)
    }
  }

  if (alertMessages.length > 0) {
    console.log(`[Demo] Created ${alertMessages.length} lab safety alerts for participant ${participantId}`)
  }

  return { created: alertMessages.length, alerts: alertMessages }
}

/**
 * Get demo state for a participant
 * Useful for showing what actions are available
 */
export async function getDemoState(participantId: string): Promise<{
  currentWeek: number
  maxWeek: number
  canAdvance: boolean
  canSimulateLabs: boolean
  pendingLabs: string[]
  dueAssessments: string[]
}> {
  const supabase = await createClient()

  // Get participant
  const { data: participant } = await supabase
    .schema(SCHEMA)
    .from('participants')
    .select('id, study_id, current_week')
    .eq('id', participantId)
    .single()

  if (!participant) {
    return {
      currentWeek: 0,
      maxWeek: 0,
      canAdvance: false,
      canSimulateLabs: false,
      pendingLabs: [],
      dueAssessments: [],
    }
  }

  // Get study protocol for max week
  const { data: study } = await supabase
    .schema(SCHEMA)
    .from('studies')
    .select('protocol')
    .eq('id', participant.study_id)
    .single()

  const protocol = study?.protocol as { duration_weeks?: number } | null
  const maxWeek = protocol?.duration_weeks || 26

  // Get schedule
  const schedule = await getParticipantSchedule(participantId)

  // Get existing lab results
  const { data: existingLabs } = await supabase
    .schema(SCHEMA)
    .from('lab_results')
    .select('timepoint')
    .eq('participant_id', participantId)

  const existingLabTimepoints = new Set(existingLabs?.map(l => l.timepoint) || [])

  // Find timepoints with labs that haven't been simulated
  const pendingLabs = schedule?.timepoints
    .filter(tp => tp.labs && tp.labs.length > 0 && !existingLabTimepoints.has(tp.timepoint))
    .map(tp => tp.timepoint) || []

  // Find due assessments
  const dueAssessments = schedule?.timepoints
    .filter(tp => tp.status === 'due')
    .map(tp => tp.timepoint) || []

  return {
    currentWeek: participant.current_week,
    maxWeek,
    canAdvance: participant.current_week < maxWeek,
    canSimulateLabs: pendingLabs.length > 0,
    pendingLabs,
    dueAssessments,
  }
}
