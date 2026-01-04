'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { CheckCircle2, Calendar, FlaskConical, Mail } from 'lucide-react'

export default function CompletePage() {
  const params = useParams()
  const studyId = params.studyId as string

  const [nextCheckInDate, setNextCheckInDate] = useState('')

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

  return (
    <>
      <MobileContainer withBottomPadding className="pt-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          You&apos;re Enrolled!
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Thank you for joining the study. Your baseline is complete.
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100 my-6" />

        {/* What's Next Section */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          What&apos;s Next
        </h2>

        <div className="space-y-4">
          {/* Next Check-in */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Next check-in</div>
              <div className="text-gray-600 text-sm">
                {nextCheckInDate} (Week 2)
              </div>
              <div className="text-gray-500 text-sm mt-1">
                We&apos;ll send you a reminder
              </div>
            </div>
          </div>

          {/* Baseline Labs */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Baseline labs</div>
              <div className="text-gray-600 text-sm">
                Your doctor will order these as part of your normal care
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Check your email</div>
              <div className="text-gray-600 text-sm">
                We&apos;ve sent a copy of your signed consent
              </div>
            </div>
          </div>
        </div>

        {/* Support Note */}
        <div className="mt-8 p-4 border border-gray-200 rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            Questions? Contact us at{' '}
            <span className="font-medium text-gray-900">research@example.com</span>
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
          View Dashboard
        </Link>
      </MobileBottomAction>
    </>
  )
}
