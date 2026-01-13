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
  scores?: Record<string, number>  // instrument -> score
}

interface ScheduleItem {
  id: string
  timepoint: string
  week: number
  instruments: string[]
}

// Fallback schedule if protocol doesn't have one
const FALLBACK_SCHEDULE: ScheduleItem[] = [
  { id: 'baseline', timepoint: 'Baseline', week: 0, instruments: [] },
  { id: 'week_2', timepoint: 'Week 2', week: 2, instruments: [] },
  { id: 'week_4', timepoint: 'Week 4', week: 4, instruments: [] },
  { id: 'week_6', timepoint: 'Week 6', week: 6, instruments: [] },
  { id: 'week_12', timepoint: 'Week 12', week: 12, instruments: [] },
]

// Format timepoint name for display (e.g., "week_6" -> "Week 6")
function formatTimepoint(tp: string): string {
  const formatted = tp.replace(/_/g, ' ')
  return formatted
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Parse week number from timepoint string
function parseWeekNumber(timepoint: string): number {
  if (timepoint.toLowerCase() === 'baseline') return 0
  const match = timepoint.match(/week[_\s]*(\d+)/i)
  return match ? parseInt(match[1], 10) : 0
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Threshold type from protocol
interface SeverityThreshold {
  min: number
  max: number
  label: string
}

// Get severity label - first check protocol thresholds, then fall back to hardcoded
function getSeverityLabel(
  instrumentId: string,
  score: number,
  protocolThresholds?: Record<string, SeverityThreshold[]>
): string | null {
  // First, try to get label from protocol thresholds
  const thresholds = protocolThresholds?.[instrumentId]
  if (thresholds && thresholds.length > 0) {
    for (const t of thresholds) {
      if (score >= t.min && score <= t.max) {
        return t.label
      }
    }
  }

  // Fall back to hardcoded thresholds for common instruments
  const id = instrumentId.toLowerCase().replace(/[-_]/g, '')

  // PHQ-9: 0-27 scale
  if (id.includes('phq9') || id.includes('phq-9')) {
    if (score >= 20) return 'Severe'
    if (score >= 15) return 'Mod. severe'
    if (score >= 10) return 'Moderate'
    if (score >= 5) return 'Mild'
    return 'Minimal'
  }

  // GAD-7: 0-21 scale
  if (id.includes('gad7') || id.includes('gad-7')) {
    if (score >= 15) return 'Severe'
    if (score >= 10) return 'Moderate'
    if (score >= 5) return 'Mild'
    return 'Minimal'
  }

  // PHQ-2: 0-6 scale
  if (id.includes('phq2') || id.includes('phq-2')) {
    if (score >= 3) return 'Positive screen'
    return 'Negative screen'
  }

  // IIEF-5: 5-25 scale (higher is better)
  if (id.includes('iief')) {
    if (score >= 22) return 'Normal'
    if (score >= 17) return 'Mild ED'
    if (score >= 12) return 'Mild-mod ED'
    if (score >= 8) return 'Moderate ED'
    return 'Severe ED'
  }

  // BDI-II: 0-63 scale
  if (id.includes('bdi')) {
    if (score >= 29) return 'Severe'
    if (score >= 20) return 'Moderate'
    if (score >= 14) return 'Mild'
    return 'Minimal'
  }

  // No label for unknown instruments
  return null
}

export default function DashboardPage() {
  const params = useParams()
  const studyId = params.studyId as string

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [currentWeek, setCurrentWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const [notEnrolled, setNotEnrolled] = useState(false)
  const [studyName, setStudyName] = useState('Your Protocol')
  const [totalWeeks, setTotalWeeks] = useState(12)
  const [userProfile, setUserProfile] = useState<{ firstName?: string; lastName?: string; email?: string } | null>(null)
  const [instrumentThresholds, setInstrumentThresholds] = useState<Record<string, SeverityThreshold[]>>({})

  const loadDashboardData = useCallback(async () => {
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      // Load user profile for sidebar
      const { data: profile } = await supabase
        .from('sp_profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserProfile({
          firstName: profile.first_name || undefined,
          lastName: profile.last_name || undefined,
          email: profile.email || user.email,
        })
      } else {
        setUserProfile({ email: user.email })
      }

      // Get study info including protocol
      const { data: study } = await supabase
        .from('sp_studies')
        .select('name, intervention, protocol, duration_weeks')
        .eq('id', studyId)
        .single()

      if (study) {
        setStudyName(study.name || study.intervention || 'Your Protocol')
        if (study.duration_weeks) {
          setTotalWeeks(study.duration_weeks)
        }
      }

      // Build schedule from protocol or use fallback
      let scheduleConfig: ScheduleItem[] = FALLBACK_SCHEDULE
      const protocol = study?.protocol as {
        schedule?: { timepoint: string; instruments?: string[] }[]
        instruments?: Array<{
          id: string
          scoring?: {
            thresholds?: SeverityThreshold[]
          }
        }>
      } | null

      if (protocol?.schedule && protocol.schedule.length > 0) {
        scheduleConfig = protocol.schedule.map(tp => ({
          id: tp.timepoint,
          timepoint: formatTimepoint(tp.timepoint),
          week: parseWeekNumber(tp.timepoint),
          instruments: tp.instruments || [],
        }))
        console.log('[Dashboard] Using protocol schedule:', scheduleConfig.length, 'timepoints')
      } else {
        console.log('[Dashboard] Using fallback schedule')
      }

      // Extract instrument thresholds from protocol
      if (protocol?.instruments && Array.isArray(protocol.instruments)) {
        const thresholdsMap: Record<string, SeverityThreshold[]> = {}
        for (const inst of protocol.instruments) {
          if (inst.id && inst.scoring?.thresholds && inst.scoring.thresholds.length > 0) {
            thresholdsMap[inst.id] = inst.scoring.thresholds
          }
        }
        setInstrumentThresholds(thresholdsMap)
        console.log('[Dashboard] Loaded thresholds for instruments:', Object.keys(thresholdsMap))
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
        .select('timepoint, instrument, submitted_at, scores')
        .eq('participant_id', participant.id)

      // Track submissions by timepoint (including scores per instrument)
      const submissionsByTimepoint = new Map<string, { instruments: Set<string>; lastSubmitted: Date | null; scores: Record<string, number> }>()
      submissions?.forEach(s => {
        if (!submissionsByTimepoint.has(s.timepoint)) {
          submissionsByTimepoint.set(s.timepoint, { instruments: new Set(), lastSubmitted: null, scores: {} })
        }
        const entry = submissionsByTimepoint.get(s.timepoint)!
        entry.instruments.add(s.instrument)
        if (s.submitted_at) {
          const submittedDate = new Date(s.submitted_at)
          if (!entry.lastSubmitted || submittedDate > entry.lastSubmitted) {
            entry.lastSubmitted = submittedDate
          }
        }
        // Store score per instrument
        const scoreData = s.scores as { total?: number } | null
        if (scoreData?.total !== undefined) {
          entry.scores[s.instrument] = scoreData.total
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

        // Check if timepoint has any submissions - for protocols without instrument list,
        // having ANY submission means it's complete
        const hasSubmissions = completedInstruments.length > 0
        const allCompleted = config.instruments.length === 0
          ? hasSubmissions  // No instruments specified: any submission counts
          : config.instruments.every(i => completedInstruments.includes(i))

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

        // Use actual scores from submissions (per instrument)
        const scores = allCompleted && submissionEntry && Object.keys(submissionEntry.scores).length > 0
          ? submissionEntry.scores
          : undefined

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
          scores
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

  const dueAssessment = assessments.find(a => a.status === 'due' || a.status === 'overdue')
  const completedAssessments = assessments.filter(a => a.status === 'completed')
  // Progress based on completed assessments, not time
  const progress = assessments.length > 0
    ? Math.round((completedAssessments.length / assessments.length) * 100)
    : 0
  // Get latest scores (all instruments from most recent completed assessment)
  const latestScores = completedAssessments.length > 0
    ? completedAssessments[completedAssessments.length - 1].scores
    : undefined

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
            <Link href="/">
              <NofOneLogo showText size={32} />
            </Link>
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
                {userProfile?.firstName?.[0]?.toUpperCase() || userProfile?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {userProfile?.firstName && userProfile?.lastName
                    ? `${userProfile.firstName} ${userProfile.lastName}`
                    : userProfile?.firstName || userProfile?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-[#6B7280] truncate">{userProfile?.email || 'user@example.com'}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-[240px] p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[28px] font-bold tracking-[-0.02em] text-white mb-1">Your Dashboard</h1>
            <p className="text-[#9CA3AF]">Track your N of 1 study progress</p>
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
                <span className="text-sm font-medium text-[#9CA3AF]">Your Scores</span>
                <a href="#" className="text-[13px] font-medium text-[var(--primary)] hover:underline">View details</a>
              </div>
              {latestScores && Object.keys(latestScores).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(latestScores).map(([instrument, score]) => {
                    const severity = getSeverityLabel(instrument, score, instrumentThresholds)
                    return (
                      <div key={instrument}>
                        <div className="text-xs text-[#71717A] uppercase tracking-wide mb-1">{instrument.replace(/_/g, '-').toUpperCase()}</div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-3xl font-semibold text-[var(--primary)]">{score}</span>
                          {severity && <span className="text-sm text-[#9CA3AF]">({severity})</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-[#71717A] text-sm">No scores yet</div>
              )}

              <div className="mt-5 pt-5 border-t border-[var(--glass-border)] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#52525B]" />
                  <span className="flex-1 text-[13px] text-[#9CA3AF]">Collective avg</span>
                  <span className="font-mono text-sm font-medium text-[#71717A]">NA</span>
                </div>
              </div>
            </div>

            {/* Chart Card */}
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm font-medium text-[#9CA3AF]">Progress Over Time</span>
                <span className="text-[13px] text-[#52525B]">Primary endpoint scores</span>
              </div>
              <div className="h-44 bg-[var(--bg-elevated)] rounded-xl flex items-center justify-center">
                {completedAssessments.length > 0 && completedAssessments.some(a => a.scores && Object.keys(a.scores).length > 0) ? (
                  <svg className="w-full h-full p-4" viewBox="0 0 400 130" preserveAspectRatio="xMidYMid meet">
                    {/* Grid lines */}
                    <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4"/>
                    <line x1="40" y1="65" x2="380" y2="65" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4"/>
                    <line x1="40" y1="110" x2="380" y2="110" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4"/>
                    {/* Y-axis labels */}
                    <text x="35" y="24" textAnchor="end" fill="#52525B" fontSize="10">High</text>
                    <text x="35" y="114" textAnchor="end" fill="#52525B" fontSize="10">Low</text>
                    {/* Data points */}
                    {completedAssessments.map((assessment, i) => {
                      const scores = assessment.scores || {}
                      const firstScore = Object.values(scores)[0]
                      if (firstScore === undefined) return null
                      // Normalize: assume max 27 (PHQ-9 style), lower is better so invert
                      const maxScore = 27
                      const normalizedY = 20 + (firstScore / maxScore) * 90
                      const x = completedAssessments.length === 1
                        ? 210
                        : 60 + (i / (completedAssessments.length - 1)) * 300
                      return (
                        <g key={i}>
                          <circle cx={x} cy={normalizedY} r="6" fill="#EA580C"/>
                          <text x={x} y={normalizedY - 12} textAnchor="middle" fill="#EA580C" fontSize="11" fontWeight="600">{firstScore}</text>
                        </g>
                      )
                    })}
                    {/* Connect line if multiple points */}
                    {completedAssessments.filter(a => a.scores && Object.values(a.scores)[0] !== undefined).length > 1 && (
                      <path
                        d={completedAssessments.map((assessment, i) => {
                          const scores = assessment.scores || {}
                          const firstScore = Object.values(scores)[0]
                          if (firstScore === undefined) return ''
                          const maxScore = 27
                          const normalizedY = 20 + (firstScore / maxScore) * 90
                          const x = 60 + (i / (completedAssessments.length - 1)) * 300
                          return `${i === 0 ? 'M' : 'L'}${x},${normalizedY}`
                        }).filter(Boolean).join(' ')}
                        fill="none"
                        stroke="#EA580C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity="0.5"
                      />
                    )}
                  </svg>
                ) : (
                  <div className="text-center text-[#52525B]">
                    <div className="text-sm">No score data yet</div>
                    <div className="text-xs mt-1">Complete assessments to see your progress</div>
                  </div>
                )}
              </div>
              <div className="flex gap-5 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                  <span className="text-xs text-[#9CA3AF]">Your scores ({completedAssessments.filter(a => a.scores).length} point{completedAssessments.filter(a => a.scores).length !== 1 ? 's' : ''})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#52525B]" />
                  <span className="text-xs text-[#52525B]">Collective (coming soon)</span>
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
                      {assessment.scores && Object.keys(assessment.scores).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(assessment.scores).map(([instrument, score]) => {
                            const severity = getSeverityLabel(instrument, score, instrumentThresholds)
                            return (
                              <div key={instrument} className="font-mono text-[13px] text-[#9CA3AF]">
                                {instrument.replace(/_/g, '-').toUpperCase()}: <strong className="text-[var(--primary)] font-semibold">{score}</strong>
                                {severity && <span className="text-[#71717A] font-sans"> ({severity})</span>}
                              </div>
                            )
                          })}
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
                <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--glass-border)] flex flex-col">
                  <div className="text-[10px] text-[#71717A] uppercase tracking-wider mb-2 whitespace-nowrap">Completion</div>
                  <div className="font-mono text-2xl font-semibold text-white">
                    {assessments.filter(a => a.status !== 'upcoming').length > 0
                      ? Math.round((completedAssessments.length / assessments.filter(a => a.status !== 'upcoming').length) * 100)
                      : 0}%
                  </div>
                  <div className="text-xs text-[#52525B] mt-auto pt-1">
                    {completedAssessments.length}/{assessments.filter(a => a.status !== 'upcoming').length} due
                  </div>
                </div>
                <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--glass-border)] flex flex-col">
                  <div className="text-[10px] text-[#71717A] uppercase tracking-wider mb-2 whitespace-nowrap">Progress</div>
                  <div className="font-mono text-2xl font-semibold text-[var(--primary)]">{progress}%</div>
                  <div className="text-xs text-[#52525B] mt-auto pt-1">{completedAssessments.length}/{assessments.length} total</div>
                </div>
                <div className="bg-[var(--bg-elevated)] rounded-xl p-4 border border-[var(--glass-border)] flex flex-col">
                  <div className="text-[10px] text-[#71717A] uppercase tracking-wider mb-2 whitespace-nowrap">Remaining</div>
                  <div className="font-mono text-2xl font-semibold text-white">{Math.max(0, (totalWeeks - currentWeek) * 7)}d</div>
                  <div className="text-xs text-[#52525B] mt-auto pt-1">{Math.max(0, totalWeeks - currentWeek)} weeks</div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Data */}
          <div className="mt-8 flex justify-center">
            <button className="flex items-center gap-2 px-6 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-[#9CA3AF] text-sm font-medium hover:bg-[var(--glass-bg-hover)] hover:text-white transition-colors">
              <Download className="w-4 h-4" />
              Export Your Data
            </button>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden px-5 py-6 pb-8">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <NofOneLogo size={28} />
          </Link>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center text-sm font-semibold">
            {userProfile?.firstName?.[0]?.toUpperCase() || userProfile?.email?.[0]?.toUpperCase() || 'U'}
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

        {/* Scores */}
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5 mb-5">
          <div className="text-sm text-[#9CA3AF] mb-3">Your Scores</div>
          {latestScores && Object.keys(latestScores).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(latestScores).map(([instrument, score]) => {
                const severity = getSeverityLabel(instrument, score, instrumentThresholds)
                return (
                  <div key={instrument}>
                    <div className="text-xs text-[#71717A] uppercase tracking-wide">{instrument.replace(/_/g, '-').toUpperCase()}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-semibold text-[var(--primary)]">{score}</span>
                      {severity && <span className="text-sm text-[#9CA3AF]">({severity})</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-[#71717A] text-sm">No scores yet</div>
          )}
          <div className="text-xs text-[#71717A] mt-3 pt-3 border-t border-[var(--glass-border)]">Collective avg: NA</div>
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
