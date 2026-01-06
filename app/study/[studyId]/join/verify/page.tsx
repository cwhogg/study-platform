'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { Mail, CheckCircle2 } from 'lucide-react'

function VerifyContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const studyId = params.studyId as string
  const email = searchParams.get('email') || 'your email'
  const isDemo = searchParams.get('demo') === 'true'

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [resendSuccess, setResendSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)

    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)
    setError('')

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (digit && index === 5 && newCode.every(d => d)) {
      handleSubmit(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]

    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i]
    }

    setCode(newCode)
    setError('')

    if (pastedData.length === 6) {
      handleSubmit(pastedData)
    } else {
      inputRefs.current[pastedData.length]?.focus()
    }
  }

  const handleSubmit = async (fullCode?: string) => {
    const codeToVerify = fullCode || code.join('')
    if (codeToVerify.length !== 6) return

    setIsSubmitting(true)
    setError('')

    try {
      if (isDemo) {
        // Demo mode - skip actual verification
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push(`/study/${studyId}/join/overview`)
        return
      }

      // Call verification API
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token: codeToVerify,
          type: 'signup',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid verification code')
        setIsSubmitting(false)
        // Clear the code inputs
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        return
      }

      // Success - navigate to overview
      router.push(`/study/${studyId}/join/overview`)

    } catch (err) {
      console.error('Verification error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    setError('')
    setResendSuccess(false)

    try {
      if (isDemo) {
        // Demo mode - just show success
        await new Promise(resolve => setTimeout(resolve, 1000))
        setResendSuccess(true)
        setIsResending(false)
        setTimeout(() => setResendSuccess(false), 3000)
        return
      }

      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          studyId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to resend code')
      } else {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Resend error:', err)
      setError('Failed to resend code. Please try again.')
    }

    setIsResending(false)
  }

  return (
    <>
      <MobileContainer withBottomPadding className="pt-8 bg-white">
        {/* Email Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-[#3B82F6]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
          Check Your Email
        </h1>
        <p className="text-slate-600 text-center mb-8">
          We sent a verification code to<br />
          <span className="font-medium text-slate-900">{email}</span>
        </p>

        {/* Demo Mode Hint */}
        {isDemo && (
          <div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-sm text-center">
            Demo mode: Enter any 6-digit code to continue
          </div>
        )}

        {/* 6-digit Code Input */}
        <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-xl font-semibold border rounded-xl focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-shadow bg-white text-slate-900 ${
                error ? 'border-red-500 bg-red-50' : 'border-slate-200'
              }`}
              style={{ minWidth: '44px', minHeight: '52px' }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Success Message */}
        {resendSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Verification code sent!
          </div>
        )}

        {/* Resend Link */}
        <div className="text-center">
          <p className="text-slate-600 text-sm mb-2">Didn&apos;t receive the code?</p>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-[#3B82F6] font-medium text-sm py-2 px-4 rounded-lg active:bg-slate-50 disabled:text-slate-400 transition-colors"
            style={{ minHeight: '44px' }}
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <button
          onClick={() => handleSubmit()}
          disabled={isSubmitting || code.some(d => !d)}
          className="w-full py-4 bg-[#3B82F6] text-white text-center font-semibold rounded-xl active:bg-[#162d4a] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          style={{ minHeight: '52px' }}
        >
          {isSubmitting ? 'Verifying...' : 'Verify'}
        </button>
      </MobileBottomAction>
    </>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-white text-slate-600">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  )
}
