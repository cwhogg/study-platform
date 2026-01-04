'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  Copy,
  FileText,
  ExternalLink,
  CheckCircle2,
  Pencil,
  Info,
  ChevronDown,
  ChevronUp,
  ListChecks,
} from 'lucide-react'

// Types for AI-generated consent
interface ConsentSection {
  id: string
  title: string
  content: string
}

interface ConsentDocument {
  title: string
  version: string
  sections: ConsentSection[]
}

interface ComprehensionQuestionOption {
  text: string
  correct: boolean
}

interface ComprehensionQuestion {
  id: string
  question: string
  options: ComprehensionQuestionOption[]
  explanation: string
}

interface ConsentSummary {
  title: string
  bullets: string[]
}

interface GeneratedConsent {
  document: ConsentDocument
  comprehensionQuestions: ComprehensionQuestion[]
  summary: ConsentSummary
}

interface CreatedStudy {
  id: string
  name: string
  intervention: string
  status: string
}

// Fallback consent if none generated
const FALLBACK_CONSENT: GeneratedConsent = {
  document: {
    title: 'Study Consent',
    version: '1.0',
    sections: [
      {
        id: 'intro',
        title: 'About This Study',
        content: 'You are being invited to participate in a research study. Please review all sections carefully before signing.',
      },
      {
        id: 'procedures',
        title: 'What You Will Do',
        content: 'Complete questionnaires at scheduled intervals during the study period.',
      },
      {
        id: 'voluntary',
        title: 'Voluntary Participation',
        content: 'Participation is completely voluntary. You can stop at any time without any penalty.',
      },
    ],
  },
  comprehensionQuestions: [
    {
      id: 'q1',
      question: 'Can you stop participating at any time?',
      options: [
        { text: 'No, you must complete the study', correct: false },
        { text: 'Yes, you can stop at any time without penalty', correct: true },
        { text: 'Only with your doctor\'s permission', correct: false },
      ],
      explanation: 'Participation is voluntary. You can stop at any time.',
    },
  ],
  summary: {
    title: 'Study at a Glance',
    bullets: [
      'Complete questionnaires at scheduled intervals',
      'Participation is voluntary',
      'Your information is kept confidential',
    ],
  },
}

function ConsentReviewContent() {
  const searchParams = useSearchParams()
  const intervention = searchParams.get('intervention') || 'Unknown Intervention'
  const population = searchParams.get('population') || ''
  const treatmentStage = searchParams.get('treatmentStage') || ''
  const primaryEndpoint = searchParams.get('primaryEndpoint') || ''
  const secondaryEndpoints = searchParams.get('secondaryEndpoints') || ''
  const duration = searchParams.get('duration') || '26'

  const [consent, setConsent] = useState<GeneratedConsent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFinalized, setIsFinalized] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [createdStudy, setCreatedStudy] = useState<CreatedStudy | null>(null)
  const [inviteLink, setInviteLink] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro']))

  // Load consent from sessionStorage
  useEffect(() => {
    try {
      const storedConsent = sessionStorage.getItem('generatedConsent')
      if (storedConsent) {
        setConsent(JSON.parse(storedConsent) as GeneratedConsent)
      } else {
        setConsent(FALLBACK_CONSENT)
      }
    } catch (err) {
      console.error('Failed to load consent:', err)
      setConsent(FALLBACK_CONSENT)
    }
    setIsLoading(false)
  }, [])

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleFinalize = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      // Get the protocol from sessionStorage
      const storedProtocol = sessionStorage.getItem('generatedProtocol')
      const protocol = storedProtocol ? JSON.parse(storedProtocol) : null

      const response = await fetch('/api/studies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intervention,
          population,
          treatmentStage,
          primaryEndpoint,
          secondaryEndpoints,
          duration,
          // Include AI-generated content
          protocol,
          consentDocument: consent?.document,
          comprehensionQuestions: consent?.comprehensionQuestions,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create study')
        setIsSubmitting(false)
        return
      }

      setCreatedStudy(data.study)
      setInviteLink(data.inviteLink)
      setIsFinalized(true)

      // Clear sessionStorage
      sessionStorage.removeItem('studyDiscovery')
      sessionStorage.removeItem('generatedProtocol')
      sessionStorage.removeItem('generatedConsent')
    } catch (err) {
      console.error('Error creating study:', err)
      setError('An unexpected error occurred. Please try again.')
    }

    setIsSubmitting(false)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading consent document...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (isFinalized && createdStudy) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Study Created!
          </h1>
          <p className="text-gray-600 mb-8">
            Your study is ready. Share the invitation link with eligible participants.
          </p>

          {/* Study Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Study Name</div>
              <div className="font-semibold text-gray-900">{createdStudy.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Study ID</div>
              <div className="font-mono text-sm text-gray-900">{createdStudy.id}</div>
            </div>
          </div>

          {/* Invitation Link */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <div className="text-sm font-medium text-gray-700 mb-3">Invitation Link</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 font-mono truncate">
                {inviteLink}
              </div>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Share this link with eligible participants to invite them to the study.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/sponsor/studies/${createdStudy.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Study Dashboard
              <ExternalLink className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Review state
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/sponsor/create/review?${searchParams.toString()}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="text-sm font-medium text-indigo-600 mb-2">CONSENT DOCUMENT</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Review & Finalize</h1>
      </div>

      {/* AI-generated indicator */}
      {consent && consent !== FALLBACK_CONSENT && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          This consent document was generated by AI. Review and edit as needed.
        </div>
      )}

      {/* Summary Card */}
      {consent?.summary && (
        <section className="bg-indigo-50 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">{consent.summary.title || 'Study at a Glance'}</h2>
          <ul className="space-y-2">
            {consent.summary.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-indigo-600 mt-0.5">•</span>
                {bullet}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Consent Document Sections */}
      <section className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">
              {consent?.document?.title || 'Informed Consent Document'}
            </span>
            {consent?.document?.version && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                v{consent.document.version}
              </span>
            )}
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50">
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {consent?.document?.sections?.map((section) => (
            <div key={section.id} className="border-b border-gray-100 last:border-0">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="font-medium text-gray-900">{section.title}</span>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {expandedSections.has(section.id) && (
                <div className="px-4 pb-4 prose prose-sm prose-gray max-w-none">
                  {section.content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('- ')) {
                      return (
                        <li key={index} className="text-gray-700 ml-4">
                          {paragraph.replace('- ', '')}
                        </li>
                      )
                    } else if (paragraph.trim()) {
                      return (
                        <p key={index} className="text-gray-700 mb-2">
                          {paragraph}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Comprehension Questions */}
      <section className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ListChecks className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Comprehension Questions</span>
            <span className="text-sm text-gray-500">
              ({consent?.comprehensionQuestions?.length || 0})
            </span>
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50">
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-4">
            Participants must answer these questions correctly before signing consent.
          </p>
          <div className="space-y-4">
            {consent?.comprehensionQuestions?.map((q, index) => (
              <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="font-medium text-gray-900">{q.question}</div>
                </div>
                <div className="ml-9 space-y-2">
                  {q.options?.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-2 text-sm p-2 rounded ${
                        option.correct
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      {option.correct && <CheckCircle2 className="w-4 h-4" />}
                      <span>{option.text}</span>
                      {option.correct && (
                        <span className="text-xs font-medium ml-auto">Correct</span>
                      )}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="ml-9 mt-2 text-xs text-gray-500">
                    <span className="font-medium">If wrong:</span> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Finalize Button */}
      <button
        onClick={handleFinalize}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Creating Study...</span>
          </>
        ) : (
          <>
            <span>Finalize Study</span>
            <Check className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="mt-4 text-center text-sm text-gray-500">
        Once finalized, you can share the invitation link with participants.
      </p>
    </div>
  )
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <ConsentReviewContent />
    </Suspense>
  )
}
