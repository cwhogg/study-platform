import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET: Get study details with participant stats for sponsor dashboard
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studyId: string }> }
) {
  try {
    const { studyId } = await params

    if (!studyId) {
      return NextResponse.json(
        { error: 'Study ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get study details
    const { data: study, error: studyError } = await supabase
      .from('sp_studies')
      .select('id, name, intervention, status, config, created_at, protocol')
      .eq('id', studyId)
      .single()

    if (studyError || !study) {
      console.error('[Study Detail] Failed to get study:', studyError)
      return NextResponse.json(
        { error: 'Study not found' },
        { status: 404 }
      )
    }

    // Get participant counts by status
    const { data: participants, error: participantsError } = await supabase
      .from('sp_participants')
      .select('id, status, current_week, enrolled_at, user_id')
      .eq('study_id', studyId)

    if (participantsError) {
      console.error('[Study Detail] Failed to get participants:', participantsError)
    }

    const participantsList = participants || []

    // Calculate stats
    const stats = {
      enrolled: participantsList.length,
      active: participantsList.filter(p => p.status === 'active').length,
      completed: participantsList.filter(p => p.status === 'completed').length,
      withdrawn: participantsList.filter(p => p.status === 'withdrawn').length,
    }

    // Get participant details with emails for the table
    const userIds = [...new Set(participantsList.map(p => p.user_id))]
    const { data: profiles } = await supabase
      .from('sp_profiles')
      .select('id, email, first_name')
      .in('id', userIds)

    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])

    const participantsWithDetails = participantsList.map(p => {
      const profile = profilesMap.get(p.user_id)
      return {
        id: p.id,
        email: profile?.email || 'Unknown',
        firstName: profile?.first_name || null,
        status: p.status,
        currentWeek: p.current_week,
        enrolledAt: p.enrolled_at,
      }
    })

    // Extract duration from protocol or config
    const durationWeeks = study.protocol?.durationWeeks || study.config?.duration_weeks || 26

    return NextResponse.json({
      id: study.id,
      name: study.name,
      intervention: study.intervention,
      description: study.config?.description || null,
      status: study.status,
      duration: `${durationWeeks} weeks`,
      startDate: study.created_at ? new Date(study.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
      stats,
      participants: participantsWithDetails,
    })

  } catch (error) {
    console.error('[Study Detail] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
