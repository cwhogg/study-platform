'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MobileFullScreen, MobileBottomAction } from '@/components/ui/MobileContainer'
import { ClipboardList, Clock, Heart } from 'lucide-react'
import type { EnrollmentCopy } from '@/lib/db/types'

interface StudyData {
  id: string
  name: string
  intervention: string
  enrollmentCopy: EnrollmentCopy | null
  durationWeeks: number
}

// Default copy if none generated
const DEFAULT_WELCOME = {
  headline: 'Join Our Research Study',
  subheadline: 'Help improve treatment for future patients',
  bullets: [
    'Short surveys every 2-4 weeks',
    'Your regular care continues',
    'Make an impact on future care',
  ],
  buttonText: 'Get Started',
  footerNote: 'Takes about 10 minutes to enroll',
}

export default function JoinPage() {
  const params = useParams()
  const studyId = params.studyId as string

  const [study, setStudy] = useState<StudyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchStudy() {
      try {
        const response = await fetch(`/api/studies/${studyId}/public`)
        if (!response.ok) {
          const data = await response.json()
          setError(data.error || 'Failed to load study')
          setIsLoading(false)
          return
        }
        const data = await response.json()
        setStudy(data)
      } catch (err) {
        console.error('Error fetching study:', err)
        setError('Failed to load study')
      }
      setIsLoading(false)
    }

    fetchStudy()
  }, [studyId])

  if (isLoading) {
    return (
      <MobileFullScreen className="flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading study...</p>
        </div>
      </MobileFullScreen>
    )
  }

  if (error || !study) {
    return (
      <MobileFullScreen className="flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Study</h1>
          <p className="text-gray-600">{error || 'Study not found'}</p>
        </div>
      </MobileFullScreen>
    )
  }

  const welcome = study.enrollmentCopy?.welcome || DEFAULT_WELCOME
  const bullets = welcome.bullets || DEFAULT_WELCOME.bullets

  return (
    <>
      <MobileFullScreen className="pb-24">
        {/* Study Name */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl font-bold text-gray-900">{welcome.headline || study.name}</h1>
          {welcome.subheadline && (
            <p className="text-gray-600 mt-2">{welcome.subheadline}</p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-6" />

        {/* Value Proposition */}
        <div className="flex-1">
          {/* 3 Bullet Points */}
          <div className="space-y-6">
            {bullets.slice(0, 3).map((bullet, index) => {
              const icons = [ClipboardList, Clock, Heart]
              const Icon = icons[index % icons.length]
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{bullet}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer note */}
          {welcome.footerNote && (
            <p className="text-center text-sm text-gray-500 mt-8">
              {welcome.footerNote}
            </p>
          )}
        </div>
      </MobileFullScreen>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <Link
          href={`/study/${studyId}/join/register`}
          className="block w-full py-4 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 transition-colors"
          style={{ minHeight: '52px' }}
        >
          {welcome.buttonText || 'Get Started'}
        </Link>
      </MobileBottomAction>
    </>
  )
}
