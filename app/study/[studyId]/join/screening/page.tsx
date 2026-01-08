'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer } from '@/components/ui/MobileContainer'
import { Loader2 } from 'lucide-react'
import type { EnrollmentCopy } from '@/lib/db/types'

// Types for screening
interface ScreeningQuestion {
  id: string
  question: string
  type: 'date' | 'yes_no' | 'select'
  options?: string[]
  disqualifyingAnswer?: string | boolean
  source: 'inclusion' | 'exclusion' | 'general'
}

interface InclusionCriterion {
  criterion: string
  rationale: string
  assessmentMethod: string
}

interface ExclusionCriterion {
  criterion: string
  rationale: string
  assessmentMethod: string
}

interface Protocol {
  inclusionCriteria?: InclusionCriterion[]
  exclusionCriteria?: ExclusionCriterion[]
}

interface StudyData {
  name: string
  intervention: string
  durationWeeks: number
  enrollmentCopy: EnrollmentCopy | null
  protocol?: Protocol
}

// Default copy if none generated
const DEFAULT_ELIGIBLE = {
  headline: 'You\'re Eligible!',
  body: 'Great news! You qualify for this study. Let\'s capture how you\'re feeling before you start.',
  subtext: 'This baseline helps us measure your progress.',
  buttonText: 'Start Baseline Survey',
  estimatedTime: 'About 5 minutes',
}

// Convert inclusion criterion to screening question
function inclusionToQuestion(criterion: InclusionCriterion, index: number): ScreeningQuestion | null {
  const text = criterion.criterion.toLowerCase()

  // Skip criteria that can't be self-assessed
  if (criterion.assessmentMethod.toLowerCase().includes('lab')) {
    return null
  }

  // Try to convert to a yes/no question
  return {
    id: `inclusion_${index}`,
    question: `Do you meet this requirement: ${criterion.criterion}?`,
    type: 'yes_no',
    disqualifyingAnswer: false, // "No" disqualifies for inclusion criteria
    source: 'inclusion',
  }
}

// Convert exclusion criterion to screening question
function exclusionToQuestion(criterion: ExclusionCriterion, index: number): ScreeningQuestion | null {
  const text = criterion.criterion.toLowerCase()

  // Skip criteria that can't be self-assessed
  if (criterion.assessmentMethod.toLowerCase().includes('lab')) {
    return null
  }

  // Exclusion criteria are things that would disqualify someone
  return {
    id: `exclusion_${index}`,
    question: criterion.criterion.includes('?')
      ? criterion.criterion
      : `Do you have: ${criterion.criterion}?`,
    type: 'yes_no',
    disqualifyingAnswer: true, // "Yes" disqualifies for exclusion criteria
    source: 'exclusion',
  }
}

// Generate general study participation question
function generateParticipationQuestion(durationWeeks: number): ScreeningQuestion {
  const months = Math.round(durationWeeks / 4)
  return {
    id: 'willing_to_participate',
    question: `Are you willing to complete short surveys every 2-4 weeks for ${months} months?`,
    type: 'yes_no',
    disqualifyingAnswer: false, // "No" disqualifies
    source: 'general',
  }
}

// Fallback questions if no protocol criteria
function getFallbackQuestions(): ScreeningQuestion[] {
  return [
    {
      id: 'dob',
      question: 'What is your date of birth?',
      type: 'date',
      source: 'general',
    },
    {
      id: 'willing_to_participate',
      question: 'Are you willing to complete short surveys every 2-4 weeks for 6 months?',
      type: 'yes_no',
      disqualifyingAnswer: false,
      source: 'general',
    }
  ]
}

export default function ScreeningPage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [isLoading, setIsLoading] = useState(true)
  const [screeningQuestions, setScreeningQuestions] = useState<ScreeningQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [study, setStudy] = useState<StudyData | null>(null)

  // Fetch study and build screening questions
  useEffect(() => {
    async function fetchStudy() {
      try {
        const response = await fetch(`/api/studies/${studyId}/public`)
        if (response.ok) {
          const data: StudyData = await response.json()
          setStudy(data)

          // Build screening questions from protocol
          const questions: ScreeningQuestion[] = []

          // Add date of birth question first
          questions.push({
            id: 'dob',
            question: 'What is your date of birth?',
            type: 'date',
            source: 'general',
          })

          if (data.protocol?.inclusionCriteria || data.protocol?.exclusionCriteria) {
            // Convert exclusion criteria first (these are disqualifiers)
            if (data.protocol.exclusionCriteria) {
              for (let i = 0; i < data.protocol.exclusionCriteria.length; i++) {
                const q = exclusionToQuestion(data.protocol.exclusionCriteria[i], i)
                if (q) questions.push(q)
              }
            }

            // Convert key inclusion criteria (limit to avoid too many questions)
            if (data.protocol.inclusionCriteria) {
              let added = 0
              for (let i = 0; i < data.protocol.inclusionCriteria.length && added < 3; i++) {
                const criterion = data.protocol.inclusionCriteria[i]
                // Only add self-reportable criteria
                if (!criterion.assessmentMethod.toLowerCase().includes('lab')) {
                  const q = inclusionToQuestion(criterion, i)
                  if (q) {
                    questions.push(q)
                    added++
                  }
                }
              }
            }

            console.log('[Screening] Generated questions from protocol:', questions.length)
          } else {
            console.log('[Screening] No protocol criteria, using fallback')
          }

          // Always add participation willingness question at the end
          questions.push(generateParticipationQuestion(data.durationWeeks || 26))

          setScreeningQuestions(questions.length > 1 ? questions : getFallbackQuestions())
        } else {
          console.error('[Screening] Failed to fetch study')
          setScreeningQuestions(getFallbackQuestions())
        }
      } catch (err) {
        console.error('[Screening] Error fetching study:', err)
        setScreeningQuestions(getFallbackQuestions())
      }

      setIsLoading(false)
    }
    fetchStudy()
  }, [studyId])

  const eligibleCopy = study?.enrollmentCopy?.eligible || DEFAULT_ELIGIBLE

  const question = screeningQuestions[currentQuestion]
  const totalQuestions = screeningQuestions.length
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0

  const currentAnswer = question ? answers[question.id] : undefined
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== ''

  const checkEligibility = (questionId: string, answer: string | boolean): boolean => {
    const q = screeningQuestions.find(sq => sq.id === questionId)
    if (!q || q.disqualifyingAnswer === undefined) return true

    // For date of birth, check age (must be 18+)
    if (questionId === 'dob' && typeof answer === 'string') {
      const birthDate = new Date(answer)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age >= 18
    }

    return answer !== q.disqualifyingAnswer
  }

  const handleAnswer = (answer: string | boolean) => {
    if (!question) return

    const newAnswers = { ...answers, [question.id]: answer }
    setAnswers(newAnswers)

    // Check eligibility for this answer
    const isEligible = checkEligibility(question.id, answer)

    if (!isEligible) {
      // Immediately redirect to ineligible page
      router.push(`/study/${studyId}/join/ineligible`)
      return
    }

    // Auto-advance after a brief delay
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        // All questions answered and eligible
        handleComplete()
      }
    }, 300)
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push(`/study/${studyId}/join/baseline`)
  }

  const renderQuestion = () => {
    if (!question) return null

    switch (question.type) {
      case 'date':
        return (
          <div className="space-y-4">
            <input
              type="date"
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
              className="w-full px-4 py-4 border border-slate-200 bg-white text-slate-900 rounded-xl text-base focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] transition-shadow"
              style={{ minHeight: '52px' }}
            />
            {hasAnswer && (
              <button
                onClick={() => handleAnswer(currentAnswer as string)}
                className="w-full py-4 bg-[#1E40AF] text-white font-semibold rounded-xl active:bg-[#162d4a] transition-colors"
                style={{ minHeight: '52px' }}
              >
                Continue
              </button>
            )}
          </div>
        )

      case 'yes_no':
        return (
          <div className="space-y-3">
            <button
              onClick={() => handleAnswer(true)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                currentAnswer === true
                  ? 'border-[#1E40AF] bg-[#1E40AF]/10'
                  : 'border-slate-200 bg-white active:bg-slate-50'
              }`}
              style={{ minHeight: '56px' }}
            >
              <span className="font-medium text-slate-900">Yes</span>
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                currentAnswer === false
                  ? 'border-[#1E40AF] bg-[#1E40AF]/10'
                  : 'border-slate-200 bg-white active:bg-slate-50'
              }`}
              style={{ minHeight: '56px' }}
            >
              <span className="font-medium text-slate-900">No</span>
            </button>
          </div>
        )

      case 'select':
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  currentAnswer === option
                    ? 'border-[#1E40AF] bg-[#1E40AF]/10'
                    : 'border-slate-200 bg-white active:bg-slate-50'
                }`}
                style={{ minHeight: '56px' }}
              >
                <span className="font-medium text-slate-900">{option}</span>
              </button>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <MobileContainer centered className="bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#1E40AF] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading eligibility questions...</p>
        </div>
      </MobileContainer>
    )
  }

  if (isSubmitting) {
    return (
      <MobileContainer centered className="bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{eligibleCopy.headline}</h2>
          <p className="text-slate-600">{eligibleCopy.body}</p>
          {eligibleCopy.estimatedTime && (
            <p className="text-slate-600 text-sm mt-2">{eligibleCopy.estimatedTime}</p>
          )}
        </div>
      </MobileContainer>
    )
  }

  // No questions (shouldn't happen)
  if (!question) {
    return (
      <MobileContainer centered className="bg-white">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No eligibility questions available.</p>
          <button
            onClick={() => router.push(`/study/${studyId}/join/baseline`)}
            className="px-6 py-3 bg-[#1E40AF] text-white rounded-xl"
          >
            Continue
          </button>
        </div>
      </MobileContainer>
    )
  }

  return (
    <MobileContainer withBottomPadding className="pt-6 bg-white">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">ELIGIBILITY</span>
          <span className="text-sm text-slate-600">
            {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1E40AF] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          {question.question}
        </h2>
        {renderQuestion()}
      </div>
    </MobileContainer>
  )
}
