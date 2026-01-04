'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer } from '@/components/ui/MobileContainer'

// Baseline instruments following the schema from docs/AGENTS.md
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

const baselineInstruments: Instrument[] = [
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
  },
  {
    id: 'symptoms',
    name: 'Symptoms',
    instructions: 'Please answer the following question about your symptoms.',
    questions: [
      {
        id: 'symptoms_q1',
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
  }
]

// Flatten all questions for sequential display
const allQuestions = baselineInstruments.flatMap(instrument =>
  instrument.questions.map(question => ({
    ...question,
    instrumentId: instrument.id,
    instrumentName: instrument.name,
    instructions: instrument.instructions
  }))
)

export default function BaselinePage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [isCompleting, setIsCompleting] = useState(false)

  const question = allQuestions[currentQuestion]
  const totalQuestions = allQuestions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  // Check if we need to show instructions for a new instrument
  const prevQuestion = currentQuestion > 0 ? allQuestions[currentQuestion - 1] : null
  const isNewInstrument = !prevQuestion || prevQuestion.instrumentId !== question.instrumentId

  useEffect(() => {
    if (isNewInstrument) {
      setShowInstructions(true)
    }
  }, [currentQuestion, isNewInstrument])

  const handleAnswer = async (value: number) => {
    if (isTransitioning) return

    setAnswers({ ...answers, [question.id]: value })
    setIsTransitioning(true)

    // Brief animation delay
    await new Promise(resolve => setTimeout(resolve, 300))

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowInstructions(false)
    } else {
      // Complete baseline
      setIsCompleting(true)
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/study/${studyId}/join/complete`)
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
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Saving your responses...</h2>
        </div>
      </MobileContainer>
    )
  }

  return (
    <MobileContainer withBottomPadding className="pt-6">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">BASELINE</span>
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
