'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { CheckCircle2, XCircle } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

const questions: Question[] = [
  {
    id: 'duration',
    question: 'How long is this study?',
    options: ['2 weeks', '3 months', '6 months', '1 year'],
    correctIndex: 2,
    explanation: 'The study lasts 6 months (26 weeks) total.'
  },
  {
    id: 'withdraw',
    question: 'Can you stop participating at any time?',
    options: ['No, you must complete the full study', 'Yes, but only with your doctor\'s approval', 'Yes, at any time for any reason', 'Only if you have a medical emergency'],
    correctIndex: 2,
    explanation: 'Participation is voluntary. You can withdraw at any time, for any reason, without affecting your care.'
  },
  {
    id: 'activities',
    question: 'What will you be asked to do?',
    options: ['Take experimental medications', 'Complete surveys and have regular lab work', 'Attend weekly in-person visits', 'Change your current treatment plan'],
    correctIndex: 1,
    explanation: 'You\'ll answer short surveys every 2-4 weeks and have blood draws at scheduled intervals.'
  },
  {
    id: 'privacy',
    question: 'Who will see your personal health data?',
    options: ['Anyone interested in the study', 'Your employer and insurance company', 'Only authorized research staff', 'Data will be posted publicly'],
    correctIndex: 2,
    explanation: 'Only authorized research staff can access your identifiable information. Results are reported only in aggregate.'
  }
]

export default function ConsentQuizPage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const question = questions[currentQuestion]
  const totalQuestions = questions.length
  const isLastQuestion = currentQuestion === totalQuestions - 1

  const handleSelectAnswer = (index: number) => {
    if (showFeedback) return // Prevent changing answer after submission

    setSelectedAnswer(index)
    setShowFeedback(true)
    setIsCorrect(index === question.correctIndex)
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

  return (
    <>
      <MobileContainer withBottomPadding className="pt-6 bg-slate-900">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-slate-500 mb-2">
            Question {currentQuestion + 1} of {totalQuestions}
          </p>
          <h1 className="text-xl font-bold text-slate-100">
            Quick Check
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Let&apos;s make sure you understand the key points
          </p>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-100 text-center">
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrectAnswer = index === question.correctIndex

            let buttonClasses = 'w-full p-4 text-left rounded-xl border-2 transition-all'

            if (showFeedback) {
              if (isCorrectAnswer) {
                buttonClasses += ' border-emerald-500 bg-emerald-900/50'
              } else if (isSelected && !isCorrectAnswer) {
                buttonClasses += ' border-red-500 bg-red-900/50'
              } else {
                buttonClasses += ' border-slate-700 bg-slate-800 opacity-60'
              }
            } else {
              buttonClasses += isSelected
                ? ' border-indigo-500 bg-indigo-900/50'
                : ' border-slate-700 bg-slate-800 active:bg-slate-700'
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
                      ? 'text-emerald-300'
                      : showFeedback && isSelected && !isCorrectAnswer
                      ? 'text-red-300'
                      : 'text-slate-100'
                  }`}>
                    {option}
                  </span>
                  {showFeedback && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {showFeedback && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-6 p-4 rounded-xl ${
            isCorrect ? 'bg-emerald-900/50 border border-emerald-700' : 'bg-amber-900/50 border border-amber-700'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-400 font-bold">!</span>
                </div>
              )}
              <div>
                <p className={`font-medium ${isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {isCorrect ? 'Correct!' : 'Not quite'}
                </p>
                <p className={`text-sm mt-1 ${isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>
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
          className="w-full py-4 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          style={{ minHeight: '52px' }}
        >
          {isLastQuestion ? 'Continue to Sign' : 'Next Question'}
        </button>
      </MobileBottomAction>
    </>
  )
}
