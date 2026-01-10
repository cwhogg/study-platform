'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const params = useParams()
  const studyId = params.studyId as string

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
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
        setError(data.error || 'Failed to sign in')
        setIsSubmitting(false)
        return
      }

      // Check enrollment status and redirect appropriately
      if (data.participantStatus === 'active' || data.participantStatus === 'completed') {
        // Already enrolled - go to dashboard
        router.push(`/study/${studyId}/dashboard`)
      } else if (data.participantStatus === 'consented') {
        // Consented but not completed baseline
        router.push(`/study/${studyId}/join/baseline`)
      } else if (data.participantStatus === 'screened') {
        // Screened but not consented
        router.push(`/study/${studyId}/join/consent`)
      } else if (data.participantStatus === 'registered') {
        // Registered but not screened
        router.push(`/study/${studyId}/join/overview`)
      } else if (data.isEnrolled) {
        // Fallback for enrolled users
        router.push(`/study/${studyId}/dashboard`)
      } else {
        // Not enrolled in this study - start enrollment
        router.push(`/study/${studyId}/join/overview`)
      }

    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <MobileContainer withBottomPadding className="pt-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-[var(--text-secondary)] text-center mb-8">
          Sign in to continue with your protocol
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-xl text-base focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
              placeholder="you@example.com"
              style={{ minHeight: '52px' }}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 pr-12 border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] rounded-xl text-base focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
                placeholder="Enter your password"
                style={{ minHeight: '52px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] p-1 transition-colors"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-[var(--error)]/15 border border-[var(--error)]/30 rounded-xl text-[var(--error)] text-sm">
              {error}
            </div>
          )}
        </form>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          fullWidth
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
        <p className="text-center text-sm text-[var(--text-secondary)] mt-3">
          Don&apos;t have an account?{' '}
          <a
            href={`/study/${studyId}/join/register`}
            className="text-[var(--primary)] font-medium hover:text-[var(--primary-light)] transition-colors"
          >
            Create one
          </a>
        </p>
      </MobileBottomAction>
    </>
  )
}
