import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'


// Public endpoint to get study data for participants (enrollment flow)
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

    const supabase = await createClient()

    const { data: study, error: studyError } = await supabase
      
      .from('sp_studies')
      .select('id, name, intervention, status, enrollment_copy, config')
      .eq('id', studyId)
      .single()

    if (studyError || !study) {
      console.error('Failed to get study:', studyError)
      return NextResponse.json(
        { error: 'Study not found' },
        { status: 404 }
      )
    }

    // Only return active studies
    if (study.status !== 'active') {
      return NextResponse.json(
        { error: 'Study is not currently accepting participants' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      id: study.id,
      name: study.name,
      intervention: study.intervention,
      enrollmentCopy: study.enrollment_copy,
      durationWeeks: study.config?.duration_weeks || 26,
    })

  } catch (error) {
    console.error('Get study error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
