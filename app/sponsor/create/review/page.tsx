'use client'

import { useState, Suspense } from 'react'
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
  Shield
} from 'lucide-react'

// Hardcoded TRT protocol data (will be AI-generated later)
const PROTOCOL = {
  name: 'TRT Symptom Response Study',
  summary: '26-week observational study of newly diagnosed hypogonadal men initiating TRT. Primary endpoint: qADAM score change at week 12.',
  inclusionCriteria: [
    'Male, 30-65 years of age',
    'Diagnosed hypogonadism with total testosterone <300 ng/dL',
    'Initiating testosterone replacement therapy',
    'Treatment-naive or >12 month gap since prior TRT',
    'Willing and able to complete study assessments',
  ],
  exclusionCriteria: [
    'History of prostate cancer',
    'PSA >4.0 ng/mL at baseline',
    'Hematocrit >50% at baseline',
    'Cardiovascular event within past 6 months',
    'Current use of chronic opioids or anabolic steroids',
    'Untreated severe obstructive sleep apnea',
  ],
  instruments: [
    { name: 'qADAM', description: 'Quantitative Androgen Deficiency in Aging Males', questions: 10, primary: true },
    { name: 'IIEF-5', description: 'International Index of Erectile Function', questions: 5 },
    { name: 'PHQ-2', description: 'Patient Health Questionnaire (Depression Screen)', questions: 2 },
    { name: 'Custom Symptoms', description: 'Energy, motivation, and well-being questions', questions: 6 },
  ],
  schedule: {
    assessments: ['Baseline', 'Week 2', 'Week 4', 'Week 6', 'Week 8', 'Week 12', 'Week 16', 'Week 20', 'Week 26'],
    labs: ['Baseline', 'Week 6', 'Week 12', 'Week 26'],
  },
  safetyMonitoring: [
    { trigger: 'PHQ-2 score ≥3', action: 'Automatically administer PHQ-9' },
    { trigger: 'PHQ-9 Question 9 >0', action: 'Display crisis resources immediately' },
    { trigger: 'Hematocrit >54%', action: 'Alert study coordinator' },
    { trigger: 'PSA increase >1.4 ng/mL from baseline', action: 'Alert study coordinator' },
  ],
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

function ReviewProtocolContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const intervention = searchParams.get('intervention') || 'Unknown Intervention'
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEdit = (section: string) => {
    // For now, just log - will implement edit modals later
    console.log(`Edit ${section}`)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Pass all params to consent step
    const params = new URLSearchParams(searchParams.toString())
    router.push(`/sponsor/create/consent?${params.toString()}`)
  }

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{PROTOCOL.name}</h1>
      </div>

      {/* Summary */}
      <div className="bg-indigo-50 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Summary</h2>
        <p className="text-gray-700">{PROTOCOL.summary}</p>
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-4 mb-8">
        {/* Inclusion Criteria */}
        <CollapsibleSection
          title="Inclusion Criteria"
          icon={<CheckCircle2 className="w-5 h-5" />}
          count={PROTOCOL.inclusionCriteria.length}
          onEdit={() => handleEdit('inclusion')}
          defaultOpen
        >
          <ul className="space-y-2">
            {PROTOCOL.inclusionCriteria.map((criterion, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-green-500 mt-0.5">•</span>
                {criterion}
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* Exclusion Criteria */}
        <CollapsibleSection
          title="Exclusion Criteria"
          icon={<AlertCircle className="w-5 h-5" />}
          count={PROTOCOL.exclusionCriteria.length}
          onEdit={() => handleEdit('exclusion')}
        >
          <ul className="space-y-2">
            {PROTOCOL.exclusionCriteria.map((criterion, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-red-500 mt-0.5">•</span>
                {criterion}
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* PRO Instruments */}
        <CollapsibleSection
          title="PRO Instruments"
          icon={<ClipboardList className="w-5 h-5" />}
          count={PROTOCOL.instruments.length}
          onEdit={() => handleEdit('instruments')}
        >
          <div className="space-y-3">
            {PROTOCOL.instruments.map((instrument, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  instrument.primary ? 'border-indigo-200 bg-indigo-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    {instrument.name}
                    {instrument.primary && (
                      <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-gray-500">{instrument.questions} questions</span>
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
                {PROTOCOL.schedule.assessments.map((timepoint, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {timepoint}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Lab Collection</h4>
              <div className="flex flex-wrap gap-2">
                {PROTOCOL.schedule.labs.map((timepoint, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {timepoint}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Safety Monitoring */}
        <CollapsibleSection
          title="Safety Monitoring"
          icon={<Shield className="w-5 h-5" />}
          count={PROTOCOL.safetyMonitoring.length}
          onEdit={() => handleEdit('safety')}
        >
          <div className="space-y-3">
            {PROTOCOL.safetyMonitoring.map((rule, index) => (
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
          </div>
        </CollapsibleSection>
      </div>

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
