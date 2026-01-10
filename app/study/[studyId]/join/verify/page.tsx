'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { Button } from '@/components/ui/Button'
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
      <MobileContainer withBottomPadding className="pt-8">
        {/* Email Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[var(--primary-dim)] rounded-full flex items-center justify-center border border-[var(--primary)]/30">
            <Mail className="w-8 h-8 text-[var(--primary)]" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-[var(--text-primary)] text-center mb-2">
          Check Your Email
        </h1>
        <p className="text-[var(--text-secondary)] text-center mb-8">
          We sent a verification code to<br />
          <span className="font-medium text-[var(--text-primary)]">{email}</span>
        </p>

        {/* Demo Mode Hint */}
        {isDemo && (
          <div className="mb-6 p-3 bg-[var(--warning)]/15 border border-[var(--warning)]/30 rounded-xl text-[var(--warning)] text-sm text-center">
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
              className={`w-12 h-14 text-center text-xl font-semibold border rounded-xl focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all bg-[var(--glass-bg)] text-[var(--text-primary)] ${
                error ? 'border-[var(--error)] bg-[var(--error)]/10' : 'border-[var(--glass-border)]'
              }`}
              style={{ minWidth: '44px', minHeight: '52px' }}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-[var(--error)]/15 border border-[var(--error)]/30 rounded-xl text-[var(--error)] text-sm text-center">
            {error}
          </div>
        )}

        {/* Success Message */}
        {resendSuccess && (
          <div className="mb-4 p-3 bg-[var(--success)]/15 border border-[var(--success)]/30 rounded-xl text-[var(--success)] text-sm text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Verification code sent!
          </div>
        )}

        {/* Resend Link */}
        <div className="text-center">
          <p className="text-[var(--text-secondary)] text-sm mb-2">Didn&apos;t receive the code?</p>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-[var(--primary)] font-medium text-sm py-2 px-4 rounded-lg hover:bg-[var(--glass-bg)] disabled:text-[var(--text-muted)] transition-colors"
            style={{ minHeight: '44px' }}
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <Button
          onClick={() => handleSubmit()}
          disabled={isSubmitting || code.some(d => !d)}
          size="lg"
          fullWidth
        >
          {isSubmitting ? 'Verifying...' : 'Verify'}
        </Button>
      </MobileBottomAction>
    </>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)] text-[var(--text-secondary)]">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  )
}
