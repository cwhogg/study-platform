import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'


/**
 * GET: Fetch all studies and participants for admin dashboard
 */
export async function GET() {
  try {
    const supabase = createServiceClient()

    // Get all studies with participant counts
    const { data: studies, error: studiesError } = await supabase
      
      .from('sp_studies')
      .select('id, name, intervention, status')
      .order('created_at', { ascending: false })

    if (studiesError) {
      console.error('[Admin] Failed to fetch studies:', studiesError)
      return NextResponse.json(
        { error: 'Failed to fetch studies' },
        { status: 500 }
      )
    }

    // Get participant counts per study
    const { data: participantCounts } = await supabase
      
      .from('sp_participants')
      .select('study_id')

    const countsByStudy = new Map<string, number>()
    participantCounts?.forEach(p => {
      countsByStudy.set(p.study_id, (countsByStudy.get(p.study_id) || 0) + 1)
    })

    const studiesWithCounts = studies?.map(study => ({
      id: study.id,
      name: study.name,
      intervention: study.intervention,
      status: study.status,
      participantCount: countsByStudy.get(study.id) || 0,
    })) || []

    // Get all participants with profile info
    const { data: participants, error: participantsError } = await supabase
      
      .from('sp_participants')
      .select(`
        id,
        study_id,
        status,
        current_week,
        enrolled_at,
        user_id
      `)
      .order('created_at', { ascending: false })

    if (participantsError) {
      console.error('[Admin] Failed to fetch participants:', participantsError)
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      )
    }

    // Get profiles for participants
    const userIds = [...new Set(participants?.map(p => p.user_id) || [])]
    const { data: profiles } = await supabase
      
      .from('sp_profiles')
      .select('id, email, first_name')
      .in('id', userIds)

    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])
    const studiesMap = new Map(studies?.map(s => [s.id, s]) || [])

    const participantsWithDetails = participants?.map(participant => {
      const profile = profilesMap.get(participant.user_id)
      const study = studiesMap.get(participant.study_id)
      return {
        id: participant.id,
        studyId: participant.study_id,
        studyName: study?.name || 'Unknown Study',
        email: profile?.email || 'Unknown',
        firstName: profile?.first_name || null,
        status: participant.status,
        currentWeek: participant.current_week,
        enrolledAt: participant.enrolled_at,
      }
    }) || []

    return NextResponse.json({
      studies: studiesWithCounts,
      participants: participantsWithDetails,
    })

  } catch (error) {
    console.error('[Admin] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * DELETE: Delete a study by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studyId = searchParams.get('studyId')

    if (!studyId) {
      return NextResponse.json(
        { error: 'Study ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Delete the study (cascades to participants, submissions, etc.)
    const { error } = await supabase
      .from('sp_studies')
      .delete()
      .eq('id', studyId)

    if (error) {
      console.error('[Admin] Failed to delete study:', error)
      return NextResponse.json(
        { error: `Failed to delete study: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[Admin] Delete error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
