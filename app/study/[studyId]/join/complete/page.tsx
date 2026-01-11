'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, Calendar, FlaskConical, Mail, ArrowRight } from 'lucide-react'
import type { EnrollmentCopy } from '@/lib/db/types'

// Default copy if none generated
const DEFAULT_ENROLLMENT_COMPLETE = {
  headline: 'You\'re Enrolled!',
  celebration: '',
  body: 'Thank you for joining. Your participation helps improve treatment for future patients.',
  nextSteps: {
    headline: 'What\'s Next',
    items: [
      { icon: 'calendar', title: 'Next check-in', body: 'Week 2. We\'ll text you a reminder.' },
      { icon: 'mail', title: 'Consent copy', body: 'We emailed your signed consent for your records.' },
    ],
  },
  buttonText: 'View Dashboard',
}

interface StudyData {
  name: string
  intervention: string
  enrollmentCopy: EnrollmentCopy | null
  protocol?: {
    schedule?: { timepoint: string; labs?: string[] }[]
  }
}

function CompletePageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const studyId = params.studyId as string
  const participantId = searchParams.get('participantId')

  const [nextCheckInDate, setNextCheckInDate] = useState('')
  const [study, setStudy] = useState<StudyData | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    // Calculate next check-in date (2 weeks from now)
    const date = new Date()
    date.setDate(date.getDate() + 14)
    const formatted = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    })
    setNextCheckInDate(formatted)
  }, [])

  useEffect(() => {
    async function fetchStudy() {
      try {
        const response = await fetch(`/api/studies/${studyId}/public`)
        if (response.ok) {
          const data = await response.json()
          setStudy(data)
        }
      } catch (err) {
        console.error('Error fetching study:', err)
      }
    }
    fetchStudy()
  }, [studyId])

  // Send enrollment confirmation email
  useEffect(() => {
    async function completeEnrollment() {
      if (!participantId || emailSent) return

      try {
        const response = await fetch('/api/enrollment/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId,
            studyId,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setEmailSent(data.emailSent)
          console.log('[Complete] Enrollment email sent:', data.emailSent)
        }
      } catch (err) {
        console.error('Error completing enrollment:', err)
      }
    }

    completeEnrollment()
  }, [participantId, studyId, emailSent])

  const copy = study?.enrollmentCopy?.enrollmentComplete || DEFAULT_ENROLLMENT_COMPLETE

  // Check if study has labs
  const hasLabs = study?.protocol?.schedule?.some(tp => tp.labs && tp.labs.length > 0) ?? false

  // Replace {{intervention}} placeholder
  const body = (copy.body || DEFAULT_ENROLLMENT_COMPLETE.body)
    .replace('{{intervention}}', study?.intervention || 'treatment')
    .replace('{{nextAssessmentDate}}', nextCheckInDate)

  return (
    <>
      <MobileContainer withBottomPadding className="pt-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[var(--success)]/15 rounded-full flex items-center justify-center border border-[var(--success)]/30 shadow-lg shadow-[var(--success)]/20">
            <CheckCircle2 className="w-10 h-10 text-[var(--success)]" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-[var(--text-primary)] text-center mb-2">
          {copy.headline || DEFAULT_ENROLLMENT_COMPLETE.headline}
        </h1>
        <p className="text-[var(--text-secondary)] text-center mb-8">
          {body}
        </p>

        {/* Divider */}
        <div className="border-t border-[var(--glass-border)] my-6" />

        {/* What's Next Section */}
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          {copy.nextSteps?.headline || 'What\'s Next'}
        </h2>

        <div className="space-y-4">
          {/* Next Check-in */}
          <div className="flex items-start gap-4 p-4 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]">
            <div className="w-10 h-10 bg-[var(--primary-dim)] rounded-lg flex items-center justify-center flex-shrink-0 border border-[var(--primary)]/30">
              <Calendar className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <div className="font-medium text-[var(--text-primary)]">Next check-in</div>
              <div className="text-[var(--text-secondary)] text-sm">
                {nextCheckInDate} (Week 2)
              </div>
              <div className="text-[var(--text-muted)] text-sm mt-1">
                We&apos;ll send you a reminder
              </div>
            </div>
          </div>

          {/* Baseline Labs - only show if study has labs */}
          {hasLabs && (
            <div className="flex items-start gap-4 p-4 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]">
              <div className="w-10 h-10 bg-[var(--primary-dim)] rounded-lg flex items-center justify-center flex-shrink-0 border border-[var(--primary)]/30">
                <FlaskConical className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <div className="font-medium text-[var(--text-primary)]">Baseline labs</div>
                <div className="text-[var(--text-secondary)] text-sm">
                  Your doctor will order these as part of your normal care
                </div>
              </div>
            </div>
          )}

          {/* Email Confirmation */}
          <div className="flex items-start gap-4 p-4 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]">
            <div className="w-10 h-10 bg-[var(--primary-dim)] rounded-lg flex items-center justify-center flex-shrink-0 border border-[var(--primary)]/30">
              <Mail className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <div className="font-medium text-[var(--text-primary)]">Check your email</div>
              <div className="text-[var(--text-secondary)] text-sm">
                We&apos;ve sent a copy of your signed consent
              </div>
            </div>
          </div>
        </div>

        {/* Support Note */}
        <div className="mt-8 p-4 border border-[var(--glass-border)] rounded-xl bg-[var(--glass-bg)]">
          <p className="text-sm text-[var(--text-secondary)] text-center">
            Questions?{' '}
            <a href="mailto:support@nofone.us" className="font-medium text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors">
              Contact support
            </a>
          </p>
        </div>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <Link href={`/study/${studyId}/dashboard`} className="block w-full">
          <Button size="lg" fullWidth rightIcon={<ArrowRight className="w-5 h-5" />}>
            {copy.buttonText || DEFAULT_ENROLLMENT_COMPLETE.buttonText}
          </Button>
        </Link>
      </MobileBottomAction>
    </>
  )
}

export default function CompletePage() {
  return (
    <Suspense fallback={
      <MobileContainer centered>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </MobileContainer>
    }>
      <CompletePageContent />
    </Suspense>
  )
}
