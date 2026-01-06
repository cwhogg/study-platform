'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { Heart } from 'lucide-react'
import type { EnrollmentCopy } from '@/lib/db/types'

// Default copy if none generated
const DEFAULT_INELIGIBLE = {
  headline: 'Thank You',
  body: 'Based on your answers, you\'re not eligible for this particular study.',
  reassurance: 'This doesn\'t mean anything is wrong — research studies have specific requirements to ensure accurate results.',
  nextSteps: 'Your regular treatment continues as normal.',
  buttonText: 'Return Home',
}

interface StudyData {
  name: string
  intervention: string
  enrollmentCopy: EnrollmentCopy | null
}

export default function IneligiblePage() {
  const params = useParams()
  const studyId = params.studyId as string

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

  const copy = study?.enrollmentCopy?.ineligible || DEFAULT_INELIGIBLE

  // Replace {{sponsor}} placeholder with actual sponsor name
  const nextSteps = copy.nextSteps?.replace('{{sponsor}}', 'your provider') || DEFAULT_INELIGIBLE.nextSteps
  const buttonText = copy.buttonText?.replace('{{sponsor}}', 'Home') || DEFAULT_INELIGIBLE.buttonText

  return (
    <>
      <MobileContainer centered className="bg-slate-900">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
            <Heart className="w-8 h-8 text-slate-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 text-center mb-4">
          {copy.headline || DEFAULT_INELIGIBLE.headline}
        </h1>

        <p className="text-slate-400 text-center mb-6">
          {copy.body || DEFAULT_INELIGIBLE.body}
        </p>

        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <p className="text-slate-400 text-sm text-center">
            {copy.reassurance || DEFAULT_INELIGIBLE.reassurance}
          </p>
        </div>

        <p className="text-slate-400 text-center text-sm">
          {nextSteps} Thank you for your interest in helping advance research.
        </p>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <a
          href="/"
          className="block w-full py-4 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 transition-colors"
          style={{ minHeight: '52px' }}
        >
          {buttonText}
        </a>
      </MobileBottomAction>
    </>
  )
}
