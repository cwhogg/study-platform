'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer } from '@/components/ui/MobileContainer'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

// Types matching the agent output schema
interface Option {
  value: number
  label: string
}

interface Question {
  id: string
  text: string
  type: 'single_choice' | 'numeric_scale' | 'text'
  options?: Option[]
  scale?: {
    min: number
    max: number
    minLabel: string
    maxLabel: string
  }
  required: boolean
}

interface Instrument {
  id: string
  name: string
  description?: string
  instructions: string
  estimatedMinutes?: number
  questions: Question[]
}

interface ScheduleTimepoint {
  timepoint: string
  week: number
  instruments: string[]
}

interface Protocol {
  instruments?: Instrument[]
  schedule?: ScheduleTimepoint[]
}

interface StudyData {
  name: string
  intervention: string
  protocol?: Protocol
}

// Fallback instruments if none in protocol
const FALLBACK_INSTRUMENTS: Instrument[] = [
  {
    id: 'phq-2',
    name: 'PHQ-2',
    instructions: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    questions: [
      {
        id: 'phq2_q1',
        text: 'Little interest or pleasure in doing things',
        type: 'single_choice',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ],
        required: true
      },
      {
        id: 'phq2_q2',
        text: 'Feeling down, depressed, or hopeless',
        type: 'single_choice',
        options: [
          { value: 0, label: 'Not at all' },
          { value: 1, label: 'Several days' },
          { value: 2, label: 'More than half the days' },
          { value: 3, label: 'Nearly every day' }
        ],
        required: true
      }
    ]
  },
  {
    id: 'qol',
    name: 'Quality of Life',
    instructions: 'Please answer the following question about your overall quality of life.',
    questions: [
      {
        id: 'qol_q1',
        text: 'In general, how would you rate your overall quality of life?',
        type: 'single_choice',
        options: [
          { value: 1, label: 'Very poor' },
          { value: 2, label: 'Poor' },
          { value: 3, label: 'Fair' },
          { value: 4, label: 'Good' },
          { value: 5, label: 'Excellent' }
        ],
        required: true
      }
    ]
  }
]

export default function BaselinePage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [isLoading, setIsLoading] = useState(true)
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
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

          // Get instruments from protocol
          let studyInstruments: Instrument[] = []

          if (data.protocol?.instruments && data.protocol.instruments.length > 0) {
            // Find baseline timepoint to know which instruments to use
            const baselineTimepoint = data.protocol.schedule?.find(
              tp => tp.timepoint === 'baseline' || tp.week === 0
            )

            let candidateInstruments = data.protocol.instruments

            if (baselineTimepoint?.instruments) {
              // Get only instruments scheduled for baseline
              candidateInstruments = data.protocol.instruments.filter(
                inst => baselineTimepoint.instruments.includes(inst.id)
              )
            }

            // Filter to only instruments that have valid questions
            // Valid = has questions array with at least one question that has id, text, and type
            studyInstruments = candidateInstruments.filter(inst => {
              if (!inst.questions || !Array.isArray(inst.questions) || inst.questions.length === 0) {
                console.log(`[Baseline] Skipping ${inst.id} - no questions array`)
                return false
              }
              // Check if questions have required fields
              const hasValidQuestions = inst.questions.every(q =>
                q && typeof q === 'object' && q.id && q.text && q.type
              )
              if (!hasValidQuestions) {
                console.log(`[Baseline] Skipping ${inst.id} - questions missing required fields`)
                return false
              }
              return true
            })
          }

          // Use protocol instruments or fallback
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
  const submitBaseline = useCallback(async (finalAnswers: Record<string, number>) => {
    if (!participantId) {
      console.error('No participant ID')
      return
    }

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000)

    // Group answers by instrument
    const answersByInstrument = new Map<string, { questionId: string; value: number }[]>()

    for (const q of allQuestions) {
      const value = finalAnswers[q.id]
      if (value !== undefined) {
        if (!answersByInstrument.has(q.instrumentId)) {
          answersByInstrument.set(q.instrumentId, [])
        }
        answersByInstrument.get(q.instrumentId)!.push({
          questionId: q.id,
          value
        })
      }
    }

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

  const handleAnswer = async (value: number) => {
    if (isTransitioning || !question) return

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
      <MobileContainer centered className="bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#1E40AF] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading survey...</p>
        </div>
      </MobileContainer>
    )
  }

  // No questions available
  if (!question || totalQuestions === 0) {
    return (
      <MobileContainer centered className="bg-white">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No baseline questions available.</p>
          <button
            onClick={() => router.push(`/study/${studyId}/join/complete?participantId=${participantId}`)}
            className="px-6 py-3 bg-[#1E40AF] text-white rounded-xl"
          >
            Continue
          </button>
        </div>
      </MobileContainer>
    )
  }

  if (isCompleting) {
    return (
      <MobileContainer centered className="bg-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#1E40AF]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse border border-[#1E40AF]/20">
            <svg className="w-8 h-8 text-[#1E40AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Saving your responses...</h2>
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
                    ? 'border-[#1E40AF] bg-[#1E40AF]/10 scale-[0.98]'
                    : 'border-slate-200 bg-white active:bg-slate-50 active:scale-[0.98]'
                }`}
                style={{ minHeight: '56px' }}
              >
                <span className={`font-medium ${isSelected ? 'text-[#1E40AF]' : 'text-slate-900'}`}>
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
          <div className="flex justify-between text-sm text-slate-500">
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
                      ? 'border-[#1E40AF] bg-[#1E40AF] text-white'
                      : 'border-slate-200 bg-white text-slate-700 active:bg-slate-50'
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

    return null
  }

  return (
    <MobileContainer withBottomPadding className="pt-6 bg-white">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">BASELINE</span>
          <span className="text-sm text-slate-600">
            {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1E40AF] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Instructions (shown for new instruments) */}
      {showInstructions && isNewInstrument && (
        <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
          <p className="text-sm font-medium text-orange-900 mb-1">{question.instrumentName}</p>
          <p className="text-sm text-orange-800">{question.instructions}</p>
          <button
            onClick={handleDismissInstructions}
            className="mt-3 text-sm font-medium text-orange-700 active:text-orange-500"
          >
            Got it
          </button>
        </div>
      )}

      {/* Question */}
      <div
        className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-6">
          {question.text}
        </h2>

        {/* Options */}
        {renderOptions()}
      </div>

      {/* Subtle hint */}
      <p className="text-center text-xs text-slate-600 mt-8">
        Tap an answer to continue
      </p>
    </MobileContainer>
  )
}
