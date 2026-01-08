'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
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
      <MobileContainer withBottomPadding className="pt-8 bg-white">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-slate-600 text-center mb-8">
          Sign in to continue with the study
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 border border-slate-200 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-base focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] transition-shadow"
              placeholder="you@example.com"
              style={{ minHeight: '52px' }}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 pr-12 border border-slate-200 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-base focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] transition-shadow"
                placeholder="Enter your password"
                style={{ minHeight: '52px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 p-1"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
          className="w-full py-4 bg-[#1E40AF] text-white text-center font-semibold rounded-xl active:bg-[#162d4a] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          style={{ minHeight: '52px' }}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="text-center text-sm text-slate-600 mt-3">
          Don&apos;t have an account?{' '}
          <a
            href={`/study/${studyId}/join/register`}
            className="text-[#1E40AF] font-medium hover:underline"
          >
            Create one
          </a>
        </p>
      </MobileBottomAction>
    </>
  )
}
