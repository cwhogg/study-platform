import { NextRequest, NextResponse } from 'next/server'
import { callAgent } from '@/lib/agents/client'
import type {
  ConsentGenerationInput,
  ConsentGenerationOutput,
  ProtocolGenerationOutput,
} from '@/lib/agents/types'
import { toTitleCase } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { protocol, studyName, intervention, goal, durationWeeks, riskAssessment } = body

    // Validate required fields
    if (!protocol) {
      return NextResponse.json(
        { error: 'Protocol is required' },
        { status: 400 }
      )
    }

    if (!intervention || typeof intervention !== 'string') {
      return NextResponse.json(
        { error: 'Intervention is required and must be a string' },
        { status: 400 }
      )
    }

    const duration = typeof durationWeeks === 'number'
      ? durationWeeks
      : parseInt(durationWeeks) || 26

    const name = studyName || (goal
      ? `${toTitleCase(intervention)} for ${toTitleCase(goal)} Study`
      : `${toTitleCase(intervention)} Outcomes Study`)

    console.log(`[Consent Generation] Starting for: ${name}`)
    console.log(`[Consent Generation] Risk Assessment:`, JSON.stringify(riskAssessment, null, 2))

    // Build input for consent agent
    const input: ConsentGenerationInput = {
      protocol: protocol as ProtocolGenerationOutput,
      studyName: name,
      intervention,
      durationWeeks: duration,
      riskAssessment,  // Pass risk assessment to agent
    }

    // Call the consent-compliance agent
    const result = await callAgent<ConsentGenerationInput, ConsentGenerationOutput>(
      'consent-compliance',
      input,
      { model: 'gpt-4o' }
    )

    if (!result.success) {
      console.error('[Consent Generation] Agent call failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to generate consent document' },
        { status: 500 }
      )
    }

    console.log('[Consent Generation] Successfully generated consent materials')

    // Validate the response has expected structure
    const consent = result.data
    if (!consent) {
      return NextResponse.json(
        { error: 'Consent generation returned empty result' },
        { status: 500 }
      )
    }

    // Log summary of what was generated
    console.log('[Consent Generation] Summary:', {
      documentSections: consent.document?.sections?.length ?? 0,
      comprehensionQuestions: consent.comprehensionQuestions?.length ?? 0,
      hasSummary: !!consent.summary,
    })

    return NextResponse.json({
      success: true,
      data: consent,
      usage: result.usage,
      ...(process.env.NODE_ENV === 'development' && { debug: result.debug }),
    })

  } catch (error) {
    console.error('[Consent Generation] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
