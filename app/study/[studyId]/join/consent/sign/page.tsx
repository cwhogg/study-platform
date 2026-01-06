'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
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
      <MobileContainer withBottomPadding className="pt-6 bg-white">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#1E3A5F] rounded-full flex items-center justify-center">
            <FileCheck className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
          Sign to Join
        </h1>
        <p className="text-slate-600 text-center mb-8">
          By signing, you agree to participate in this research study.
        </p>

        {/* Signature Form */}
        <div className="space-y-6">
          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
              Type your full legal name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-4 border border-slate-200 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-base focus:ring-2 focus:ring-[#1E3A5F] focus:border-[#1E3A5F] transition-shadow"
              placeholder="Your full name"
              style={{ minHeight: '52px' }}
            />
            {fullName && (
              <p className="mt-2 text-sm text-slate-600">
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
                    ? 'bg-[#1E3A5F] border-[#1E3A5F]'
                    : 'bg-white border-slate-200'
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
              className="text-slate-700 text-sm leading-relaxed cursor-pointer select-none"
            >
              I have read and understood the informed consent document. I voluntarily agree to participate in this research study.
            </label>
          </div>

          {/* Date (Auto-filled) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Date</span>
              <span className="text-sm font-medium text-slate-900">{currentDate}</span>
            </div>
          </div>
        </div>

        {/* Summary Box */}
        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="font-medium text-slate-900 mb-2">What happens next:</h3>
          <ul className="text-sm text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-medium">1.</span>
              Quick eligibility check (2 minutes)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-medium">2.</span>
              Baseline survey about your current symptoms
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-medium">3.</span>
              You&apos;re enrolled and ready to go!
            </li>
          </ul>
        </div>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-4 bg-[#1E3A5F] text-white text-center font-semibold rounded-xl active:bg-[#162d4a] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          style={{ minHeight: '52px' }}
        >
          {isSubmitting ? 'Signing...' : 'Sign & Continue'}
        </button>
      </MobileBottomAction>
    </>
  )
}
