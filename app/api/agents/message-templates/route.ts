import { NextRequest, NextResponse } from 'next/server'
import { callAgent } from '@/lib/agents/client'
import type {
  MessageTemplateInput,
  MessageTemplatesOutput,
} from '@/lib/agents/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studyName,
      sponsor,
      schedule,
      durationWeeks,
      assessmentMinutes,
    } = body

    // Validate required fields
    if (!studyName || typeof studyName !== 'string') {
      return NextResponse.json(
        { error: 'Study name is required' },
        { status: 400 }
      )
    }

    const duration = typeof durationWeeks === 'number'
      ? durationWeeks
      : parseInt(durationWeeks) || 26

    const minutes = typeof assessmentMinutes === 'number'
      ? assessmentMinutes
      : parseInt(assessmentMinutes) || 5

    console.log(`[Message Templates] Starting for: ${studyName}`)

    // Build input for patient-communication agent
    const input: MessageTemplateInput = {
      studyName,
      sponsor: sponsor || 'Study Sponsor',
      schedule: schedule || [
        { timepoint: 'baseline', week: 0 },
        { timepoint: 'week_2', week: 2 },
        { timepoint: 'week_4', week: 4 },
      ],
      durationWeeks: duration,
      assessmentMinutes: minutes,
    }

    // Call the patient-communication agent
    const result = await callAgent<MessageTemplateInput, MessageTemplatesOutput>(
      'patient-communication',
      input,
      { model: 'gpt-4o' }
    )

    if (!result.success) {
      console.error('[Message Templates] Agent call failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to generate message templates' },
        { status: 500 }
      )
    }

    console.log('[Message Templates] Successfully generated templates')

    // Validate the response has expected structure
    const templates = result.data
    if (!templates) {
      return NextResponse.json(
        { error: 'Message template generation returned empty result' },
        { status: 500 }
      )
    }

    // Log summary of what was generated
    console.log('[Message Templates] Summary:', {
      hasReminders: !!templates.reminders,
      hasMilestones: !!templates.milestones,
      hasReEngagement: !!templates.reEngagement,
    })

    return NextResponse.json({
      success: true,
      data: templates,
      usage: result.usage,
    })

  } catch (error) {
    console.error('[Message Templates] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
