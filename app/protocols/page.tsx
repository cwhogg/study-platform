'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Target, ArrowRight, Search, Users, Clock } from 'lucide-react'
import { PageSpinner } from '@/components/ui/Spinner'
import { NofOneLogo } from '@/components/ui/NofOneLogo'

interface StudyProtocol {
  duration_weeks?: number
  primary_endpoint?: {
    name?: string
  }
}

interface Study {
  id: string
  name: string
  intervention: string
  config?: {
    description?: string
    goal?: string
    duration_weeks?: number
  }
  protocol?: StudyProtocol
  participant_count?: number
}

// Extract a clean intervention name from the full intervention string
function getShortIntervention(intervention: string): string {
  // Remove parenthetical details for cleaner display
  const cleaned = intervention.replace(/\s*\([^)]*\)\s*/g, '').trim()
  return cleaned
}

// Get goal from study - try config.goal, then extract from primary endpoint, or infer from name
function getGoal(study: Study): string | null {
  // Check config first
  if (study.config?.goal) {
    return study.config.goal
  }

  // Try to extract from primary endpoint name
  const endpointName = study.protocol?.primary_endpoint?.name
  if (endpointName) {
    // Extract goal from endpoint like "Symptom improvement (qADAM)" -> "symptom improvement"
    const match = endpointName.match(/^([^(]+)/)
    if (match) {
      return match[1].trim().toLowerCase()
    }
  }

  // Try to extract from study name (e.g. "Magnesium Supplementation Outcomes Study")
  const nameMatch = study.name.match(/(.+?)\s+(?:Outcomes?\s+)?Study$/i)
  if (nameMatch) {
    // Remove "Supplementation" type words
    const goal = nameMatch[1]
      .replace(/\s+Supplementation$/i, '')
      .replace(/\s+Therapy$/i, '')
      .replace(/\s+Treatment$/i, '')
    return goal.toLowerCase()
  }

  return null
}

// Format duration in weeks to a readable string
function formatDuration(weeks?: number): string {
  if (!weeks) return '12 weeks'
  if (weeks >= 52) {
    const years = Math.floor(weeks / 52)
    return years === 1 ? '1 year' : `${years} years`
  }
  return `${weeks} weeks`
}

export default function ProtocolsPage() {
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
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Find a Protocol</h1>
          <p className="text-[var(--text-secondary)]">
            Join a self-study protocol to track your outcomes
          </p>
        </div>

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
          <div className="mb-8">
            <h2 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Available Protocols
            </h2>
            <div className="space-y-3">
              {studies.map((study) => {
                const goal = getGoal(study)
                const shortIntervention = getShortIntervention(study.intervention)
                const duration = formatDuration(study.protocol?.duration_weeks || study.config?.duration_weeks)
                const participantCount = study.participant_count || 0

                return (
                  <Link
                    key={study.id}
                    href={`/study/${study.id}/join`}
                    className="block bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)] p-4 hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title: Intervention for Goal */}
                        <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                          {goal ? (
                            <>
                              <span>{shortIntervention}</span>
                              <span className="text-[var(--text-muted)] font-normal"> for </span>
                              <span className="text-[var(--primary)]">{goal}</span>
                            </>
                          ) : (
                            shortIntervention
                          )}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-[var(--text-secondary)] mt-1.5 line-clamp-2">
                          {study.config?.description || `Track your progress and outcomes over ${duration.toLowerCase()}.`}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                            <Users className="w-3.5 h-3.5" />
                            <span>{participantCount} enrolled</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{duration}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* No studies message */}
        {studies.length === 0 && !error && (
          <div className="text-center text-[var(--text-secondary)] py-8 mb-8">
            <p>No protocols are currently available.</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">If you have an invitation link, use it directly or enter the protocol code below.</p>
          </div>
        )}

        {/* Protocol Code Form - Moved to bottom */}
        <form onSubmit={handleSubmit} className="bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)] p-5">
          <label htmlFor="studyCode" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Have a protocol code?
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
                placeholder="Enter code"
                className="w-full pl-10 pr-4 py-3 bg-[var(--bg-primary)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-[var(--primary)] text-white font-medium rounded-lg hover:bg-[var(--primary-light)] disabled:bg-[var(--glass-border)] disabled:text-[var(--text-muted)] transition-colors"
            >
              {isSubmitting ? '...' : 'Go'}
            </button>
          </div>
          {error && studyCode && (
            <p className="mt-2 text-sm text-[var(--error)]">{error}</p>
          )}
        </form>

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
