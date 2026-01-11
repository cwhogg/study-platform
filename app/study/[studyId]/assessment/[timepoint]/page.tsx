'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Info, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  getTimepointInstruments,
  groupAnswersByInstrument,
  FALLBACK_INSTRUMENTS,
  type Instrument,
  type Protocol,
  type QuestionResponseValue,
} from '@/lib/study/instruments'
import { QuestionRenderer } from '@/components/questions'
import type { Question } from '@/lib/questions/types'

interface StudyData {
  name: string
  intervention: string
  protocol?: Protocol
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

  const [isLoading, setIsLoading] = useState(true)
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, QuestionResponseValue>>({})
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [startTime] = useState(() => Date.now())

  // Fetch study and participant data
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch study protocol
        const response = await fetch(`/api/studies/${studyId}/public`)
        if (response.ok) {
          const data: StudyData = await response.json()

          // Get instruments for this timepoint from protocol
          const timepointInstruments = getTimepointInstruments(data.protocol, timepoint)

          if (timepointInstruments.length > 0) {
            console.log('[Assessment] Using protocol instruments:', timepointInstruments.map(i => i.id))
            setInstruments(timepointInstruments)
          } else {
            // Fallback to all protocol instruments if no specific timepoint schedule
            const allInstruments = data.protocol?.instruments?.filter(
              inst => inst.questions && inst.questions.length > 0
            ) || []

            if (allInstruments.length > 0) {
              console.log('[Assessment] Using all protocol instruments:', allInstruments.map(i => i.id))
              setInstruments(allInstruments as Instrument[])
            } else {
              console.log('[Assessment] No protocol instruments, using fallback')
              setInstruments(FALLBACK_INSTRUMENTS)
            }
          }
        } else {
          console.error('[Assessment] Failed to fetch study')
          setInstruments(FALLBACK_INSTRUMENTS)
        }
      } catch (error) {
        console.error('[Assessment] Error fetching study:', error)
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

    fetchData()
  }, [studyId, timepoint])

  // Flatten questions from instruments
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

  // Submit assessment data
  const submitAssessment = useCallback(async (finalAnswers: Record<string, QuestionResponseValue>) => {
    if (!participantId) {
      console.error('No participant ID')
      return
    }

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000)
    const answersByInstrument = groupAnswersByInstrument(finalAnswers, allQuestions)

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

  const handleAnswer = async (value: QuestionResponseValue) => {
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

  // Render question using QuestionRenderer
  const renderQuestion = () => {
    if (!question) return null

    // Cast to the comprehensive Question type for QuestionRenderer
    const fullQuestion = question as unknown as Question

    return (
      <QuestionRenderer
        question={fullQuestion}
        value={answers[question.id]}
        onChange={handleAnswer}
        disabled={isTransitioning}
      />
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[#9CA3AF]">Loading assessment...</p>
        </div>
      </div>
    )
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
              <div className="font-mono text-[32px] font-semibold text-white">{totalQuestions}/{totalQuestions}</div>
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

  // No questions available
  if (!question || totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[#9CA3AF] mb-4">No questions found for this timepoint.</p>
          <button
            onClick={() => router.push(`/study/${studyId}/dashboard`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[#0A0A0A] rounded-xl font-semibold hover:bg-[var(--primary-light)] transition-all"
          >
            Back to Dashboard
          </button>
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
      <main className="flex-1 flex flex-col px-6 py-8" style={{ paddingBottom: 'calc(40px + env(safe-area-inset-bottom, 0px))' }}>
        <div className={`flex-1 transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
          {/* Question meta */}
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-xs font-semibold text-[var(--primary)] px-2.5 py-1 bg-[var(--primary-dim)] rounded-full">
              {currentQuestion + 1} / {totalQuestions}
            </span>
            {question.instrumentName && (
              <span className="text-xs text-[#71717A]">{question.instrumentName}</span>
            )}
          </div>

          {/* Question text */}
          <h2 className="text-2xl font-semibold text-white leading-tight tracking-[-0.01em] mb-2">
            {question.text}
          </h2>

          {question.hint && (
            <p className="text-sm text-[#71717A] mb-6">{question.hint}</p>
          )}

          {/* Question Input - rendered using QuestionRenderer */}
          <div className="mt-6">
            {renderQuestion()}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
