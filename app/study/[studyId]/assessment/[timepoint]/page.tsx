'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Info, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Option {
  value: number
  label: string
  description?: string
}

interface Question {
  id: string
  text: string
  hint?: string
  type: 'single_choice'
  options: Option[]
  required: boolean
  category?: string
}

interface Instrument {
  id: string
  name: string
  instructions: string
  questions: Question[]
}

const allInstruments: Record<string, Instrument> = {
  'phq-2': {
    id: 'phq-2',
    name: 'PHQ-2',
    instructions: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    questions: [
      {
        id: 'phq2_q1',
        text: 'Little interest or pleasure in doing things',
        hint: 'Compare to your typical baseline before starting the protocol.',
        type: 'single_choice',
        category: 'Mood',
        options: [
          { value: 0, label: 'Not at all', description: 'No issues with this' },
          { value: 1, label: 'Several days', description: 'Happened a few times' },
          { value: 2, label: 'More than half the days', description: 'Frequent occurrence' },
          { value: 3, label: 'Nearly every day', description: 'Daily experience' }
        ],
        required: true
      },
      {
        id: 'phq2_q2',
        text: 'Feeling down, depressed, or hopeless',
        hint: 'Consider the past two weeks overall.',
        type: 'single_choice',
        category: 'Mood',
        options: [
          { value: 0, label: 'Not at all', description: 'No issues with this' },
          { value: 1, label: 'Several days', description: 'Happened a few times' },
          { value: 2, label: 'More than half the days', description: 'Frequent occurrence' },
          { value: 3, label: 'Nearly every day', description: 'Daily experience' }
        ],
        required: true
      }
    ]
  },
  'energy': {
    id: 'energy',
    name: 'Energy & Fatigue',
    instructions: 'Please answer the following about your energy level.',
    questions: [
      {
        id: 'energy_q1',
        text: 'How would you rate your energy level over the past week?',
        hint: 'Consider your typical energy throughout the day.',
        type: 'single_choice',
        category: 'Energy',
        options: [
          { value: 1, label: 'Very low', description: 'Struggled to get through the day' },
          { value: 2, label: 'Low', description: 'Less energy than usual' },
          { value: 3, label: 'Moderate', description: 'About average energy' },
          { value: 4, label: 'Good', description: 'Better than usual' },
          { value: 5, label: 'Very good', description: 'Lots of sustained energy' }
        ],
        required: true
      }
    ]
  },
  'symptoms': {
    id: 'symptoms',
    name: 'Symptoms',
    instructions: 'Rate how you\'ve been feeling over the past 2 weeks.',
    questions: [
      {
        id: 'symptoms_libido',
        text: 'How would you rate your sex drive or libido?',
        type: 'single_choice',
        category: 'Physical',
        options: [
          { value: 1, label: 'Very low' },
          { value: 2, label: 'Low' },
          { value: 3, label: 'Moderate' },
          { value: 4, label: 'Good' },
          { value: 5, label: 'Very good' }
        ],
        required: true
      },
      {
        id: 'symptoms_strength',
        text: 'How would you rate your physical strength and endurance?',
        type: 'single_choice',
        category: 'Physical',
        options: [
          { value: 1, label: 'Very poor' },
          { value: 2, label: 'Poor' },
          { value: 3, label: 'Fair' },
          { value: 4, label: 'Good' },
          { value: 5, label: 'Very good' }
        ],
        required: true
      }
    ]
  },
  'satisfaction': {
    id: 'satisfaction',
    name: 'Treatment Satisfaction',
    instructions: 'Rate your overall treatment experience.',
    questions: [
      {
        id: 'satisfaction_q1',
        text: 'Overall, how satisfied are you with your treatment so far?',
        type: 'single_choice',
        category: 'Satisfaction',
        options: [
          { value: 1, label: 'Very dissatisfied' },
          { value: 2, label: 'Dissatisfied' },
          { value: 3, label: 'Neutral' },
          { value: 4, label: 'Satisfied' },
          { value: 5, label: 'Very satisfied' }
        ],
        required: true
      }
    ]
  }
}

const timepointSchedule: Record<string, string[]> = {
  'baseline': ['phq-2', 'energy'],
  'week2': ['phq-2', 'energy'],
  'week4': ['phq-2', 'energy', 'symptoms'],
  'week6': ['phq-2', 'energy', 'symptoms'],
  'week8': ['phq-2', 'energy', 'symptoms', 'satisfaction'],
  'week12': ['phq-2', 'energy', 'symptoms', 'satisfaction'],
  'week16': ['phq-2', 'energy', 'symptoms'],
  'week20': ['phq-2', 'energy', 'symptoms'],
  'week26': ['phq-2', 'energy', 'symptoms', 'satisfaction']
}

function getTimepointLabel(timepoint: string): string {
  if (timepoint === 'baseline') return 'Baseline'
  const match = timepoint.match(/week(\d+)/)
  if (match) return `Week ${match[1]}`
  return timepoint.charAt(0).toUpperCase() + timepoint.slice(1)
}

export default function AssessmentPage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string
  const timepoint = params.timepoint as string

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [startTime] = useState(() => Date.now())

  useEffect(() => {
    async function getParticipant() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: participant } = await supabase
        .from('sp_participants')
        .select('id')
        .eq('user_id', user.id)
        .eq('study_id', studyId)
        .single()

      if (participant) {
        setParticipantId(participant.id)
      }
    }
    getParticipant()
  }, [studyId])

  const instrumentIds = timepointSchedule[timepoint] || ['phq-2', 'energy']
  const instruments = instrumentIds.map(id => allInstruments[id]).filter(Boolean)

  const allQuestions = useMemo(() => {
    return instruments.flatMap(instrument =>
      instrument.questions.map(question => ({
        ...question,
        instrumentId: instrument.id,
        instrumentName: instrument.name,
        instructions: instrument.instructions
      }))
    )
  }, [instruments])

  const question = allQuestions[currentQuestion]
  const totalQuestions = allQuestions.length
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0

  const submitAssessment = useCallback(async (finalAnswers: Record<string, number>) => {
    if (!participantId) return

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000)
    const answersByInstrument = new Map<string, { questionId: string; value: number }[]>()

    for (const q of allQuestions) {
      const value = finalAnswers[q.id]
      if (value !== undefined) {
        if (!answersByInstrument.has(q.instrumentId)) {
          answersByInstrument.set(q.instrumentId, [])
        }
        answersByInstrument.get(q.instrumentId)!.push({ questionId: q.id, value })
      }
    }

    for (const [instrumentId, responses] of answersByInstrument) {
      try {
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId, timepoint, instrumentId, responses, durationSeconds })
        })
      } catch (error) {
        console.error('Submission error:', error)
      }
    }
  }, [participantId, timepoint, allQuestions, startTime])

  const handleAnswer = async (value: number) => {
    if (isTransitioning || !question) return

    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)
    setIsTransitioning(true)

    await new Promise(resolve => setTimeout(resolve, 250))

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setIsCompleting(true)
      await submitAssessment(newAnswers)
      await new Promise(resolve => setTimeout(resolve, 1200))
      router.push(`/study/${studyId}/dashboard`)
    }

    setIsTransitioning(false)
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    } else {
      router.back()
    }
  }

  // Completion screen
  if (isCompleting) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
        <div className="text-center animate-fade-in">
          <div
            className="w-20 h-20 bg-[var(--success-dim)] rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ animation: 'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          >
            <Check className="w-10 h-10 text-[var(--success)]" />
          </div>
          <h2 className="text-[28px] font-bold text-white mb-2 tracking-[-0.02em]">Entry Recorded</h2>
          <p className="text-[#9CA3AF] mb-10">{getTimepointLabel(timepoint)} data has been saved to your protocol.</p>

          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="font-mono text-[32px] font-semibold text-[var(--primary)]">78</div>
              <div className="text-[13px] text-[#71717A] mt-1">Your Score</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-[32px] font-semibold text-white">{currentQuestion + 1}/{totalQuestions}</div>
              <div className="text-[13px] text-[#71717A] mt-1">Entries Complete</div>
            </div>
          </div>

          <button
            onClick={() => router.push(`/study/${studyId}/dashboard`)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary)] text-[#0A0A0A] rounded-xl font-semibold text-base hover:bg-[var(--primary-light)] transition-all"
          >
            View Dashboard
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[#9CA3AF]">No questions found for this timepoint.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen min-h-dvh bg-[var(--bg-primary)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[rgba(10,10,10,0.9)] backdrop-blur-xl border-b border-[var(--glass-border)]">
        <div className="flex items-center justify-between px-5 h-16" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
          <button onClick={handleBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[#9CA3AF] hover:bg-[var(--glass-bg-hover)] hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-white">{getTimepointLabel(timepoint)} Entry</span>
          <div className="w-10 h-10 flex items-center justify-center text-[#71717A]">
            <Info className="w-5 h-5" />
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-[3px] bg-[var(--bg-elevated-2)]">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-400"
            style={{ width: `${progress}%`, transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </div>
      </header>

      {/* Question Content */}
      <main className="flex-1 flex flex-col px-6 py-8" style={{ paddingBottom: 'calc(140px + env(safe-area-inset-bottom, 0px))' }}>
        <div className={`flex-1 transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
          {/* Question meta */}
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs font-semibold text-[var(--primary)] px-2.5 py-1 bg-[var(--primary-dim)] rounded-full">
              {currentQuestion + 1} / {totalQuestions}
            </span>
            {question.category && (
              <span className="text-xs text-[#71717A]">{question.category}</span>
            )}
          </div>

          {/* Question text */}
          <h2 className="text-2xl font-semibold text-white leading-tight tracking-[-0.01em] mb-2">
            {question.text}
          </h2>

          {question.hint && (
            <p className="text-sm text-[#71717A] mb-10">{question.hint}</p>
          )}

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = answers[question.id] === option.value

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.value)}
                  disabled={isTransitioning}
                  className={`
                    w-full flex items-center gap-4 p-5 text-left rounded-2xl border-2 transition-all duration-200
                    ${isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary-dim)]'
                      : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)] hover:border-[rgba(255,255,255,0.12)]'
                    }
                  `}
                >
                  {/* Radio indicator */}
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${isSelected
                      ? 'bg-[var(--primary)] border-[var(--primary)]'
                      : 'border-[#52525B]'
                    }
                  `}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>

                  <div className="flex-1">
                    <div className={`font-medium ${isSelected ? 'text-[var(--primary)]' : 'text-white'}`}>
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-[13px] text-[#71717A] mt-0.5">{option.description}</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-5 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)] to-transparent" style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-md mx-auto flex gap-3">
          {currentQuestion > 0 && (
            <button
              onClick={handleBack}
              className="w-14 h-14 flex items-center justify-center rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[#9CA3AF] hover:bg-[var(--glass-bg-hover)] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => answers[question.id] !== undefined && handleAnswer(answers[question.id])}
            disabled={answers[question.id] === undefined || isTransitioning}
            className={`
              flex-1 h-14 flex items-center justify-center gap-2 rounded-xl font-semibold text-base transition-all
              ${answers[question.id] !== undefined
                ? 'bg-[var(--primary)] text-[#0A0A0A] hover:bg-[var(--primary-light)]'
                : 'bg-[#52525B] text-[#A1A1AA] cursor-not-allowed'
              }
            `}
          >
            {currentQuestion < totalQuestions - 1 ? 'Continue' : 'Submit Entry'}
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
