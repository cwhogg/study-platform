'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MobileContainer, MobileSection, MobileDivider } from '@/components/ui/MobileContainer'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressRing } from '@/components/ui/Progress'
import { CheckCircle2, Clock, FlaskConical, ArrowRight, Sparkles } from 'lucide-react'
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
  const [notEnrolled, setNotEnrolled] = useState(false)
  const totalWeeks = 26

  const loadDashboardData = useCallback(async () => {
    const supabase = createClient()

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get participant record (use maybeSingle to handle no results gracefully)
      const { data: participant, error: participantError } = await supabase
        .from('sp_participants')
        .select('id, enrolled_at, current_week')
        .eq('user_id', user.id)
        .eq('study_id', studyId)
        .maybeSingle()

      if (participantError) {
        console.error('Error fetching participant:', participantError)
        setLoading(false)
        return
      }

      if (!participant || !participant.enrolled_at) {
        // User is registered but not fully enrolled yet
        setNotEnrolled(true)
        setLoading(false)
        return
      }

      // Get all submissions for this participant
      const { data: submissions, error: submissionsError } = await supabase
        .from('sp_submissions')
        .select('timepoint, instrument, submitted_at')
        .eq('participant_id', participant.id)

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError)
      }

      // Get lab results for this participant
      const { data: labResults, error: labsError } = await supabase
        .from('sp_lab_results')
        .select('timepoint')
        .eq('participant_id', participant.id)

      if (labsError) {
        console.error('Error fetching lab results:', labsError)
      }

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
    } catch (error) {
      console.error('Dashboard error:', error)
      setLoading(false)
    }
  }, [studyId])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const progress = Math.min((currentWeek / totalWeeks) * 100, 100)
  const dueAssessment = assessments.find(a => a.status === 'due' || a.status === 'overdue')
  const completedAssessments = assessments.filter(a => a.status === 'completed')
  const upcomingAssessments = assessments.filter(a => a.status === 'upcoming')

  if (loading) {
    return (
      <MobileContainer className="pt-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--glass-border)]" />
              <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
            </div>
            <p className="text-[var(--text-secondary)]">Loading your data...</p>
          </div>
        </div>
      </MobileContainer>
    )
  }

  if (notEnrolled) {
    return (
      <MobileContainer className="pt-8">
        <div className="text-center py-12 animate-fade-in">
          <div className="w-16 h-16 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-[var(--warning)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Complete Your Setup</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-xs mx-auto">
            You&apos;re almost there! Complete the setup process to start collecting data.
          </p>
          <Link href={`/study/${studyId}/join/overview`}>
            <Button size="lg">
              Continue Setup
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </MobileContainer>
    )
  }

  return (
    <MobileContainer className="pt-6 pb-8">
      {/* Header with Progress Ring */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Your Data</h1>
          <p className="text-sm text-[var(--text-secondary)]">Week {currentWeek} of {totalWeeks}</p>
        </div>
        <ProgressRing
          value={progress}
          size={64}
          strokeWidth={5}
          showValue={false}
          label={`${Math.round(progress)}%`}
        />
      </div>

      {/* Due Assessment Card */}
      {dueAssessment && (
        <Card
          variant="glow"
          padding="md"
          className="mb-6 animate-fade-in-up relative overflow-hidden"
        >
          {/* Decorative gradient */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-[var(--primary)]/10 rounded-full blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant={dueAssessment.status === 'overdue' ? 'danger' : 'warning'}
                dot
                dotPulse
              >
                {dueAssessment.status === 'overdue' ? 'Overdue' : 'Due Now'}
              </Badge>
            </div>

            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              {dueAssessment.timepoint} Entry
            </h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              Quick data entry · ~5 minutes
            </p>

            <Link href={`/study/${studyId}/assessment/${dueAssessment.id}`}>
              <Button size="lg" fullWidth>
                Record Data
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* All Done Message */}
      {!dueAssessment && completedAssessments.length > 0 && (
        <Card variant="default" padding="md" className="mb-6 animate-fade-in-up">
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7 text-[var(--success)]" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-1">You&apos;re all caught up!</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {upcomingAssessments.length > 0
                ? `Next entry: ${upcomingAssessments[0].timepoint}`
                : 'No more entries scheduled'}
            </p>
          </div>
        </Card>
      )}

      <MobileDivider />

      {/* Completed Section */}
      {completedAssessments.length > 0 && (
        <MobileSection title="Completed">
          <div className="space-y-2 stagger-children">
            {completedAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-3.5 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[var(--success)]/10 rounded-lg flex items-center justify-center border border-[var(--success)]/20">
                    <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                  </div>
                  <div>
                    <span className="font-medium text-[var(--text-primary)] text-sm">{assessment.timepoint}</span>
                    {assessment.hasLabs && assessment.labsReceived && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <FlaskConical className="w-3 h-3 text-[var(--success)]" />
                        <span className="text-xs text-[var(--success)]">Labs received</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono">{assessment.completedDate}</span>
              </div>
            ))}
          </div>
        </MobileSection>
      )}

      {/* Upcoming Section */}
      {upcomingAssessments.length > 0 && (
        <MobileSection title="Upcoming">
          <div className="space-y-2 stagger-children">
            {upcomingAssessments.slice(0, 4).map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-3.5 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[var(--glass-hover)] rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <span className="font-medium text-[var(--text-secondary)] text-sm">{assessment.timepoint}</span>
                    {assessment.hasLabs && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <FlaskConical className="w-3 h-3 text-[var(--text-muted)]" />
                        <span className="text-xs text-[var(--text-muted)]">Labs scheduled</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono">{assessment.dueDate}</span>
              </div>
            ))}
          </div>
        </MobileSection>
      )}

      {/* Help Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Questions?{' '}
          <a href="mailto:support@nofone.us" className="text-[var(--primary)] font-medium hover:text-[var(--primary-light)]">
            Contact support
          </a>
        </p>
      </div>
    </MobileContainer>
  )
}
