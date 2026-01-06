import { NextRequest, NextResponse } from 'next/server'
import { callAgent } from '@/lib/agents/client'
import type {
  SafetyGenerationInput,
  SafetyGenerationOutput,
  Instrument,
  RiskAssessment,
} from '@/lib/agents/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { intervention, interventionCategory, instruments, riskAssessment, labMarkers } = body

    // Validate required fields
    if (!intervention || typeof intervention !== 'string') {
      return NextResponse.json(
        { error: 'Intervention is required and must be a string' },
        { status: 400 }
      )
    }

    if (!instruments || !Array.isArray(instruments) || instruments.length === 0) {
      return NextResponse.json(
        { error: 'Instruments array is required and must not be empty' },
        { status: 400 }
      )
    }

    console.log(`[Safety Generation] Starting for: ${intervention}`)
    console.log(`[Safety Generation] Instruments: ${instruments.map((i: Instrument) => i.id).join(', ')}`)
    console.log(`[Safety Generation] Lab markers: ${labMarkers?.join(', ') || 'none'}`)

    // Build input for safety agent
    const input: SafetyGenerationInput = {
      intervention,
      interventionCategory: interventionCategory || 'pharmacological',
      instruments: instruments as Instrument[],
      riskAssessment: riskAssessment as RiskAssessment | undefined,
      labMarkers: labMarkers || [],
    }

    // Call the safety agent
    const result = await callAgent<SafetyGenerationInput, SafetyGenerationOutput>(
      'safety',
      input,
      { model: 'gpt-4o' }
    )

    if (!result.success) {
      console.error('[Safety Generation] Agent call failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to generate safety rules' },
        { status: 500 }
      )
    }

    // Validate the response has expected structure
    const safety = result.data
    if (!safety) {
      return NextResponse.json(
        { error: 'Safety generation returned empty result' },
        { status: 500 }
      )
    }

    // Validate proAlerts is present
    if (!safety.proAlerts || !Array.isArray(safety.proAlerts)) {
      console.error('[Safety Generation] Invalid response structure - missing proAlerts')
      return NextResponse.json(
        { error: 'Safety generation returned invalid result' },
        { status: 500 }
      )
    }

    // Log summary of what was generated
    console.log('[Safety Generation] Summary:', {
      proAlerts: safety.proAlerts.length,
      labThresholds: safety.labThresholds?.length ?? 0,
      hasCrisisProtocol: !!safety.crisisProtocol,
      adverseEventMonitoring: safety.adverseEventMonitoring?.enabled ?? false,
    })

    return NextResponse.json({
      success: true,
      data: safety,
      usage: result.usage,
      ...(process.env.NODE_ENV === 'development' && { debug: result.debug }),
    })

  } catch (error) {
    console.error('[Safety Generation] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
