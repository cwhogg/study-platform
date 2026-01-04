import { NextRequest, NextResponse } from 'next/server'
import { callAgent } from '@/lib/agents/client'
import type {
  EnrollmentCopyInput,
  EnrollmentCopyOutput,
} from '@/lib/agents/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studyName,
      intervention,
      sponsor,
      durationWeeks,
      proceduresSummary,
      estimatedTimePerAssessment,
      primaryBenefit,
    } = body

    // Validate required fields
    if (!studyName || typeof studyName !== 'string') {
      return NextResponse.json(
        { error: 'Study name is required' },
        { status: 400 }
      )
    }

    if (!intervention || typeof intervention !== 'string') {
      return NextResponse.json(
        { error: 'Intervention is required' },
        { status: 400 }
      )
    }

    const duration = typeof durationWeeks === 'number'
      ? durationWeeks
      : parseInt(durationWeeks) || 26

    console.log(`[Enrollment Copy] Starting for: ${studyName}`)

    // Build input for enrollment agent
    const input: EnrollmentCopyInput = {
      studyName,
      intervention,
      sponsor: sponsor || 'Study Sponsor',
      durationWeeks: duration,
      proceduresSummary: proceduresSummary || `Short surveys every 2-4 weeks for ${Math.round(duration / 4)} months`,
      estimatedTimePerAssessment: estimatedTimePerAssessment || '5 minutes',
      primaryBenefit: primaryBenefit || `Help improve ${intervention} treatment for future patients`,
    }

    // Call the enrollment agent
    const result = await callAgent<EnrollmentCopyInput, EnrollmentCopyOutput>(
      'enrollment',
      input,
      { model: 'gpt-4o' }
    )

    if (!result.success) {
      console.error('[Enrollment Copy] Agent call failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to generate enrollment copy' },
        { status: 500 }
      )
    }

    console.log('[Enrollment Copy] Successfully generated enrollment copy')

    // Validate the response has expected structure
    const enrollmentCopy = result.data
    if (!enrollmentCopy) {
      return NextResponse.json(
        { error: 'Enrollment copy generation returned empty result' },
        { status: 500 }
      )
    }

    // Log summary of what was generated
    console.log('[Enrollment Copy] Summary:', {
      hasWelcome: !!enrollmentCopy.welcome,
      hasRegistration: !!enrollmentCopy.registration,
      hasVerification: !!enrollmentCopy.verification,
      hasPreConsent: !!enrollmentCopy.preConsent,
      hasConsentGuidance: !!enrollmentCopy.consentGuidance,
      hasComprehensionQuiz: !!enrollmentCopy.comprehensionQuiz,
      hasSignature: !!enrollmentCopy.signature,
      hasScreening: !!enrollmentCopy.screening,
      hasEligible: !!enrollmentCopy.eligible,
      hasIneligible: !!enrollmentCopy.ineligible,
      hasEnrollmentComplete: !!enrollmentCopy.enrollmentComplete,
    })

    return NextResponse.json({
      success: true,
      data: enrollmentCopy,
      usage: result.usage,
    })

  } catch (error) {
    console.error('[Enrollment Copy] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
