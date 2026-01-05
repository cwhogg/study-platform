import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/client'
import { buildEmail, renderTemplate, TemplateVariables } from '@/lib/email/templates'
import { getBaseUrl } from '@/lib/utils'


interface SendEmailRequest {
  participantId: string
  templateType: 'milestone' | 'reminder' | 'reEngagement'
  templateKey: string
  variables?: TemplateVariables
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json()
    const { participantId, templateType, templateKey, variables = {} } = body

    // Validate required fields
    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      )
    }

    if (!templateType || !templateKey) {
      return NextResponse.json(
        { error: 'Template type and key are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get participant with profile and study
    const { data: participant, error: participantError } = await supabase
      
      .from('sp_participants')
      .select(`
        id,
        user_id,
        study_id
      `)
      .eq('id', participantId)
      .single()

    if (participantError || !participant) {
      console.error('[Email] Participant not found:', participantError)
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Get profile (email and name)
    const { data: profile, error: profileError } = await supabase
      
      .from('sp_profiles')
      .select('email, first_name')
      .eq('id', participant.user_id)
      .single()

    if (profileError || !profile) {
      console.error('[Email] Profile not found:', profileError)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get study with message templates
    const { data: study, error: studyError } = await supabase
      
      .from('sp_studies')
      .select('id, name, message_templates')
      .eq('id', participant.study_id)
      .single()

    if (studyError || !study) {
      console.error('[Email] Study not found:', studyError)
      return NextResponse.json(
        { error: 'Study not found' },
        { status: 404 }
      )
    }

    // Get the template
    const templates = study.message_templates as Record<string, unknown> | null
    if (!templates) {
      return NextResponse.json(
        { error: 'No message templates found for study' },
        { status: 404 }
      )
    }

    // Navigate to the correct template
    const templateSection = templates[templateType] as Record<string, unknown> | undefined
    if (!templateSection) {
      return NextResponse.json(
        { error: `Template type '${templateType}' not found` },
        { status: 404 }
      )
    }

    const template = templateSection[templateKey] as { email?: { subject: string; body: string } } | undefined
    if (!template?.email) {
      return NextResponse.json(
        { error: `Template '${templateKey}' not found in '${templateType}'` },
        { status: 404 }
      )
    }

    // Build the email
    const baseUrl = getBaseUrl()
    const allVariables: TemplateVariables = {
      firstName: profile.first_name || 'there',
      studyName: study.name,
      link: `${baseUrl}/study/${study.id}/dashboard`,
      unsubscribeLink: `${baseUrl}/unsubscribe`,
      preferencesLink: `${baseUrl}/preferences`,
      ...variables,
    }

    const { subject, html } = buildEmail(
      template.email.subject,
      template.email.body,
      allVariables
    )

    // Send the email
    const result = await sendEmail({
      to: profile.email,
      subject,
      html,
    })

    if (!result.success) {
      // Log failed message
      await supabase
        
        .from('sp_messages')
        .insert({
          participant_id: participantId,
          type: templateType === 'milestone' ? 'milestone' : 'reminder',
          channel: 'email',
          template_id: templateKey,
          subject,
          body: template.email.body,
          status: 'failed',
        })

      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    // Log successful message
    const { error: messageError } = await supabase
      
      .from('sp_messages')
      .insert({
        participant_id: participantId,
        type: templateType === 'milestone' ? 'milestone' : 'reminder',
        channel: 'email',
        template_id: templateKey,
        subject,
        body: template.email.body,
        status: 'sent',
        external_id: result.id,
        sent_at: new Date().toISOString(),
      })

    if (messageError) {
      console.error('[Email] Failed to log message:', messageError)
      // Don't fail the request, email was sent successfully
    }

    return NextResponse.json({
      success: true,
      messageId: result.id,
    })

  } catch (error) {
    console.error('[Email] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
