'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, AlertCircle } from 'lucide-react'

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
      console.log('[StudyDiscovery] Response data:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error('[StudyDiscovery] Error response:', data)
        setError(data.error || 'Failed to analyze intervention')
        setIsSubmitting(false)
        return
      }

      // Log key fields from the discovery
      if (data.data) {
        console.log('[StudyDiscovery] Summary:', data.data.summary)
        console.log('[StudyDiscovery] Endpoints:', data.data.endpoints?.length || 0)
        console.log('[StudyDiscovery] Populations:', data.data.populations?.length || 0)
        console.log('[StudyDiscovery] Risk Assessment:', data.data.riskAssessment)
        console.log('[StudyDiscovery] Using fallback data:', data.fallback || false)
      }

      // Log OpenAI prompt/response debug info
      if (data.debug) {
        console.log('\n=== OPENAI AGENT DEBUG INFO ===')
        console.log('[Agent] Name:', data.debug.agentName)
        console.log('[Agent] Model:', data.debug.model)
        console.log('[Agent] System Prompt Length:', data.debug.systemPromptLength, 'chars')
        console.log('[Agent] Elapsed:', data.debug.elapsedMs, 'ms')
        console.log('\n[Agent] USER MESSAGE (what was sent to OpenAI):')
        console.log(data.debug.userMessage)
        console.log('\n[Agent] RAW RESPONSE (what came back from OpenAI):')
        console.log(data.debug.rawResponse)
        console.log('=== END DEBUG INFO ===\n')
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-sm font-medium text-indigo-600 mb-2">
            CREATE A NEW STUDY
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            What intervention do you want to study?
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <textarea
              value={intervention}
              onChange={(e) => setIntervention(e.target.value)}
              placeholder="Testosterone replacement therapy for men with hypogonadism..."
              className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-shadow"
              rows={3}
              autoFocus
            />
          </div>

          {/* Examples */}
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-3">Examples:</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!intervention.trim() || isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Intervention...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Our AI will design a complete study protocol based on your intervention,
          including endpoints, PRO instruments, and safety monitoring.
        </p>
      </div>
    </div>
  )
}
