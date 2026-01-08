import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, studyId } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }
      if (authError.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Please verify your email before signing in' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to sign in' },
        { status: 500 }
      )
    }

    // If studyId provided, check enrollment status
    let isEnrolled = false
    let participantStatus: string | null = null

    if (studyId) {
      try {
        const serviceClient = createServiceClient()

        const { data: participant } = await serviceClient
          .from('sp_participants')
          .select('id, status')
          .eq('study_id', studyId)
          .eq('user_id', authData.user.id)
          .single()

        if (participant) {
          isEnrolled = true
          participantStatus = participant.status
        }
      } catch {
        // Service client not available - continue without enrollment check
      }
    }

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
      isEnrolled,
      participantStatus,
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
