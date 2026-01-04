'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, ArrowRight, Search } from 'lucide-react'

interface Study {
  id: string
  name: string
  intervention: string
}

export default function StudyPage() {
  const router = useRouter()
  const [studies, setStudies] = useState<Study[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [studyCode, setStudyCode] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function fetchStudies() {
      try {
        const response = await fetch('/api/studies/active')
        if (response.ok) {
          const data = await response.json()
          setStudies(data.studies || [])

          // If only one study exists, redirect directly to it
          if (data.studies?.length === 1) {
            router.push(`/study/${data.studies[0].id}/join`)
            return
          }
        }
      } catch (err) {
        console.error('Error fetching studies:', err)
      }
      setIsLoading(false)
    }
    fetchStudies()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!studyCode.trim()) {
      setError('Please enter a study code')
      return
    }

    setIsSubmitting(true)

    try {
      // Validate the study exists
      const response = await fetch(`/api/studies/${studyCode.trim()}/public`)
      if (response.ok) {
        router.push(`/study/${studyCode.trim()}/join`)
      } else {
        setError('Study not found. Please check your code and try again.')
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error('Error validating study:', err)
      setError('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join a Study</h1>
          <p className="text-gray-600">
            Enter your study code or select from available studies below
          </p>
        </div>

        {/* Study Code Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <label htmlFor="studyCode" className="block text-sm font-medium text-gray-700 mb-2">
            Study Code
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="studyCode"
                type="text"
                value={studyCode}
                onChange={(e) => setStudyCode(e.target.value)}
                placeholder="Enter study code or ID"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
            >
              {isSubmitting ? 'Checking...' : 'Go'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            You should have received a study code or invitation link from your provider
          </p>
        </form>

        {/* Available Studies */}
        {studies.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Available Studies
            </h2>
            <div className="space-y-3">
              {studies.map((study) => (
                <Link
                  key={study.id}
                  href={`/study/${study.id}/join`}
                  className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {study.name}
                      </h3>
                      <p className="text-sm text-gray-500">{study.intervention}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No studies message */}
        {studies.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No studies are currently open for enrollment.</p>
            <p className="text-sm mt-1">If you have an invitation link, use it directly or enter the study code above.</p>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
