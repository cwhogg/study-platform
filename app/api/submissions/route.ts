import { NextRequest, NextResponse } from 'next/server'
import { handleProSubmission, type ProResponse } from '@/lib/operations/pro-submission'
import { CRISIS_RESOURCES } from '@/lib/operations/safety'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      participantId,
      timepoint,
      instrumentId,
      responses,
      durationSeconds,
    } = body

    // Validate required fields
    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      )
    }

    if (!timepoint) {
      return NextResponse.json(
        { error: 'Timepoint is required' },
        { status: 400 }
      )
    }

    if (!instrumentId) {
      return NextResponse.json(
        { error: 'Instrument ID is required' },
        { status: 400 }
      )
    }

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Responses array is required' },
        { status: 400 }
      )
    }

    // Validate response format - preserve original value types
    // Values can be: number, string, array, or object depending on question type
    const validatedResponses: ProResponse[] = responses.map(r => ({
      questionId: r.questionId || r.id,
      value: r.value, // Preserve the original value type
    }))

    console.log(`[Submission] Processing ${instrumentId} for participant ${participantId}`)

    // Handle the submission
    const result = await handleProSubmission(
      participantId,
      timepoint,
      instrumentId,
      validatedResponses,
      durationSeconds
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to process submission' },
        { status: 500 }
      )
    }

    // Build response
    const response: {
      success: boolean
      submissionId?: string
      scores?: { total: number; [key: string]: number }
      showCrisisResources?: boolean
      crisisResources?: typeof CRISIS_RESOURCES
      triggerFollowUp?: string | null
      alerts?: number
    } = {
      success: true,
      submissionId: result.submissionId,
      scores: result.scores,
    }

    // Add safety information
    if (result.safety) {
      if (result.safety.showCrisisResources) {
        response.showCrisisResources = true
        response.crisisResources = CRISIS_RESOURCES
      }
      if (result.safety.triggerFollowUp) {
        response.triggerFollowUp = result.safety.triggerFollowUp
      }
      if (result.safety.alerts.length > 0) {
        response.alerts = result.safety.alerts.length
      }
    }

    console.log(`[Submission] Successfully processed, score: ${result.scores?.total}`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('[Submission] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
