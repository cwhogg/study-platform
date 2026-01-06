'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, ArrowRight, Search } from 'lucide-react'
import { PageSpinner } from '@/components/ui/Spinner'

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
        const data = await response.json()

        if (response.ok) {
          setStudies(data.studies || [])

          // If only one study exists, redirect directly to it
          if (data.studies?.length === 1) {
            router.push(`/study/${data.studies[0].id}/join`)
            return
          }
        } else {
          console.error('Error response from studies/active:', data)
          setError(data.error || 'Failed to load studies')
        }
      } catch (err) {
        console.error('Error fetching studies:', err)
        setError('Unable to connect to server. Please try again.')
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <PageSpinner label="Loading studies..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1E40AF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-[#1E40AF]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Join a Study</h1>
          <p className="text-slate-600">
            Enter your study code or select from available studies below
          </p>
        </div>

        {/* Study Code Form */}
        <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <label htmlFor="studyCode" className="block text-sm font-medium text-slate-600 mb-2">
            Study Code
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
              <input
                id="studyCode"
                type="text"
                value={studyCode}
                onChange={(e) => {
                  setStudyCode(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Enter study code or ID"
                className="w-full pl-10 pr-4 py-3 border border-slate-200 bg-white text-slate-900 placeholder-slate-600 rounded-lg focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#1E40AF] text-white font-medium rounded-lg hover:bg-[#152a45] disabled:bg-slate-300 transition-colors"
            >
              {isSubmitting ? 'Checking...' : 'Go'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <p className="mt-2 text-xs text-slate-600">
            You should have received a study code or invitation link from your provider
          </p>
        </form>

        {/* API Error */}
        {error && studies.length === 0 && !studyCode && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 underline hover:text-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Available Studies */}
        {studies.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-3">
              Available Studies
            </h2>
            <div className="space-y-3">
              {studies.map((study) => (
                <Link
                  key={study.id}
                  href={`/study/${study.id}/join`}
                  className="block bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-4 hover:border-[#1E40AF] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-[#1E40AF] transition-colors">
                        {study.name}
                      </h3>
                      <p className="text-sm text-slate-600">{study.intervention}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-[#1E40AF] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No studies message */}
        {studies.length === 0 && (
          <div className="text-center text-slate-600 py-8">
            <p>No studies are currently open for enrollment.</p>
            <p className="text-sm mt-1">If you have an invitation link, use it directly or enter the study code above.</p>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
