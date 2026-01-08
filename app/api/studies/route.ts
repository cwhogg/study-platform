import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { StudyProtocol, ComprehensionQuestion, StudyConfig } from '@/lib/db/types'
import { getBaseUrl, toTitleCase } from '@/lib/utils'

// Demo sponsor ID - consistent across all demo studies
const DEMO_SPONSOR_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_SPONSOR_EMAIL = 'demo-sponsor@study-platform.local'

// Hardcoded protocol template - will be replaced by AI generation
function generateProtocol(config: {
  intervention: string
  population: string
  treatmentStage: string
  primaryEndpoint: string
  secondaryEndpoints: string[]
  durationWeeks: number
}): StudyProtocol {
  return {
    population: getPopulationLabel(config.population),
    treatment_stage: getTreatmentStageLabel(config.treatmentStage),
    primary_endpoint: {
      name: getEndpointLabel(config.primaryEndpoint),
      timepoint: 'week_12',
    },
    secondary_endpoints: config.secondaryEndpoints.map(getEndpointLabel),
    duration_weeks: config.durationWeeks,
    inclusion_criteria: [
      { criterion: 'Male, 30-65 years', rationale: 'Typical TRT population', assessmentMethod: 'Self-report' },
      { criterion: 'Total T <300 ng/dL', rationale: 'Hypogonadism threshold', assessmentMethod: 'Lab confirmation' },
      { criterion: 'Initiating TRT', rationale: 'Study population', assessmentMethod: 'Self-report' },
      { criterion: 'Willing to complete assessments', rationale: 'Study compliance', assessmentMethod: 'Consent' },
    ],
    exclusion_criteria: [
      { criterion: 'Prior prostate cancer', rationale: 'Safety concern', assessmentMethod: 'Self-report' },
      { criterion: 'PSA >4.0 at baseline', rationale: 'Safety concern', assessmentMethod: 'Lab confirmation' },
      { criterion: 'Recent CV event (6 months)', rationale: 'Safety concern', assessmentMethod: 'Self-report' },
    ],
    instruments: {
      'phq-2': { name: 'PHQ-2', questions: 2 },
      'qadam': { name: 'qADAM', questions: 10 },
      'iief-5': { name: 'IIEF-5', questions: 5 },
    },
    schedule: {
      baseline: { week: 0, instruments: ['phq-2', 'qadam', 'iief-5'] },
      week_2: { week: 2, instruments: ['phq-2'] },
      week_4: { week: 4, instruments: ['phq-2', 'qadam'] },
      week_6: { week: 6, instruments: ['phq-2', 'qadam'], labs: true },
      week_8: { week: 8, instruments: ['phq-2', 'qadam'] },
      week_12: { week: 12, instruments: ['phq-2', 'qadam', 'iief-5'], labs: true },
      week_16: { week: 16, instruments: ['phq-2', 'qadam'] },
      week_20: { week: 20, instruments: ['phq-2', 'qadam'] },
      week_26: { week: 26, instruments: ['phq-2', 'qadam', 'iief-5'], labs: true },
    },
    safety_thresholds: {
      'phq-2': { threshold: 3, action: 'Trigger PHQ-9' },
      hematocrit: { threshold: 54, action: 'Alert coordinator' },
    },
  }
}

// Hardcoded consent document template
function generateConsentDocument(studyName: string, intervention: string, durationWeeks: number): string {
  return `# Informed Consent for Research Participation

## ${studyName}

### Purpose of the Study
You are being invited to participate in a research study about ${intervention}. The purpose of this study is to understand how ${intervention} affects symptoms like energy, mood, and quality of life over time.

### What You Will Be Asked To Do
If you agree to participate, you will:
- Complete short questionnaires about your symptoms every 2-4 weeks
- Have blood work done at baseline, 6 weeks, 12 weeks, and ${durationWeeks} weeks (same labs your doctor would order anyway)
- The study lasts ${Math.round(durationWeeks / 4)} months total

### Time Commitment
- Questionnaires take about 5 minutes each
- You'll complete 9 questionnaires over ${Math.round(durationWeeks / 4)} months

### Risks
This is an observational study. Your treatment does not change based on participation. The main risk is the time required to complete questionnaires.

### Benefits
You may not benefit directly, but your participation will help improve ${intervention} treatment for future patients.

### Confidentiality
Your responses are kept confidential. Data is stored securely and only study staff can access it. Results are reported in aggregate only.

### Voluntary Participation
Participation is voluntary. You can withdraw at any time without affecting your medical care.

### Questions
Contact the study coordinator at study@example.com with any questions.`
}

// Hardcoded comprehension questions
function generateComprehensionQuestions(durationWeeks: number): ComprehensionQuestion[] {
  const months = Math.round(durationWeeks / 4)
  return [
    {
      id: 1,
      question: 'How long does this study last?',
      correctAnswer: `${months} months`,
    },
    {
      id: 2,
      question: 'Can you withdraw from the study at any time?',
      correctAnswer: 'Yes',
    },
    {
      id: 3,
      question: 'What will you be asked to do?',
      correctAnswer: 'Complete questionnaires and have blood work done',
    },
    {
      id: 4,
      question: 'Will participating change your treatment?',
      correctAnswer: 'No',
    },
  ]
}

function getPopulationLabel(id: string): string {
  const labels: Record<string, string> = {
    'new_hypogonadal': 'Newly diagnosed hypogonadal men initiating TRT',
    'existing_trt': 'Existing TRT patients (6+ months)',
    'borderline': 'Men with borderline testosterone',
  }
  return labels[id] || id
}

function getTreatmentStageLabel(id: string): string {
  const labels: Record<string, string> = {
    'initiation': 'Treatment initiation',
    'optimization': 'Dose optimization',
    'maintenance': 'Maintenance',
  }
  return labels[id] || id
}

function getEndpointLabel(id: string): string {
  const labels: Record<string, string> = {
    'qadam': 'Symptom improvement (qADAM)',
    'iief5': 'Sexual function (IIEF-5)',
    'hba1c': 'Metabolic markers (HbA1c)',
    'sf36': 'Quality of life (SF-36)',
    'sexual_function': 'Sexual function (IIEF-5)',
    'mood': 'Mood/depression (PHQ-2/9)',
    'energy': 'Energy/fatigue',
    'body_composition': 'Body composition',
    'sleep': 'Sleep quality',
    'adherence': 'Treatment adherence',
    'satisfaction': 'Patient satisfaction',
  }
  return labels[id] || id
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      intervention,
      studyName: aiStudyName,
      studyDescription,
      population,
      treatmentStage,
      primaryEndpoint,
      secondaryEndpoints,
      duration,
      enrollmentCopy,
      protocol: aiProtocol,
      consentDocument: aiConsentDocument,
      comprehensionQuestions: aiComprehensionQuestions,
    } = body

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    const durationWeeks = parseInt(duration) || 26
    const secondaryEndpointsList = typeof secondaryEndpoints === 'string'
      ? secondaryEndpoints.split(',').filter(Boolean)
      : (secondaryEndpoints || [])

    // Use AI-generated study name if provided, otherwise generate default
    const studyName = aiStudyName || `${toTitleCase(intervention)} Outcomes Study`

    // Use AI-generated content when available, fall back to hardcoded templates
    const protocol = aiProtocol || generateProtocol({
      intervention,
      population: population || 'new_hypogonadal',
      treatmentStage: treatmentStage || 'initiation',
      primaryEndpoint: primaryEndpoint || 'qadam',
      secondaryEndpoints: secondaryEndpointsList,
      durationWeeks,
    })

    // Use AI-generated consent document when available
    const consentDocument = aiConsentDocument || generateConsentDocument(studyName, intervention, durationWeeks)

    // Use AI-generated comprehension questions when available
    const comprehensionQuestions = aiComprehensionQuestions || generateComprehensionQuestions(durationWeeks)

    // Create study config (includes description for display)
    const config: StudyConfig = {
      duration_weeks: durationWeeks,
      target_enrollment: 100,
      description: studyDescription || null,
    }

    let sponsorId: string
    let dbClient

    if (user) {
      // Use authenticated user
      sponsorId = user.id

      // Check if user has a profile - create one if not
      const { data: userProfile } = await supabase
        .from('sp_profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!userProfile) {
        // Profile doesn't exist - need service client to create it
        console.log('[Studies] User profile not found, creating one')
        try {
          const serviceClient = createServiceClient()
          const { error: profileError } = await serviceClient
            .from('sp_profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              role: 'sponsor',
            })

          if (profileError) {
            console.error('[Studies] Failed to create user profile:', profileError)
            return NextResponse.json(
              { error: 'Failed to create user profile. Please try again.' },
              { status: 500 }
            )
          }
          // Use service client for the study creation too since we just created the profile
          dbClient = serviceClient
        } catch (err) {
          console.error('[Studies] Service client error:', err)
          return NextResponse.json(
            { error: 'Unable to create user profile' },
            { status: 500 }
          )
        }
      } else {
        dbClient = supabase
      }
    } else {
      // Demo mode: use service client to bypass RLS
      console.log('[Studies] No authenticated user, using demo mode')

      try {
        const serviceClient = createServiceClient()

        // Check if demo sponsor profile exists
        const { data: existingProfile } = await serviceClient
          .from('sp_profiles')
          .select('id')
          .eq('id', DEMO_SPONSOR_ID)
          .single()

        if (!existingProfile) {
          console.log('[Studies] Creating demo sponsor user and profile')

          // Create demo auth user using Admin API
          const { data: authUser, error: authError } = await serviceClient.auth.admin.createUser({
            email: DEMO_SPONSOR_EMAIL,
            email_confirm: true,
            user_metadata: { role: 'sponsor', name: 'Demo Sponsor' },
          })

          if (authError) {
            // User might already exist - try to get them
            console.log('[Studies] Auth user creation failed, checking if exists:', authError.message)

            const { data: existingUser } = await serviceClient.auth.admin.listUsers()
            const demoUser = existingUser?.users?.find(u => u.email === DEMO_SPONSOR_EMAIL)

            if (demoUser) {
              // Update the demo sponsor ID to match existing user
              console.log('[Studies] Found existing demo user:', demoUser.id)

              // Check if their profile exists
              const { data: profile } = await serviceClient
                .from('sp_profiles')
                .select('id')
                .eq('id', demoUser.id)
                .single()

              if (!profile) {
                // Create profile for existing auth user
                await serviceClient
                  .from('sp_profiles')
                  .insert({
                    id: demoUser.id,
                    email: DEMO_SPONSOR_EMAIL,
                    role: 'sponsor',
                    first_name: 'Demo',
                    last_name: 'Sponsor',
                  })
              }

              sponsorId = demoUser.id
            } else {
              console.error('[Studies] Could not create or find demo user')
              return NextResponse.json(
                { error: 'Failed to set up demo mode' },
                { status: 500 }
              )
            }
          } else if (authUser?.user) {
            // New user created - ensure profile exists
            sponsorId = authUser.user.id

            // Give the trigger a moment to run
            await new Promise(resolve => setTimeout(resolve, 500))

            // Check if profile was created by trigger
            const { data: triggerProfile } = await serviceClient
              .from('sp_profiles')
              .select('id')
              .eq('id', sponsorId)
              .single()

            if (!triggerProfile) {
              // Trigger didn't create profile - create it manually
              console.log('[Studies] Creating profile manually for new demo user')
              const { error: createProfileError } = await serviceClient
                .from('sp_profiles')
                .insert({
                  id: sponsorId,
                  email: DEMO_SPONSOR_EMAIL,
                  role: 'sponsor',
                  first_name: 'Demo',
                  last_name: 'Sponsor',
                })

              if (createProfileError) {
                console.error('[Studies] Failed to create demo profile:', createProfileError)
                return NextResponse.json(
                  { error: 'Failed to set up demo mode' },
                  { status: 500 }
                )
              }
            } else {
              // Profile exists - just update the role
              await serviceClient
                .from('sp_profiles')
                .update({ role: 'sponsor', first_name: 'Demo', last_name: 'Sponsor' })
                .eq('id', sponsorId)
            }
          } else {
            return NextResponse.json(
              { error: 'Failed to create demo user' },
              { status: 500 }
            )
          }
        } else {
          sponsorId = existingProfile.id
        }

        dbClient = serviceClient
      } catch (serviceError) {
        console.error('[Studies] Service client error:', serviceError)
        return NextResponse.json(
          { error: 'Demo mode requires SUPABASE_SERVICE_ROLE_KEY' },
          { status: 500 }
        )
      }
    }

    // Insert study
    const { data: study, error: studyError } = await dbClient
      .from('sp_studies')
      .insert({
        sponsor_id: sponsorId,
        name: studyName,
        intervention,
        status: 'active',
        protocol,
        consent_document: consentDocument,
        comprehension_questions: comprehensionQuestions,
        enrollment_copy: enrollmentCopy || null,
        config,
      })
      .select()
      .single()

    if (studyError) {
      console.error('Failed to create study:', studyError)
      return NextResponse.json(
        { error: `Failed to create study: ${studyError.message}` },
        { status: 500 }
      )
    }

    // Generate invite link
    const inviteLink = `${getBaseUrl()}/study/${study.id}/join`

    return NextResponse.json({
      success: true,
      study: {
        id: study.id,
        name: study.name,
        intervention: study.intervention,
        status: study.status,
      },
      inviteLink,
    })

  } catch (error) {
    console.error('Study creation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// GET: List studies for current sponsor
export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: studies, error: studiesError } = await supabase
      .from('sp_studies')
      .select('id, name, intervention, status, created_at, config')
      .eq('sponsor_id', user.id)
      .order('created_at', { ascending: false })

    if (studiesError) {
      console.error('Failed to get studies:', studiesError)
      return NextResponse.json(
        { error: 'Failed to get studies' },
        { status: 500 }
      )
    }

    return NextResponse.json({ studies })

  } catch (error) {
    console.error('Get studies error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
