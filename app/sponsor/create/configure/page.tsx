'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, ArrowLeft, Info, Sparkles, Loader2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

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

interface RiskAssessment {
  interventionCategory?: 'pharmacological' | 'non_pharmacological'
  knownRisks?: Array<{ risk: string; severity: string; frequency?: string }>
  overallRiskLevel?: string
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
  riskAssessment?: RiskAssessment
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
  const [submissionPhase, setSubmissionPhase] = useState<'protocol' | 'safety' | null>(null)
  const [safetyWarning, setSafetyWarning] = useState<{ show: boolean; error: string; protocol: Record<string, unknown> | null }>({
    show: false,
    error: '',
    protocol: null,
  })

  // Load discovery data from sessionStorage
  useEffect(() => {
    try {
      const storedData = sessionStorage.getItem('studyDiscovery')
      console.log('[Configure] Loading discovery data from sessionStorage')
      if (storedData) {
        const data = JSON.parse(storedData) as DiscoveryData
        console.log('[Configure] Loaded discovery data:', JSON.stringify(data, null, 2))
        console.log('[Configure] Endpoints:', data.endpoints?.length || 0)
        console.log('[Configure] Populations:', data.populations?.length || 0)
        console.log('[Configure] Treatment Stages:', data.treatmentStages?.length || 0)
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
      } else {
        console.log('[Configure] No discovery data found in sessionStorage, using fallbacks')
      }
    } catch (err) {
      console.error('[Configure] Failed to load discovery data:', err)
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
    setSubmissionPhase('protocol')
    setError('')

    const requestBody = {
      intervention,
      population,
      treatmentStage,
      primaryEndpoint,
      secondaryEndpoints,
      durationWeeks: duration,
    }

    try {
      // Step 1: Call Protocol Agent (generates study design, NOT safety rules)
      console.log('[Protocol] Sending request:', JSON.stringify(requestBody, null, 2))
      const protocolResponse = await fetch('/api/agents/protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const protocolData = await protocolResponse.json()
      console.log('[Protocol] Response status:', protocolResponse.status)

      if (!protocolResponse.ok) {
        console.error('[Protocol] Error response:', protocolData)
        setError(protocolData.error || 'Failed to generate protocol')
        setIsSubmitting(false)
        setSubmissionPhase(null)
        return
      }

      const protocol = protocolData.data
      console.log('[Protocol] Summary:', protocol.summary)
      console.log('[Protocol] Instruments:', protocol.instruments?.length || 0)
      console.log('[Protocol] Schedule timepoints:', protocol.schedule?.length || 0)

      // Step 2: Call Safety Agent with protocol context
      setSubmissionPhase('safety')
      console.log('[Safety] Generating safety rules...')

      // Extract lab markers from schedule
      const labMarkers: string[] = []
      if (protocol.schedule) {
        for (const tp of protocol.schedule) {
          if (tp.labs && Array.isArray(tp.labs)) {
            for (const lab of tp.labs) {
              if (!labMarkers.includes(lab)) {
                labMarkers.push(lab)
              }
            }
          }
        }
      }

      const safetyRequestBody = {
        intervention,
        interventionCategory: discoveryData?.riskAssessment?.interventionCategory || 'pharmacological',
        instruments: protocol.instruments || [],
        riskAssessment: discoveryData?.riskAssessment,
        labMarkers,
      }

      console.log('[Safety] Request body:', JSON.stringify(safetyRequestBody, null, 2))
      const safetyResponse = await fetch('/api/agents/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safetyRequestBody),
      })

      const safetyData = await safetyResponse.json()
      console.log('[Safety] Response status:', safetyResponse.status)

      // Check if Safety Agent succeeded
      if (!safetyResponse.ok || !safetyData.data) {
        // Safety Agent failed - show warning and ask for confirmation
        console.warn('[Safety] Failed to generate safety rules:', safetyData.error)
        setIsSubmitting(false)
        setSubmissionPhase(null)
        setSafetyWarning({
          show: true,
          error: safetyData.error || 'Unknown error',
          protocol: protocol,
        })
        return // Don't continue - wait for user decision
      }

      const safetyMonitoring = {
        proAlerts: safetyData.data.proAlerts || [],
        labThresholds: safetyData.data.labThresholds || [],
      }
      console.log('[Safety] Generated:', {
        proAlerts: safetyMonitoring.proAlerts.length,
        labThresholds: safetyMonitoring.labThresholds.length,
      })

      // Step 3: Merge safety into protocol
      const completeProtocol = {
        ...protocol,
        safetyMonitoring,
      }

      // Store complete protocol in sessionStorage for the review page
      sessionStorage.setItem('generatedProtocol', JSON.stringify(completeProtocol))

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
      setSubmissionPhase(null)
    }
  }

  // Handler for proceeding without safety rules (user confirmed)
  const handleProceedWithoutSafety = () => {
    if (!safetyWarning.protocol) return

    console.warn('[Safety] User chose to proceed without safety rules')

    // Create protocol with empty safety monitoring
    const completeProtocol = {
      ...safetyWarning.protocol,
      safetyMonitoring: { proAlerts: [], labThresholds: [] },
    }

    // Store and navigate
    sessionStorage.setItem('generatedProtocol', JSON.stringify(completeProtocol))

    const params = new URLSearchParams({
      intervention,
      population,
      treatmentStage,
      primaryEndpoint,
      secondaryEndpoints: secondaryEndpoints.join(','),
      duration: duration.toString(),
    })

    setSafetyWarning({ show: false, error: '', protocol: null })
    router.push(`/sponsor/create/review?${params.toString()}`)
  }

  // Handler for canceling (go back to fix/retry)
  const handleCancelSafetyWarning = () => {
    setSafetyWarning({ show: false, error: '', protocol: null })
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-2 border-[#1E3A5F] border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-600">Loading study options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Safety Warning Dialog */}
      {safetyWarning.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-display text-lg text-slate-900">Safety Rules Failed</h3>
                <p className="text-sm text-slate-500">Unable to generate safety monitoring</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <p className="font-medium mb-1">Error:</p>
              <p className="text-amber-700">{safetyWarning.error}</p>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              <strong className="text-slate-900">Warning:</strong> Proceeding without safety rules means
              this study will have <strong>no automated safety monitoring</strong> for participant responses
              or lab values. This could miss critical safety signals.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleCancelSafetyWarning}
                className="flex-1"
              >
                Go Back
              </Button>
              <Button
                variant="ghost"
                onClick={handleProceedWithoutSafety}
                className="flex-1 !text-amber-700 hover:!bg-amber-50"
              >
                Proceed Anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <Link
          href="/sponsor/create"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1E3A5F]/10 border border-[#1E3A5F]/20 rounded-full text-xs font-medium text-[#1E3A5F] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Configure Study
        </div>
        <h1 className="font-display text-2xl sm:text-3xl text-slate-900">{intervention}</h1>
        {discoveryData?.summary && (
          <p className="mt-2 text-slate-600">{discoveryData.summary}</p>
        )}
      </div>

      {/* AI-generated indicator */}
      {discoveryData && (
        <div className="mb-6 p-4 bg-[#1E3A5F]/10 border border-[#1E3A5F]/20 rounded-xl text-[#1E3A5F] text-sm flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-[#1E3A5F]/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 text-[#1E3A5F]" />
          </div>
          <span>Options below were generated by AI based on clinical evidence for {intervention}.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 stagger-children">
        {/* Population */}
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-slate-900 mb-1">Population</h2>
          <p className="text-sm text-slate-600 mb-4">Who are you studying?</p>
          <div className="space-y-3">
            {populations.map((option, index) => (
              <label
                key={option.name}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  population === option.name
                    ? 'border-[#1E3A5F] bg-[#1E3A5F]/10 ring-1 ring-[#1E3A5F]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="population"
                  value={option.name}
                  checked={population === option.name}
                  onChange={(e) => setPopulation(e.target.value)}
                  className="w-4 h-4 mt-0.5 text-[#1E3A5F] border-slate-300 bg-white focus:ring-[#1E3A5F]"
                />
                <div className="flex-1">
                  <span className="text-slate-900 font-medium">{option.name}</span>
                  {option.description && (
                    <p className="text-sm text-slate-600 mt-0.5">{option.description}</p>
                  )}
                </div>
                {index === 0 && discoveryData && (
                  <span className="text-orange-700 text-xs font-medium bg-orange-100 px-2 py-1 rounded-full whitespace-nowrap border border-orange-200">Recommended</span>
                )}
              </label>
            ))}
          </div>
        </Card>

        {/* Treatment Stage */}
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-slate-900 mb-1">Treatment Stage</h2>
          <p className="text-sm text-slate-600 mb-4">What phase of treatment?</p>
          <div className="space-y-3">
            {treatmentStages.map((option, index) => (
              <label
                key={option.name}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  treatmentStage === option.name
                    ? 'border-[#1E3A5F] bg-[#1E3A5F]/10 ring-1 ring-[#1E3A5F]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="treatmentStage"
                  value={option.name}
                  checked={treatmentStage === option.name}
                  onChange={(e) => setTreatmentStage(e.target.value)}
                  className="w-4 h-4 mt-0.5 text-[#1E3A5F] border-slate-300 bg-white focus:ring-[#1E3A5F]"
                />
                <div className="flex-1">
                  <span className="text-slate-900 font-medium">{option.name}</span>
                  {option.description && (
                    <p className="text-sm text-slate-600 mt-0.5">{option.description}</p>
                  )}
                </div>
                {index === 0 && discoveryData && (
                  <span className="text-orange-700 text-xs font-medium bg-orange-100 px-2 py-1 rounded-full whitespace-nowrap border border-orange-200">Recommended</span>
                )}
              </label>
            ))}
          </div>
        </Card>

        {/* Primary Endpoint */}
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-slate-900 mb-1">Primary Endpoint</h2>
          <p className="text-sm text-slate-600 mb-4">What&apos;s the main outcome you&apos;re measuring?</p>
          <div className="space-y-3">
            {endpoints.map((option) => (
              <label
                key={option.name}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  primaryEndpoint === option.name
                    ? 'border-[#1E3A5F] bg-[#1E3A5F]/10 ring-1 ring-[#1E3A5F]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="primaryEndpoint"
                  value={option.name}
                  checked={primaryEndpoint === option.name}
                  onChange={(e) => setPrimaryEndpoint(e.target.value)}
                  className="w-4 h-4 mt-0.5 text-[#1E3A5F] border-slate-300 bg-white focus:ring-[#1E3A5F]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900 font-medium">{option.name}</span>
                    {option.suggestedInstrument && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {option.suggestedInstrument}
                      </span>
                    )}
                  </div>
                  {option.rationale && (
                    <p className="text-sm text-slate-600 mt-0.5">{option.rationale}</p>
                  )}
                </div>
                {option.confidence === 'high' && (
                  <span className="text-emerald-600 text-xs font-medium bg-emerald-100 px-2 py-1 rounded-full whitespace-nowrap border border-emerald-200">High confidence</span>
                )}
              </label>
            ))}
          </div>
        </Card>

        {/* Secondary Endpoints */}
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-slate-900 mb-1">Secondary Endpoints</h2>
          <p className="text-sm text-slate-600 mb-4">What else do you want to track?</p>
          <div className="space-y-3">
            {endpoints
              .filter(e => e.name !== primaryEndpoint)
              .map((option) => (
                <label
                  key={option.name}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    secondaryEndpoints.includes(option.name)
                      ? 'border-[#1E3A5F] bg-[#1E3A5F]/10 ring-1 ring-[#1E3A5F]'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={secondaryEndpoints.includes(option.name)}
                    onChange={(e) => handleSecondaryEndpointChange(option.name, e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#1E3A5F] border-slate-300 bg-white rounded focus:ring-[#1E3A5F]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-900 font-medium">{option.name}</span>
                      {option.suggestedInstrument && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {option.suggestedInstrument}
                        </span>
                      )}
                    </div>
                    {option.rationale && (
                      <p className="text-sm text-slate-600 mt-0.5">{option.rationale}</p>
                    )}
                  </div>
                </label>
              ))}
          </div>
        </Card>

        {/* Duration */}
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-slate-900 mb-1">Study Duration</h2>
          <p className="text-sm text-slate-600 mb-4">How long will the study run?</p>
          <div className="space-y-3">
            {DURATION_OPTIONS.map((option) => (
              <label
                key={option.weeks}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  duration === option.weeks
                    ? 'border-[#1E3A5F] bg-[#1E3A5F]/10 ring-1 ring-[#1E3A5F]'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="duration"
                  value={option.weeks}
                  checked={duration === option.weeks}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-4 h-4 text-[#1E3A5F] border-slate-300 bg-white focus:ring-[#1E3A5F]"
                />
                <span className="flex-1 text-slate-900 font-medium">{option.label}</span>
                {discoveryData?.recommendedDuration?.weeks === option.weeks && (
                  <span className="text-orange-700 text-xs font-medium bg-orange-100 px-2 py-1 rounded-full border border-orange-200">Recommended</span>
                )}
              </label>
            ))}
          </div>

          {/* Duration info */}
          {durationRationale && (
            <div className="mt-4 flex gap-3 p-4 bg-violet-50 border border-violet-200 rounded-xl text-sm text-violet-700">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-violet-500" />
              <p>{durationRationale}</p>
            </div>
          )}
        </Card>

        {/* Safety Considerations */}
        {discoveryData?.safetyConsiderations && discoveryData.safetyConsiderations.length > 0 && (
          <Card variant="default" padding="md" className="border-orange-200 bg-orange-50">
            <h2 className="font-semibold text-slate-900 mb-3">Safety Considerations</h2>
            <ul className="space-y-2 text-sm text-orange-800">
              {discoveryData.safetyConsiderations.map((consideration, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                  {consideration}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={isSubmitting || !population || !treatmentStage || !primaryEndpoint}
          isLoading={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {submissionPhase === 'safety' ? 'Generating Safety Rules...' : 'Generating Protocol...'}
            </>
          ) : (
            <>
              Generate Protocol
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

export default function ConfigureStudyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
              <div className="absolute inset-0 rounded-full border-2 border-[#1E3A5F] border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      }>
        <ConfigureStudyContent />
      </Suspense>
    </div>
  )
}
