'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, ArrowLeft, Info, Sparkles, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { toTitleCase } from '@/lib/utils'
import { generateDefaultSchedule } from '@/lib/study/schedule'
import { useDynamicMessage } from '@/lib/hooks/useDynamicMessage'
import {
  DynamicLoader,
  DISCOVERY_MESSAGES,
  PROTOCOL_BUTTON_MESSAGES,
  SAFETY_BUTTON_MESSAGES,
} from '@/components/ui/DynamicLoader'

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
  goal?: string
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
  const goal = searchParams.get('goal') || ''

  const [discoveryData, setDiscoveryData] = useState<DiscoveryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [population, setPopulation] = useState('')
  const [treatmentStage, setTreatmentStage] = useState('')
  const [primaryEndpoint, setPrimaryEndpoint] = useState('')
  const [primaryInstrument, setPrimaryInstrument] = useState('')
  const [secondaryEndpoints, setSecondaryEndpoints] = useState<string[]>([])
  const [secondaryInstruments, setSecondaryInstruments] = useState<string[]>([])
  const [duration, setDuration] = useState(26)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Custom option state
  const [customPopulation, setCustomPopulation] = useState('')
  const [customTreatmentStage, setCustomTreatmentStage] = useState('')
  const [customDuration, setCustomDuration] = useState('')
  const [customPrimaryEndpoint, setCustomPrimaryEndpoint] = useState('')
  const [customSecondaryEndpoint, setCustomSecondaryEndpoint] = useState('')
  const [submissionPhase, setSubmissionPhase] = useState<'protocol' | 'safety' | null>(null)
  const [safetyWarning, setSafetyWarning] = useState<{ show: boolean; error: string; protocol: Record<string, unknown> | null }>({
    show: false,
    error: '',
    protocol: null,
  })

  // Dynamic loading messages
  const protocolMessage = useDynamicMessage(
    PROTOCOL_BUTTON_MESSAGES,
    4000,
    submissionPhase === 'protocol'
  )
  const safetyMessage = useDynamicMessage(
    SAFETY_BUTTON_MESSAGES,
    4000,
    submissionPhase === 'safety'
  )
  const loadingMessage = submissionPhase === 'safety' ? safetyMessage : protocolMessage

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
          setPrimaryInstrument(sortedEndpoints[0].suggestedInstrument || '')
          // Set remaining high/moderate confidence endpoints as secondary
          const secondaryEps = sortedEndpoints
            .slice(1)
            .filter(e => e.confidence !== 'low')
          setSecondaryEndpoints(secondaryEps.map(e => e.name))
          setSecondaryInstruments(secondaryEps.map(e => e.suggestedInstrument || ''))
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
  // Always include "All adults 18-75" as first option, but keep AI recommendation as default
  const ALL_ADULTS_OPTION: PopulationOption = {
    name: 'All adults 18-75',
    description: 'No specific population restrictions'
  }
  const aiPopulations = discoveryData?.populations?.length ? discoveryData.populations : FALLBACK_POPULATIONS
  const populations = [ALL_ADULTS_OPTION, ...aiPopulations.filter(p => p.name !== 'All adults 18-75')]
  const treatmentStages = discoveryData?.treatmentStages?.length ? discoveryData.treatmentStages : FALLBACK_TREATMENT_STAGES
  const endpoints = discoveryData?.endpoints?.length ? discoveryData.endpoints : FALLBACK_ENDPOINTS
  const durationRationale = discoveryData?.recommendedDuration?.rationale

  const handleSecondaryEndpointChange = (name: string, checked: boolean) => {
    if (checked) {
      // Find the instrument for this endpoint
      const endpoint = endpoints.find(e => e.name === name)
      const instrument = endpoint?.suggestedInstrument || ''
      setSecondaryEndpoints([...secondaryEndpoints, name])
      setSecondaryInstruments([...secondaryInstruments, instrument])
    } else {
      const index = secondaryEndpoints.indexOf(name)
      setSecondaryEndpoints(secondaryEndpoints.filter(e => e !== name))
      setSecondaryInstruments(secondaryInstruments.filter((_, i) => i !== index))
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
      primaryInstrument: primaryInstrument || undefined,  // Suggested instrument from Discovery
      secondaryEndpoints,
      secondaryInstruments: secondaryInstruments.length > 0 ? secondaryInstruments : undefined,
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

      // Ensure schedule exists - generate default if missing
      if (!protocol.schedule || protocol.schedule.length === 0) {
        console.warn('[Protocol] No schedule returned, generating default')
        const instrumentIds = protocol.instruments?.map((i: { id: string }) => i.id) || ['phq-2']
        protocol.schedule = generateDefaultSchedule(duration, instrumentIds)
      }

      // Ensure instruments array exists
      if (!protocol.instruments || protocol.instruments.length === 0) {
        console.warn('[Protocol] No instruments returned')
        protocol.instruments = []
      }

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
        goal,  // Pass goal for context (e.g., "sleep")
        primaryEndpoint,  // Pass primary endpoint (e.g., "Sleep Quality")
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
        ...(goal && { goal }),
        population,
        treatmentStage,
        primaryEndpoint,
        secondaryEndpoints: secondaryEndpoints.join(','),
        duration: duration.toString(),
      })

      router.push(`/create/review?${params.toString()}`)

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
      ...(goal && { goal }),
      population,
      treatmentStage,
      primaryEndpoint,
      secondaryEndpoints: secondaryEndpoints.join(','),
      duration: duration.toString(),
    })

    setSafetyWarning({ show: false, error: '', protocol: null })
    router.push(`/create/review?${params.toString()}`)
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
            <div className="absolute inset-0 rounded-full border-2 border-[var(--glass-border)]" />
            <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
          </div>
          <p className="text-[var(--text-secondary)]">Loading study options...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Safety Warning Dialog */}
      {safetyWarning.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
          <div className="bg-[var(--bg-elevated)] rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-up border border-[var(--glass-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[var(--warning)]/15 rounded-full flex items-center justify-center flex-shrink-0 border border-[var(--warning)]/30">
                <AlertTriangle className="w-6 h-6 text-[var(--warning)]" />
              </div>
              <div>
                <h3 className="font-display text-lg text-[var(--text-primary)]">Safety Rules Failed</h3>
                <p className="text-sm text-[var(--text-muted)]">Unable to generate safety monitoring</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-[var(--warning)]/15 border border-[var(--warning)]/30 rounded-lg text-sm text-[var(--warning)]">
              <p className="font-medium mb-1">Error:</p>
              <p>{safetyWarning.error}</p>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mb-6">
              <strong className="text-[var(--text-primary)]">Warning:</strong> Proceeding without safety rules means
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
                className="flex-1 !text-[var(--warning)] hover:!bg-[var(--warning)]/10"
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
          href="/create"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6 block w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--primary-dim)] border border-[var(--primary)]/20 rounded-full text-xs font-medium text-[var(--primary-light)] mb-4 w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          Configure Protocol
        </div>
        <h1 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)]">
          {toTitleCase(intervention)}
          {goal && (
            <span className="text-[var(--text-muted)] font-normal"> for </span>
          )}
          {goal && (
            <span className="text-[var(--primary)]">{goal}</span>
          )}
        </h1>
        {discoveryData?.summary && (
          <p className="mt-2 text-[var(--text-secondary)]">{discoveryData.summary}</p>
        )}
      </div>

      {/* AI-generated indicator */}
      {discoveryData && (
        <div className="mb-6 p-4 bg-[var(--primary-dim)] border border-[var(--primary)]/20 rounded-xl text-[var(--primary-light)] text-sm flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-[var(--primary)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <span>Options below were generated by AI based on clinical evidence for {intervention}{goal ? ` for ${goal}` : ''}.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 stagger-children">
        {/* Population */}
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-[var(--text-primary)] mb-1">Population</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Who are you studying?</p>
          <div className="space-y-3">
            {populations.map((option, index) => (
              <label
                key={option.name}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  population === option.name && !customPopulation
                    ? 'border-[var(--primary)] bg-[var(--primary-dim)] ring-1 ring-[var(--primary)]'
                    : 'border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
                }`}
              >
                <input
                  type="radio"
                  name="population"
                  value={option.name}
                  checked={population === option.name && !customPopulation}
                  onChange={(e) => {
                    setPopulation(e.target.value)
                    setCustomPopulation('')
                  }}
                  className="w-4 h-4 mt-0.5 text-[var(--primary)] border-[var(--glass-border)] bg-[var(--glass-bg)] focus:ring-[var(--primary)]"
                />
                <div className="flex-1">
                  <span className="text-[var(--text-primary)] font-medium">{option.name}</span>
                  {option.description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{option.description}</p>
                  )}
                </div>
                {index === 0 && discoveryData && (
                  <span className="text-[var(--primary)] text-xs font-medium bg-[var(--primary-dim)] px-2 py-1 rounded-full whitespace-nowrap border border-[var(--primary)]/30">Recommended</span>
                )}
              </label>
            ))}
            {/* Custom option */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                customPopulation
                  ? 'border-[var(--primary)] bg-[var(--primary-dim)] ring-1 ring-[var(--primary)]'
                  : 'border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
              }`}
            >
              <input
                type="radio"
                name="population"
                checked={!!customPopulation}
                onChange={() => {}}
                className="w-4 h-4 mt-2 text-[var(--primary)] border-[var(--glass-border)] bg-[var(--glass-bg)] focus:ring-[var(--primary)]"
              />
              <input
                type="text"
                value={customPopulation}
                onChange={(e) => {
                  setCustomPopulation(e.target.value)
                  if (e.target.value) setPopulation(e.target.value)
                }}
                onFocus={() => {
                  if (customPopulation) setPopulation(customPopulation)
                }}
                placeholder="Or tell me what population you want to study"
                className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-0 p-0"
              />
            </label>
          </div>
        </Card>

        {/* Treatment Stage */}
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-[var(--text-primary)] mb-1">Treatment Stage</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">What phase of treatment?</p>
          <div className="space-y-3">
            {treatmentStages.map((option, index) => (
              <label
                key={option.name}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  treatmentStage === option.name && !customTreatmentStage
                    ? 'border-[var(--primary)] bg-[var(--primary-dim)] ring-1 ring-[var(--primary)]'
                    : 'border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
                }`}
              >
                <input
                  type="radio"
                  name="treatmentStage"
                  value={option.name}
                  checked={treatmentStage === option.name && !customTreatmentStage}
                  onChange={(e) => {
                    setTreatmentStage(e.target.value)
                    setCustomTreatmentStage('')
                  }}
                  className="w-4 h-4 mt-0.5 text-[var(--primary)] border-[var(--glass-border)] bg-[var(--glass-bg)] focus:ring-[var(--primary)]"
                />
                <div className="flex-1">
                  <span className="text-[var(--text-primary)] font-medium">{option.name}</span>
                  {option.description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{option.description}</p>
                  )}
                </div>
                {index === 0 && discoveryData && (
                  <span className="text-[var(--primary)] text-xs font-medium bg-[var(--primary-dim)] px-2 py-1 rounded-full whitespace-nowrap border border-[var(--primary)]/30">Recommended</span>
                )}
              </label>
            ))}
            {/* Custom option */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                customTreatmentStage
                  ? 'border-[var(--primary)] bg-[var(--primary-dim)] ring-1 ring-[var(--primary)]'
                  : 'border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
              }`}
            >
              <input
                type="radio"
                name="treatmentStage"
                checked={!!customTreatmentStage}
                onChange={() => {}}
                className="w-4 h-4 mt-2 text-[var(--primary)] border-[var(--glass-border)] bg-[var(--glass-bg)] focus:ring-[var(--primary)]"
              />
              <input
                type="text"
                value={customTreatmentStage}
                onChange={(e) => {
                  setCustomTreatmentStage(e.target.value)
                  if (e.target.value) setTreatmentStage(e.target.value)
                }}
                onFocus={() => {
                  if (customTreatmentStage) setTreatmentStage(customTreatmentStage)
                }}
                placeholder="Or describe the treatment stage"
                className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-0 p-0"
              />
            </label>
          </div>
        </Card>

        {/* Primary Endpoint */}
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-[var(--text-primary)] mb-1">Primary Endpoint</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">What&apos;s the main outcome you&apos;re measuring?</p>
          <div className="space-y-3">
            {endpoints.map((option) => (
              <label
                key={option.name}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  primaryEndpoint === option.name && !customPrimaryEndpoint
                    ? 'border-[var(--primary)] bg-[var(--primary-dim)] ring-1 ring-[var(--primary)]'
                    : 'border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
                }`}
              >
                <input
                  type="radio"
                  name="primaryEndpoint"
                  value={option.name}
                  checked={primaryEndpoint === option.name && !customPrimaryEndpoint}
                  onChange={(e) => {
                    setPrimaryEndpoint(e.target.value)
                    setPrimaryInstrument(option.suggestedInstrument || '')
                    setCustomPrimaryEndpoint('')
                  }}
                  className="w-4 h-4 mt-1.5 text-[var(--primary)] border-[var(--glass-border)] bg-[var(--glass-bg)] focus:ring-[var(--primary)]"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[var(--text-primary)]">{option.name}</div>
                  {option.confidence === 'high' && (
                    <span className="inline-flex text-[var(--success)] text-xs font-medium bg-[var(--success)]/15 px-2 py-1 rounded-full border border-[var(--success)]/30 mt-2">High confidence</span>
                  )}
                  {option.suggestedInstrument && (
                    <div className="bg-[var(--glass-bg)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] mt-2 border border-[var(--glass-border)]">
                      {option.suggestedInstrument}
                    </div>
                  )}
                  {option.rationale && (
                    <p className="text-sm text-[var(--text-secondary)] mt-2">{option.rationale}</p>
                  )}
                </div>
              </label>
            ))}
            {/* Custom option */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                customPrimaryEndpoint
                  ? 'border-[var(--primary)] bg-[var(--primary-dim)] ring-1 ring-[var(--primary)]'
                  : 'border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
              }`}
            >
              <input
                type="radio"
                name="primaryEndpoint"
                checked={!!customPrimaryEndpoint}
                onChange={() => {}}
                className="w-4 h-4 mt-2 text-[var(--primary)] border-[var(--glass-border)] bg-[var(--glass-bg)] focus:ring-[var(--primary)]"
              />
              <input
                type="text"
                value={customPrimaryEndpoint}
                onChange={(e) => {
                  setCustomPrimaryEndpoint(e.target.value)
                  if (e.target.value) {
                    setPrimaryEndpoint(e.target.value)
                    setPrimaryInstrument('') // Clear instrument for custom endpoints
                  }
                }}
                onFocus={() => {
                  if (customPrimaryEndpoint) {
                    setPrimaryEndpoint(customPrimaryEndpoint)
                    setPrimaryInstrument('')
                  }
                }}
                placeholder="Or describe the primary outcome you want to measure"
                className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-0 p-0"
              />
            </label>
          </div>
        </Card>

        {/* Secondary Endpoints */}
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-[var(--text-primary)] mb-1">Secondary Endpoints</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">What else do you want to track?</p>
          <div className="space-y-3">
            {endpoints
              .filter(e => e.name !== primaryEndpoint || customPrimaryEndpoint)
              .filter(e => customPrimaryEndpoint ? true : e.name !== primaryEndpoint)
              .map((option) => (
                <label
                  key={option.name}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    secondaryEndpoints.includes(option.name)
                      ? 'border-[var(--primary)] bg-[var(--primary-dim)] ring-1 ring-[var(--primary)]'
                      : 'border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={secondaryEndpoints.includes(option.name)}
                    onChange={(e) => handleSecondaryEndpointChange(option.name, e.target.checked)}
                    className="w-4 h-4 mt-1.5 text-[var(--primary)] border-[var(--glass-border)] bg-[var(--glass-bg)] rounded focus:ring-[var(--primary)]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--text-primary)]">{option.name}</div>
                    {option.confidence === 'high' && (
                      <span className="inline-flex text-[var(--success)] text-xs font-medium bg-[var(--success)]/15 px-2 py-1 rounded-full border border-[var(--success)]/30 mt-2">High confidence</span>
                    )}
                    {option.suggestedInstrument && (
                      <div className="bg-[var(--glass-bg)] rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] mt-2 border border-[var(--glass-border)]">
                        {option.suggestedInstrument}
                      </div>
                    )}
                    {option.rationale && (
                      <p className="text-sm text-[var(--text-secondary)] mt-2">{option.rationale}</p>
                    )}
                  </div>
                </label>
              ))}
            {/* Custom secondary endpoints that have been added */}
            {secondaryEndpoints
              .filter(e => !endpoints.some(ep => ep.name === e))
              .map((customEndpoint) => (
                <label
                  key={customEndpoint}
                  className="flex items-start gap-3 p-4 rounded-xl border border-[var(--primary)] bg-[var(--primary-dim)] ring-1 ring-[var(--primary)] cursor-pointer transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => handleSecondaryEndpointChange(customEndpoint, false)}
                    className="w-4 h-4 mt-1.5 text-[var(--primary)] border-[var(--glass-border)] bg-[var(--glass-bg)] rounded focus:ring-[var(--primary)]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--text-primary)]">{customEndpoint}</div>
                    <span className="inline-flex text-[var(--text-muted)] text-xs font-medium bg-[var(--glass-bg)] px-2 py-1 rounded-full border border-[var(--glass-border)] mt-2">Custom endpoint</span>
                  </div>
                </label>
              ))}
            {/* Custom option input */}
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
                customSecondaryEndpoint
                  ? 'border-[var(--primary)] bg-[var(--primary-dim)] ring-1 ring-[var(--primary)]'
                  : 'border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
              }`}
            >
              <input
                type="checkbox"
                checked={false}
                disabled
                className="w-4 h-4 mt-2 text-[var(--primary)] border-[var(--glass-border)] bg-[var(--glass-bg)] rounded focus:ring-[var(--primary)] opacity-50"
              />
              <input
                type="text"
                value={customSecondaryEndpoint}
                onChange={(e) => setCustomSecondaryEndpoint(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customSecondaryEndpoint.trim()) {
                    e.preventDefault()
                    if (!secondaryEndpoints.includes(customSecondaryEndpoint.trim())) {
                      setSecondaryEndpoints([...secondaryEndpoints, customSecondaryEndpoint.trim()])
                    }
                    setCustomSecondaryEndpoint('')
                  }
                }}
                placeholder="Or describe another outcome (press Enter to add)"
                className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-0 p-0"
              />
              {customSecondaryEndpoint.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    if (!secondaryEndpoints.includes(customSecondaryEndpoint.trim())) {
                      setSecondaryEndpoints([...secondaryEndpoints, customSecondaryEndpoint.trim()])
                    }
                    setCustomSecondaryEndpoint('')
                  }}
                  className="text-xs font-medium text-[var(--primary)] hover:underline"
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Duration */}
        <Card variant="default" padding="md">
          <h2 className="font-semibold text-[var(--text-primary)] mb-1">Study Duration</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">How long will the study run?</p>
          <div className="space-y-3">
            {DURATION_OPTIONS.map((option) => (
              <label
                key={option.weeks}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  duration === option.weeks && !customDuration
                    ? 'border-[var(--primary)] bg-[var(--primary-dim)] ring-1 ring-[var(--primary)]'
                    : 'border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
                }`}
              >
                <input
                  type="radio"
                  name="duration"
                  value={option.weeks}
                  checked={duration === option.weeks && !customDuration}
                  onChange={(e) => {
                    setDuration(parseInt(e.target.value))
                    setCustomDuration('')
                  }}
                  className="w-4 h-4 text-[var(--primary)] border-[var(--glass-border)] bg-[var(--glass-bg)] focus:ring-[var(--primary)]"
                />
                <span className="flex-1 text-[var(--text-primary)] font-medium">{option.label}</span>
                {discoveryData?.recommendedDuration?.weeks === option.weeks && (
                  <span className="text-[var(--primary)] text-xs font-medium bg-[var(--primary-dim)] px-2 py-1 rounded-full border border-[var(--primary)]/30">Recommended</span>
                )}
              </label>
            ))}
            {/* Custom option */}
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                customDuration
                  ? 'border-[var(--primary)] bg-[var(--primary-dim)] ring-1 ring-[var(--primary)]'
                  : 'border-[var(--glass-border)] hover:border-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
              }`}
            >
              <input
                type="radio"
                name="duration"
                checked={!!customDuration}
                onChange={() => {}}
                className="w-4 h-4 text-[var(--primary)] border-[var(--glass-border)] bg-[var(--glass-bg)] focus:ring-[var(--primary)]"
              />
              <input
                type="text"
                value={customDuration}
                onChange={(e) => {
                  setCustomDuration(e.target.value)
                  const weeks = parseInt(e.target.value)
                  if (!isNaN(weeks) && weeks > 0) setDuration(weeks)
                }}
                placeholder="Or enter duration in weeks (e.g., 16)"
                className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-0 p-0"
              />
            </label>
          </div>

          {/* Duration info */}
          {durationRationale && (
            <div className="mt-4 flex gap-3 p-4 bg-[var(--primary-dim)] border border-[var(--primary)]/30 rounded-xl text-sm text-[var(--primary-light)]">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--primary)]" />
              <p>{durationRationale}</p>
            </div>
          )}
        </Card>

        {/* Safety Considerations */}
        {discoveryData?.safetyConsiderations && discoveryData.safetyConsiderations.length > 0 && (
          <Card variant="default" padding="md" className="border-[var(--warning)]/30 bg-[var(--warning)]/10">
            <h2 className="font-semibold text-[var(--text-primary)] mb-3">Safety Considerations</h2>
            <ul className="space-y-2 text-sm text-[var(--warning)]">
              {discoveryData.safetyConsiderations.map((consideration, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 bg-[var(--warning)] rounded-full flex-shrink-0" />
                  {consideration}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-[var(--error)]/15 border border-[var(--error)]/30 rounded-xl text-[var(--error)] text-sm animate-fade-in">
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
          loadingText={loadingMessage}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Generate Protocol
        </Button>
      </form>
    </div>
  )
}

export default function ConfigureStudyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--glass-border)]" />
              <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
            </div>
            <p className="text-[var(--text-secondary)]">Loading...</p>
          </div>
        </div>
      }>
        <ConfigureStudyContent />
      </Suspense>
    </div>
  )
}
