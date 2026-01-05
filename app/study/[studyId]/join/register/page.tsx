'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { Eye, EyeOff } from 'lucide-react'
import type { EnrollmentCopy } from '@/lib/db/types'

// Default copy if none generated
const DEFAULT_REGISTRATION = {
  headline: 'Create Your Account',
  emailLabel: 'Email',
  emailHelp: 'Use your email address',
  passwordLabel: 'Password',
  passwordHelp: 'At least 8 characters',
  confirmPasswordLabel: 'Confirm Password',
  buttonText: 'Continue',
  errors: {
    emailInvalid: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords don\'t match',
  },
}

interface StudyData {
  enrollmentCopy: EnrollmentCopy | null
}

export default function RegisterPage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [study, setStudy] = useState<StudyData | null>(null)

  useEffect(() => {
    async function fetchStudy() {
      try {
        const response = await fetch(`/api/studies/${studyId}/public`)
        if (response.ok) {
          const data = await response.json()
          setStudy(data)
        }
      } catch (err) {
        console.error('Error fetching study:', err)
      }
    }
    fetchStudy()
  }, [studyId])

  const copy = study?.enrollmentCopy?.registration || DEFAULT_REGISTRATION

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(copy.errors?.emailInvalid || 'Please enter a valid email address')
      return
    }

    if (password !== confirmPassword) {
      setError(copy.errors?.passwordMismatch || 'Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError(copy.errors?.passwordTooShort || 'Password must be at least 8 characters')
      return
    }

    setIsSubmitting(true)

    try {
      // Call registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          studyId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        setIsSubmitting(false)
        return
      }

      // Check if email verification is needed
      if (data.emailConfirmationRequired === false || data.demoMode === true) {
        // Email already confirmed (demo mode) - skip to consent
        router.push(`/study/${studyId}/join/overview`)
      } else {
        // Navigate to verification page
        router.push(`/study/${studyId}/join/verify?email=${encodeURIComponent(email)}`)
      }

    } catch (err) {
      console.error('Registration error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <MobileContainer withBottomPadding className="pt-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {copy.headline || 'Create Your Account'}
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your details to join the study
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {copy.emailLabel || 'Email'}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              placeholder="you@example.com"
              style={{ minHeight: '52px' }}
            />
            {copy.emailHelp && (
              <p className="mt-1 text-xs text-gray-500">{copy.emailHelp}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {copy.passwordLabel || 'Password'}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                placeholder={copy.passwordHelp || 'At least 8 characters'}
                style={{ minHeight: '52px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              {copy.confirmPasswordLabel || 'Confirm Password'}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                placeholder="Confirm your password"
                style={{ minHeight: '52px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
        </form>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          style={{ minHeight: '52px' }}
        >
          {isSubmitting ? 'Creating Account...' : (copy.buttonText || 'Continue')}
        </button>
      </MobileBottomAction>
    </>
  )
}
