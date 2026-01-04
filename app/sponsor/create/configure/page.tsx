'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

// Hardcoded TRT options (will be dynamic later)
const POPULATION_OPTIONS = [
  { id: 'new_hypogonadal', label: 'Newly diagnosed hypogonadal men initiating TRT', recommended: true },
  { id: 'existing_trt', label: 'Existing TRT patients (6+ months)' },
  { id: 'borderline', label: 'Men with borderline testosterone' },
]

const TREATMENT_STAGE_OPTIONS = [
  { id: 'initiation', label: 'Treatment initiation', recommended: true },
  { id: 'optimization', label: 'Dose optimization' },
  { id: 'maintenance', label: 'Maintenance' },
]

const PRIMARY_ENDPOINT_OPTIONS = [
  { id: 'qadam', label: 'Symptom improvement (qADAM)', recommended: true },
  { id: 'iief5', label: 'Sexual function (IIEF-5)' },
  { id: 'hba1c', label: 'Metabolic markers (HbA1c)' },
  { id: 'sf36', label: 'Quality of life (SF-36)' },
]

const SECONDARY_ENDPOINT_OPTIONS = [
  { id: 'sexual_function', label: 'Sexual function (IIEF-5)', defaultChecked: true },
  { id: 'mood', label: 'Mood/depression (PHQ-2/9)', defaultChecked: true },
  { id: 'energy', label: 'Energy/fatigue', defaultChecked: true },
  { id: 'body_composition', label: 'Body composition' },
  { id: 'sleep', label: 'Sleep quality' },
  { id: 'adherence', label: 'Treatment adherence', defaultChecked: true },
  { id: 'satisfaction', label: 'Patient satisfaction', defaultChecked: true },
]

const DURATION_OPTIONS = [
  { id: '12', label: '12 weeks', weeks: 12 },
  { id: '26', label: '26 weeks (6 months)', weeks: 26, recommended: true },
  { id: '52', label: '52 weeks (1 year)', weeks: 52 },
]

function ConfigureStudyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intervention = searchParams.get('intervention') || 'Unknown Intervention'

  const [population, setPopulation] = useState('new_hypogonadal')
  const [treatmentStage, setTreatmentStage] = useState('initiation')
  const [primaryEndpoint, setPrimaryEndpoint] = useState('qadam')
  const [secondaryEndpoints, setSecondaryEndpoints] = useState<string[]>(
    SECONDARY_ENDPOINT_OPTIONS.filter(o => o.defaultChecked).map(o => o.id)
  )
  const [duration, setDuration] = useState('26')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSecondaryEndpointChange = (id: string, checked: boolean) => {
    if (checked) {
      setSecondaryEndpoints([...secondaryEndpoints, id])
    } else {
      setSecondaryEndpoints(secondaryEndpoints.filter(e => e !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Build URL params for next step
    const params = new URLSearchParams({
      intervention,
      population,
      treatmentStage,
      primaryEndpoint,
      secondaryEndpoints: secondaryEndpoints.join(','),
      duration,
    })

    router.push(`/sponsor/create/review?${params.toString()}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/sponsor/create"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="text-sm font-medium text-indigo-600 mb-2">STUDY BUILDER</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{intervention}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Population */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Population</h2>
          <p className="text-sm text-gray-500 mb-4">Who are you studying?</p>
          <div className="space-y-3">
            {POPULATION_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  population === option.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="population"
                  value={option.id}
                  checked={population === option.id}
                  onChange={(e) => setPopulation(e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex-1 text-gray-900">{option.label}</span>
                {option.recommended && (
                  <span className="text-amber-500 text-sm">★ Recommended</span>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* Treatment Stage */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Treatment Stage</h2>
          <p className="text-sm text-gray-500 mb-4">What phase of treatment?</p>
          <div className="space-y-3">
            {TREATMENT_STAGE_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  treatmentStage === option.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="treatmentStage"
                  value={option.id}
                  checked={treatmentStage === option.id}
                  onChange={(e) => setTreatmentStage(e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex-1 text-gray-900">{option.label}</span>
                {option.recommended && (
                  <span className="text-amber-500 text-sm">★ Recommended</span>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* Primary Endpoint */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Primary Endpoint</h2>
          <p className="text-sm text-gray-500 mb-4">What&apos;s the main outcome you&apos;re measuring?</p>
          <div className="space-y-3">
            {PRIMARY_ENDPOINT_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  primaryEndpoint === option.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="primaryEndpoint"
                  value={option.id}
                  checked={primaryEndpoint === option.id}
                  onChange={(e) => setPrimaryEndpoint(e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex-1 text-gray-900">{option.label}</span>
                {option.recommended && (
                  <span className="text-amber-500 text-sm">★ Recommended</span>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* Secondary Endpoints */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Secondary Endpoints</h2>
          <p className="text-sm text-gray-500 mb-4">What else do you want to track?</p>
          <div className="space-y-3">
            {SECONDARY_ENDPOINT_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  secondaryEndpoints.includes(option.id)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={secondaryEndpoints.includes(option.id)}
                  onChange={(e) => handleSecondaryEndpointChange(option.id, e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="flex-1 text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Duration */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Study Duration</h2>
          <p className="text-sm text-gray-500 mb-4">How long will the study run?</p>
          <div className="space-y-3">
            {DURATION_OPTIONS.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  duration === option.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="duration"
                  value={option.id}
                  checked={duration === option.id}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex-1 text-gray-900">{option.label}</span>
                {option.recommended && (
                  <span className="text-amber-500 text-sm">★ Recommended</span>
                )}
              </label>
            ))}
          </div>

          {/* Duration info */}
          <div className="mt-4 flex gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              TRT typically shows symptom improvement by 6-12 weeks, with continued gains through 6 months.
            </p>
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Protocol...</span>
            </>
          ) : (
            <>
              <span>Generate Protocol</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default function ConfigureStudyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ConfigureStudyContent />
    </Suspense>
  )
}
