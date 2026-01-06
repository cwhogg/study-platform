'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileBottomAction } from '@/components/ui/MobileContainer'
import { ConsentContent } from '@/components/participant/ConsentContent'
import { Loader2 } from 'lucide-react'

// Types for consent sections
interface ConsentSection {
  id?: string
  title: string
  content: string
}

// Fallback consent sections (used if no generated content)
const FALLBACK_SECTIONS: ConsentSection[] = [
  {
    id: 'purpose',
    title: 'Purpose of the Study',
    content: `This observational study aims to better understand how this intervention affects symptoms, quality of life, and overall health.

By participating, you'll help us learn how this treatment works in real-world settings, which can improve care for future patients.

Your treatment will not change based on your participation - you'll receive the same care whether or not you join the study.`
  },
  {
    id: 'procedures',
    title: 'What You\'ll Do',
    content: `You'll complete questionnaires at regular intervals throughout the study.

These questionnaires ask about your symptoms, mood, energy, and quality of life. They take about 5 minutes each.`
  },
  {
    id: 'risks',
    title: 'Risks and Discomforts',
    content: `This is an observational study - we're only collecting information, not changing your treatment. There are no additional medical risks from participating.

Some questions ask about sensitive topics. You can skip any question you're not comfortable answering.`
  },
  {
    id: 'benefits',
    title: 'Benefits',
    content: `Direct Benefits:
• Track your changes over time
• Receive a summary of your progress

Indirect Benefits:
• Help improve understanding of treatment outcomes
• Contribute to better care for future patients`
  },
  {
    id: 'privacy',
    title: 'Privacy and Confidentiality',
    content: `Your information is protected:

• All data is encrypted and stored securely
• Your identity is separated from your health data
• Results are reported only in aggregate
• We never share your individual data with third parties

Only authorized research staff can access your identifiable information.`
  },
  {
    id: 'voluntary',
    title: 'Voluntary Participation',
    content: `Joining this study is completely voluntary.

• You can withdraw at any time, for any reason
• Withdrawing will not affect your treatment or care
• If you withdraw, data already collected may still be used (in de-identified form)

To withdraw, simply contact us or stop completing surveys.`
  },
  {
    id: 'compensation',
    title: 'Compensation',
    content: `There is no monetary compensation for participating in this study.

You will not be charged any fees for participating.`
  },
  {
    id: 'contact',
    title: 'Contact Information',
    content: `Questions about the study:
Email: research@example.com

Questions about your rights as a participant:
Institutional Review Board
Email: irb@example.com

For medical emergencies, contact your healthcare provider or call 911.`
  }
]

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
          if (data.consentDocument?.sections && data.consentDocument.sections.length > 0) {
            setConsentSections(data.consentDocument.sections)
          } else {
            setConsentSections(FALLBACK_SECTIONS)
          }
        } else {
          setConsentSections(FALLBACK_SECTIONS)
        }
      } catch (error) {
        console.error('Failed to fetch consent document:', error)
        setConsentSections(FALLBACK_SECTIONS)
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
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mb-4" />
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
          className="px-6 py-3 bg-[#3B82F6] text-white rounded-xl"
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
            className="h-full bg-[#3B82F6] transition-all duration-300 ease-out"
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
                  ? 'bg-[#3B82F6]'
                  : readSections.has(idx)
                  ? 'bg-[#3B82F6]/60'
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
            className="flex-1 py-4 bg-[#3B82F6] text-white text-center font-semibold rounded-xl active:bg-[#162d4a] transition-colors"
            style={{ minHeight: '52px' }}
          >
            {isLastSection ? 'Continue to Quiz' : 'Continue'}
          </button>
        </div>
      </MobileBottomAction>
    </div>
  )
}
