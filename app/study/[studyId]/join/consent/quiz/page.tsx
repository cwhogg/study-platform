'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { Button } from '@/components/ui/Button'
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
          // Check if questions exist and have the correct format (with options array)
          const questions = data.comprehensionQuestions
          if (questions &&
              questions.length > 0 &&
              questions[0].options &&
              Array.isArray(questions[0].options)) {
            setQuestions(questions)
          } else {
            // Old format or missing - use fallback
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
      <MobileContainer withBottomPadding className="pt-6">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mb-4" />
          <p className="text-[var(--text-secondary)]">Loading questions...</p>
        </div>
      </MobileContainer>
    )
  }

  // No questions available
  if (!question) {
    return (
      <MobileContainer withBottomPadding className="pt-6">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-[var(--text-secondary)] mb-4">No questions available.</p>
          <Button onClick={() => router.push(`/study/${studyId}/join/consent/sign`)}>
            Continue to Sign
          </Button>
        </div>
      </MobileContainer>
    )
  }

  return (
    <>
      <MobileContainer withBottomPadding className="pt-6">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-[var(--text-muted)] mb-2 font-mono">
            Question {currentQuestion + 1} of {totalQuestions}
          </p>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Quick Check
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Let&apos;s make sure you understand the key points
          </p>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] text-center">
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
                buttonClasses += ' border-[var(--success)] bg-[var(--success)]/15'
              } else if (isSelected && !isCorrectAnswer) {
                buttonClasses += ' border-[var(--error)] bg-[var(--error)]/15'
              } else {
                buttonClasses += ' border-[var(--glass-border)] bg-[var(--glass-bg)] opacity-60'
              }
            } else {
              buttonClasses += isSelected
                ? ' border-[var(--primary)] bg-[var(--primary-dim)]'
                : ' border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)]'
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
                      ? 'text-[var(--success)]'
                      : showFeedback && isSelected && !isCorrectAnswer
                      ? 'text-[var(--error)]'
                      : 'text-[var(--text-primary)]'
                  }`}>
                    {option.text}
                  </span>
                  {showFeedback && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-[var(--success)] flex-shrink-0" />
                  )}
                  {showFeedback && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-[var(--error)] flex-shrink-0" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-6 p-4 rounded-xl border ${
            isCorrect
              ? 'bg-[var(--success)]/15 border-[var(--success)]/30'
              : 'bg-[var(--warning)]/15 border-[var(--warning)]/30'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[var(--warning)] font-bold">!</span>
                </div>
              )}
              <div>
                <p className={`font-medium ${isCorrect ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>
                  {isCorrect ? 'Correct!' : 'Not quite'}
                </p>
                <p className={`text-sm mt-1 ${isCorrect ? 'text-[var(--success)]/80' : 'text-[var(--warning)]/80'}`}>
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <Button
          onClick={handleContinue}
          disabled={!showFeedback}
          size="lg"
          fullWidth
        >
          {isLastQuestion ? 'Continue to Sign' : 'Next Question'}
        </Button>
      </MobileBottomAction>
    </>
  )
}
