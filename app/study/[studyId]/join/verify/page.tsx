'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { Mail } from 'lucide-react'

function VerifyContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const studyId = params.studyId as string
  const email = searchParams.get('email') || 'your email'

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
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

    // For demo, skip actual verification and proceed
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push(`/study/${studyId}/join/overview`)
  }

  const handleResend = async () => {
    setIsResending(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsResending(false)
    // In production, trigger resend email
  }

  return (
    <>
      <MobileContainer withBottomPadding className="pt-8">
        {/* Email Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Check Your Email
        </h1>
        <p className="text-gray-600 text-center mb-8">
          We sent a verification code to<br />
          <span className="font-medium text-gray-900">{email}</span>
        </p>

        {/* 6-digit Code Input */}
        <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
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
              className="w-12 h-14 text-center text-xl font-semibold border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              style={{ minWidth: '44px', minHeight: '52px' }}
            />
          ))}
        </div>

        {/* Resend Link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">Didn&apos;t receive the code?</p>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-indigo-600 font-medium text-sm py-2 px-4 rounded-lg active:bg-indigo-50 disabled:text-gray-400 transition-colors"
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
          className="w-full py-4 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  )
}
