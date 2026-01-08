import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Lazy initialize OpenAI client
let openaiClient: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

interface Criterion {
  criterion: string
  rationale: string
  assessmentMethod: string
}

interface ExpandRequest {
  action: 'expand'
  intervention: string
  type: 'inclusion' | 'exclusion'
  description: string
}

interface SuggestRequest {
  action: 'suggest'
  intervention: string
  type: 'inclusion' | 'exclusion'
  existingCriteria: Criterion[]
  count?: number
}

type CriteriaRequest = ExpandRequest | SuggestRequest

export async function POST(request: NextRequest) {
  try {
    const body: CriteriaRequest = await request.json()

    if (body.action === 'expand') {
      return handleExpand(body)
    } else if (body.action === 'suggest') {
      return handleSuggest(body)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "expand" or "suggest".' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Criteria API error:', error)
    return NextResponse.json(
      { error: 'Failed to process criteria request' },
      { status: 500 }
    )
  }
}

async function handleExpand(request: ExpandRequest): Promise<NextResponse> {
  const { intervention, type, description } = request

  if (!description?.trim()) {
    return NextResponse.json(
      { error: 'Description is required' },
      { status: 400 }
    )
  }

  const typeGuidance = type === 'inclusion'
    ? `INCLUSION CRITERIA REQUIREMENTS:
- Must be specific and measurable (not vague)
- Must be assessable from available data, self-report, or simple screening questions
- Should not be overly restrictive - aim to include the target population
- Focus on: demographics, diagnosis confirmation, treatment status, willingness to participate`
    : `EXCLUSION CRITERIA REQUIREMENTS:
- Focus on safety concerns for the specific intervention
- Include conditions that would confound study results
- Keep list practical and limited to truly necessary exclusions
- Consider: contraindications, recent medical events, conditions affecting outcomes, inability to comply`

  const prompt = `You are a clinical research expert helping design study criteria for an observational study.

Intervention: ${intervention}
Type: ${type} criterion

${typeGuidance}

User's brief description: "${description}"

Generate a complete criterion based on the user's description:
1. criterion: Refine into a clear, specific, measurable criterion statement using proper clinical language
2. rationale: Clinical justification explaining why this criterion matters for the study (1-2 sentences)
3. assessmentMethod: Practical method to verify this criterion. Choose from:
   - "Self-reported" (for demographics, symptoms, medical history)
   - "Lab confirmation" (for biomarkers, hormone levels)
   - "Medical history review" (for diagnoses, surgeries)
   - "Screening questionnaire" (for validated assessments)
   - "Consent process" (for willingness, understanding)

Return ONLY valid JSON in this exact format:
{
  "criterion": "...",
  "rationale": "...",
  "assessmentMethod": "..."
}`

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  })

  const content = completion.choices[0]?.message?.content?.trim()

  if (!content) {
    return NextResponse.json(
      { error: 'No response from AI' },
      { status: 500 }
    )
  }

  try {
    // Parse JSON, handling potential markdown code blocks
    let jsonContent = content
    if (content.startsWith('```')) {
      jsonContent = content.replace(/```json?\n?/g, '').replace(/```$/g, '').trim()
    }

    const criterion: Criterion = JSON.parse(jsonContent)
    return NextResponse.json(criterion)
  } catch {
    console.error('Failed to parse AI response:', content)
    return NextResponse.json(
      { error: 'Failed to parse AI response' },
      { status: 500 }
    )
  }
}

async function handleSuggest(request: SuggestRequest): Promise<NextResponse> {
  const { intervention, type, existingCriteria, count = 3 } = request

  const existingList = existingCriteria?.length > 0
    ? existingCriteria.map(c => `- ${c.criterion}`).join('\n')
    : 'None yet'

  const typeGuidance = type === 'inclusion'
    ? `INCLUSION CRITERIA REQUIREMENTS:
- Must be specific and measurable (not vague)
- Must be assessable from available data, self-report, or simple screening questions
- Should not be overly restrictive - aim to include the target population
- Common inclusion criteria: age range, diagnosis confirmation, treatment initiation status, ability to consent

SUGGESTED AREAS TO COVER for ${intervention}:
- Target demographic (age, sex if relevant)
- Confirmation of condition/indication
- Treatment status (new vs existing)
- Willingness/ability to complete study assessments`
    : `EXCLUSION CRITERIA REQUIREMENTS:
- Focus on safety concerns specific to ${intervention}
- Include conditions that would confound study results
- Keep list practical and limited to truly necessary exclusions
- Consider: contraindications from clinical literature, recent medical events, comorbidities affecting outcomes

SUGGESTED AREAS TO COVER for ${intervention}:
- Known contraindications for the intervention
- Recent major medical events (surgeries, hospitalizations)
- Conditions that could confound outcome measures
- Inability to comply with study requirements`

  const prompt = `You are a clinical research expert helping design study criteria for an observational study of ${intervention}.

${typeGuidance}

Existing ${type} criteria (avoid duplicates or very similar items):
${existingList}

Suggest ${count} additional ${type} criteria that would strengthen this study design.

For each criterion, provide:
1. criterion: A clear, specific, measurable criterion statement using proper clinical language
2. rationale: Clinical justification explaining why this criterion matters (1-2 sentences)
3. assessmentMethod: Choose from: "Self-reported", "Lab confirmation", "Medical history review", "Screening questionnaire", or "Consent process"

Return ONLY valid JSON as an array:
[
  { "criterion": "...", "rationale": "...", "assessmentMethod": "..." },
  ...
]`

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8,
    max_tokens: 1000,
  })

  const content = completion.choices[0]?.message?.content?.trim()

  if (!content) {
    return NextResponse.json(
      { error: 'No response from AI' },
      { status: 500 }
    )
  }

  try {
    // Parse JSON, handling potential markdown code blocks
    let jsonContent = content
    if (content.startsWith('```')) {
      jsonContent = content.replace(/```json?\n?/g, '').replace(/```$/g, '').trim()
    }

    const suggestions: Criterion[] = JSON.parse(jsonContent)
    return NextResponse.json({ suggestions })
  } catch {
    console.error('Failed to parse AI response:', content)
    return NextResponse.json(
      { error: 'Failed to parse AI response' },
      { status: 500 }
    )
  }
}
