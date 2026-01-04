import { NextRequest, NextResponse } from 'next/server'
import { advanceParticipantTime } from '@/lib/operations/demo'

/**
 * POST: Advance participant to a specific week
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, toWeek } = body

    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      )
    }

    if (typeof toWeek !== 'number' || toWeek < 0) {
      return NextResponse.json(
        { error: 'Valid target week is required' },
        { status: 400 }
      )
    }

    console.log(`[Admin] Advancing participant ${participantId} to week ${toWeek}`)

    const result = await advanceParticipantTime(participantId, toWeek)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      previousWeek: result.previousWeek,
      currentWeek: result.currentWeek,
      schedule: result.schedule,
    })

  } catch (error) {
    console.error('[Admin] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
