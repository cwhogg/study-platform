'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { CheckCircle2, Calendar, FlaskConical, Mail } from 'lucide-react'
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

  // Replace {{intervention}} placeholder
  const body = (copy.body || DEFAULT_ENROLLMENT_COMPLETE.body)
    .replace('{{intervention}}', study?.intervention || 'treatment')
    .replace('{{nextAssessmentDate}}', nextCheckInDate)

  // Icon mapping
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar': return Calendar
      case 'mail': return Mail
      case 'droplet':
      case 'flask': return FlaskConical
      default: return Calendar
    }
  }

  return (
    <>
      <MobileContainer withBottomPadding className="pt-8 bg-slate-900">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-emerald-900/50 rounded-full flex items-center justify-center border border-emerald-700">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 text-center mb-2">
          {copy.headline || DEFAULT_ENROLLMENT_COMPLETE.headline}
        </h1>
        <p className="text-slate-400 text-center mb-8">
          {body}
        </p>

        {/* Divider */}
        <div className="border-t border-slate-800 my-6" />

        {/* What's Next Section */}
        <h2 className="text-lg font-semibold text-slate-100 mb-4">
          {copy.nextSteps?.headline || 'What\'s Next'}
        </h2>

        <div className="space-y-4">
          {/* Next Check-in */}
          <div className="flex items-start gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <div className="w-10 h-10 bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="font-medium text-slate-100">Next check-in</div>
              <div className="text-slate-400 text-sm">
                {nextCheckInDate} (Week 2)
              </div>
              <div className="text-slate-500 text-sm mt-1">
                We&apos;ll send you a reminder
              </div>
            </div>
          </div>

          {/* Baseline Labs */}
          <div className="flex items-start gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <div className="w-10 h-10 bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="font-medium text-slate-100">Baseline labs</div>
              <div className="text-slate-400 text-sm">
                Your doctor will order these as part of your normal care
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="flex items-start gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <div className="w-10 h-10 bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="font-medium text-slate-100">Check your email</div>
              <div className="text-slate-400 text-sm">
                We&apos;ve sent a copy of your signed consent
              </div>
            </div>
          </div>
        </div>

        {/* Support Note */}
        <div className="mt-8 p-4 border border-slate-700 rounded-xl bg-slate-800">
          <p className="text-sm text-slate-400 text-center">
            Questions? Contact us at{' '}
            <span className="font-medium text-slate-100">research@example.com</span>
          </p>
        </div>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <Link
          href={`/study/${studyId}/dashboard`}
          className="block w-full py-4 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 transition-colors"
          style={{ minHeight: '52px' }}
        >
          {copy.buttonText || DEFAULT_ENROLLMENT_COMPLETE.buttonText}
        </Link>
      </MobileBottomAction>
    </>
  )
}

export default function CompletePage() {
  return (
    <Suspense fallback={
      <MobileContainer centered className="bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </MobileContainer>
    }>
      <CompletePageContent />
    </Suspense>
  )
}
