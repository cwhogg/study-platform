'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

const EXAMPLES = [
  'GLP-1 medications',
  'Testosterone replacement therapy',
  'Ketamine therapy',
  'BPC-157',
  'Virtual CBT',
]

export default function CreateStudyPage() {
  const router = useRouter()
  const [intervention, setIntervention] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!intervention.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      // Call study discovery API
      console.log('[StudyDiscovery] Sending request for intervention:', intervention.trim())
      const response = await fetch('/api/agents/study-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervention: intervention.trim() }),
      })

      const data = await response.json()
      console.log('[StudyDiscovery] Response status:', response.status)

      if (!response.ok) {
        console.error('[StudyDiscovery] Error response:', data)
        setError(data.error || 'Failed to analyze intervention')
        setIsSubmitting(false)
        return
      }

      // Store discovery results in sessionStorage for the configure page
      sessionStorage.setItem('studyDiscovery', JSON.stringify(data.data))

      // Navigate to configure page
      const params = new URLSearchParams({ intervention: intervention.trim() })
      router.push(`/sponsor/create/configure?${params.toString()}`)

    } catch (err) {
      console.error('Study discovery error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setIntervention(example)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-stone-50">
      {/* Decorative elements */}
      <div className="fixed -right-40 top-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -left-40 bottom-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-base py-8 sm:py-12">
        {/* Back link */}
        <Link
          href="/sponsor"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-medium text-teal-700">New Study</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-stone-900 mb-3">
            What do you want to study?
          </h1>
          <p className="text-stone-500 max-w-md mx-auto">
            Describe the treatment or intervention, and our AI will design a complete study protocol.
          </p>
        </div>

        {/* Form Card */}
        <Card variant="elevated" padding="lg" className="max-w-xl mx-auto animate-fade-in-up">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <Textarea
                value={intervention}
                onChange={(e) => setIntervention(e.target.value)}
                placeholder="e.g., Testosterone replacement therapy for men with hypogonadism..."
                className="text-lg min-h-[140px]"
                autoFocus
              />
            </div>

            {/* Examples */}
            <div className="mb-6">
              <div className="text-sm text-stone-500 mb-3">Try an example:</div>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className={`
                      px-3 py-1.5 text-sm rounded-full border transition-all duration-150
                      ${intervention === example
                        ? 'bg-teal-50 border-teal-200 text-teal-700'
                        : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                      }
                    `}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl animate-fade-in">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={!intervention.trim()}
              isLoading={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Intervention...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Info */}
        <p className="mt-8 text-center text-sm text-stone-400 max-w-md mx-auto animate-fade-in">
          Our AI will analyze your intervention and generate a complete study protocol
          including endpoints, PRO instruments, and safety monitoring.
        </p>
      </div>
    </div>
  )
}
