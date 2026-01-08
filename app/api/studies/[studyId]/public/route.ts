import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'


// Public endpoint to get study data for participants (enrollment flow)
// Uses service client to bypass RLS since this is public data
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

    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not configured')
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    const supabase = createServiceClient()

    const { data: study, error: studyError } = await supabase
      .from('sp_studies')
      .select('id, name, intervention, status, enrollment_copy, config, comprehension_questions, consent_document')
      .eq('id', studyId)
      .single()

    if (studyError) {
      console.error('[Public Study API] Database error:', studyError)
      // Check if it's a "not found" error vs other database errors
      if (studyError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Study not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Unable to load study. Please try again.' },
        { status: 500 }
      )
    }

    if (!study) {
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
      comprehensionQuestions: study.comprehension_questions,
      consentDocument: study.consent_document,
    })

  } catch (error) {
    console.error('Get study error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
