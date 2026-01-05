'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MobileContainer } from '@/components/ui/MobileContainer'
import { CheckCircle2, Clock, FlaskConical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Assessment {
  id: string
  timepoint: string
  week: number
  status: 'completed' | 'due' | 'upcoming' | 'overdue'
  completedDate?: string
  dueDate?: string
  hasLabs?: boolean
  labsReceived?: boolean
  instruments: string[]
  completedInstruments: string[]
}

// Schedule defines which instruments are needed at each timepoint
const scheduleConfig: { id: string; timepoint: string; week: number; instruments: string[]; hasLabs?: boolean }[] = [
  { id: 'baseline', timepoint: 'Baseline', week: 0, instruments: ['phq-2', 'energy'] },
  { id: 'week2', timepoint: 'Week 2', week: 2, instruments: ['phq-2', 'energy'] },
  { id: 'week4', timepoint: 'Week 4', week: 4, instruments: ['phq-2', 'energy', 'symptoms'] },
  { id: 'week6', timepoint: 'Week 6', week: 6, instruments: ['phq-2', 'energy', 'symptoms'], hasLabs: true },
  { id: 'week8', timepoint: 'Week 8', week: 8, instruments: ['phq-2', 'energy', 'symptoms', 'satisfaction'] },
  { id: 'week12', timepoint: 'Week 12', week: 12, instruments: ['phq-2', 'energy', 'symptoms', 'satisfaction'], hasLabs: true },
  { id: 'week16', timepoint: 'Week 16', week: 16, instruments: ['phq-2', 'energy', 'symptoms'] },
  { id: 'week20', timepoint: 'Week 20', week: 20, instruments: ['phq-2', 'energy', 'symptoms'] },
  { id: 'week26', timepoint: 'Week 26', week: 26, instruments: ['phq-2', 'energy', 'symptoms', 'satisfaction'], hasLabs: true }
]

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DashboardPage() {
  const params = useParams()
  const studyId = params.studyId as string

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [currentWeek, setCurrentWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const totalWeeks = 26

  const loadDashboardData = useCallback(async () => {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    // Get participant record
    const { data: participant } = await supabase
      .from('sp_participants')
      .select('id, enrolled_at, current_week')
      .eq('user_id', user.id)
      .eq('study_id', studyId)
      .single()

    if (!participant || !participant.enrolled_at) {
      setLoading(false)
      return
    }

    // Get all submissions for this participant
    const { data: submissions } = await supabase
      .from('sp_submissions')
      .select('timepoint, instrument, submitted_at')
      .eq('participant_id', participant.id)

    // Get lab results for this participant
    const { data: labResults } = await supabase
      .from('sp_lab_results')
      .select('timepoint')
      .eq('participant_id', participant.id)

    // Build submissions map
    const submissionsByTimepoint = new Map<string, { instruments: Set<string>; lastSubmitted: Date | null }>()
    submissions?.forEach(s => {
      if (!submissionsByTimepoint.has(s.timepoint)) {
        submissionsByTimepoint.set(s.timepoint, { instruments: new Set(), lastSubmitted: null })
      }
      const entry = submissionsByTimepoint.get(s.timepoint)!
      entry.instruments.add(s.instrument)
      if (s.submitted_at) {
        const submittedDate = new Date(s.submitted_at)
        if (!entry.lastSubmitted || submittedDate > entry.lastSubmitted) {
          entry.lastSubmitted = submittedDate
        }
      }
    })

    // Build lab results set
    const labsByTimepoint = new Set(labResults?.map(l => l.timepoint) || [])

    // Calculate current week from enrollment
    const enrolledAt = new Date(participant.enrolled_at)
    const now = new Date()
    const diffMs = now.getTime() - enrolledAt.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const calculatedWeek = Math.floor(diffDays / 7)
    setCurrentWeek(calculatedWeek)

    // Build assessment status from schedule
    const assessmentList: Assessment[] = scheduleConfig.map(config => {
      const dueDate = new Date(enrolledAt)
      dueDate.setDate(dueDate.getDate() + config.week * 7)

      const windowDays = 7
      const windowStart = new Date(dueDate)
      windowStart.setDate(windowStart.getDate() - Math.floor(windowDays / 2))
      const windowEnd = new Date(dueDate)
      windowEnd.setDate(windowEnd.getDate() + Math.ceil(windowDays / 2))

      const submissionEntry = submissionsByTimepoint.get(config.id)
      const completedInstruments = Array.from(submissionEntry?.instruments || [])
      const allCompleted = config.instruments.every(i => completedInstruments.includes(i))

      let status: Assessment['status']
      if (allCompleted) {
        status = 'completed'
      } else if (now > windowEnd) {
        status = 'overdue'
      } else if (now >= windowStart && now <= windowEnd) {
        status = 'due'
      } else {
        status = 'upcoming'
      }

      // Check if we have labs for this timepoint
      const labsReceived = labsByTimepoint.has(config.id)

      return {
        id: config.id,
        timepoint: config.timepoint,
        week: config.week,
        status,
        completedDate: allCompleted && submissionEntry?.lastSubmitted
          ? formatDate(submissionEntry.lastSubmitted)
          : undefined,
        dueDate: formatDate(dueDate),
        hasLabs: config.hasLabs,
        labsReceived,
        instruments: config.instruments,
        completedInstruments
      }
    })

    setAssessments(assessmentList)
    setLoading(false)
  }, [studyId])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const progress = (currentWeek / totalWeeks) * 100
  const dueAssessment = assessments.find(a => a.status === 'due' || a.status === 'overdue')
  const completedAssessments = assessments.filter(a => a.status === 'completed')
  const upcomingAssessments = assessments.filter(a => a.status === 'upcoming')

  if (loading) {
    return (
      <MobileContainer className="pt-4 pb-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </MobileContainer>
    )
  }

  return (
    <MobileContainer className="pt-4 pb-8">
      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Your Progress</span>
          <span className="text-sm font-semibold text-gray-900">
            Week {currentWeek} of {totalWeeks}
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Due Assessment Card */}
      {dueAssessment && (
        <div className="mb-6">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-indigo-900">
                {dueAssessment.status === 'overdue' ? 'OVERDUE' : 'DUE NOW'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {dueAssessment.timepoint} Check-in
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              ~5 minutes
            </p>
            <Link
              href={`/study/${studyId}/assessment/${dueAssessment.id}`}
              className="block w-full py-3 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 transition-colors"
              style={{ minHeight: '48px' }}
            >
              Start
            </Link>
          </div>
        </div>
      )}

      {/* All Done Message */}
      {!dueAssessment && completedAssessments.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="font-medium text-green-900">You&apos;re all caught up!</p>
          <p className="text-sm text-green-700 mt-1">
            {upcomingAssessments.length > 0
              ? `Next check-in: ${upcomingAssessments[0].timepoint}`
              : 'No more assessments scheduled'}
          </p>
        </div>
      )}

      {/* Completed Section */}
      {completedAssessments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Completed
          </h2>
          <div className="space-y-2">
            {completedAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div>
                    <span className="font-medium text-gray-900">{assessment.timepoint}</span>
                    {assessment.hasLabs && assessment.labsReceived && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <FlaskConical className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Labs received</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{assessment.completedDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      {upcomingAssessments.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Upcoming
          </h2>
          <div className="space-y-2">
            {upcomingAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-700">{assessment.timepoint}</span>
                    {assessment.hasLabs && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <FlaskConical className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Labs scheduled</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{assessment.dueDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Questions?{' '}
          <a href="mailto:research@example.com" className="text-indigo-600 font-medium">
            Contact support
          </a>
        </p>
      </div>
    </MobileContainer>
  )
}
