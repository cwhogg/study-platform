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
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CriteriaEditModal } from '@/components/sponsor/CriteriaEditModal'
import { toTitleCase } from '@/lib/utils'

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
  operator: string
  value: number
  unit: string
  type: string
  urgency: string
  action: string
}

interface ProAlert {
  instrumentId: string
  condition: string
  type: string
  message: string
  target?: string | null
  urgency?: string | null
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
    proAlerts: [{ instrumentId: 'phq-2', condition: 'total >= 3', type: 'trigger_instrument', message: 'Trigger PHQ-9 follow-up', target: 'phq-9' }],
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
    <Card variant="default" padding="none" className="overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-slate-500">{icon}</div>
          <span className="font-medium text-slate-900">{title}</span>
          {count !== undefined && (
            <span className="text-sm text-slate-500">({count})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="text-sm text-[#1E40AF] hover:text-[#1E40AF] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#1E40AF]/10"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-slate-200">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </Card>
  )
}

// Risk assessment type from discovery
interface RiskAssessment {
  interventionCategory: 'pharmacological' | 'non_pharmacological'
  fdaApprovalStatus?: {
    approved: boolean
    approvedForStudiedIndication?: boolean
    indications?: string[]
    studiedIndication?: string
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
  const [editingCriteria, setEditingCriteria] = useState<'inclusion' | 'exclusion' | null>(null)

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
    if (section === 'inclusion' || section === 'exclusion') {
      setEditingCriteria(section)
    } else {
      // Other sections - will implement later
      console.log(`Edit ${section}`)
    }
  }

  const handleSaveCriteria = (type: 'inclusion' | 'exclusion', criteria: InclusionCriterion[] | ExclusionCriterion[]) => {
    if (!protocol) return

    const updatedProtocol = {
      ...protocol,
      [type === 'inclusion' ? 'inclusionCriteria' : 'exclusionCriteria']: criteria,
    }

    setProtocol(updatedProtocol)
    // Persist to sessionStorage
    sessionStorage.setItem('generatedProtocol', JSON.stringify(updatedProtocol))
    setEditingCriteria(null)
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
        studyName: `${toTitleCase(intervention)} Outcomes Study`,
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
      console.log('[Consent] Response status:', response.status)
      console.log('[Consent] Response data:', JSON.stringify(data, null, 2))

      // Log OpenAI prompt/response debug info
      if (data.debug) {
        console.log('\n=== CONSENT AGENT DEBUG INFO ===')
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-2 border-[#1E40AF] border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-600">Loading protocol...</p>
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
      trigger: `${a.instrumentId}: ${a.condition}`,
      action: a.message,
    })) || []),
    ...(protocol.safetyMonitoring?.labThresholds?.map(t => ({
      trigger: `${t.marker} ${t.operator} ${t.value} ${t.unit}`,
      action: t.action,
    })) || []),
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <Link
          href={`/sponsor/create/configure?intervention=${encodeURIComponent(intervention)}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-6 block w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1E40AF]/10 border border-[#1E40AF]/20 rounded-full text-xs font-medium text-[#1E40AF] mb-4 w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          Generated Protocol
        </div>
        <h1 className="font-display text-2xl sm:text-3xl text-slate-900">{toTitleCase(intervention)} Study</h1>
      </div>

      {/* AI-generated indicator */}
      <div className="mb-6 p-4 bg-[#1E40AF]/10 border border-[#1E40AF]/20 rounded-xl text-[#1E40AF] text-sm flex items-center gap-3 animate-fade-in">
        <div className="w-8 h-8 bg-[#1E40AF]/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Info className="w-4 h-4 text-[#1E40AF]" />
        </div>
        <span>This protocol was generated by AI. Review and edit as needed before finalizing.</span>
      </div>

      {/* Summary */}
      <Card variant="default" padding="md" className="mb-6 bg-gradient-to-br from-[#1E40AF]/10 to-white border-[#1E40AF]/20 animate-fade-in-up">
        <h2 className="font-semibold text-slate-900 mb-2">Summary</h2>
        <p className="text-slate-700">{protocol.summary}</p>
      </Card>

      {/* Collapsible Sections */}
      <div className="space-y-4 mb-8 stagger-children">
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
              <div key={index} className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-start gap-2 text-slate-900 font-medium">
                  <span className="text-emerald-600 mt-0.5">•</span>
                  {criterion.criterion}
                </div>
                {criterion.rationale && (
                  <p className="text-sm text-slate-600 mt-1 ml-4">{criterion.rationale}</p>
                )}
                {criterion.assessmentMethod && (
                  <p className="text-xs text-slate-500 mt-1 ml-4">
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
              <div key={index} className="p-3 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-start gap-2 text-slate-900 font-medium">
                  <span className="text-red-600 mt-0.5">•</span>
                  {criterion.criterion}
                </div>
                {criterion.rationale && (
                  <p className="text-sm text-slate-600 mt-1 ml-4">{criterion.rationale}</p>
                )}
                {criterion.assessmentMethod && (
                  <p className="text-xs text-slate-500 mt-1 ml-4">
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
                className={`p-3 rounded-xl border ${
                  index === 0 ? 'border-[#1E40AF]/30 bg-[#1E40AF]/10' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-900">
                    {instrument.name}
                    {index === 0 && primaryInstrument && (
                      <span className="ml-2 text-xs bg-[#1E40AF] text-white px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-slate-500">
                    {instrument.questions?.length || 0} questions
                    {instrument.estimatedMinutes && ` • ~${instrument.estimatedMinutes} min`}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{instrument.description}</p>
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
              <h4 className="text-sm font-medium text-slate-900 mb-2">Assessment Timepoints</h4>
              <div className="flex flex-wrap gap-2">
                {assessmentTimepoints.map((timepoint, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                  >
                    {timepoint}
                  </span>
                ))}
              </div>
            </div>
            {labTimepoints.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2">Lab Collection</h4>
                <div className="flex flex-wrap gap-2">
                  {labTimepoints.map((timepoint, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-full text-sm font-medium"
                    >
                      {timepoint}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed schedule */}
            <div className="mt-4 border-t border-slate-200 pt-4">
              <h4 className="text-sm font-medium text-slate-900 mb-3">Detailed Schedule</h4>
              <div className="space-y-2">
                {protocol.schedule?.map((timepoint, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm p-2 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900 w-20 flex-shrink-0">
                      {timepoint.week === 0 ? 'Baseline' : `Week ${timepoint.week}`}
                    </span>
                    <div className="flex-1">
                      <span className="text-slate-700">
                        {timepoint.instruments?.join(', ')}
                      </span>
                      {timepoint.labs && timepoint.labs.length > 0 && (
                        <span className="text-violet-600 ml-2">
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
              <div key={index} className="p-3 rounded-xl border border-orange-200 bg-orange-50">
                <div className="text-sm">
                  <span className="font-medium text-slate-900">If:</span>{' '}
                  <span className="text-slate-700">{rule.trigger}</span>
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium text-slate-900">Then:</span>{' '}
                  <span className="text-slate-700">{rule.action}</span>
                </div>
              </div>
            ))}
            {safetyRules.length === 0 && (
              <p className="text-sm text-slate-500">No safety rules defined.</p>
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
              {/* FDA Status - only show for pharmacological interventions */}
              {riskAssessment.interventionCategory === 'pharmacological' && (
                <div className={`p-4 rounded-xl ${
                  riskAssessment.fdaApprovalStatus?.approvedForStudiedIndication
                    ? 'bg-emerald-50 border border-emerald-200'
                    : riskAssessment.fdaApprovalStatus?.approved
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="font-medium text-slate-900 mb-1">
                    {riskAssessment.fdaApprovalStatus?.approvedForStudiedIndication
                      ? `✓ FDA Approved${riskAssessment.fdaApprovalStatus?.studiedIndication ? ` for ${riskAssessment.fdaApprovalStatus.studiedIndication}` : ''}`
                      : riskAssessment.fdaApprovalStatus?.approved
                      ? '⚠ Off-Label Use'
                      : '⚠ NOT FDA Approved'}
                  </div>
                  {/* Show approved indications for off-label use */}
                  {riskAssessment.fdaApprovalStatus?.approved && !riskAssessment.fdaApprovalStatus?.approvedForStudiedIndication && (
                    <p className="text-sm text-amber-700 mb-1">
                      FDA-approved for: {riskAssessment.fdaApprovalStatus?.indications?.join(', ') || 'other indications'}
                      {riskAssessment.fdaApprovalStatus?.studiedIndication && (
                        <> — not for {riskAssessment.fdaApprovalStatus.studiedIndication}</>
                      )}
                    </p>
                  )}
                  {/* Show regulatory disclaimer for off-label or non-approved */}
                  {riskAssessment.regulatoryDisclaimer && (
                    <p className={`text-sm ${
                      riskAssessment.fdaApprovalStatus?.approved ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {riskAssessment.regulatoryDisclaimer}
                    </p>
                  )}
                </div>
              )}

              {/* Risk Summary */}
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="font-medium text-slate-900 mb-1">Risk Summary</div>
                <p className="text-sm text-slate-700">{riskAssessment.riskSummary}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                    riskAssessment.overallRiskLevel === 'high' ? 'bg-red-100 text-red-700' :
                    riskAssessment.overallRiskLevel === 'moderate' ? 'bg-orange-100 text-orange-800' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    Overall Risk: {riskAssessment.overallRiskLevel}
                  </span>
                </div>
              </div>

              {/* Known Risks */}
              {riskAssessment.knownRisks && riskAssessment.knownRisks.length > 0 && (
                <div>
                  <div className="font-medium text-slate-900 mb-2">Known Risks</div>
                  <div className="space-y-2">
                    {riskAssessment.knownRisks.map((risk, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          risk.severity === 'high' ? 'bg-red-500' :
                          risk.severity === 'moderate' ? 'bg-orange-500' : 'bg-emerald-500'
                        }`} />
                        <span className="text-slate-700">
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
                  <div className="font-medium text-slate-900 mb-2">Community-Reported Risks</div>
                  <div className="space-y-2">
                    {riskAssessment.communityReportedRisks.map((risk, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          risk.severity === 'high' ? 'bg-red-500' :
                          risk.severity === 'moderate' ? 'bg-orange-500' : 'bg-emerald-500'
                        }`} />
                        <span className="text-slate-700">
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
                  <div className="font-medium text-slate-900 mb-2">Contraindications</div>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {riskAssessment.contraindications.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Data Sources */}
              {riskAssessment.dataSources && riskAssessment.dataSources.length > 0 && (
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                  Sources: {riskAssessment.dataSources.join(', ')}
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6 animate-fade-in">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="button"
        size="lg"
        fullWidth
        onClick={handleSubmit}
        disabled={isSubmitting}
        isLoading={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Consent Document...
          </>
        ) : (
          <>
            Generate Consent Document
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </Button>

      {/* Criteria Edit Modal */}
      {editingCriteria && protocol && (
        <CriteriaEditModal
          type={editingCriteria}
          criteria={editingCriteria === 'inclusion' ? protocol.inclusionCriteria : protocol.exclusionCriteria}
          intervention={intervention}
          onSave={(criteria) => handleSaveCriteria(editingCriteria, criteria)}
          onClose={() => setEditingCriteria(null)}
        />
      )}
    </div>
  )
}

export default function ReviewProtocolPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
              <div className="absolute inset-0 rounded-full border-2 border-[#1E40AF] border-t-transparent animate-spin" />
            </div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      }>
        <ReviewProtocolContent />
      </Suspense>
    </div>
  )
}
