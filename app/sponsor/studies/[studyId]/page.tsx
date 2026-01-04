'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Copy,
  Check,
  Users,
  UserCheck,
  UserX,
  Clock,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'

// Demo study data - in production, fetch from database
const demoStudyData: Record<string, {
  name: string
  status: 'active' | 'enrolling' | 'draft' | 'completed'
  intervention: string
  duration: string
  startDate: string | null
  stats: {
    enrolled: number
    active: number
    completed: number
    withdrawn: number
  }
}> = {
  'trt-outcomes-001': {
    name: 'TRT Outcomes Study',
    status: 'active',
    intervention: 'Testosterone Replacement Therapy',
    duration: '26 weeks',
    startDate: 'Jan 3, 2025',
    stats: {
      enrolled: 52,
      active: 47,
      completed: 3,
      withdrawn: 2
    }
  },
  'glp1-weight-002': {
    name: 'GLP-1 Weight Management Study',
    status: 'enrolling',
    intervention: 'GLP-1 Medications (Semaglutide)',
    duration: '52 weeks',
    startDate: 'Dec 15, 2024',
    stats: {
      enrolled: 12,
      active: 12,
      completed: 0,
      withdrawn: 0
    }
  },
  'sleep-quality-003': {
    name: 'Sleep Quality Improvement Study',
    status: 'draft',
    intervention: 'CBT-I (Cognitive Behavioral Therapy for Insomnia)',
    duration: '12 weeks',
    startDate: null,
    stats: {
      enrolled: 0,
      active: 0,
      completed: 0,
      withdrawn: 0
    }
  }
}

// Demo participants - empty for now
const demoParticipants: Array<{
  id: string
  email: string
  enrolledDate: string
  status: 'active' | 'completed' | 'withdrawn'
  currentWeek: number
  completedAssessments: number
  totalAssessments: number
}> = []

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          Active
        </span>
      )
    case 'enrolling':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          Enrolling
        </span>
      )
    case 'draft':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          Draft
        </span>
      )
    case 'completed':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          Completed
        </span>
      )
    default:
      return null
  }
}

export default function StudyDashboardPage() {
  const params = useParams()
  const studyId = params.studyId as string

  const [copied, setCopied] = useState(false)

  // Get study data or use default
  const study = demoStudyData[studyId] || {
    name: 'TRT Symptom Response Study',
    status: 'active' as const,
    intervention: 'Testosterone Replacement Therapy',
    duration: '26 weeks',
    startDate: 'Jan 3, 2025',
    stats: {
      enrolled: 0,
      active: 0,
      completed: 0,
      withdrawn: 0
    }
  }

  const inviteLink = `https://study-platform-psi.vercel.app/study/${studyId}/join`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/sponsor/studies"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          All Studies
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{study.name}</h1>
              {getStatusBadge(study.status)}
            </div>
            <p className="text-gray-600">{study.intervention}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{study.duration}</span>
              {study.startDate && (
                <>
                  <span>•</span>
                  <span>Started {study.startDate}</span>
                </>
              )}
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{study.stats.enrolled}</div>
            <div className="text-sm text-gray-500">Total Enrolled</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{study.stats.active}</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{study.stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <UserX className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{study.stats.withdrawn}</div>
            <div className="text-sm text-gray-500">Withdrawn</div>
          </div>
        </div>

        {/* Invitation Link */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invitation Link</h2>
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
            <a
              href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Share this link with eligible participants to invite them to the study.
          </p>
        </div>

        {/* Participants Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
          </div>

          {demoParticipants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrolled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {demoParticipants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{participant.email}</div>
                        <div className="text-sm text-gray-500">ID: {participant.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {participant.enrolledDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(participant.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Week {participant.currentWeek}
                        </div>
                        <div className="text-sm text-gray-500">
                          {participant.completedAssessments}/{participant.totalAssessments} assessments
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No participants yet</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Share the invitation link with eligible participants to start enrolling.
              </p>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Invitation Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
