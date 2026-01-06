'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Clock,
  TestTube,
  Bell,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react'

interface Study {
  id: string
  name: string
  intervention: string
  status: string
  participantCount: number
}

interface Participant {
  id: string
  studyId: string
  studyName: string
  email: string
  firstName: string | null
  status: string
  currentWeek: number
  enrolledAt: string | null
}

export default function AdminPage() {
  const [studies, setStudies] = useState<Study[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedStudy, setExpandedStudy] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/data')
      if (response.ok) {
        const data = await response.json()
        setStudies(data.studies || [])
        setParticipants(data.participants || [])
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function advanceWeek(participantId: string, toWeek: number) {
    setActionLoading(`advance-${participantId}`)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/advance-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, toWeek }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage({ type: 'success', text: `Advanced to Week ${toWeek}` })
        fetchData()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to advance week' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to advance week' })
    } finally {
      setActionLoading(null)
    }
  }

  async function simulateLabs(participantId: string, timepoint: string) {
    setActionLoading(`labs-${participantId}`)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/simulate-labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, timepoint }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage({ type: 'success', text: 'Lab results simulated' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to simulate labs' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to simulate labs' })
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteStudy(studyId: string, studyName: string) {
    if (!confirm(`Delete "${studyName}"? This will delete all participants and data.`)) {
      return
    }
    setActionLoading(`delete-${studyId}`)
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/data?studyId=${studyId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (response.ok) {
        setMessage({ type: 'success', text: 'Study deleted' })
        fetchData()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete study' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete study' })
    } finally {
      setActionLoading(null)
    }
  }

  async function triggerReminder(participantId: string, timepoint: string) {
    setActionLoading(`reminder-${participantId}`)
    setMessage(null)
    try {
      const response = await fetch('/api/cron/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, timepoint, channel: 'email' }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Reminder sent' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send reminder' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to send reminder' })
    } finally {
      setActionLoading(null)
    }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      draft: 'bg-slate-700 text-slate-300',
      active: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      paused: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      completed: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
      enrolled: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      consented: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      screening: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
      withdrawn: 'bg-red-500/20 text-red-300 border border-red-500/30',
      ineligible: 'bg-red-500/20 text-red-300 border border-red-500/30',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-700 text-slate-300'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getParticipantsForStudy = (studyId: string) =>
    participants.filter(p => p.studyId === studyId)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-slate-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading admin data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Demo controls and study management</p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Studies Overview */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 mb-8">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Studies ({studies.length})
            </h2>
          </div>

          {studies.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No studies found. Create a study from the sponsor portal.
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {studies.map((study) => (
                <div key={study.id} className="p-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedStudy(expandedStudy === study.id ? null : study.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-slate-100">{study.name}</h3>
                        {getStatusBadge(study.status)}
                      </div>
                      <p className="text-sm text-slate-400">{study.intervention}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {study.participantCount} participants
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteStudy(study.id, study.name)
                        }}
                        disabled={actionLoading === `delete-${study.id}`}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete study"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedStudy === study.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Participant List */}
                  {expandedStudy === study.id && (
                    <div className="mt-6 pt-6 border-t border-slate-700">
                      <h4 className="text-sm font-medium text-slate-300 mb-4">Participants</h4>
                      {getParticipantsForStudy(study.id).length === 0 ? (
                        <p className="text-sm text-slate-500">No participants enrolled yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {getParticipantsForStudy(study.id).map((participant) => (
                            <div
                              key={participant.id}
                              className="bg-slate-900 rounded-lg p-4 border border-slate-700"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-100">
                                      {participant.firstName || participant.email}
                                    </span>
                                    {getStatusBadge(participant.status)}
                                  </div>
                                  <p className="text-sm text-slate-400 mt-1">
                                    {participant.email}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      Week {participant.currentWeek}
                                    </span>
                                    {participant.enrolledAt && (
                                      <span>
                                        Enrolled: {new Date(participant.enrolledAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Demo Controls */}
                              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700">
                                {/* Advance Week Dropdown */}
                                <div className="relative inline-block">
                                  <select
                                    className="appearance-none bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-200 hover:bg-slate-700 cursor-pointer"
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        advanceWeek(participant.id, parseInt(e.target.value))
                                      }
                                    }}
                                    disabled={actionLoading === `advance-${participant.id}`}
                                  >
                                    <option value="">
                                      {actionLoading === `advance-${participant.id}` ? 'Advancing...' : 'Advance to Week...'}
                                    </option>
                                    {[1, 2, 4, 8, 12, 16, 20, 24, 26].filter(w => w > participant.currentWeek).map(week => (
                                      <option key={week} value={week}>Week {week}</option>
                                    ))}
                                  </select>
                                  <Clock className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                                </div>

                                {/* Simulate Labs */}
                                <button
                                  onClick={() => simulateLabs(participant.id, `week_${participant.currentWeek}`)}
                                  disabled={actionLoading === `labs-${participant.id}`}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                  <TestTube className="w-4 h-4" />
                                  {actionLoading === `labs-${participant.id}` ? 'Simulating...' : 'Simulate Labs'}
                                </button>

                                {/* Trigger Reminder */}
                                <button
                                  onClick={() => triggerReminder(participant.id, `week_${participant.currentWeek}`)}
                                  disabled={actionLoading === `reminder-${participant.id}`}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                  <Bell className="w-4 h-4" />
                                  {actionLoading === `reminder-${participant.id}` ? 'Sending...' : 'Send Reminder'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Participants Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              All Participants ({participants.length})
            </h2>
          </div>

          {participants.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No participants found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 border-b border-slate-700">
                  <tr>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                      Participant
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                      Study
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                      Week
                    </th>
                    <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-6 py-3">
                      Enrolled
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {participants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-slate-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-100">
                            {participant.firstName || 'Unknown'}
                          </p>
                          <p className="text-sm text-slate-400">{participant.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {participant.studyName}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(participant.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        Week {participant.currentWeek}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {participant.enrolledAt
                          ? new Date(participant.enrolledAt).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
