'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { CheckCircle2, FileText, FlaskConical, MessageSquare, Shield, ClipboardList, Clock } from 'lucide-react'
import type { EnrollmentCopy } from '@/lib/db/types'

// Default copy if none generated
const DEFAULT_PRE_CONSENT = {
  headline: 'Here\'s What to Expect',
  sections: [
    { icon: 'clipboard', title: 'Surveys', body: 'Short check-ins about your symptoms. Every 2-4 weeks, about 5 minutes each.' },
    { icon: 'droplet', title: 'Lab Work', body: 'Same blood tests you\'d do anyway. Your doctor handles this.' },
    { icon: 'clock', title: 'Timeline', body: '6 months total. You can stop anytime.' },
  ],
  buttonText: 'Review Consent',
}

interface StudyData {
  name: string
  intervention: string
  enrollmentCopy: EnrollmentCopy | null
}

// Icon mapping
const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'clipboard': return ClipboardList
    case 'droplet':
    case 'flask': return FlaskConical
    case 'clock': return Clock
    case 'file':
    case 'document': return FileText
    case 'message': return MessageSquare
    case 'shield': return Shield
    default: return ClipboardList
  }
}

export default function OverviewPage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [isLoading, setIsLoading] = useState(false)
  const [study, setStudy] = useState<StudyData | null>(null)

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

  const copy = study?.enrollmentCopy?.preConsent || DEFAULT_PRE_CONSENT
  const sections = copy.sections || DEFAULT_PRE_CONSENT.sections

  const handleContinue = async () => {
    setIsLoading(true)
    // Navigate to consent page
    router.push(`/study/${studyId}/join/consent`)
  }

  return (
    <>
      <MobileContainer withBottomPadding className="pt-6 bg-slate-900">
        {/* Success Badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-emerald-900/50 text-emerald-300 px-4 py-2 rounded-full border border-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">Account Created</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 text-center mb-2">
          {copy.headline || DEFAULT_PRE_CONSENT.headline}
        </h1>
        <p className="text-slate-400 text-center mb-8">
          A quick overview of what participating involves
        </p>

        {/* Steps Overview */}
        <div className="space-y-4">
          {sections.slice(0, 4).map((section, index) => {
            const Icon = getIcon(section.icon)
            return (
              <div key={index} className="flex items-start gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div className="w-10 h-10 bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-100 mb-1">{section.title}</div>
                  <div className="text-slate-400 text-sm">
                    {section.body}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Privacy Note */}
        <div className="mt-6 p-4 border border-slate-700 rounded-xl bg-slate-800">
          <p className="text-sm text-slate-400 text-center">
            <span className="font-medium text-slate-100">Your privacy matters.</span>{' '}
            All data is encrypted and de-identified before analysis.
          </p>
        </div>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full py-4 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          style={{ minHeight: '52px' }}
        >
          {isLoading ? 'Loading...' : (copy.buttonText || DEFAULT_PRE_CONSENT.buttonText)}
        </button>
      </MobileBottomAction>
    </>
  )
}
