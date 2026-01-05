import { NextRequest, NextResponse } from 'next/server'
import { generateProtocol } from '@/lib/agents/client'
import type { ProtocolGenerationOutput } from '@/lib/agents/types'

/**
 * Validate that the generated protocol has sufficient safety monitoring
 */
function validateSafetyMonitoring(protocol: ProtocolGenerationOutput): string[] {
  const warnings: string[] = []

  const proAlerts = protocol.safetyMonitoring?.proAlerts || []
  const labThresholds = protocol.safetyMonitoring?.labThresholds || []

  // Must have at least 4 PRO alerts (PHQ-2, PHQ-9 x3, adverse events)
  if (proAlerts.length < 4) {
    warnings.push(`Safety monitoring may be insufficient: only ${proAlerts.length} PRO alerts (recommended minimum: 4)`)
  }

  // Must include PHQ-2 trigger
  const hasPhq2 = proAlerts.some(a => a.instrument?.toLowerCase().includes('phq-2') || a.instrument?.toLowerCase() === 'phq2')
  if (!hasPhq2) {
    warnings.push('Missing PHQ-2 depression screening alert')
  }

  // Must include PHQ-9 alerts
  const hasPhq9 = proAlerts.some(a => a.instrument?.toLowerCase().includes('phq-9') || a.instrument?.toLowerCase() === 'phq9')
  if (!hasPhq9) {
    warnings.push('Missing PHQ-9 depression escalation alerts')
  }

  // Check for adverse events monitoring
  const hasAdverseEvents = proAlerts.some(a =>
    a.instrument?.toLowerCase().includes('adverse') ||
    a.instrument?.toLowerCase().includes('ae')
  )
  if (!hasAdverseEvents) {
    warnings.push('Missing adverse events monitoring alert')
  }

  // Log lab threshold count (not a hard requirement for all interventions)
  if (labThresholds.length === 0) {
    warnings.push('No lab thresholds defined - verify if appropriate for this intervention')
  }

  return warnings
}

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
      labThresholds: protocol.safetyMonitoring?.labThresholds?.length ?? 0,
      proAlerts: protocol.safetyMonitoring?.proAlerts?.length ?? 0,
    })

    // Validate safety monitoring completeness
    const safetyWarnings = validateSafetyMonitoring(protocol)
    if (safetyWarnings.length > 0) {
      console.warn('[Protocol Generation] Safety monitoring warnings:', safetyWarnings)
    }

    return NextResponse.json({
      success: true,
      data: protocol,
      usage: result.usage,
      safetyWarnings: safetyWarnings.length > 0 ? safetyWarnings : undefined,
      ...(process.env.NODE_ENV === 'development' && { debug: result.debug }),
    })

  } catch (error) {
    console.error('[Protocol Generation] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
