'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileBottomAction } from '@/components/ui/MobileContainer'
import { ConsentContent } from '@/components/participant/ConsentContent'
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
            setConsentSections(data.consentDocument.sections)
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
      <div className="flex flex-col h-full bg-white items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1E40AF] animate-spin mb-4" />
        <p className="text-slate-600">Loading consent document...</p>
      </div>
    )
  }

  // No sections available
  if (consentSections.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white items-center justify-center p-4">
        <p className="text-slate-600 mb-4">Consent document not available.</p>
        <button
          onClick={() => router.push(`/study/${studyId}/join/consent/quiz`)}
          className="px-6 py-3 bg-[#1E40AF] text-white rounded-xl"
        >
          Continue
        </button>
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
    <div className="flex flex-col h-full bg-white">
      {/* Progress Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">CONSENT</span>
          <span className="text-sm text-slate-600">
            {currentSection + 1} of {totalSections}
          </span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1E40AF] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto px-4 py-6 pb-32"
      >
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {section.title}
        </h2>
        <ConsentContent content={section.content} />

        {/* Section Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8 pt-4 border-t border-slate-200">
          {consentSections.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSection(idx)
                setReadSections(prev => new Set([...prev, idx]))
              }}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                idx === currentSection
                  ? 'bg-[#1E40AF]'
                  : readSections.has(idx)
                  ? 'bg-[#1E40AF]/60'
                  : 'bg-slate-300'
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
            <button
              onClick={handleBack}
              className="px-6 py-4 border border-slate-200 text-slate-700 font-semibold rounded-xl active:bg-slate-50 transition-colors"
              style={{ minHeight: '52px' }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleContinue}
            className="flex-1 py-4 bg-[#1E40AF] text-white text-center font-semibold rounded-xl active:bg-[#162d4a] transition-colors"
            style={{ minHeight: '52px' }}
          >
            {isLastSection ? 'Continue to Quiz' : 'Continue'}
          </button>
        </div>
      </MobileBottomAction>
    </div>
  )
}
