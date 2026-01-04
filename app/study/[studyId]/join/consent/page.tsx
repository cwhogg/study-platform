'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileBottomAction } from '@/components/ui/MobileContainer'

// Placeholder consent sections
const consentSections = [
  {
    title: 'Purpose of the Study',
    content: `This observational study aims to better understand how testosterone replacement therapy (TRT) affects symptoms, quality of life, and overall health in men with low testosterone.

By participating, you'll help us learn how TRT works in real-world settings, which can improve care for future patients.

Your treatment will not change based on your participation - you'll receive the same care whether or not you join the study.`
  },
  {
    title: 'What You\'ll Do',
    content: `Questionnaires
You'll answer short questions about your symptoms, mood, energy, and quality of life. These take about 5 minutes and happen every 2-4 weeks.

Lab Work
Blood draws at the start, 6 weeks, 12 weeks, and 26 weeks. Your Hone doctor orders these as part of your normal TRT care.

Timeline
The study lasts 6 months (26 weeks) total.`
  },
  {
    title: 'Risks and Discomforts',
    content: `This is an observational study - we're only collecting information, not changing your treatment. There are no additional medical risks from participating.

Possible discomforts:
• Time spent completing questionnaires (~5 minutes every 2-4 weeks)
• Blood draws (same as your regular TRT monitoring)

Some questions ask about sensitive topics like mood and sexual function. You can skip any question you're not comfortable answering.`
  },
  {
    title: 'Benefits',
    content: `Direct Benefits
• Track your symptom changes over time
• Receive a summary of your progress at the end of the study

Indirect Benefits
• Help improve understanding of TRT outcomes
• Contribute to better care for future patients with low testosterone`
  },
  {
    title: 'Privacy and Confidentiality',
    content: `Your information is protected:

• All data is encrypted and stored securely
• Your identity is separated from your health data
• Results are reported only in aggregate (grouped with other participants)
• We never share your individual data with third parties

Only authorized research staff can access your identifiable information.`
  },
  {
    title: 'Voluntary Participation',
    content: `Joining this study is completely voluntary.

• You can withdraw at any time, for any reason
• Withdrawing will not affect your Hone treatment or care
• If you withdraw, data already collected may still be used (in de-identified form)

To withdraw, simply contact us or stop completing surveys.`
  },
  {
    title: 'Compensation',
    content: `There is no monetary compensation for participating in this study.

You will not be charged any fees for participating. Your regular TRT treatment costs remain the same.`
  },
  {
    title: 'Contact Information',
    content: `Questions about the study:
Email: research@example.com
Phone: 1-800-XXX-XXXX

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

  const [currentSection, setCurrentSection] = useState(0)
  const [readSections, setReadSections] = useState<Set<number>>(new Set([0]))
  const contentRef = useRef<HTMLDivElement>(null)

  const totalSections = consentSections.length
  const progress = ((currentSection + 1) / totalSections) * 100
  const isLastSection = currentSection === totalSections - 1
  const allSectionsRead = readSections.size === totalSections

  // Scroll to top when section changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentSection])

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
    <div className="flex flex-col h-full">
      {/* Progress Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">CONSENT</span>
          <span className="text-sm text-gray-500">
            {currentSection + 1} of {totalSections}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={contentRef}
        className="flex-1 overflow-y-auto px-4 py-6 pb-32"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {section.title}
        </h2>
        <div className="prose prose-gray max-w-none">
          {section.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-gray-700 mb-4 leading-relaxed whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Section Navigation Dots */}
        <div className="flex justify-center gap-2 mt-8 pt-4 border-t border-gray-100">
          {consentSections.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentSection(idx)
                setReadSections(prev => new Set([...prev, idx]))
              }}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                idx === currentSection
                  ? 'bg-indigo-600'
                  : readSections.has(idx)
                  ? 'bg-indigo-300'
                  : 'bg-gray-300'
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
              className="px-6 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl active:bg-gray-50 transition-colors"
              style={{ minHeight: '52px' }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleContinue}
            className="flex-1 py-4 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 transition-colors"
            style={{ minHeight: '52px' }}
          >
            {isLastSection ? 'Continue to Quiz' : 'Continue'}
          </button>
        </div>
      </MobileBottomAction>
    </div>
  )
}
