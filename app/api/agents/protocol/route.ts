import { NextRequest, NextResponse } from 'next/server'
import { generateProtocol } from '@/lib/agents/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      intervention,
      population,
      treatmentStage,
      primaryEndpoint,
      secondaryEndpoints,
      durationWeeks,
    } = body

    // Validate required fields
    if (!intervention || typeof intervention !== 'string') {
      return NextResponse.json(
        { error: 'Intervention is required and must be a string' },
        { status: 400 }
      )
    }

    if (!population || typeof population !== 'string') {
      return NextResponse.json(
        { error: 'Population is required and must be a string' },
        { status: 400 }
      )
    }

    if (!treatmentStage || typeof treatmentStage !== 'string') {
      return NextResponse.json(
        { error: 'Treatment stage is required and must be a string' },
        { status: 400 }
      )
    }

    if (!primaryEndpoint || typeof primaryEndpoint !== 'string') {
      return NextResponse.json(
        { error: 'Primary endpoint is required and must be a string' },
        { status: 400 }
      )
    }

    // Ensure secondaryEndpoints is an array
    const endpoints = Array.isArray(secondaryEndpoints)
      ? secondaryEndpoints
      : typeof secondaryEndpoints === 'string'
        ? secondaryEndpoints.split(',').filter(Boolean)
        : []

    // Default duration to 26 weeks if not provided
    const duration = typeof durationWeeks === 'number'
      ? durationWeeks
      : parseInt(durationWeeks) || 26

    console.log(`[Protocol Generation] Starting for: ${intervention}`)
    console.log(`[Protocol Generation] Config:`, {
      population,
      treatmentStage,
      primaryEndpoint,
      secondaryEndpoints: endpoints,
      durationWeeks: duration,
    })

    // Call the clinical-protocol agent with generate task
    const result = await generateProtocol({
      intervention,
      population,
      treatmentStage,
      primaryEndpoint,
      secondaryEndpoints: endpoints,
      durationWeeks: duration,
    })

    if (!result.success) {
      console.error('[Protocol Generation] Agent call failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to generate protocol' },
        { status: 500 }
      )
    }

    console.log('[Protocol Generation] Successfully generated protocol')

    // Validate the response has expected structure
    const protocol = result.data
    if (!protocol) {
      return NextResponse.json(
        { error: 'Protocol generation returned empty result' },
        { status: 500 }
      )
    }

    // Log summary of what was generated
    console.log('[Protocol Generation] Summary:', {
      inclusionCriteria: protocol.inclusionCriteria?.length ?? 0,
      exclusionCriteria: protocol.exclusionCriteria?.length ?? 0,
      instruments: protocol.instruments?.length ?? 0,
      scheduleTimepoints: protocol.schedule?.length ?? 0,
      hasLabThresholds: (protocol.safetyMonitoring?.labThresholds?.length ?? 0) > 0,
      hasProAlerts: (protocol.safetyMonitoring?.proAlerts?.length ?? 0) > 0,
    })

    return NextResponse.json({
      success: true,
      data: protocol,
      usage: result.usage,
    })

  } catch (error) {
    console.error('[Protocol Generation] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
