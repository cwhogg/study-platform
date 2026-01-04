'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!intervention.trim()) return

    setIsSubmitting(true)

    // Navigate to next step with intervention in URL params
    const params = new URLSearchParams({ intervention: intervention.trim() })
    router.push(`/sponsor/create/configure?${params.toString()}`)
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
          <div className="mb-8">
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

          {/* Submit */}
          <button
            type="submit"
            disabled={!intervention.trim() || isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
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
