'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  Copy,
  FileText,
  ExternalLink,
  CheckCircle2,
  Pencil
} from 'lucide-react'

// Placeholder consent document
const CONSENT_DOCUMENT = `# Informed Consent for Research Participation

## TRT Symptom Response Study

### Purpose of the Study
You are being invited to participate in a research study about testosterone replacement therapy (TRT). The purpose of this study is to understand how TRT affects symptoms like energy, mood, and sexual function over time.

### What You Will Be Asked To Do
If you agree to participate, you will:
- Complete short questionnaires about your symptoms every 2-4 weeks
- Have blood work done at baseline, 6 weeks, 12 weeks, and 26 weeks (same labs your doctor would order anyway)
- The study lasts 6 months total

### Time Commitment
- Questionnaires take about 5 minutes each
- You'll complete 9 questionnaires over 6 months

### Risks
This is an observational study. Your treatment does not change based on participation. The main risk is the time required to complete questionnaires.

### Benefits
You may not benefit directly, but your participation will help improve TRT treatment for future patients.

### Confidentiality
Your responses are kept confidential. Data is stored securely and only study staff can access it. Results are reported in aggregate only.

### Voluntary Participation
Participation is voluntary. You can withdraw at any time without affecting your medical care.

### Questions
Contact the study coordinator at study@example.com with any questions.`

// Placeholder comprehension questions
const COMPREHENSION_QUESTIONS = [
  {
    id: 1,
    question: 'How long does this study last?',
    correctAnswer: '6 months',
  },
  {
    id: 2,
    question: 'Can you withdraw from the study at any time?',
    correctAnswer: 'Yes',
  },
  {
    id: 3,
    question: 'What will you be asked to do?',
    correctAnswer: 'Complete questionnaires and have blood work done',
  },
  {
    id: 4,
    question: 'Will participating change your TRT treatment?',
    correctAnswer: 'No',
  },
]

function ConsentReviewContent() {
  const searchParams = useSearchParams()
  const intervention = searchParams.get('intervention') || 'Unknown Intervention'

  const [isFinalized, setIsFinalized] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  // Generate a fake study ID
  const studyId = 'study_' + Math.random().toString(36).substring(2, 10)
  const inviteLink = `https://study-platform-psi.vercel.app/join/${studyId}`

  const handleFinalize = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsFinalized(true)
    setIsSubmitting(false)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Success state
  if (isFinalized) {
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
              <div className="font-semibold text-gray-900">TRT Symptom Response Study</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Study ID</div>
              <div className="font-mono text-sm text-gray-900">{studyId}</div>
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
              href="/sponsor"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Dashboard
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

      {/* Consent Document Preview */}
      <section className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Informed Consent Document</span>
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-indigo-50">
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="prose prose-sm prose-gray max-w-none">
            {CONSENT_DOCUMENT.split('\n').map((line, index) => {
              if (line.startsWith('# ')) {
                return <h1 key={index} className="text-xl font-bold text-gray-900 mt-0">{line.replace('# ', '')}</h1>
              } else if (line.startsWith('## ')) {
                return <h2 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-2">{line.replace('## ', '')}</h2>
              } else if (line.startsWith('### ')) {
                return <h3 key={index} className="text-base font-semibold text-gray-800 mt-4 mb-2">{line.replace('### ', '')}</h3>
              } else if (line.startsWith('- ')) {
                return <li key={index} className="text-gray-700 ml-4">{line.replace('- ', '')}</li>
              } else if (line.trim()) {
                return <p key={index} className="text-gray-700 mb-3">{line}</p>
              }
              return null
            })}
          </div>
        </div>
      </section>

      {/* Comprehension Questions */}
      <section className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900">Comprehension Questions</span>
            <span className="text-sm text-gray-500">({COMPREHENSION_QUESTIONS.length})</span>
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
          <div className="space-y-3">
            {COMPREHENSION_QUESTIONS.map((q, index) => (
              <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">{q.question}</div>
                    <div className="text-sm text-gray-600">
                      <span className="text-gray-500">Correct answer:</span>{' '}
                      <span className="text-green-600 font-medium">{q.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
