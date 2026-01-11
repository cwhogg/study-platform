'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer } from '@/components/ui/MobileContainer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowRight } from 'lucide-react'
import {
  getBaselineInstruments,
  groupAnswersByInstrument,
  FALLBACK_INSTRUMENTS,
  type Instrument,
  type Protocol,
} from '@/lib/study/instruments'

interface StudyData {
  name: string
  intervention: string
  protocol?: Protocol
}

export default function BaselinePage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [isLoading, setIsLoading] = useState(true)
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | string>>({})
  const [textInput, setTextInput] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [startTime] = useState(() => Date.now())

  // Flatten questions from instruments
  const allQuestions = instruments.flatMap(instrument =>
    instrument.questions.map(question => ({
      ...question,
      instrumentId: instrument.id,
      instrumentName: instrument.name,
      instructions: instrument.instructions
    }))
  )

  // Fetch study data and instruments
  useEffect(() => {
    async function fetchStudyAndParticipant() {
      try {
        // Fetch study data including protocol
        const response = await fetch(`/api/studies/${studyId}/public`)
        if (response.ok) {
          const data: StudyData = await response.json()

          // Get baseline instruments using lib function
          const studyInstruments = getBaselineInstruments(data.protocol)

          if (studyInstruments.length > 0) {
            console.log('[Baseline] Using protocol instruments:', studyInstruments.map(i => i.id))
            setInstruments(studyInstruments)
          } else {
            console.log('[Baseline] No valid protocol instruments, using fallback')
            setInstruments(FALLBACK_INSTRUMENTS)
          }
        } else {
          console.error('[Baseline] Failed to fetch study')
          setInstruments(FALLBACK_INSTRUMENTS)
        }
      } catch (error) {
        console.error('[Baseline] Error fetching study:', error)
        setInstruments(FALLBACK_INSTRUMENTS)
      }

      // Get participant ID
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: participant } = await supabase
          .from('sp_participants')
          .select('id')
          .eq('user_id', user.id)
          .eq('study_id', studyId)
          .maybeSingle()

        if (participant) {
          setParticipantId(participant.id)
        }
      }

      setIsLoading(false)
    }

    fetchStudyAndParticipant()
  }, [studyId])

  const question = allQuestions[currentQuestion]
  const totalQuestions = allQuestions.length
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0

  // Check if we need to show instructions for a new instrument
  const prevQuestion = currentQuestion > 0 ? allQuestions[currentQuestion - 1] : null
  const isNewInstrument = !prevQuestion || prevQuestion.instrumentId !== question?.instrumentId

  useEffect(() => {
    if (isNewInstrument && question) {
      setShowInstructions(true)
    }
  }, [currentQuestion, isNewInstrument, question])

  // Submit baseline data to API
  const submitBaseline = useCallback(async (finalAnswers: Record<string, number | string>) => {
    if (!participantId) {
      console.error('No participant ID')
      return
    }

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000)

    // Group answers by instrument using lib function
    const answersByInstrument = groupAnswersByInstrument(finalAnswers, allQuestions)

    // Submit each instrument
    for (const [instrumentId, responses] of answersByInstrument) {
      try {
        const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId,
            timepoint: 'baseline',
            instrumentId,
            responses,
            durationSeconds
          })
        })

        if (!response.ok) {
          const data = await response.json()
          console.error('Submission failed:', data.error)
        } else {
          console.log(`Submitted ${instrumentId} for baseline`)
        }
      } catch (error) {
        console.error('Submission error:', error)
      }
    }
  }, [participantId, startTime, allQuestions])

  const handleAnswer = async (value: number | string) => {
    if (isTransitioning || !question) return

    // Reset text input when moving to next question
    setTextInput('')
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)
    setIsTransitioning(true)

    // Brief animation delay
    await new Promise(resolve => setTimeout(resolve, 300))

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowInstructions(false)
    } else {
      // Complete baseline - submit all data
      setIsCompleting(true)
      await submitBaseline(newAnswers)
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/study/${studyId}/join/complete?participantId=${participantId}`)
    }

    setIsTransitioning(false)
  }

  const handleDismissInstructions = () => {
    setShowInstructions(false)
  }

  // Loading state
  if (isLoading) {
    return (
      <MobileContainer centered>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading survey...</p>
        </div>
      </MobileContainer>
    )
  }

  // No questions available
  if (!question || totalQuestions === 0) {
    return (
      <MobileContainer centered>
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">No baseline questions available.</p>
          <Button onClick={() => router.push(`/study/${studyId}/join/complete?participantId=${participantId}`)}>
            Continue
          </Button>
        </div>
      </MobileContainer>
    )
  }

  if (isCompleting) {
    return (
      <MobileContainer centered>
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--primary-dim)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse border border-[var(--primary)]/30">
            <svg className="w-8 h-8 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Saving your responses...</h2>
        </div>
      </MobileContainer>
    )
  }

  // Render options based on question type
  const renderOptions = () => {
    if (question.type === 'single_choice' && question.options) {
      return (
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = answers[question.id] === option.value
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(option.value)}
                disabled={isTransitioning}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-[var(--primary)] bg-[var(--primary-dim)] scale-[0.98]'
                    : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)] active:scale-[0.98]'
                }`}
                style={{ minHeight: '56px' }}
              >
                <span className={`font-medium ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      )
    }

    if (question.type === 'numeric_scale' && question.scale) {
      const { min, max, minLabel, maxLabel } = question.scale
      const values = Array.from({ length: max - min + 1 }, (_, i) => min + i)
      return (
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-[var(--text-muted)]">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {values.map(value => {
              const isSelected = answers[question.id] === value
              return (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  disabled={isTransitioning}
                  className={`w-12 h-12 rounded-xl border-2 font-medium transition-all ${
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                      : 'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      )
    }

    // Text input for free-form responses (e.g., time questions in PSQI)
    if (question.type === 'text') {
      return (
        <div className="space-y-4">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter your answer..."
            className="text-lg"
            autoFocus
          />
          <Button
            onClick={() => handleAnswer(textInput)}
            disabled={!textInput.trim() || isTransitioning}
            fullWidth
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Continue
          </Button>
        </div>
      )
    }

    // Fallback: render as text input if no options are provided
    // This handles cases where the question type doesn't match or options are missing
    if (!question.options || question.options.length === 0) {
      return (
        <div className="space-y-4">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter your answer..."
            className="text-lg"
            autoFocus
          />
          <Button
            onClick={() => handleAnswer(textInput)}
            disabled={!textInput.trim() || isTransitioning}
            fullWidth
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Continue
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <MobileContainer withBottomPadding className="pt-6">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">Baseline</span>
          <span className="text-sm text-[var(--text-muted)] font-mono">
            {currentQuestion + 1}/{totalQuestions}
          </span>
        </div>
        <div className="h-2 bg-[var(--glass-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Instructions (shown for new instruments) */}
      {showInstructions && isNewInstrument && (
        <div className="mb-6 p-4 bg-[var(--primary-dim)] rounded-xl border border-[var(--primary)]/30">
          <p className="text-sm font-medium text-[var(--primary-light)] mb-1">{question.instrumentName}</p>
          <p className="text-sm text-[var(--text-secondary)]">{question.instructions}</p>
          <button
            onClick={handleDismissInstructions}
            className="mt-3 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors"
          >
            Got it
          </button>
        </div>
      )}

      {/* Question */}
      <div
        className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
      >
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
          {question.text}
        </h2>

        {/* Options */}
        {renderOptions()}
      </div>

      {/* Subtle hint */}
      <p className="text-center text-xs text-[var(--text-muted)] mt-8">
        Tap an answer to continue
      </p>
    </MobileContainer>
  )
}
