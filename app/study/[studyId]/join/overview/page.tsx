'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { CheckCircle2, FileText, FlaskConical, MessageSquare, Shield } from 'lucide-react'

export default function OverviewPage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    setIsLoading(true)
    // Navigate to consent page
    router.push(`/study/${studyId}/join/consent`)
  }

  return (
    <>
      <MobileContainer withBottomPadding className="pt-6">
        {/* Success Badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">Account Created</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Here&apos;s What to Expect
        </h1>
        <p className="text-gray-600 text-center mb-8">
          A quick overview of what participating involves
        </p>

        {/* Steps Overview */}
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">1. Review Consent</div>
              <div className="text-gray-600 text-sm">
                Read and sign the informed consent document. This explains your rights and what data we collect.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FlaskConical className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">2. Complete Screening</div>
              <div className="text-gray-600 text-sm">
                Answer a few questions to confirm eligibility. Takes about 2 minutes.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">3. Baseline Survey</div>
              <div className="text-gray-600 text-sm">
                Complete your first survey about current symptoms. Takes 5-10 minutes.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">4. Ongoing Check-ins</div>
              <div className="text-gray-600 text-sm">
                Brief surveys every 2-4 weeks for 6 months. We&apos;ll send you reminders.
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 p-4 border border-gray-200 rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            <span className="font-medium text-gray-900">Your privacy matters.</span>{' '}
            All data is encrypted and de-identified before analysis.
          </p>
        </div>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full py-4 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          style={{ minHeight: '52px' }}
        >
          {isLoading ? 'Loading...' : 'Continue to Consent'}
        </button>
      </MobileBottomAction>
    </>
  )
}
