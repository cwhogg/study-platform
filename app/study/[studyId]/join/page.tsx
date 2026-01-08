'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MobileFullScreen, MobileBottomAction, MobileDivider } from '@/components/ui/MobileContainer'
import { Button } from '@/components/ui/Button'
import { ClipboardCheck, Clock, Sparkles, Shield } from 'lucide-react'
import type { EnrollmentCopy } from '@/lib/db/types'

interface StudyData {
  id: string
  name: string
  intervention: string
  enrollmentCopy: EnrollmentCopy | null
  durationWeeks: number
}

// Default copy if none generated
const DEFAULT_WELCOME = {
  headline: 'Join Our Research Study',
  subheadline: 'Help shape the future of care',
  bullets: [
    'Quick check-ins from your phone',
    'Your regular treatment continues',
    'Make a real impact on research',
  ],
  buttonText: 'Get Started',
  footerNote: 'Takes about 10 minutes to enroll',
}

const FEATURE_ICONS = [ClipboardCheck, Clock, Sparkles]

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
          setError(data.error || 'Failed to load study')
          setIsLoading(false)
          return
        }
        const data = await response.json()
        setStudy(data)
      } catch (err) {
        console.error('Error fetching study:', err)
        setError('Failed to load study')
      }
      setIsLoading(false)
    }

    fetchStudy()
  }, [studyId])

  if (isLoading) {
    return (
      <MobileFullScreen className="flex items-center justify-center bg-white">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-2 border-[#1E40AF] border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-600">Loading study...</p>
        </div>
      </MobileFullScreen>
    )
  }

  if (error || !study) {
    return (
      <MobileFullScreen className="flex items-center justify-center bg-white">
        <div className="text-center px-4 animate-fade-in">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-slate-600" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Unable to Load Study</h1>
          <p className="text-slate-600 mb-6">{error || 'Study not found'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#1E40AF] text-white font-medium rounded-xl hover:bg-[#1E40AF]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </MobileFullScreen>
    )
  }

  const welcome = study.enrollmentCopy?.welcome || DEFAULT_WELCOME
  const bullets = welcome.bullets || DEFAULT_WELCOME.bullets

  return (
    <>
      <MobileFullScreen className="pb-32 bg-white">
        {/* Hero Section */}
        <div className="text-center pt-8 mb-8 stagger-children">
          {/* Logo/Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1E40AF]/10 border border-[#1E40AF]/30 rounded-full mb-6">
            <div className="w-2 h-2 bg-[#1E40AF] rounded-full animate-pulse" />
            <span className="text-xs font-medium text-[#1E40AF]">Research Study</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-3xl text-slate-900 mb-3 text-balance">
            {welcome.headline || study.name}
          </h1>

          {/* Subheadline */}
          {welcome.subheadline && (
            <p className="text-slate-600 text-lg">
              {welcome.subheadline}
            </p>
          )}
        </div>

        <MobileDivider />

        {/* Value Props */}
        <div className="space-y-4 stagger-children">
          {bullets.slice(0, 3).map((bullet, index) => {
            const Icon = FEATURE_ICONS[index % FEATURE_ICONS.length]
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#1E40AF] to-[#1E40AF] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-slate-900">{bullet}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Duration Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{study.durationWeeks} week study</span>
          </div>
        </div>

        {/* Footer note */}
        {welcome.footerNote && (
          <p className="text-center text-sm text-slate-600 mt-4">
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
        <p className="text-center text-xs text-slate-600 mt-3">
          By continuing, you agree to review the study information
        </p>
      </MobileBottomAction>
    </>
  )
}
