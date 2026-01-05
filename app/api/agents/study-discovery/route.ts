import { NextRequest, NextResponse } from 'next/server'
import { discoverStudy } from '@/lib/agents/client'
import type { DiscoveryOutput } from '@/lib/agents/types'

// Default fallback data if AI fails or returns incomplete data
const DEFAULT_DISCOVERY: DiscoveryOutput = {
  intervention: '',
  summary: 'This intervention is being studied for its effects on patient outcomes.',
  endpoints: [
    { name: 'Symptom improvement', domain: 'physical', suggestedInstrument: 'Custom questionnaire', confidence: 'moderate', rationale: 'Primary outcome measure' },
    { name: 'Quality of life', domain: 'general', suggestedInstrument: 'SF-36 or similar', confidence: 'high', rationale: 'Validated general measure' },
    { name: 'Mood/depression', domain: 'mental', suggestedInstrument: 'PHQ-9', confidence: 'high', rationale: 'Standard depression screening' },
    { name: 'Energy/fatigue', domain: 'physical', suggestedInstrument: 'FACIT-Fatigue', confidence: 'moderate', rationale: 'Common symptom to track' },
    { name: 'Patient satisfaction', domain: 'satisfaction', suggestedInstrument: 'Custom survey', confidence: 'moderate', rationale: 'Patient experience metric' },
  ],
  populations: [
    { name: 'Newly diagnosed patients initiating treatment', description: 'Treatment-naive or >12 month gap since prior treatment' },
    { name: 'Existing patients on treatment (6+ months)', description: 'Currently on stable therapy' },
    { name: 'Patients considering treatment', description: 'Meeting criteria but not yet started' },
  ],
  treatmentStages: [
    { name: 'Treatment initiation', description: 'First weeks/months of therapy' },
    { name: 'Dose optimization', description: 'Adjusting to find optimal dosing' },
    { name: 'Maintenance', description: 'Long-term stable treatment' },
  ],
  recommendedDuration: {
    weeks: 26,
    rationale: 'Six months provides adequate time to observe clinical response and durability of effects.',
  },
  riskAssessment: {
    interventionCategory: 'pharmacological',
    fdaApprovalStatus: {
      approved: true,
      indications: ['Various conditions - specific indications depend on intervention'],
    },
    knownRisks: [
      { risk: 'Side effects may occur', severity: 'moderate', frequency: 'varies by individual' },
      { risk: 'Drug interactions possible', severity: 'moderate', mitigation: 'Review with healthcare provider' },
    ],
    contraindications: ['Known hypersensitivity to intervention components'],
    warnings: ['Review complete prescribing information before use'],
    overallRiskLevel: 'moderate',
    riskSummary: 'This intervention may have side effects. Please review the full informed consent for complete risk information. Discuss any concerns with your healthcare provider.',
    dataSources: ['General clinical guidelines'],
  },
  safetyConsiderations: [
    'Monitor for adverse reactions',
    'Track patient-reported symptoms',
    'Include depression screening at all timepoints',
  ],
  dataSources: ['Clinical evidence', 'Standard practice guidelines'],
}

export async function POST(request: NextRequest) {
  try {
    const { intervention } = await request.json()

    if (!intervention || typeof intervention !== 'string') {
      return NextResponse.json(
        { error: 'Intervention is required and must be a string' },
        { status: 400 }
      )
    }

    console.log(`[Study Discovery] Starting discovery for: ${intervention}`)

    // Call the clinical-protocol agent with discover task
    const result = await discoverStudy(intervention)

    if (!result.success) {
      console.error('[Study Discovery] Agent call failed:', result.error)
      // Return fallback data instead of error so user can still proceed
      console.log('[Study Discovery] Using fallback data')
      const fallbackData = { ...DEFAULT_DISCOVERY, intervention }
      return NextResponse.json({
        success: true,
        data: fallbackData,
        fallback: true,
      })
    }

    // Ensure the response has all required fields with proper structure
    const data = (result.data || {}) as Partial<DiscoveryOutput>
    const mergedData: DiscoveryOutput = {
      intervention: data.intervention || intervention,
      summary: data.summary || DEFAULT_DISCOVERY.summary,
      endpoints: Array.isArray(data.endpoints) && data.endpoints.length > 0
        ? data.endpoints
        : DEFAULT_DISCOVERY.endpoints,
      populations: Array.isArray(data.populations) && data.populations.length > 0
        ? data.populations
        : DEFAULT_DISCOVERY.populations,
      treatmentStages: Array.isArray(data.treatmentStages) && data.treatmentStages.length > 0
        ? data.treatmentStages
        : DEFAULT_DISCOVERY.treatmentStages,
      recommendedDuration: data.recommendedDuration || DEFAULT_DISCOVERY.recommendedDuration,
      riskAssessment: data.riskAssessment && data.riskAssessment.interventionCategory
        ? data.riskAssessment
        : DEFAULT_DISCOVERY.riskAssessment,
      safetyConsiderations: Array.isArray(data.safetyConsiderations) && data.safetyConsiderations.length > 0
        ? data.safetyConsiderations
        : DEFAULT_DISCOVERY.safetyConsiderations,
      dataSources: Array.isArray(data.dataSources) && data.dataSources.length > 0
        ? data.dataSources
        : DEFAULT_DISCOVERY.dataSources,
    }

    console.log('[Study Discovery] Successfully generated options')
    console.log('[Study Discovery] Endpoints:', mergedData.endpoints.length)
    console.log('[Study Discovery] Populations:', mergedData.populations.length)
    console.log('[Study Discovery] Treatment stages:', mergedData.treatmentStages.length)

    return NextResponse.json({
      success: true,
      data: mergedData,
      usage: result.usage,
      debug: result.debug,  // Include prompt/response debug info
    })

  } catch (error) {
    console.error('[Study Discovery] Unexpected error:', error)
    // Return fallback data instead of error
    const { intervention } = await request.clone().json().catch(() => ({ intervention: 'Unknown' }))
    const fallbackData = { ...DEFAULT_DISCOVERY, intervention: intervention || 'Unknown' }
    return NextResponse.json({
      success: true,
      data: fallbackData,
      fallback: true,
    })
  }
}
