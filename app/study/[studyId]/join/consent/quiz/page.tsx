'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

// Types matching the agent-generated format
interface ComprehensionQuestionOption {
  text: string
  correct: boolean
}

interface ComprehensionQuestion {
  id: string
  question: string
  options: ComprehensionQuestionOption[]
  explanation: string
}

// Fallback questions (used only if study has no generated questions)
const FALLBACK_QUESTIONS: ComprehensionQuestion[] = [
  {
    id: 'withdraw',
    question: 'Can you stop participating at any time?',
    options: [
      { text: 'No, you must complete the full study', correct: false },
      { text: 'Yes, but only with your doctor\'s approval', correct: false },
      { text: 'Yes, at any time for any reason', correct: true },
      { text: 'Only if you have a medical emergency', correct: false },
    ],
    explanation: 'Participation is voluntary. You can withdraw at any time, for any reason, without affecting your care.'
  },
  {
    id: 'activities',
    question: 'What will you be asked to do?',
    options: [
      { text: 'Take experimental medications', correct: false },
      { text: 'Complete surveys and have regular lab work', correct: true },
      { text: 'Attend weekly in-person visits', correct: false },
      { text: 'Change your current treatment plan', correct: false },
    ],
    explanation: 'You\'ll answer short surveys every 2-4 weeks and have blood draws at scheduled intervals.'
  },
  {
    id: 'privacy',
    question: 'Who will see your personal health data?',
    options: [
      { text: 'Anyone interested in the study', correct: false },
      { text: 'Your employer and insurance company', correct: false },
      { text: 'Only authorized research staff', correct: true },
      { text: 'Data will be posted publicly', correct: false },
    ],
    explanation: 'Only authorized research staff can access your identifiable information. Results are reported only in aggregate.'
  }
]

export default function ConsentQuizPage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [questions, setQuestions] = useState<ComprehensionQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // Fetch comprehension questions from study
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`/api/studies/${studyId}/public`)
        if (response.ok) {
          const data = await response.json()
          if (data.comprehensionQuestions && data.comprehensionQuestions.length > 0) {
            setQuestions(data.comprehensionQuestions)
          } else {
            setQuestions(FALLBACK_QUESTIONS)
          }
        } else {
          setQuestions(FALLBACK_QUESTIONS)
        }
      } catch (error) {
        console.error('Failed to fetch comprehension questions:', error)
        setQuestions(FALLBACK_QUESTIONS)
      }
      setIsLoading(false)
    }

    fetchQuestions()
  }, [studyId])

  const question = questions[currentQuestion]
  const totalQuestions = questions.length
  const isLastQuestion = currentQuestion === totalQuestions - 1

  // Find the correct answer index
  const correctIndex = question?.options?.findIndex(opt => opt.correct) ?? -1

  const handleSelectAnswer = (index: number) => {
    if (showFeedback) return // Prevent changing answer after submission

    setSelectedAnswer(index)
    setShowFeedback(true)
    setIsCorrect(index === correctIndex)
  }

  const handleContinue = () => {
    if (isLastQuestion) {
      router.push(`/study/${studyId}/join/consent/sign`)
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setIsCorrect(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <MobileContainer withBottomPadding className="pt-6 bg-white">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-[#1E3A5F] animate-spin mb-4" />
          <p className="text-slate-600">Loading questions...</p>
        </div>
      </MobileContainer>
    )
  }

  // No questions available
  if (!question) {
    return (
      <MobileContainer withBottomPadding className="pt-6 bg-white">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-slate-600 mb-4">No questions available.</p>
          <button
            onClick={() => router.push(`/study/${studyId}/join/consent/sign`)}
            className="px-6 py-3 bg-[#1E3A5F] text-white rounded-xl"
          >
            Continue to Sign
          </button>
        </div>
      </MobileContainer>
    )
  }

  return (
    <>
      <MobileContainer withBottomPadding className="pt-6 bg-white">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-slate-600 mb-2">
            Question {currentQuestion + 1} of {totalQuestions}
          </p>
          <h1 className="text-xl font-bold text-slate-900">
            Quick Check
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Let&apos;s make sure you understand the key points
          </p>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 text-center">
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrectAnswer = option.correct

            let buttonClasses = 'w-full p-4 text-left rounded-xl border-2 transition-all'

            if (showFeedback) {
              if (isCorrectAnswer) {
                buttonClasses += ' border-emerald-500 bg-emerald-50'
              } else if (isSelected && !isCorrectAnswer) {
                buttonClasses += ' border-red-500 bg-red-50'
              } else {
                buttonClasses += ' border-slate-200 bg-slate-50 opacity-60'
              }
            } else {
              buttonClasses += isSelected
                ? ' border-[#1E3A5F] bg-[#1E3A5F]/10'
                : ' border-slate-200 bg-slate-50 active:bg-slate-100'
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={showFeedback}
                className={buttonClasses}
                style={{ minHeight: '56px' }}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    showFeedback && isCorrectAnswer
                      ? 'text-emerald-700'
                      : showFeedback && isSelected && !isCorrectAnswer
                      ? 'text-red-700'
                      : 'text-slate-900'
                  }`}>
                    {option.text}
                  </span>
                  {showFeedback && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  )}
                  {showFeedback && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-6 p-4 rounded-xl ${
            isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-700 font-bold">!</span>
                </div>
              )}
              <div>
                <p className={`font-medium ${isCorrect ? 'text-emerald-700' : 'text-orange-800'}`}>
                  {isCorrect ? 'Correct!' : 'Not quite'}
                </p>
                <p className={`text-sm mt-1 ${isCorrect ? 'text-emerald-600' : 'text-orange-700'}`}>
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <button
          onClick={handleContinue}
          disabled={!showFeedback}
          className="w-full py-4 bg-[#1E3A5F] text-white text-center font-semibold rounded-xl active:bg-[#162d4a] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          style={{ minHeight: '52px' }}
        >
          {isLastQuestion ? 'Continue to Sign' : 'Next Question'}
        </button>
      </MobileBottomAction>
    </>
  )
}
