import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { StudyProtocol, ComprehensionQuestion, StudyConfig } from '@/lib/db/types'

const SCHEMA = 'study_platform'

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
      population,
      treatmentStage,
      primaryEndpoint,
      secondaryEndpoints,
      duration,
    } = body

    if (!intervention) {
      return NextResponse.json(
        { error: 'Intervention is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      // For demo, create without user - in production, require auth
      console.log('No authenticated user, creating study without sponsor_id check')
    }

    const durationWeeks = parseInt(duration) || 26
    const secondaryEndpointsList = typeof secondaryEndpoints === 'string'
      ? secondaryEndpoints.split(',').filter(Boolean)
      : (secondaryEndpoints || [])

    // Generate study name
    const studyName = `${intervention} Outcomes Study`

    // Generate protocol
    const protocol = generateProtocol({
      intervention,
      population: population || 'new_hypogonadal',
      treatmentStage: treatmentStage || 'initiation',
      primaryEndpoint: primaryEndpoint || 'qadam',
      secondaryEndpoints: secondaryEndpointsList,
      durationWeeks,
    })

    // Generate consent document
    const consentDocument = generateConsentDocument(studyName, intervention, durationWeeks)

    // Generate comprehension questions
    const comprehensionQuestions = generateComprehensionQuestions(durationWeeks)

    // Create study config
    const config: StudyConfig = {
      duration_weeks: durationWeeks,
      target_enrollment: 100,
    }

    // For demo mode, use a placeholder sponsor_id if not authenticated
    // In production, this would require authentication
    const sponsorId = user?.id || '00000000-0000-0000-0000-000000000000'

    // Insert study
    const { data: study, error: studyError } = await supabase
      .schema(SCHEMA)
      .from('studies')
      .insert({
        sponsor_id: sponsorId,
        name: studyName,
        intervention,
        status: 'active',
        protocol,
        consent_document: consentDocument,
        comprehension_questions: comprehensionQuestions,
        config,
      })
      .select()
      .single()

    if (studyError) {
      console.error('Failed to create study:', studyError)
      return NextResponse.json(
        { error: 'Failed to create study' },
        { status: 500 }
      )
    }

    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/study/${study.id}/join`

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
      .schema(SCHEMA)
      .from('studies')
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
