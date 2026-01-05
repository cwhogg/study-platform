import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/client'
import { emailTemplates } from '@/lib/email/templates'
import { getBaseUrl } from '@/lib/utils'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, studyId } = body

    if (!participantId || !studyId) {
      return NextResponse.json(
        { error: 'Participant ID and Study ID are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get participant
    const { data: participant, error: participantError } = await supabase
      
      .from('sp_participants')
      .select('id, user_id, status')
      .eq('id', participantId)
      .single()

    if (participantError || !participant) {
      console.error('[Enrollment] Participant not found:', participantError)
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Update participant status to enrolled
    const { error: updateError } = await supabase
      
      .from('sp_participants')
      .update({
        status: 'enrolled',
        enrolled_at: new Date().toISOString(),
      })
      .eq('id', participantId)

    if (updateError) {
      console.error('[Enrollment] Failed to update status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update enrollment status' },
        { status: 500 }
      )
    }

    // Get profile for email
    const { data: profile, error: profileError } = await supabase
      
      .from('sp_profiles')
      .select('email, first_name')
      .eq('id', participant.user_id)
      .single()

    if (profileError || !profile) {
      console.error('[Enrollment] Profile not found:', profileError)
      // Don't fail - enrollment is complete, just can't send email
      return NextResponse.json({
        success: true,
        emailSent: false,
        message: 'Enrollment complete but email could not be sent',
      })
    }

    // Get study name
    const { data: study, error: studyError } = await supabase
      
      .from('sp_studies')
      .select('id, name')
      .eq('id', studyId)
      .single()

    if (studyError || !study) {
      console.error('[Enrollment] Study not found:', studyError)
      return NextResponse.json({
        success: true,
        emailSent: false,
        message: 'Enrollment complete but email could not be sent',
      })
    }

    // Calculate next check-in date (2 weeks from now)
    const nextCheckIn = new Date()
    nextCheckIn.setDate(nextCheckIn.getDate() + 14)
    const nextCheckInDate = nextCheckIn.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    })

    // Build enrollment confirmation email
    const baseUrl = getBaseUrl()
    const { subject, html } = emailTemplates.enrollmentConfirmation({
      firstName: profile.first_name || 'there',
      studyName: study.name,
      nextCheckInDate,
      dashboardLink: `${baseUrl}/study/${studyId}/dashboard`,
    })

    // Send the email
    const emailResult = await sendEmail({
      to: profile.email,
      subject,
      html,
    })

    // Log the message
    const { error: messageError } = await supabase
      
      .from('sp_messages')
      .insert({
        participant_id: participantId,
        type: 'milestone',
        channel: 'email',
        template_id: 'enrolled',
        subject,
        body: 'Enrollment confirmation email',
        status: emailResult.success ? 'sent' : 'failed',
        external_id: emailResult.id || null,
        sent_at: emailResult.success ? new Date().toISOString() : null,
      })

    if (messageError) {
      console.error('[Enrollment] Failed to log message:', messageError)
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      messageId: emailResult.id,
    })

  } catch (error) {
    console.error('[Enrollment] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
