'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer } from '@/components/ui/MobileContainer'
import { Button } from '@/components/ui/Button'
import { Loader2 } from 'lucide-react'
import type { EnrollmentCopy } from '@/lib/db/types'
import {
  buildScreeningQuestions,
  checkEligibility,
  getFallbackQuestions,
  type ScreeningQuestion,
  type Protocol,
} from '@/lib/study/screening'

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
  body: 'Great news! You qualify for this protocol. Let\'s capture how you\'re feeling before you start.',
  subtext: 'This baseline helps us measure your progress.',
  buttonText: 'Start Baseline Survey',
  estimatedTime: 'About 5 minutes',
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

          // Build screening questions from protocol using lib function
          const questions = buildScreeningQuestions(
            data.protocol,
            data.durationWeeks || 26
          )
          console.log('[Screening] Generated questions:', questions.length)
          setScreeningQuestions(questions)
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

  const handleAnswer = (answer: string | boolean) => {
    if (!question) return

    const newAnswers = { ...answers, [question.id]: answer }
    setAnswers(newAnswers)

    // Check eligibility for this answer using lib function
    const isEligible = checkEligibility(question.id, answer, screeningQuestions)

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
              className="w-full px-4 py-4 border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-primary)] rounded-xl text-base focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
              style={{ minHeight: '52px' }}
            />
            {hasAnswer && (
              <Button
                onClick={() => handleAnswer(currentAnswer as string)}
                fullWidth
              >
                Continue
              </Button>
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
                  ? 'border-[var(--primary)] bg-[var(--primary-dim)]'
                  : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)]'
              }`}
              style={{ minHeight: '56px' }}
            >
              <span className={`font-medium ${currentAnswer === true ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>Yes</span>
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                currentAnswer === false
                  ? 'border-[var(--primary)] bg-[var(--primary-dim)]'
                  : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)]'
              }`}
              style={{ minHeight: '56px' }}
            >
              <span className={`font-medium ${currentAnswer === false ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>No</span>
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
                    ? 'border-[var(--primary)] bg-[var(--primary-dim)]'
                    : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)]'
                }`}
                style={{ minHeight: '56px' }}
              >
                <span className={`font-medium ${currentAnswer === option ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>{option}</span>
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
      <MobileContainer centered>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading eligibility questions...</p>
        </div>
      </MobileContainer>
    )
  }

  if (isSubmitting) {
    return (
      <MobileContainer centered>
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--success)]/15 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--success)]/30">
            <svg className="w-8 h-8 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{eligibleCopy.headline}</h2>
          <p className="text-[var(--text-secondary)]">{eligibleCopy.body}</p>
          {eligibleCopy.estimatedTime && (
            <p className="text-[var(--text-muted)] text-sm mt-2">{eligibleCopy.estimatedTime}</p>
          )}
        </div>
      </MobileContainer>
    )
  }

  // No questions (shouldn't happen)
  if (!question) {
    return (
      <MobileContainer centered>
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">No eligibility questions available.</p>
          <Button onClick={() => router.push(`/study/${studyId}/join/baseline`)}>
            Continue
          </Button>
        </div>
      </MobileContainer>
    )
  }

  return (
    <MobileContainer withBottomPadding className="pt-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">Eligibility</span>
          <span className="text-sm text-[var(--text-muted)] font-mono">
            {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        <div className="h-2 bg-[var(--glass-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
          {question.question}
        </h2>
        {renderQuestion()}
      </div>
    </MobileContainer>
  )
}
