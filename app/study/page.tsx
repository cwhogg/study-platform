'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Target, ArrowRight, Search, BarChart3 } from 'lucide-react'
import { PageSpinner } from '@/components/ui/Spinner'
import { NofOneLogo } from '@/components/ui/NofOneLogo'

interface Study {
  id: string
  name: string
  intervention: string
  config?: {
    description?: string
  }
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
      setError('Please enter a protocol code')
      return
    }

    setIsSubmitting(true)

    try {
      // Validate the study exists
      const response = await fetch(`/api/studies/${studyCode.trim()}/public`)
      if (response.ok) {
        router.push(`/study/${studyCode.trim()}/join`)
      } else {
        setError('Protocol not found. Please check your code and try again.')
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <PageSpinner label="Loading protocols..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-lg border-b border-[var(--glass-border)]">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <NofOneLogo size={28} />
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--primary-dim)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Start Your Study</h1>
          <p className="text-[var(--text-secondary)]">
            Enter a protocol code or select from available studies below
          </p>
        </div>

        {/* Protocol Code Form */}
        <form onSubmit={handleSubmit} className="bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)] p-6 mb-6">
          <label htmlFor="studyCode" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Protocol Code
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                id="studyCode"
                type="text"
                value={studyCode}
                onChange={(e) => {
                  setStudyCode(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Enter protocol code"
                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[var(--primary)] text-white font-medium rounded-lg hover:bg-[var(--primary-light)] disabled:bg-[var(--glass-border)] disabled:text-[var(--text-muted)] transition-colors"
            >
              {isSubmitting ? 'Checking...' : 'Go'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-[var(--error)]">{error}</p>
          )}
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            You may have received a protocol code or invitation link
          </p>
        </form>

        {/* API Error */}
        {error && studies.length === 0 && !studyCode && (
          <div className="bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-xl p-4 mb-6">
            <p className="text-[var(--error)] text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-[var(--error)] underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Available Studies */}
        {studies.length > 0 && (
          <div>
            <h2 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Available Protocols
            </h2>
            <div className="space-y-3">
              {studies.map((study) => (
                <Link
                  key={study.id}
                  href={`/study/${study.id}/join`}
                  className="block bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)] p-4 hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-[var(--primary-dim)] rounded-xl flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                          {study.name}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          {study.config?.description || `Self-study protocol for ${study.intervention.toLowerCase()}.`}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No studies message */}
        {studies.length === 0 && !error && (
          <div className="text-center text-[var(--text-secondary)] py-8">
            <p>No protocols are currently available.</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">If you have an invitation link, use it directly or enter the protocol code above.</p>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
