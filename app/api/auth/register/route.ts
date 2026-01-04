import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const SCHEMA = 'study_platform'

export async function POST(request: NextRequest) {
  try {
    const { email, password, studyId } = await request.json()

    if (!email || !password || !studyId) {
      return NextResponse.json(
        { error: 'Email, password, and studyId are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 1. Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // For demo, we'll handle verification differently
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/study/${studyId}/join/verify`,
      },
    })

    if (authError) {
      // Handle specific auth errors
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // 2. Check if study exists
    const { data: study, error: studyError } = await supabase
      .schema(SCHEMA)
      .from('studies')
      .select('id, status')
      .eq('id', studyId)
      .single()

    if (studyError || !study) {
      return NextResponse.json(
        { error: 'Study not found' },
        { status: 404 }
      )
    }

    // 3. Create participant record
    const { data: participant, error: participantError } = await supabase
      .schema(SCHEMA)
      .from('participants')
      .insert({
        study_id: studyId,
        user_id: authData.user.id,
        status: 'registered',
        current_week: 0,
      })
      .select()
      .single()

    if (participantError) {
      // If participant already exists, that's okay
      if (participantError.code === '23505') { // Unique violation
        return NextResponse.json({
          success: true,
          userId: authData.user.id,
          message: 'User already enrolled in this study',
        })
      }
      console.error('Failed to create participant:', participantError)
      return NextResponse.json(
        { error: 'Failed to enroll in study' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      participantId: participant.id,
      emailConfirmationRequired: !authData.user.email_confirmed_at,
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
