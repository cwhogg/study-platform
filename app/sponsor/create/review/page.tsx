'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Calendar,
  Shield,
  Info,
} from 'lucide-react'

// Types for AI-generated protocol
interface InclusionCriterion {
  criterion: string
  rationale: string
  assessmentMethod: string
}

interface ExclusionCriterion {
  criterion: string
  rationale: string
  assessmentMethod: string
}

interface Instrument {
  id: string
  name: string
  description: string
  instructions?: string
  estimatedMinutes: number
  questions: unknown[]
}

interface ScheduleTimepoint {
  timepoint: string
  week: number
  instruments: string[]
  labs?: string[]
  windowDays?: number
}

interface LabThreshold {
  marker: string
  threshold: string
  action: string
}

interface ProAlert {
  instrument: string
  condition: string
  action: string
}

interface Protocol {
  summary: string
  inclusionCriteria: InclusionCriterion[]
  exclusionCriteria: ExclusionCriterion[]
  instruments: Instrument[]
  schedule: ScheduleTimepoint[]
  safetyMonitoring: {
    labThresholds: LabThreshold[]
    proAlerts: ProAlert[]
  }
}

// Fallback protocol if none generated
const FALLBACK_PROTOCOL: Protocol = {
  summary: 'Observational study protocol. Please go back and generate a protocol using AI.',
  inclusionCriteria: [
    { criterion: 'Adults 18+ years', rationale: 'Standard adult population', assessmentMethod: 'Self-report' },
  ],
  exclusionCriteria: [
    { criterion: 'Unable to provide consent', rationale: 'Ethical requirement', assessmentMethod: 'Consent process' },
  ],
  instruments: [
    { id: 'phq-2', name: 'PHQ-2', description: 'Depression screening', estimatedMinutes: 1, questions: [] },
  ],
  schedule: [
    { timepoint: 'baseline', week: 0, instruments: ['phq-2'] },
    { timepoint: 'week_12', week: 12, instruments: ['phq-2'] },
  ],
  safetyMonitoring: {
    labThresholds: [],
    proAlerts: [{ instrument: 'phq-2', condition: 'total >= 3', action: 'Trigger PHQ-9' }],
  },
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  count?: number
  children: React.ReactNode
  onEdit?: () => void
  defaultOpen?: boolean
}

function CollapsibleSection({ title, icon, count, children, onEdit, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-gray-400">{icon}</div>
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && (
            <span className="text-sm text-gray-500">({count})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  )
}

// Risk assessment type from discovery
interface RiskAssessment {
  interventionCategory: 'pharmacological' | 'non_pharmacological'
  fdaApprovalStatus?: {
    approved: boolean
    indications?: string[]
    approvalYear?: number
  }
  regulatoryDisclaimer?: string
  knownRisks: Array<{ risk: string; severity: string; frequency?: string; mitigation?: string }>
  contraindications?: string[]
  warnings?: string[]
  communityReportedRisks?: Array<{ risk: string; severity: string; frequency?: string }>
  overallRiskLevel: string
  riskSummary: string
  dataSources: string[]
}

function ReviewProtocolContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intervention = searchParams.get('intervention') || 'Unknown Intervention'

  const [protocol, setProtocol] = useState<Protocol | null>(null)
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load protocol and discovery data from sessionStorage
  useEffect(() => {
    try {
      const storedProtocol = sessionStorage.getItem('generatedProtocol')
      if (storedProtocol) {
        setProtocol(JSON.parse(storedProtocol) as Protocol)
      } else {
        setProtocol(FALLBACK_PROTOCOL)
      }

      // Load discovery data for riskAssessment
      const storedDiscovery = sessionStorage.getItem('studyDiscovery')
      if (storedDiscovery) {
        const discovery = JSON.parse(storedDiscovery)
        if (discovery.riskAssessment) {
          setRiskAssessment(discovery.riskAssessment)
          console.log('[Review] Loaded riskAssessment:', discovery.riskAssessment)
        }
      }
    } catch (err) {
      console.error('Failed to load protocol:', err)
      setProtocol(FALLBACK_PROTOCOL)
    }
    setIsLoading(false)
  }, [])

  const handleEdit = (section: string) => {
    // For now, just log - will implement edit modals later
    console.log(`Edit ${section}`)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      // Store protocol for consent page to use
      if (protocol) {
        sessionStorage.setItem('generatedProtocol', JSON.stringify(protocol))
      }

      // Get duration from URL params
      const duration = parseInt(searchParams.get('duration') || '26')

      // Call consent generation API
      const consentRequest = {
        protocol,
        studyName: `${intervention} Outcomes Study`,
        intervention,
        durationWeeks: duration,
        riskAssessment,  // Pass risk assessment from discovery
      }
      console.log('[Consent] Sending request with riskAssessment:', riskAssessment)

      const response = await fetch('/api/agents/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentRequest),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to generate consent document')
        setIsSubmitting(false)
        return
      }

      // Store generated consent in sessionStorage
      sessionStorage.setItem('generatedConsent', JSON.stringify(data.data))

      // Pass all params to consent step
      const params = new URLSearchParams(searchParams.toString())
      router.push(`/sponsor/create/consent?${params.toString()}`)

    } catch (err) {
      console.error('Consent generation error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (isLoading || !protocol) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading protocol...</p>
        </div>
      </div>
    )
  }

  // Find primary instrument (first one or one marked as such)
  const primaryInstrument = protocol.instruments?.[0]

  // Get unique timepoints for display
  const assessmentTimepoints = protocol.schedule?.map(s =>
    s.week === 0 ? 'Baseline' : `Week ${s.week}`
  ) || []

  const labTimepoints = protocol.schedule
    ?.filter(s => s.labs && s.labs.length > 0)
    .map(s => s.week === 0 ? 'Baseline' : `Week ${s.week}`) || []

  // Combine safety rules
  const safetyRules = [
    ...(protocol.safetyMonitoring?.proAlerts?.map(a => ({
      trigger: `${a.instrument}: ${a.condition}`,
      action: a.action,
    })) || []),
    ...(protocol.safetyMonitoring?.labThresholds?.map(t => ({
      trigger: `${t.marker} ${t.threshold}`,
      action: t.action,
    })) || []),
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/sponsor/create/configure?intervention=${encodeURIComponent(intervention)}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="text-sm font-medium text-indigo-600 mb-2">GENERATED PROTOCOL</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{intervention} Study</h1>
      </div>

      {/* AI-generated indicator */}
      <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
        <Info className="w-4 h-4" />
        This protocol was generated by AI. Review and edit as needed before finalizing.
      </div>

      {/* Summary */}
      <div className="bg-indigo-50 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Summary</h2>
        <p className="text-gray-700">{protocol.summary}</p>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-4 mb-8">
        {/* Inclusion Criteria */}
        <CollapsibleSection
          title="Inclusion Criteria"
          icon={<CheckCircle2 className="w-5 h-5" />}
          count={protocol.inclusionCriteria?.length || 0}
          onEdit={() => handleEdit('inclusion')}
          defaultOpen
        >
          <div className="space-y-3">
            {protocol.inclusionCriteria?.map((criterion, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-start gap-2 text-gray-900 font-medium">
                  <span className="text-green-500 mt-0.5">•</span>
                  {criterion.criterion}
                </div>
                {criterion.rationale && (
                  <p className="text-sm text-gray-600 mt-1 ml-4">{criterion.rationale}</p>
                )}
                {criterion.assessmentMethod && (
                  <p className="text-xs text-gray-500 mt-1 ml-4">
                    Assessment: {criterion.assessmentMethod}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Exclusion Criteria */}
        <CollapsibleSection
          title="Exclusion Criteria"
          icon={<AlertCircle className="w-5 h-5" />}
          count={protocol.exclusionCriteria?.length || 0}
          onEdit={() => handleEdit('exclusion')}
        >
          <div className="space-y-3">
            {protocol.exclusionCriteria?.map((criterion, index) => (
              <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-start gap-2 text-gray-900 font-medium">
                  <span className="text-red-500 mt-0.5">•</span>
                  {criterion.criterion}
                </div>
                {criterion.rationale && (
                  <p className="text-sm text-gray-600 mt-1 ml-4">{criterion.rationale}</p>
                )}
                {criterion.assessmentMethod && (
                  <p className="text-xs text-gray-500 mt-1 ml-4">
                    Assessment: {criterion.assessmentMethod}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* PRO Instruments */}
        <CollapsibleSection
          title="PRO Instruments"
          icon={<ClipboardList className="w-5 h-5" />}
          count={protocol.instruments?.length || 0}
          onEdit={() => handleEdit('instruments')}
        >
          <div className="space-y-3">
            {protocol.instruments?.map((instrument, index) => (
              <div
                key={instrument.id || index}
                className={`p-3 rounded-lg border ${
                  index === 0 ? 'border-indigo-200 bg-indigo-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    {instrument.name}
                    {index === 0 && primaryInstrument && (
                      <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-gray-500">
                    {instrument.questions?.length || 0} questions
                    {instrument.estimatedMinutes && ` • ~${instrument.estimatedMinutes} min`}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{instrument.description}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Schedule */}
        <CollapsibleSection
          title="Schedule"
          icon={<Calendar className="w-5 h-5" />}
          onEdit={() => handleEdit('schedule')}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Assessment Timepoints</h4>
              <div className="flex flex-wrap gap-2">
                {assessmentTimepoints.map((timepoint, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {timepoint}
                  </span>
                ))}
              </div>
            </div>
            {labTimepoints.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Lab Collection</h4>
                <div className="flex flex-wrap gap-2">
                  {labTimepoints.map((timepoint, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {timepoint}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed schedule */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Detailed Schedule</h4>
              <div className="space-y-2">
                {protocol.schedule?.map((timepoint, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <span className="font-medium text-gray-900 w-20">
                      {timepoint.week === 0 ? 'Baseline' : `Week ${timepoint.week}`}
                    </span>
                    <div className="flex-1">
                      <span className="text-gray-600">
                        {timepoint.instruments?.join(', ')}
                      </span>
                      {timepoint.labs && timepoint.labs.length > 0 && (
                        <span className="text-blue-600 ml-2">
                          + Labs: {timepoint.labs.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Safety Monitoring */}
        <CollapsibleSection
          title="Safety Monitoring"
          icon={<Shield className="w-5 h-5" />}
          count={safetyRules.length}
          onEdit={() => handleEdit('safety')}
        >
          <div className="space-y-3">
            {safetyRules.map((rule, index) => (
              <div key={index} className="p-3 rounded-lg border border-amber-200 bg-amber-50">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">If:</span>{' '}
                  <span className="text-gray-700">{rule.trigger}</span>
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium text-gray-900">Then:</span>{' '}
                  <span className="text-gray-700">{rule.action}</span>
                </div>
              </div>
            ))}
            {safetyRules.length === 0 && (
              <p className="text-sm text-gray-500">No safety rules defined.</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Risk Assessment from Discovery */}
        {riskAssessment && (
          <CollapsibleSection
            title="Intervention Risk Assessment"
            icon={<AlertCircle className="w-5 h-5" />}
            defaultOpen
          >
            <div className="space-y-4">
              {/* FDA Status */}
              <div className={`p-3 rounded-lg ${
                riskAssessment.fdaApprovalStatus?.approved
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="font-medium text-gray-900 mb-1">
                  {riskAssessment.fdaApprovalStatus?.approved
                    ? '✓ FDA Approved'
                    : '⚠️ NOT FDA Approved'}
                </div>
                {!riskAssessment.fdaApprovalStatus?.approved && riskAssessment.regulatoryDisclaimer && (
                  <p className="text-sm text-red-700">{riskAssessment.regulatoryDisclaimer}</p>
                )}
              </div>

              {/* Risk Summary */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-1">Risk Summary</div>
                <p className="text-sm text-gray-700">{riskAssessment.riskSummary}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    riskAssessment.overallRiskLevel === 'high' ? 'bg-red-100 text-red-700' :
                    riskAssessment.overallRiskLevel === 'moderate' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    Overall Risk: {riskAssessment.overallRiskLevel}
                  </span>
                </div>
              </div>

              {/* Known Risks */}
              {riskAssessment.knownRisks && riskAssessment.knownRisks.length > 0 && (
                <div>
                  <div className="font-medium text-gray-900 mb-2">Known Risks</div>
                  <div className="space-y-2">
                    {riskAssessment.knownRisks.map((risk, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          risk.severity === 'high' ? 'bg-red-500' :
                          risk.severity === 'moderate' ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                        <span className="text-gray-700">
                          <strong>{risk.risk}</strong>
                          {risk.frequency && ` (${risk.frequency})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community-Reported Risks */}
              {riskAssessment.communityReportedRisks && riskAssessment.communityReportedRisks.length > 0 && (
                <div>
                  <div className="font-medium text-gray-900 mb-2">Community-Reported Risks</div>
                  <div className="space-y-2">
                    {riskAssessment.communityReportedRisks.map((risk, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          risk.severity === 'high' ? 'bg-red-500' :
                          risk.severity === 'moderate' ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                        <span className="text-gray-700">
                          <strong>{risk.risk}</strong>
                          {risk.frequency && ` (${risk.frequency})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contraindications */}
              {riskAssessment.contraindications && riskAssessment.contraindications.length > 0 && (
                <div>
                  <div className="font-medium text-gray-900 mb-2">Contraindications</div>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {riskAssessment.contraindications.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Sources */}
              {riskAssessment.dataSources && riskAssessment.dataSources.length > 0 && (
                <div className="text-xs text-gray-500">
                  Sources: {riskAssessment.dataSources.join(', ')}
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}
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
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Generating Consent Document...</span>
          </>
        ) : (
          <>
            <span>Generate Consent Document</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  )
}

export default function ReviewProtocolPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ReviewProtocolContent />
    </Suspense>
  )
}
