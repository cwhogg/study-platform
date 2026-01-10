'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { Button } from '@/components/ui/Button'
import { FileCheck } from 'lucide-react'

export default function ConsentSignPage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [fullName, setFullName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentDate, setCurrentDate] = useState('')

  // Set current date on mount (client-side only)
  useEffect(() => {
    const now = new Date()
    const formatted = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    setCurrentDate(formatted)
  }, [])

  const canSubmit = fullName.trim().length >= 2 && agreed && !isSubmitting

  const handleSubmit = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)

    // For demo, simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // Navigate to screening
    router.push(`/study/${studyId}/join/screening`)
  }

  return (
    <>
      <MobileContainer withBottomPadding className="pt-6">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
            <FileCheck className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-[var(--text-primary)] text-center mb-2">
          Sign to Continue
        </h1>
        <p className="text-[var(--text-secondary)] text-center mb-8">
          By signing, you agree to participate in this research protocol.
        </p>

        {/* Signature Form */}
        <div className="space-y-6">
          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Type your full legal name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-4 border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-xl text-base focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
              placeholder="Your full name"
              style={{ minHeight: '52px' }}
            />
            {fullName && (
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                This serves as your electronic signature.
              </p>
            )}
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-0.5">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  agreed
                    ? 'bg-[var(--primary)] border-[var(--primary)]'
                    : 'bg-[var(--glass-bg)] border-[var(--glass-border)]'
                }`}
                style={{ minWidth: '24px', minHeight: '24px' }}
                aria-checked={agreed}
                role="checkbox"
              >
                {agreed && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
            <label
              onClick={() => setAgreed(!agreed)}
              className="text-[var(--text-secondary)] text-sm leading-relaxed cursor-pointer select-none"
            >
              I have read and understood the informed consent document. I voluntarily agree to participate in this research protocol.
            </label>
          </div>

          {/* Date (Auto-filled) */}
          <div className="pt-4 border-t border-[var(--glass-border)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">Date</span>
              <span className="text-sm font-medium text-[var(--text-primary)] font-mono">{currentDate}</span>
            </div>
          </div>
        </div>

        {/* Summary Box */}
        <div className="mt-8 p-4 bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]">
          <h3 className="font-medium text-[var(--text-primary)] mb-2">What happens next:</h3>
          <ul className="text-sm text-[var(--text-secondary)] space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] font-medium font-mono">1.</span>
              Quick eligibility check (2 minutes)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] font-medium font-mono">2.</span>
              Baseline survey about your current symptoms
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] font-medium font-mono">3.</span>
              You&apos;re enrolled and ready to go!
            </li>
          </ul>
        </div>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          size="lg"
          fullWidth
        >
          {isSubmitting ? 'Signing...' : 'Sign & Continue'}
        </Button>
      </MobileBottomAction>
    </>
  )
}
