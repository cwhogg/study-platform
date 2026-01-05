import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

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

    // In demo mode, auto-confirm email to skip verification step
    let emailConfirmed = !!authData.user.email_confirmed_at
    if (IS_DEMO_MODE && !emailConfirmed) {
      try {
        const serviceClient = createServiceClient()
        const { error: confirmError } = await serviceClient.auth.admin.updateUserById(
          authData.user.id,
          { email_confirm: true }
        )
        if (!confirmError) {
          emailConfirmed = true
          console.log('[Auth] Demo mode: Auto-confirmed email for', email)

          // Update profile email_verified status
          await serviceClient
            
            .from('sp_profiles')
            .update({ email_verified: true })
            .eq('id', authData.user.id)
        }
      } catch (err) {
        console.warn('[Auth] Failed to auto-confirm email in demo mode:', err)
        // Continue without auto-confirm - user can still verify manually
      }
    }

    // 2. Get service client for bypassing RLS
    let serviceClient
    try {
      serviceClient = createServiceClient()
    } catch {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    // 3. Check if study exists
    const { data: study, error: studyError } = await serviceClient
      .from('sp_studies')
      .select('id, status')
      .eq('id', studyId)
      .single()

    if (studyError || !study) {
      return NextResponse.json(
        { error: 'Study not found' },
        { status: 404 }
      )
    }

    // 4. Ensure profile exists (trigger may not have fired yet)
    const { data: existingProfile } = await serviceClient
      .from('sp_profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single()

    if (!existingProfile) {
      // Create profile manually if trigger hasn't fired
      const { error: profileError } = await serviceClient
        .from('sp_profiles')
        .insert({
          id: authData.user.id,
          email: email,
          role: 'participant',
        })

      if (profileError && profileError.code !== '23505') {
        console.error('Failed to create profile:', profileError)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }
    }

    // 5. Create participant record
    const { data: participant, error: participantError } = await serviceClient
      .from('sp_participants')
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
      emailConfirmationRequired: !emailConfirmed,
      demoMode: IS_DEMO_MODE,
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
