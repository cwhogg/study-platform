import { createClient } from '@/lib/supabase/server'
import type { Study, StudyInsert, StudyUpdate } from './types'


/**
 * Create a new study
 */
export async function createStudy(data: StudyInsert): Promise<Study> {
  const supabase = await createClient()

  const { data: study, error } = await supabase
    
    .from('sp_studies')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create study: ${error.message}`)
  }

  return study as Study
}

/**
 * Get a study by ID
 */
export async function getStudy(id: string): Promise<Study | null> {
  const supabase = await createClient()

  const { data: study, error } = await supabase
    
    .from('sp_studies')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to get study: ${error.message}`)
  }

  return study as Study
}

/**
 * Update a study by ID
 */
export async function updateStudy(id: string, data: StudyUpdate): Promise<Study> {
  const supabase = await createClient()

  const { data: study, error } = await supabase
    
    .from('sp_studies')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update study: ${error.message}`)
  }

  return study as Study
}

/**
 * Get a study by invite code (study ID is used as invite code)
 */
export async function getStudyByInviteCode(code: string): Promise<Study | null> {
  // The invite code is the study ID in this implementation
  // In production, you might want a separate invite_code column
  return getStudy(code)
}

/**
 * Get all studies for a sponsor
 */
export async function getStudiesBySponsor(sponsorId: string): Promise<Study[]> {
  const supabase = await createClient()

  const { data: studies, error } = await supabase
    
    .from('sp_studies')
    .select()
    .eq('sponsor_id', sponsorId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to get studies: ${error.message}`)
  }

  return (studies || []) as Study[]
}

/**
 * Get study with participant count
 */
export async function getStudyWithStats(id: string): Promise<{
  study: Study
  stats: {
    total: number
    active: number
    completed: number
    withdrawn: number
  }
} | null> {
  const supabase = await createClient()

  // Get the study
  const { data: study, error: studyError } = await supabase
    
    .from('sp_studies')
    .select()
    .eq('id', id)
    .single()

  if (studyError) {
    if (studyError.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to get study: ${studyError.message}`)
  }

  // Get participant counts
  const { data: participants, error: participantsError } = await supabase
    
    .from('sp_participants')
    .select('status')
    .eq('study_id', id)

  if (participantsError) {
    throw new Error(`Failed to get participants: ${participantsError.message}`)
  }

  const stats = {
    total: participants?.length || 0,
    active: participants?.filter(p => p.status === 'active').length || 0,
    completed: participants?.filter(p => p.status === 'completed').length || 0,
    withdrawn: participants?.filter(p => p.status === 'withdrawn').length || 0,
  }

  return { study: study as Study, stats }
}

/**
 * Delete a study (admin only, typically soft delete in production)
 */
export async function deleteStudy(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    
    .from('sp_studies')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete study: ${error.message}`)
  }
}
