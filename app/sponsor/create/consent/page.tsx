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
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

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

      const studyName = `${intervention} Outcomes Study`
      const durationWeeks = parseInt(duration) || 26

      // Generate enrollment copy
      let enrollmentCopy = null
      try {
        const enrollmentResponse = await fetch('/api/agents/enrollment-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studyName,
            intervention,
            sponsor: 'Study Sponsor', // Could be customizable
            durationWeeks,
            proceduresSummary: `Short surveys every 2-4 weeks for ${Math.round(durationWeeks / 4)} months`,
            estimatedTimePerAssessment: '5 minutes',
            primaryBenefit: `Help improve ${intervention} treatment for future patients`,
          }),
        })

        if (enrollmentResponse.ok) {
          const enrollmentData = await enrollmentResponse.json()
          enrollmentCopy = enrollmentData.data
        } else {
          console.warn('Failed to generate enrollment copy, using defaults')
        }
      } catch (enrollmentErr) {
        console.warn('Error generating enrollment copy:', enrollmentErr)
      }

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
          enrollmentCopy,
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-2 border-stone-200" />
            <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-stone-500">Loading consent document...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (isFinalized && createdStudy) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="w-full max-w-lg text-center animate-fade-in-up">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl text-stone-900 mb-2">
            Study Created!
          </h1>
          <p className="text-stone-500 mb-8">
            Your study is ready. Share the invitation link with eligible participants.
          </p>

          {/* Study Info */}
          <Card variant="default" padding="md" className="mb-6 text-left">
            <div className="mb-4">
              <div className="text-sm text-stone-500 mb-1">Study Name</div>
              <div className="font-semibold text-stone-900">{createdStudy.name}</div>
            </div>
            <div>
              <div className="text-sm text-stone-500 mb-1">Study ID</div>
              <div className="font-mono text-sm text-stone-600">{createdStudy.id}</div>
            </div>
          </Card>

          {/* Invitation Link */}
          <Card variant="default" padding="md" className="mb-8">
            <div className="text-sm font-medium text-stone-700 mb-3">Invitation Link</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-stone-50 rounded-xl px-4 py-3 text-sm text-stone-600 font-mono truncate border border-stone-100">
                {inviteLink}
              </div>
              <Button
                variant={copied ? 'primary' : 'secondary'}
                onClick={handleCopyLink}
                leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-sm text-stone-500 mt-3">
              Share this link with eligible participants to invite them to the study.
            </p>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/sponsor/studies/${createdStudy.id}`} className="flex-1">
              <Button size="lg" fullWidth>
                View Study Dashboard
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="secondary" size="lg" fullWidth>
                Back to Home
              </Button>
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
      <div className="mb-8 animate-fade-in">
        <Link
          href={`/sponsor/create/review?${searchParams.toString()}`}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-100 rounded-full text-xs font-medium text-teal-700 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Consent Document
        </div>
        <h1 className="font-display text-2xl sm:text-3xl text-stone-900">Review & Finalize</h1>
      </div>

      {/* AI-generated indicator */}
      {consent && consent !== FALLBACK_CONSENT && (
        <div className="mb-6 p-4 bg-teal-50 border border-teal-100 rounded-xl text-teal-700 text-sm flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 text-teal-600" />
          </div>
          <span>This consent document was generated by AI. Review and edit as needed.</span>
        </div>
      )}

      {/* Summary Card */}
      {consent?.summary && (
        <Card variant="default" padding="md" className="mb-6 bg-gradient-to-br from-teal-50 to-white border-teal-100 animate-fade-in-up">
          <h2 className="font-semibold text-stone-900 mb-3">{consent.summary.title || 'Study at a Glance'}</h2>
          <ul className="space-y-2">
            {consent.summary.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-2 text-stone-600">
                <span className="text-teal-500 mt-0.5">•</span>
                {bullet}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Consent Document Sections */}
      <Card variant="default" padding="none" className="mb-6 overflow-hidden stagger-children">
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-stone-400" />
            <span className="font-medium text-stone-900">
              {consent?.document?.title || 'Informed Consent Document'}
            </span>
            {consent?.document?.version && (
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                v{consent.document.version}
              </span>
            )}
          </div>
          <button className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-teal-50">
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
        <div className="divide-y divide-stone-100">
          {consent?.document?.sections?.map((section) => (
            <div key={section.id} className="border-b border-stone-100 last:border-0">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors text-left"
              >
                <span className="font-medium text-stone-900">{section.title}</span>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="w-5 h-5 text-stone-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-stone-400" />
                )}
              </button>
              {expandedSections.has(section.id) && (
                <div className="px-4 pb-4 prose prose-sm prose-stone max-w-none">
                  {section.content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('- ')) {
                      return (
                        <li key={index} className="text-stone-600 ml-4">
                          {paragraph.replace('- ', '')}
                        </li>
                      )
                    } else if (paragraph.trim()) {
                      return (
                        <p key={index} className="text-stone-600 mb-2">
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
      </Card>

      {/* Comprehension Questions */}
      <Card variant="default" padding="none" className="mb-8 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <ListChecks className="w-5 h-5 text-stone-400" />
            <span className="font-medium text-stone-900">Comprehension Questions</span>
            <span className="text-sm text-stone-500">
              ({consent?.comprehensionQuestions?.length || 0})
            </span>
          </div>
          <button className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-teal-50">
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-stone-500 mb-4">
            Participants must answer these questions correctly before signing consent.
          </p>
          <div className="space-y-4">
            {consent?.comprehensionQuestions?.map((q, index) => (
              <div key={q.id} className="p-4 bg-stone-50 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="font-medium text-stone-900">{q.question}</div>
                </div>
                <div className="ml-10 space-y-2">
                  {q.options?.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                        option.correct
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-white text-stone-600 border border-stone-200'
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
                  <div className="ml-10 mt-2 text-xs text-stone-500">
                    <span className="font-medium">If wrong:</span> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-6 animate-fade-in">
          {error}
        </div>
      )}

      {/* Finalize Button */}
      <Button
        size="lg"
        fullWidth
        onClick={handleFinalize}
        disabled={isSubmitting}
        isLoading={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Study...
          </>
        ) : (
          <>
            Finalize Study
            <Check className="w-5 h-5" />
          </>
        )}
      </Button>

      <p className="mt-4 text-center text-sm text-stone-500">
        Once finalized, you can share the invitation link with participants.
      </p>
    </div>
  )
}

export default function ConsentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-2 border-stone-200" />
            <div className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-stone-500">Loading...</p>
        </div>
      </div>
    }>
      <ConsentReviewContent />
    </Suspense>
  )
}
