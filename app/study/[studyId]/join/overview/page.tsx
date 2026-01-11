'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, FileText, FlaskConical, MessageSquare, Shield, ClipboardList, Clock, ArrowRight } from 'lucide-react'
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
  durationWeeks: number
  enrollmentCopy: EnrollmentCopy | null
  protocol?: {
    schedule?: { timepoint: string; labs?: string[] }[]
    labMarkers?: string[]
  }
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

  // Build dynamic sections from protocol data when available
  const buildDynamicSections = () => {
    if (!study?.protocol?.schedule) {
      return copy.sections || DEFAULT_PRE_CONSENT.sections
    }

    const schedule = study.protocol.schedule
    const scheduleCount = schedule.length
    const labTimepoints = schedule.filter(tp => tp.labs && tp.labs.length > 0)
    const hasLabs = labTimepoints.length > 0
    const durationMonths = Math.round((study.durationWeeks || 26) / 4.33)

    // Format timepoint names
    const formatTimepoint = (tp: string): string => {
      const formatted = tp.replace(/_/g, ' ')
      return formatted
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }

    const timepoints = schedule.map(tp => formatTimepoint(tp.timepoint))

    // Build surveys description
    let surveysBody: string
    if (scheduleCount <= 4) {
      surveysBody = `${scheduleCount} check-ins at ${timepoints.join(', ')}. Each takes about 5 minutes.`
    } else {
      surveysBody = `${scheduleCount} check-ins throughout the study, each taking about 5 minutes.`
    }

    // Build labs description
    let labsBody: string
    if (hasLabs) {
      const labMarkers = study.protocol.labMarkers || []
      const labNames = labMarkers.slice(0, 3).map(m =>
        m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      )
      labsBody = labTimepoints.length === scheduleCount
        ? `Blood tests at each visit to monitor ${labNames.length > 0 ? labNames.join(', ') : 'key markers'}. Handled by your healthcare provider.`
        : `${labTimepoints.length} blood draws to monitor ${labNames.length > 0 ? labNames.join(', ') : 'key markers'}. Handled by your healthcare provider.`
    } else {
      labsBody = 'No blood tests required for this study.'
    }

    // Build timeline description
    const timelineBody = `${durationMonths} months total. You can stop at any time if you choose.`

    return [
      { icon: 'clipboard', title: 'Surveys', body: surveysBody },
      { icon: 'droplet', title: 'Lab Work', body: labsBody },
      { icon: 'clock', title: 'Timeline', body: timelineBody },
    ]
  }

  const sections = buildDynamicSections()

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
          <div className="flex items-center gap-2 bg-[var(--success)]/15 text-[var(--success)] px-4 py-2 rounded-full border border-[var(--success)]/30">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium text-sm">Account Created</span>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-[var(--text-primary)] text-center mb-2">
          {copy.headline || DEFAULT_PRE_CONSENT.headline}
        </h1>
        <p className="text-[var(--text-secondary)] text-center mb-8">
          A quick overview of what participating involves
        </p>

        {/* Steps Overview */}
        <div className="space-y-4">
          {sections.slice(0, 4).map((section, index) => {
            const Icon = getIcon(section.icon)
            return (
              <div key={index} className="flex items-start gap-4 p-4 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]">
                <div className="w-10 h-10 bg-[var(--primary-dim)] rounded-lg flex items-center justify-center flex-shrink-0 border border-[var(--primary)]/30">
                  <Icon className="w-5 h-5 text-[var(--primary)]" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[var(--text-primary)] mb-1">{section.title}</div>
                  <div className="text-[var(--text-secondary)] text-sm leading-relaxed">
                    {section.body}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Privacy Note */}
        <div className="mt-6 p-4 border border-[var(--glass-border)] rounded-xl bg-[var(--glass-bg)]">
          <p className="text-sm text-[var(--text-secondary)] text-center">
            <span className="font-medium text-[var(--text-primary)]">Your privacy matters.</span>{' '}
            All data is encrypted and de-identified before analysis.
          </p>
        </div>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <Button
          onClick={handleContinue}
          disabled={isLoading}
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          {isLoading ? 'Loading...' : (copy.buttonText || DEFAULT_PRE_CONSENT.buttonText)}
        </Button>
      </MobileBottomAction>
    </>
  )
}
