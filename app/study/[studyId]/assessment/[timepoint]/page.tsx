'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer } from '@/components/ui/MobileContainer'
import { createClient } from '@/lib/supabase/client'

// Instrument types (same as baseline)
interface Option {
  value: number
  label: string
}

interface Question {
  id: string
  text: string
  type: 'single_choice'
  options: Option[]
  required: boolean
}

interface Instrument {
  id: string
  name: string
  instructions: string
  questions: Question[]
}

// Instrument definitions - in production, loaded from study protocol
const allInstruments: Record<string, Instrument> = {
  'phq-2': {
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
  'energy': {
    id: 'energy',
    name: 'Energy & Fatigue',
    instructions: 'Please answer the following question about your energy level.',
    questions: [
      {
        id: 'energy_q1',
        text: 'How would you rate your energy level over the past week?',
        type: 'single_choice',
        options: [
          { value: 1, label: 'Very low' },
          { value: 2, label: 'Low' },
          { value: 3, label: 'Moderate' },
          { value: 4, label: 'Good' },
          { value: 5, label: 'Very good' }
        ],
        required: true
      }
    ]
  },
  'symptoms': {
    id: 'symptoms',
    name: 'TRT Symptoms',
    instructions: 'Please rate how you\'ve been feeling over the past 2 weeks.',
    questions: [
      {
        id: 'symptoms_libido',
        text: 'How would you rate your sex drive or libido?',
        type: 'single_choice',
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
    instructions: 'Please answer the following question about your treatment.',
    questions: [
      {
        id: 'satisfaction_q1',
        text: 'Overall, how satisfied are you with your TRT treatment so far?',
        type: 'single_choice',
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

// Timepoint schedule - defines which instruments are needed at each timepoint
const timepointSchedule: Record<string, string[]> = {
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
  const match = timepoint.match(/week(\d+)/)
  if (match) {
    return `Week ${match[1]}`
  }
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
  const [showInstructions, setShowInstructions] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [startTime] = useState(() => Date.now())

  // Get participant ID on mount
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

  // Get instruments for this timepoint
  const instrumentIds = timepointSchedule[timepoint] || ['phq-2', 'energy']
  const instruments = instrumentIds.map(id => allInstruments[id]).filter(Boolean)

  // Flatten all questions for sequential display
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

  // Check if we need to show instructions for a new instrument
  const prevQuestion = currentQuestion > 0 ? allQuestions[currentQuestion - 1] : null
  const isNewInstrument = !prevQuestion || prevQuestion.instrumentId !== question?.instrumentId

  useEffect(() => {
    if (isNewInstrument) {
      setShowInstructions(true)
    }
  }, [currentQuestion, isNewInstrument])

  // Submit all instruments for this timepoint
  const submitAssessment = useCallback(async (finalAnswers: Record<string, number>) => {
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
            timepoint,
            instrumentId,
            responses,
            durationSeconds
          })
        })

        if (!response.ok) {
          const data = await response.json()
          console.error('Submission failed:', data.error)
        } else {
          console.log(`Submitted ${instrumentId} for ${timepoint}`)
        }
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

    // Brief animation delay
    await new Promise(resolve => setTimeout(resolve, 300))

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowInstructions(false)
    } else {
      // Complete assessment - submit all data
      setIsCompleting(true)
      await submitAssessment(newAnswers)
      await new Promise(resolve => setTimeout(resolve, 800))
      router.push(`/study/${studyId}/dashboard`)
    }

    setIsTransitioning(false)
  }

  const handleDismissInstructions = () => {
    setShowInstructions(false)
  }

  if (isCompleting) {
    return (
      <MobileContainer centered>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
          <p className="text-gray-600">Returning to dashboard...</p>
        </div>
      </MobileContainer>
    )
  }

  if (!question) {
    return (
      <MobileContainer centered>
        <div className="text-center">
          <p className="text-gray-600">No questions found for this timepoint.</p>
        </div>
      </MobileContainer>
    )
  }

  return (
    <MobileContainer withBottomPadding className="pt-6">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            {getTimepointLabel(timepoint)} CHECK-IN
          </span>
          <span className="text-sm text-gray-500">
            {currentQuestion + 1} of {totalQuestions}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Instructions (shown for new instruments) */}
      {showInstructions && isNewInstrument && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-xl">
          <p className="text-sm font-medium text-indigo-900 mb-1">{question.instrumentName}</p>
          <p className="text-sm text-indigo-700">{question.instructions}</p>
          <button
            onClick={handleDismissInstructions}
            className="mt-3 text-sm font-medium text-indigo-600 active:text-indigo-800"
          >
            Got it
          </button>
        </div>
      )}

      {/* Question */}
      <div
        className={`transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {question.text}
        </h2>

        {/* Options */}
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
                    ? 'border-indigo-500 bg-indigo-50 scale-[0.98]'
                    : 'border-gray-200 bg-white active:bg-gray-50 active:scale-[0.98]'
                }`}
                style={{ minHeight: '56px' }}
              >
                <span className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Subtle hint */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Tap an answer to continue
      </p>
    </MobileContainer>
  )
}
