import { createClient } from '@/lib/supabase/server'
import type { Participant, ParticipantInsert, ParticipantStatus, ParticipantUpdate } from './types'


/**
 * Create a new participant (enrollment record)
 */
export async function createParticipant(
  studyId: string,
  userId: string,
  status: ParticipantStatus = 'registered'
): Promise<Participant> {
  const supabase = await createClient()

  const data: ParticipantInsert = {
    study_id: studyId,
    user_id: userId,
    status,
    current_week: 0,
  }

  const { data: participant, error } = await supabase
    
    .from('sp_participants')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create participant: ${error.message}`)
  }

  return participant as Participant
}

/**
 * Get a participant by ID
 */
export async function getParticipant(id: string): Promise<Participant | null> {
  const supabase = await createClient()

  const { data: participant, error } = await supabase
    
    .from('sp_participants')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get participant: ${error.message}`)
  }

  return participant as Participant
}

/**
 * Get participant by user ID and study ID
 */
export async function getParticipantByUser(
  studyId: string,
  userId: string
): Promise<Participant | null> {
  const supabase = await createClient()

  const { data: participant, error } = await supabase
    
    .from('sp_participants')
    .select()
    .eq('study_id', studyId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get participant: ${error.message}`)
  }

  return participant as Participant
}

/**
 * Update participant status
 */
export async function updateParticipantStatus(
  id: string,
  status: ParticipantStatus
): Promise<Participant> {
  const supabase = await createClient()

  const updateData: ParticipantUpdate = { status }

  // Set enrolled_at when transitioning to enrolled/active status
  if (status === 'enrolled' || status === 'active') {
    updateData.enrolled_at = new Date().toISOString()
  }

  const { data: participant, error } = await supabase
    
    .from('sp_participants')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update participant status: ${error.message}`)
  }

  return participant as Participant
}

/**
 * Advance participant to a specific week (for demo time advancement)
 */
export async function advanceParticipantWeek(
  id: string,
  week: number
): Promise<Participant> {
  const supabase = await createClient()

  const { data: participant, error } = await supabase
    
    .from('sp_participants')
    .update({ current_week: week })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to advance participant week: ${error.message}`)
  }

  return participant as Participant
}

/**
 * Update participant data
 */
export async function updateParticipant(
  id: string,
  data: ParticipantUpdate
): Promise<Participant> {
  const supabase = await createClient()

  const { data: participant, error } = await supabase
    
    .from('sp_participants')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update participant: ${error.message}`)
  }

  return participant as Participant
}

/**
 * Get all participants for a study
 */
export async function getParticipantsByStudy(studyId: string): Promise<Participant[]> {
  const supabase = await createClient()

  const { data: participants, error } = await supabase
    
    .from('sp_participants')
    .select()
    .eq('study_id', studyId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get participants: ${error.message}`)
  }

  return (participants || []) as Participant[]
}

/**
 * Get all studies a user is participating in
 */
export async function getParticipantsByUser(userId: string): Promise<Participant[]> {
  const supabase = await createClient()

  const { data: participants, error } = await supabase
    
    .from('sp_participants')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get participations: ${error.message}`)
  }

  return (participants || []) as Participant[]
}

/**
 * Save screening responses
 */
export async function saveScreeningResponses(
  id: string,
  responses: Array<{ questionId: string; answer: string | boolean | number }>
): Promise<Participant> {
  const supabase = await createClient()

  const { data: participant, error } = await supabase
    
    .from('sp_participants')
    .update({ screening_responses: responses })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save screening responses: ${error.message}`)
  }

  return participant as Participant
}

/**
 * Get participant with study details
 */
export async function getParticipantWithStudy(id: string): Promise<{
  participant: Participant
  study: { id: string; name: string; intervention: string; status: string }
} | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    
    .from('sp_participants')
    .select(`
      *,
      studies!inner (
        id,
        name,
        intervention,
        status
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get participant with study: ${error.message}`)
  }

  const { studies, ...participant } = data as Participant & {
    studies: { id: string; name: string; intervention: string; status: string }
  }

  return {
    participant: participant as Participant,
    study: studies
  }
}
