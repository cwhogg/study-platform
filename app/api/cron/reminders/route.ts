import { NextRequest, NextResponse } from 'next/server'
import { processReminders, sendSingleReminder } from '@/lib/operations/reminders'

/**
 * GET: Trigger reminder processing (called by cron or manually)
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Check for cron secret in production
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In production, require auth. In dev, allow without.
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    console.log('[Cron] Starting reminder processing')

    const result = await processReminders()

    console.log('[Cron] Reminder processing complete:', {
      processed: result.processed,
      sent: result.sent,
      skipped: result.skipped,
      errors: result.errors,
    })

    return NextResponse.json({
      success: true,
      ...result,
    })

  } catch (error) {
    console.error('[Cron] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * POST: Send a single reminder (for admin/demo use)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, timepoint, channel } = body

    if (!participantId || !timepoint) {
      return NextResponse.json(
        { error: 'Participant ID and timepoint are required' },
        { status: 400 }
      )
    }

    console.log(`[Cron] Sending single reminder to ${participantId} for ${timepoint}`)

    const result = await sendSingleReminder(
      participantId,
      timepoint,
      channel || 'email'
    )

    return NextResponse.json({
      success: result.sent,
      error: result.error,
    })

  } catch (error) {
    console.error('[Cron] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
