'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle2, Clock, ArrowRight, ArrowUpRight, Download, Activity, LayoutDashboard, Calendar, Search, Settings, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NofOneLogo } from '@/components/ui/NofOneLogo'

interface Assessment {
  id: string
  timepoint: string
  week: number
  status: 'completed' | 'due' | 'upcoming' | 'overdue'
  completedDate?: string
  dueDate?: string
  instruments: string[]
  completedInstruments: string[]
  score?: number
}

const scheduleConfig: { id: string; timepoint: string; week: number; instruments: string[] }[] = [
  { id: 'baseline', timepoint: 'Baseline', week: 0, instruments: ['phq-2', 'energy'] },
  { id: 'week2', timepoint: 'Week 2', week: 2, instruments: ['phq-2', 'energy'] },
  { id: 'week4', timepoint: 'Week 4', week: 4, instruments: ['phq-2', 'energy', 'symptoms'] },
  { id: 'week6', timepoint: 'Week 6', week: 6, instruments: ['phq-2', 'energy', 'symptoms'] },
  { id: 'week8', timepoint: 'Week 8', week: 8, instruments: ['phq-2', 'energy', 'symptoms', 'satisfaction'] },
  { id: 'week12', timepoint: 'Week 12', week: 12, instruments: ['phq-2', 'energy', 'symptoms', 'satisfaction'] },
]

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function DashboardPage() {
  const params = useParams()
  const studyId = params.studyId as string

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [currentWeek, setCurrentWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notEnrolled, setNotEnrolled] = useState(false)
  const [studyName, setStudyName] = useState('Your Protocol')
  const totalWeeks = 12

  const loadDashboardData = useCallback(async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Get study info
      const { data: study } = await supabase
        .from('sp_studies')
        .select('name, intervention')
        .eq('id', studyId)
        .single()

      if (study) {
        setStudyName(study.name || study.intervention || 'Your Protocol')
      }

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
        setNotEnrolled(true)
        setLoading(false)
        return
      }

      const { data: submissions } = await supabase
        .from('sp_submissions')
        .select('timepoint, instrument, submitted_at')
        .eq('participant_id', participant.id)

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

      const enrolledAt = new Date(participant.enrolled_at)
      const now = new Date()
      const diffMs = now.getTime() - enrolledAt.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const calculatedWeek = Math.floor(diffDays / 7)
      setCurrentWeek(calculatedWeek)

      const assessmentList: Assessment[] = scheduleConfig.map((config, idx) => {
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

        // Mock scores for completed assessments
        const score = allCompleted ? 55 + idx * 5 + Math.floor(Math.random() * 10) : undefined

        return {
          id: config.id,
          timepoint: config.timepoint,
          week: config.week,
          status,
          completedDate: allCompleted && submissionEntry?.lastSubmitted
            ? formatDate(submissionEntry.lastSubmitted)
            : undefined,
          dueDate: formatDate(dueDate),
          instruments: config.instruments,
          completedInstruments,
          score
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

  const progress = Math.min(((currentWeek) / totalWeeks) * 100, 100)
  const dueAssessment = assessments.find(a => a.status === 'due' || a.status === 'overdue')
  const completedAssessments = assessments.filter(a => a.status === 'completed')
  const latestScore = completedAssessments.length > 0 ? completedAssessments[completedAssessments.length - 1].score || 78 : 78
  const scoreChange = completedAssessments.length > 1 ? 23 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--glass-border)]" />
            <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
          </div>
          <p className="text-[var(--text-secondary)]">Loading your data...</p>
        </div>
      </div>
    )
  }

  if (notEnrolled) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-6">
        <div className="text-center animate-fade-in max-w-sm">
          <div className="w-16 h-16 bg-[var(--warning)]/15 border border-[var(--warning)]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-[var(--warning)]" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Complete Your Setup</h2>
          <p className="text-[#9CA3AF] mb-6">
            You&apos;re almost there! Complete the setup process to start collecting data.
          </p>
          <Link href={`/study/${studyId}/join/overview`}>
            <Button size="lg">
              Continue Setup
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Desktop layout with sidebar */}
      <div className="hidden lg:grid lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="fixed top-0 left-0 bottom-0 w-[240px] bg-[var(--bg-elevated)] border-r border-[var(--glass-border)] p-6 flex flex-col">
          <div className="mb-8">
            <NofOneLogo showText size={32} />
          </div>

          <nav className="flex-1 space-y-1">
            <Link href={`/study/${studyId}/dashboard`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--primary-dim)] text-[var(--primary)] font-medium text-sm">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#9CA3AF] hover:bg-[var(--glass-bg)] hover:text-white transition-colors text-sm">
              <Activity className="w-5 h-5" />
              Your Data
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#9CA3AF] hover:bg-[var(--glass-bg)] hover:text-white transition-colors text-sm">
              <Calendar className="w-5 h-5" />
              Schedule
            </Link>

            <div className="pt-6 pb-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#52525B] px-3">Discover</div>
            </div>
            <Link href="/protocols" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#9CA3AF] hover:bg-[var(--glass-bg)] hover:text-white transition-colors text-sm">
              <Search className="w-5 h-5" />
              Browse Protocols
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#9CA3AF] hover:bg-[var(--glass-bg)] hover:text-white transition-colors text-sm">
              <Users className="w-5 h-5" />
              N of Many
            </Link>

            <div className="pt-6 pb-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#52525B] px-3">Account</div>
            </div>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#9CA3AF] hover:bg-[var(--glass-bg)] hover:text-white transition-colors text-sm">
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </nav>

          <div className="pt-4 border-t border-[var(--glass-border)]">
            <div className="flex items-center gap-3 p-3 bg-[var(--glass-bg)] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-sm font-semibold">
                U
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">User</div>
                <div className="text-xs text-[#6B7280] truncate">user@example.com</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-[240px] p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.02em] text-white mb-1">Your Dashboard</h1>
              <p className="text-[#9CA3AF]">Track your N of 1 study progress</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-white text-sm font-medium hover:bg-[var(--glass-bg-hover)] transition-colors">
              <Download className="w-[18px] h-[18px]" />
              Export Data
            </button>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-[1fr_1fr_320px] gap-5">
            {/* Protocol Card - spans 2 cols */}
            <div className="col-span-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-[var(--primary-dim)] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Activity className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-[22px] font-bold tracking-[-0.01em] text-white mb-1">{studyName}</h2>
                  <p className="text-sm text-[#9CA3AF] mb-4">{totalWeeks}-week protocol · Started {assessments[0]?.dueDate}</p>
                  <div className="h-2 bg-[var(--bg-elevated-2)] rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--primary-dark), var(--primary))' }}
                    />
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#71717A]"><strong className="text-[var(--primary)] font-semibold">Week {Math.min(currentWeek, totalWeeks)}</strong> of {totalWeeks}</span>
                    <span className="text-[#71717A]">{Math.round(progress)}% complete</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Entry Card */}
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 backdrop-blur-xl flex flex-col">
              <div className="text-sm font-medium text-[#9CA3AF] mb-4">Next Entry</div>
              {dueAssessment ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className={`text-[11px] font-semibold uppercase tracking-[0.08em] mb-2 ${dueAssessment.status === 'overdue' ? 'text-[var(--error)]' : 'text-[var(--success)]'}`}>
                    {dueAssessment.status === 'overdue' ? 'Overdue' : 'Due Today'}
                  </div>
                  <div className="text-lg font-semibold text-white mb-1">{dueAssessment.timepoint} Entry</div>
                  <div className="text-sm text-[#71717A] mb-5">~5 min to complete</div>
                  <Link href={`/study/${studyId}/assessment/${dueAssessment.id}`} className="w-full">
                    <Button size="lg" fullWidth>
                      Record Data
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-[var(--success)]/15 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-[var(--success)]" />
                  </div>
                  <div className="text-white font-medium">All caught up!</div>
                  <div className="text-sm text-[#71717A]">Next entry coming soon</div>
                </div>
              )}
            </div>

            {/* Score Card */}
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm font-medium text-[#9CA3AF]">Primary Outcome</span>
                <a href="#" className="text-[13px] font-medium text-[var(--primary)] hover:underline">View details</a>
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-[48px] font-semibold text-[var(--primary)] tracking-[-0.02em]">{latestScore}</span>
                {scoreChange > 0 && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[var(--success-dim)] rounded-full text-[13px] font-semibold text-[var(--success)]">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{scoreChange}%
                  </span>
                )}
              </div>
              <div className="text-sm text-[#71717A]">Response Score</div>

              <div className="mt-5 pt-5 border-t border-[var(--glass-border)] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary-glow)]" />
                  <span className="flex-1 text-[13px] text-[#9CA3AF]">Your score</span>
                  <span className="font-mono text-sm font-medium text-[var(--primary)]">{latestScore}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#52525B]" />
                  <span className="flex-1 text-[13px] text-[#9CA3AF]">Collective avg</span>
                  <span className="font-mono text-sm font-medium text-white">62</span>
                </div>
              </div>
            </div>

            {/* Chart Card */}
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm font-medium text-[#9CA3AF]">Progress Over Time</span>
                <a href="#" className="text-[13px] font-medium text-[var(--primary)] hover:underline">Full analysis</a>
              </div>
              <div className="h-44">
                <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4"/>
                  <path d="M0,100 Q50,95 100,90 T200,80 T300,75 T400,65 L400,150 L0,150 Z" fill="rgba(82,82,91,0.15)"/>
                  <path d="M0,100 Q50,95 100,90 T200,80 T300,75 T400,65" fill="none" stroke="rgba(82,82,91,0.4)" strokeWidth="2"/>
                  <path d="M0,110 Q50,100 100,80 T200,55 T300,40 T400,25" fill="none" stroke="#EA580C" strokeWidth="3" strokeLinecap="round"/>
                  {completedAssessments.map((_, i) => {
                    const x = (i / (completedAssessments.length)) * 400
                    const y = 110 - (i * 20)
                    return <circle key={i} cx={x} cy={Math.max(y, 25)} r="4" fill="#EA580C"/>
                  })}
                  <circle cx="400" cy="25" r="6" fill="#EA580C">
                    <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
              <div className="flex gap-5 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                  <span className="text-xs text-[#9CA3AF]">Your data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#52525B]" />
                  <span className="text-xs text-[#9CA3AF]">Collective (n=1,247)</span>
                </div>
              </div>
            </div>

            {/* Timeline Card - spans row 1-3, col 3 */}
            <div className="row-span-3 col-start-3 row-start-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 backdrop-blur-xl self-start">
              <div className="text-sm font-medium text-[#9CA3AF] mb-4">Protocol Timeline</div>
              <div className="space-y-0">
                {assessments.map((assessment, i) => (
                  <div key={assessment.id} className="flex gap-4 pb-4 border-b border-[var(--glass-border)] last:border-b-0">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        assessment.status === 'completed' ? 'bg-[var(--success)]' :
                        assessment.status === 'due' || assessment.status === 'overdue' ? 'bg-[var(--primary)] shadow-[0_0_0_4px_var(--primary-dim)]' :
                        'bg-transparent border-2 border-[#52525B]'
                      }`} />
                      {i < assessments.length - 1 && <div className="w-0.5 flex-1 bg-[var(--glass-border)] min-h-[20px]" />}
                    </div>
                    <div className="flex-1 pt-0">
                      <div className="font-semibold text-sm text-white mb-0.5">{assessment.timepoint}</div>
                      <div className="text-xs text-[#71717A] mb-2">{assessment.dueDate}</div>
                      <Badge
                        variant={
                          assessment.status === 'completed' ? 'success' :
                          assessment.status === 'due' ? 'primary' :
                          assessment.status === 'overdue' ? 'danger' : 'neutral'
                        }
                        size="sm"
                      >
                        {assessment.status === 'completed' ? 'Completed' :
                         assessment.status === 'due' ? 'Due Today' :
                         assessment.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                      </Badge>
                      {assessment.score && (
                        <div className="font-mono text-[13px] text-[#9CA3AF] mt-2">
                          Score: <strong className="text-[var(--primary)] font-semibold">{assessment.score}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights Card - spans 2 cols */}
            <div className="col-span-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 backdrop-blur-xl">
              <div className="text-sm font-medium text-[#9CA3AF] mb-4">Your Insights</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-[var(--glass-border)]">
                  <div className="text-xs text-[#71717A] uppercase tracking-[0.05em] mb-2">Completion Rate</div>
                  <div className="font-mono text-2xl font-semibold text-white">100%</div>
                  <div className="text-xs text-[#52525B] mt-1">{completedAssessments.length} of {completedAssessments.length} entries</div>
                </div>
                <div className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-[var(--glass-border)]">
                  <div className="text-xs text-[#71717A] uppercase tracking-[0.05em] mb-2">Your Percentile</div>
                  <div className="font-mono text-2xl font-semibold text-[var(--primary)]">87th</div>
                  <div className="text-xs text-[#52525B] mt-1">vs. collective</div>
                </div>
                <div className="bg-[var(--bg-elevated)] rounded-xl p-5 border border-[var(--glass-border)]">
                  <div className="text-xs text-[#71717A] uppercase tracking-[0.05em] mb-2">Days Remaining</div>
                  <div className="font-mono text-2xl font-semibold text-white">{Math.max(0, (totalWeeks - currentWeek) * 7)}</div>
                  <div className="text-xs text-[#52525B] mt-1">{Math.max(0, totalWeeks - currentWeek)} weeks left</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden px-5 py-6 pb-8">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6">
          <NofOneLogo size={28} />
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-sm font-semibold">
            U
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Your Dashboard</h1>
        <p className="text-[#9CA3AF] mb-6">Week {Math.min(currentWeek, totalWeeks)} of {totalWeeks}</p>

        {/* Protocol Progress */}
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[var(--primary-dim)] rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white">{studyName}</div>
              <div className="text-sm text-[#71717A]">{totalWeeks}-week protocol</div>
            </div>
          </div>
          <div className="h-2 bg-[var(--bg-elevated-2)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--primary-dark), var(--primary))' }}
            />
          </div>
          <div className="text-xs text-[#71717A] mt-2 text-right">{Math.round(progress)}% complete</div>
        </div>

        {/* Due Assessment */}
        {dueAssessment && (
          <div className="bg-[var(--glass-bg)] border border-[var(--primary)]/30 rounded-2xl p-5 mb-5 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-[var(--primary)]/10 rounded-full blur-2xl" />
            <Badge variant={dueAssessment.status === 'overdue' ? 'danger' : 'warning'} dot dotPulse className="mb-3">
              {dueAssessment.status === 'overdue' ? 'Overdue' : 'Due Now'}
            </Badge>
            <h3 className="text-lg font-semibold text-white mb-1">{dueAssessment.timepoint} Entry</h3>
            <p className="text-sm text-[#9CA3AF] mb-4">~5 minutes to complete</p>
            <Link href={`/study/${studyId}/assessment/${dueAssessment.id}`}>
              <Button size="lg" fullWidth>
                Record Data
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Score */}
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5 mb-5">
          <div className="text-sm text-[#9CA3AF] mb-2">Your Score</div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-4xl font-semibold text-[var(--primary)]">{latestScore}</span>
            {scoreChange > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--success-dim)] rounded-full text-xs font-semibold text-[var(--success)]">
                <ArrowUpRight className="w-3 h-3" />
                +{scoreChange}%
              </span>
            )}
          </div>
          <div className="text-xs text-[#71717A] mt-1">Collective avg: 62</div>
        </div>

        {/* Timeline */}
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5">
          <div className="text-sm font-medium text-[#9CA3AF] mb-4">Timeline</div>
          <div className="space-y-3">
            {assessments.slice(0, 5).map((assessment) => (
              <div key={assessment.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    assessment.status === 'completed' ? 'bg-[var(--success)]' :
                    assessment.status === 'due' || assessment.status === 'overdue' ? 'bg-[var(--primary)]' :
                    'border-2 border-[#52525B]'
                  }`} />
                  <span className="text-sm text-white">{assessment.timepoint}</span>
                </div>
                <span className="text-xs text-[#71717A]">{assessment.status === 'completed' ? 'Done' : assessment.dueDate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
