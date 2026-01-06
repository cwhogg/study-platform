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
            const isCorrectAnswer = index === question.correctIndex

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
                    {option}
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
            isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-600 font-bold">!</span>
                </div>
              )}
              <div>
                <p className={`font-medium ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isCorrect ? 'Correct!' : 'Not quite'}
                </p>
                <p className={`text-sm mt-1 ${isCorrect ? 'text-emerald-600' : 'text-amber-600'}`}>
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
