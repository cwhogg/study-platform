'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MobileFullScreen, MobileBottomAction, MobileDivider } from '@/components/ui/MobileContainer'
import { Button } from '@/components/ui/Button'
import { Target, Clock, Activity, TrendingUp, AlertCircle } from 'lucide-react'
import type { EnrollmentCopy } from '@/lib/db/types'

interface StudyData {
  id: string
  name: string
  intervention: string
  enrollmentCopy: EnrollmentCopy | null
  durationWeeks: number
  protocol?: {
    summary?: string
    primaryEndpoint?: { name: string }
    secondaryEndpoints?: { name: string }[]
    schedule?: { timepoint: string }[]
  }
}

// Default copy if none generated
const DEFAULT_WELCOME = {
  headline: 'Begin Your Protocol',
  subheadline: 'Track your response with scientific rigor',
  bullets: [
    'Quick data entries from your phone',
    'Validated measurement instruments',
    'Compare your results to the aggregate',
  ],
  buttonText: 'Get Started',
  footerNote: 'Takes about 10 minutes to set up',
}

const FEATURE_ICONS = [Activity, TrendingUp, Target]

export default function JoinPage() {
  const params = useParams()
  const studyId = params.studyId as string

  const [study, setStudy] = useState<StudyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchStudy() {
      try {
        const response = await fetch(`/api/studies/${studyId}/public`)
        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Failed to load protocol')
          setIsLoading(false)
          return
        }
        const data = await response.json()
        setStudy(data)
      } catch (err) {
        console.error('Error fetching study:', err)
        setError('Failed to load protocol')
      }
      setIsLoading(false)
    }

    fetchStudy()
  }, [studyId])

  if (isLoading) {
    return (
      <MobileFullScreen className="flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--glass-border)]" />
            <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
          </div>
          <p className="text-[var(--text-secondary)]">Loading protocol...</p>
        </div>
      </MobileFullScreen>
    )
  }

  if (error || !study) {
    return (
      <MobileFullScreen className="flex items-center justify-center">
        <div className="text-center px-4 animate-fade-in">
          <div className="w-16 h-16 bg-[var(--error)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--error)]/20">
            <AlertCircle className="w-8 h-8 text-[var(--error)]" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Unable to Load Protocol</h1>
          <p className="text-[var(--text-secondary)] mb-6">{error || 'Protocol not found'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[var(--primary)] text-white font-medium rounded-xl hover:bg-[var(--primary-light)] transition-colors"
          >
            Try Again
          </button>
        </div>
      </MobileFullScreen>
    )
  }

  const welcome = study.enrollmentCopy?.welcome || DEFAULT_WELCOME

  // Build dynamic headline - use study name which includes intervention + goal
  const headline = welcome.headline && welcome.headline !== DEFAULT_WELCOME.headline
    ? welcome.headline
    : `Join the ${study.name}`

  // Build dynamic subheadline - use protocol summary or fall back
  const subheadline = welcome.subheadline && !welcome.subheadline.includes('Study Sponsor')
    ? welcome.subheadline
    : study.protocol?.summary || 'Track your personal response with validated clinical measures'

  // Build dynamic bullets based on actual study data
  const dynamicBullets = [
    `Short surveys every 2-4 weeks`,
    `${Math.round(study.durationWeeks / 4.33)} months total`,
    study.protocol?.primaryEndpoint?.name
      ? `Measure ${study.protocol.primaryEndpoint.name.toLowerCase()}`
      : 'Help improve future treatments',
  ]

  const bullets = welcome.bullets && welcome.bullets.length > 0 && welcome.bullets[0] !== DEFAULT_WELCOME.bullets[0]
    ? welcome.bullets
    : dynamicBullets

  return (
    <>
      <MobileFullScreen className="pb-32">
        {/* Hero Section */}
        <div className="text-center pt-8 mb-8 stagger-children">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--primary-dim)] border border-[var(--primary)]/30 rounded-full mb-6">
            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[var(--primary-light)]">N of 1 Protocol</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-semibold text-[var(--text-primary)] mb-3 text-balance">
            {headline}
          </h1>

          {/* Subheadline */}
          <p className="text-[var(--text-secondary)] text-lg text-balance px-2">
            {subheadline}
          </p>
        </div>

        <MobileDivider />

        {/* Value Props */}
        <div className="space-y-4 stagger-children">
          {bullets.slice(0, 3).map((bullet, index) => {
            const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length]
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)]"
              >
                <div className="w-12 h-12 bg-[var(--primary-dim)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-[var(--primary)]" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-[var(--text-primary)]">{bullet}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Duration Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Clock className="w-4 h-4" />
            <span>{study.durationWeeks} week protocol</span>
          </div>
        </div>

        {/* Footer note */}
        {welcome.footerNote && (
          <p className="text-center text-sm text-[var(--text-muted)] mt-4">
            {welcome.footerNote}
          </p>
        )}
      </MobileFullScreen>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction variant="blur">
        <Link href={`/study/${studyId}/join/register`} className="block">
          <Button size="lg" fullWidth>
            {welcome.buttonText || 'Get Started'}
          </Button>
        </Link>
        <p className="text-center text-xs text-[var(--text-muted)] mt-3">
          By continuing, you agree to review the protocol information
        </p>
      </MobileBottomAction>
    </>
  )
}
