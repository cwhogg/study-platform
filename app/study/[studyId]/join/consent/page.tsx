'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileBottomAction } from '@/components/ui/MobileContainer'
import { ConsentContent } from '@/components/participant/ConsentContent'
import { Button } from '@/components/ui/Button'
import { Loader2 } from 'lucide-react'
import { generateConsentSections, type ConsentSection } from '@/lib/study/consent'

export default function ConsentPage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [consentSections, setConsentSections] = useState<ConsentSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState(0)
  const [readSections, setReadSections] = useState<Set<number>>(new Set([0]))
  const contentRef = useRef<HTMLDivElement>(null)

  // Format timepoint name for display (e.g., "week_6" -> "Week 6")
  const formatTimepoint = (tp: string): string => {
    const formatted = tp.replace(/_/g, ' ')
    return formatted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Post-process consent sections to replace generic text with actual protocol data
  const enhanceConsentWithProtocol = (
    sections: ConsentSection[],
    protocol: { schedule?: { timepoint: string; labs?: string[] }[]; labMarkers?: string[] } | undefined,
    durationWeeks: number
  ): ConsentSection[] => {
    if (!protocol?.schedule || protocol.schedule.length === 0) {
      return sections
    }

    const schedule = protocol.schedule
    const scheduleCount = schedule.length
    const labTimepoints = schedule.filter(tp => tp.labs && tp.labs.length > 0)
    const durationMonths = Math.round(durationWeeks / 4.33)
    const timepoints = schedule.map(tp => formatTimepoint(tp.timepoint))
    const timepointsText = timepoints.join(', ')

    return sections.map(section => {
      let content = section.content

      // Replace generic "every 2-4 weeks" with actual schedule
      content = content.replace(
        /every 2-4 weeks/gi,
        `at ${scheduleCount} timepoints: ${timepointsText}`
      )
      content = content.replace(
        /every 2 to 4 weeks/gi,
        `at ${scheduleCount} timepoints: ${timepointsText}`
      )

      // Replace generic questionnaire counts
      content = content.replace(
        /approximately \d+ questionnaires/gi,
        `${scheduleCount} questionnaires`
      )
      content = content.replace(
        /\d+ questionnaires over \d+ months/gi,
        `${scheduleCount} questionnaires over ${durationMonths} months`
      )

      // Replace generic "7 months" or similar with actual duration
      content = content.replace(
        /(\d+) months total/gi,
        `${durationMonths} months total`
      )
      content = content.replace(
        /lasts (\d+) months/gi,
        `lasts ${durationMonths} months`
      )
      content = content.replace(
        /for (\d+) months/gi,
        `for ${durationMonths} months`
      )

      // Replace generic blood test count
      if (labTimepoints.length > 0) {
        content = content.replace(
          /blood tests at (each visit|every visit|all visits)/gi,
          `blood tests at ${labTimepoints.length} visits`
        )
      }

      return { ...section, content }
    })
  }

  // Fetch consent document from study
  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const response = await fetch(`/api/studies/${studyId}/public`)
        if (response.ok) {
          const data = await response.json()
          const intervention = data.intervention || 'the intervention'
          const durationWeeks = data.durationWeeks || 26

          if (data.consentDocument?.sections && data.consentDocument.sections.length > 0) {
            // Enhance stored consent with actual protocol data
            const enhanced = enhanceConsentWithProtocol(
              data.consentDocument.sections,
              data.protocol,
              durationWeeks
            )
            setConsentSections(enhanced)
          } else {
            // Use personalized fallback with intervention name
            console.log('[Consent] Using fallback with intervention:', intervention)
            setConsentSections(generateConsentSections(intervention, durationWeeks))
          }
        } else {
          // Generic fallback if API fails
          setConsentSections(generateConsentSections('the intervention', 26))
        }
      } catch (error) {
        console.error('Failed to fetch consent document:', error)
        setConsentSections(generateConsentSections('the intervention', 26))
      }
      setIsLoading(false)
    }

    fetchConsent()
  }, [studyId])

  const totalSections = consentSections.length
  const progress = totalSections > 0 ? ((currentSection + 1) / totalSections) * 100 : 0
  const isLastSection = currentSection === totalSections - 1

  // Scroll to top when section changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentSection])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-primary)] items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mb-4" />
        <p className="text-[var(--text-secondary)]">Loading consent document...</p>
      </div>
    )
  }

  // No sections available
  if (consentSections.length === 0) {
    return (
      <div className="flex flex-col h-full bg-[var(--bg-primary)] items-center justify-center p-4">
        <p className="text-[var(--text-secondary)] mb-4">Consent document not available.</p>
        <Button onClick={() => router.push(`/study/${studyId}/join/consent/quiz`)}>
          Continue
        </Button>
      </div>
    )
  }

  const handleContinue = () => {
    if (isLastSection) {
      // Go to quiz
      router.push(`/study/${studyId}/join/consent/quiz`)
    } else {
      const nextSection = currentSection + 1
      setCurrentSection(nextSection)
      setReadSections(prev => new Set([...prev, nextSection]))
    }
  }

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const section = consentSections[currentSection]

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Progress Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--glass-border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">Consent</span>
          <span className="text-sm text-[var(--text-muted)] font-mono">
            {currentSection + 1} of {totalSections}
          </span>
        </div>
        <div className="h-2 bg-[var(--glass-border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto px-4 py-6 pb-32"
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          {section.title}
        </h2>
        <ConsentContent content={section.content} />

        {/* Section Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8 pt-4 border-t border-[var(--glass-border)]">
          {consentSections.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSection(idx)
                setReadSections(prev => new Set([...prev, idx]))
              }}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                idx === currentSection
                  ? 'bg-[var(--primary)]'
                  : readSections.has(idx)
                  ? 'bg-[var(--primary)]/60'
                  : 'bg-[var(--glass-border)]'
              }`}
              style={{ minWidth: '10px', minHeight: '10px' }}
              aria-label={`Go to section ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <MobileBottomAction>
        <div className="flex gap-3">
          {currentSection > 0 && (
            <Button
              onClick={handleBack}
              variant="secondary"
              className="px-6"
            >
              Back
            </Button>
          )}
          <Button
            onClick={handleContinue}
            fullWidth
          >
            {isLastSection ? 'Continue to Quiz' : 'Continue'}
          </Button>
        </div>
      </MobileBottomAction>
    </div>
  )
}
