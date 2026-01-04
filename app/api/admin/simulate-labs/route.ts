import { NextRequest, NextResponse } from 'next/server'
import { simulateLabResults } from '@/lib/operations/demo'

/**
 * POST: Simulate lab results for a participant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, timepoint } = body

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

    console.log(`[Admin] Simulating labs for participant ${participantId} at ${timepoint}`)

    const result = await simulateLabResults(participantId, timepoint)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      labCount: result.labIds.length,
      labIds: result.labIds,
    })

  } catch (error) {
    console.error('[Admin] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
