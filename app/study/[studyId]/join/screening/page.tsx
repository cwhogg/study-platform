'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import type { EnrollmentCopy } from '@/lib/db/types'

interface ScreeningQuestion {
  id: string
  question: string
  type: 'date' | 'yes_no' | 'select'
  options?: string[]
  disqualifyingAnswer?: string | boolean
}

// Default copy if none generated
const DEFAULT_SCREENING = {
  headline: 'A Few Questions',
  intro: 'These help us confirm you\'re eligible for this study.',
  buttonText: 'Continue',
}

const DEFAULT_ELIGIBLE = {
  headline: 'You\'re Eligible!',
  body: 'Great news! You qualify for this study. Let\'s capture how you\'re feeling before you start treatment.',
  subtext: 'This baseline helps us measure your progress.',
  buttonText: 'Start Baseline Survey',
  estimatedTime: 'About 5 minutes',
}

interface StudyData {
  name: string
  intervention: string
  enrollmentCopy: EnrollmentCopy | null
}

const screeningQuestions: ScreeningQuestion[] = [
  {
    id: 'dob',
    question: 'What is your date of birth?',
    type: 'date'
  },
  {
    id: 'prostate_cancer',
    question: 'Have you ever been diagnosed with prostate cancer?',
    type: 'yes_no',
    disqualifyingAnswer: true
  },
  {
    id: 'recent_cv_event',
    question: 'Have you had a heart attack, stroke, or other major cardiovascular event in the past 6 months?',
    type: 'yes_no',
    disqualifyingAnswer: true
  },
  {
    id: 'trt_status',
    question: 'Which best describes your TRT status?',
    type: 'select',
    options: [
      'Just starting TRT (within past 2 weeks)',
      'Been on TRT for less than 3 months',
      'Been on TRT for 3-12 months',
      'Been on TRT for over 12 months'
    ],
    disqualifyingAnswer: 'Been on TRT for over 12 months'
  },
  {
    id: 'willing_to_complete',
    question: 'Are you willing to complete short surveys every 2-4 weeks for 6 months?',
    type: 'yes_no',
    disqualifyingAnswer: false
  }
]

export default function ScreeningPage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [study, setStudy] = useState<StudyData | null>(null)

  useEffect(() => {
    async function fetchStudy() {
      try {
        const response = await fetch(`/api/studies/${studyId}/public`)
        if (response.ok) {
          const data = await response.json()
          setStudy(data)
        }
      } catch (err) {
        console.error('Error fetching study:', err)
      }
    }
    fetchStudy()
  }, [studyId])

  const eligibleCopy = study?.enrollmentCopy?.eligible || DEFAULT_ELIGIBLE

  const question = screeningQuestions[currentQuestion]
  const totalQuestions = screeningQuestions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  const currentAnswer = answers[question.id]
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== ''

  const checkEligibility = (questionId: string, answer: string | boolean): boolean => {
    const q = screeningQuestions.find(sq => sq.id === questionId)
    if (!q || q.disqualifyingAnswer === undefined) return true

    // For date of birth, check age (must be 30-65)
    if (questionId === 'dob' && typeof answer === 'string') {
      const birthDate = new Date(answer)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age >= 30 && age <= 65
    }

    return answer !== q.disqualifyingAnswer
  }

  const handleAnswer = (answer: string | boolean) => {
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
                onClick={() => handleAnswer(currentAnswer)}
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
