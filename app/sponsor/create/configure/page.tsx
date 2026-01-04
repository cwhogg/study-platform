'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, ArrowLeft, Info, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Types for AI discovery response
interface EndpointOption {
  name: string
  domain: string
  suggestedInstrument: string
  confidence: 'high' | 'moderate' | 'low'
  rationale: string
}

interface PopulationOption {
  name: string
  description: string
}

interface TreatmentStageOption {
  name: string
  description: string
}

interface DiscoveryData {
  intervention: string
  summary: string
  endpoints: EndpointOption[]
  populations: PopulationOption[]
  treatmentStages: TreatmentStageOption[]
  recommendedDuration: {
    weeks: number
    rationale: string
  }
  safetyConsiderations: string[]
}

// Fallback options if no AI data
const FALLBACK_POPULATIONS = [
  { name: 'Newly diagnosed patients initiating treatment', description: 'Treatment-naive or >12 month gap' },
  { name: 'Existing patients on treatment (6+ months)', description: 'Currently on stable therapy' },
  { name: 'Patients with borderline diagnosis', description: 'Near threshold for treatment' },
]

const FALLBACK_TREATMENT_STAGES = [
  { name: 'Treatment initiation', description: 'First weeks/months of therapy' },
  { name: 'Dose optimization', description: 'Adjusting to optimal dosing' },
  { name: 'Maintenance', description: 'Long-term stable treatment' },
]

const FALLBACK_ENDPOINTS = [
  { name: 'Symptom improvement', domain: 'physical', suggestedInstrument: 'Custom questionnaire', confidence: 'moderate' as const, rationale: 'Common primary outcome' },
  { name: 'Quality of life', domain: 'general', suggestedInstrument: 'SF-36', confidence: 'high' as const, rationale: 'Validated general measure' },
  { name: 'Mood/depression', domain: 'mental', suggestedInstrument: 'PHQ-9', confidence: 'high' as const, rationale: 'Standard depression screening' },
]

const DURATION_OPTIONS = [
  { weeks: 12, label: '12 weeks (3 months)' },
  { weeks: 26, label: '26 weeks (6 months)' },
  { weeks: 52, label: '52 weeks (1 year)' },
]

function ConfigureStudyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intervention = searchParams.get('intervention') || 'Unknown Intervention'

  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [population, setPopulation] = useState('')
  const [treatmentStage, setTreatmentStage] = useState('')
  const [primaryEndpoint, setPrimaryEndpoint] = useState('')
  const [secondaryEndpoints, setSecondaryEndpoints] = useState<string[]>([])
  const [duration, setDuration] = useState(26)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load discovery data from sessionStorage
  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('studyDiscovery')
      if (storedData) {
        const data = JSON.parse(storedData) as DiscoveryData
        setDiscoveryData(data)

        // Set defaults from AI recommendations
        if (data.populations?.length > 0) {
          setPopulation(data.populations[0].name)
        }
        if (data.treatmentStages?.length > 0) {
          setTreatmentStage(data.treatmentStages[0].name)
        }
        if (data.endpoints?.length > 0) {
          // Set the highest confidence endpoint as primary
          const sortedEndpoints = [...data.endpoints].sort((a, b) => {
            const order = { high: 0, moderate: 1, low: 2 }
            return order[a.confidence] - order[b.confidence]
          })
          setPrimaryEndpoint(sortedEndpoints[0].name)
          // Set remaining high/moderate confidence endpoints as secondary
          setSecondaryEndpoints(
            sortedEndpoints
              .slice(1)
              .filter(e => e.confidence !== 'low')
              .map(e => e.name)
          )
        }
        if (data.recommendedDuration?.weeks) {
          setDuration(data.recommendedDuration.weeks)
        }
      }
    } catch (err) {
      console.error('Failed to load discovery data:', err)
    }
    setIsLoading(false)
  }, [])

  // Get options (AI-generated or fallback)
  const populations = discoveryData?.populations?.length ? discoveryData.populations : FALLBACK_POPULATIONS
  const treatmentStages = discoveryData?.treatmentStages?.length ? discoveryData.treatmentStages : FALLBACK_TREATMENT_STAGES
  const endpoints = discoveryData?.endpoints?.length ? discoveryData.endpoints : FALLBACK_ENDPOINTS
  const durationRationale = discoveryData?.recommendedDuration?.rationale

  const handleSecondaryEndpointChange = (name: string, checked: boolean) => {
    if (checked) {
      setSecondaryEndpoints([...secondaryEndpoints, name])
    } else {
      setSecondaryEndpoints(secondaryEndpoints.filter(e => e !== name))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Call protocol generation API
      const response = await fetch('/api/agents/protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intervention,
          population,
          treatmentStage,
          primaryEndpoint,
          secondaryEndpoints,
          durationWeeks: duration,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to generate protocol')
        setIsSubmitting(false)
        return
      }

      // Store protocol in sessionStorage for the review page
      sessionStorage.setItem('generatedProtocol', JSON.stringify(data.data))

      // Build URL params for next step
      const params = new URLSearchParams({
        intervention,
        population,
        treatmentStage,
        primaryEndpoint,
        secondaryEndpoints: secondaryEndpoints.join(','),
        duration: duration.toString(),
      })

      router.push(`/sponsor/create/review?${params.toString()}`)

    } catch (err) {
      console.error('Protocol generation error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading study options...</p>
        </div>
      </div>
    )
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
        <div className="text-sm font-medium text-indigo-600 mb-2">CONFIGURE STUDY</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{intervention}</h1>
        {discoveryData?.summary && (
          <p className="mt-2 text-gray-600">{discoveryData.summary}</p>
        )}
      </div>

      {/* AI-generated indicator */}
      {discoveryData && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Options below were generated by AI based on clinical evidence for {intervention}.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Population */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Population</h2>
          <p className="text-sm text-gray-500 mb-4">Who are you studying?</p>
          <div className="space-y-3">
            {populations.map((option, index) => (
              <label
                key={option.name}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  population === option.name
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="population"
                  value={option.name}
                  checked={population === option.name}
                  onChange={(e) => setPopulation(e.target.value)}
                  className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <span className="text-gray-900">{option.name}</span>
                  {option.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                  )}
                </div>
                {index === 0 && discoveryData && (
                  <span className="text-amber-500 text-sm whitespace-nowrap">★ Recommended</span>
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
            {treatmentStages.map((option, index) => (
              <label
                key={option.name}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  treatmentStage === option.name
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="treatmentStage"
                  value={option.name}
                  checked={treatmentStage === option.name}
                  onChange={(e) => setTreatmentStage(e.target.value)}
                  className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <span className="text-gray-900">{option.name}</span>
                  {option.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                  )}
                </div>
                {index === 0 && discoveryData && (
                  <span className="text-amber-500 text-sm whitespace-nowrap">★ Recommended</span>
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
            {endpoints.map((option) => (
              <label
                key={option.name}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  primaryEndpoint === option.name
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="primaryEndpoint"
                  value={option.name}
                  checked={primaryEndpoint === option.name}
                  onChange={(e) => setPrimaryEndpoint(e.target.value)}
                  className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900">{option.name}</span>
                    {option.suggestedInstrument && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {option.suggestedInstrument}
                      </span>
                    )}
                  </div>
                  {option.rationale && (
                    <p className="text-sm text-gray-500 mt-0.5">{option.rationale}</p>
                  )}
                </div>
                {option.confidence === 'high' && (
                  <span className="text-green-600 text-xs whitespace-nowrap">High confidence</span>
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
            {endpoints
              .filter(e => e.name !== primaryEndpoint)
              .map((option) => (
                <label
                  key={option.name}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    secondaryEndpoints.includes(option.name)
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={secondaryEndpoints.includes(option.name)}
                    onChange={(e) => handleSecondaryEndpointChange(option.name, e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{option.name}</span>
                      {option.suggestedInstrument && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {option.suggestedInstrument}
                        </span>
                      )}
                    </div>
                    {option.rationale && (
                      <p className="text-sm text-gray-500 mt-0.5">{option.rationale}</p>
                    )}
                  </div>
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
                key={option.weeks}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  duration === option.weeks
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="duration"
                  value={option.weeks}
                  checked={duration === option.weeks}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex-1 text-gray-900">{option.label}</span>
                {discoveryData?.recommendedDuration?.weeks === option.weeks && (
                  <span className="text-amber-500 text-sm">★ Recommended</span>
                )}
              </label>
            ))}
          </div>

          {/* Duration info */}
          {durationRationale && (
            <div className="mt-4 flex gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{durationRationale}</p>
            </div>
          )}
        </section>

        {/* Safety Considerations */}
        {discoveryData?.safetyConsiderations && discoveryData.safetyConsiderations.length > 0 && (
          <section className="bg-amber-50 rounded-xl border border-amber-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Safety Considerations</h2>
            <ul className="space-y-1 text-sm text-amber-800">
              {discoveryData.safetyConsiderations.map((consideration, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  {consideration}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !population || !treatmentStage || !primaryEndpoint}
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
