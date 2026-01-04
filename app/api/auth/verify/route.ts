import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const SCHEMA = 'study_platform'

export async function POST(request: NextRequest) {
  try {
    const { email, token, type = 'signup' } = await request.json()

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Email and verification token are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify the OTP token
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as 'signup' | 'email',
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Verification failed' },
        { status: 400 }
      )
    }

    // Update the profile email_verified status
    const { error: profileError } = await supabase
      .schema(SCHEMA)
      .from('profiles')
      .update({ email_verified: true })
      .eq('id', data.user.id)

    if (profileError) {
      console.error('Failed to update profile:', profileError)
      // Don't fail the request - the auth verification was successful
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
