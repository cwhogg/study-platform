'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
import { NofOneLogo } from '@/components/ui/NofOneLogo'

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
      draft: 'bg-[var(--glass-bg)] text-[var(--text-muted)] border border-[var(--glass-border)]',
      active: 'bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30',
      paused: 'bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/30',
      completed: 'bg-[var(--secondary)]/15 text-[var(--secondary)] border border-[var(--secondary)]/30',
      enrolled: 'bg-[var(--primary-dim)] text-[var(--primary-light)] border border-[var(--primary)]/30',
      consented: 'bg-[var(--primary-dim)] text-[var(--primary-light)] border border-[var(--primary)]/30',
      screening: 'bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/30',
      withdrawn: 'bg-[var(--error)]/15 text-[var(--error)] border border-[var(--error)]/30',
      ineligible: 'bg-[var(--error)]/15 text-[var(--error)] border border-[var(--error)]/30',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-[var(--glass-bg)] text-[var(--text-muted)]'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getParticipantsForStudy = (studyId: string) =>
    participants.filter(p => p.studyId === studyId)

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[var(--text-muted)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading admin data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-lg border-b border-[var(--glass-border)]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <NofOneLogo size={28} />
          </Link>
          <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 bg-[var(--glass-bg)] rounded-full border border-[var(--glass-border)]">
            Admin
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Admin Dashboard</h1>
            <p className="text-[var(--text-secondary)] mt-1">Demo controls and study management</p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-primary)] font-medium rounded-lg hover:bg-[var(--glass-hover)] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30'
              : 'bg-[var(--error)]/15 text-[var(--error)] border border-[var(--error)]/30'
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
        <div className="bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)] mb-8">
          <div className="p-6 border-b border-[var(--glass-border)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--primary)]" />
              Studies ({studies.length})
            </h2>
          </div>

          {studies.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No studies found. Create a study from the sponsor portal.
            </div>
          ) : (
            <div className="divide-y divide-[var(--glass-border)]">
              {studies.map((study) => (
                <div key={study.id} className="p-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedStudy(expandedStudy === study.id ? null : study.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-[var(--text-primary)]">{study.name}</h3>
                        {getStatusBadge(study.status)}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">{study.intervention}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-muted)]">
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
                        className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete study"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedStudy === study.id ? (
                        <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Participant List */}
                  {expandedStudy === study.id && (
                    <div className="mt-6 pt-6 border-t border-[var(--glass-border)]">
                      <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Participants</h4>
                      {getParticipantsForStudy(study.id).length === 0 ? (
                        <p className="text-sm text-[var(--text-muted)]">No participants enrolled yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {getParticipantsForStudy(study.id).map((participant) => (
                            <div
                              key={participant.id}
                              className="bg-[var(--glass-hover)] rounded-lg p-4 border border-[var(--glass-border)]"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-[var(--text-primary)]">
                                      {participant.firstName || participant.email}
                                    </span>
                                    {getStatusBadge(participant.status)}
                                  </div>
                                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    {participant.email}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-muted)]">
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
                              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--glass-border)]">
                                {/* Advance Week Dropdown */}
                                <div className="relative inline-block">
                                  <select
                                    className="appearance-none bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg px-3 py-2 pr-8 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg)] cursor-pointer"
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
                                  <Clock className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
                                </div>

                                {/* Simulate Labs */}
                                <button
                                  onClick={() => simulateLabs(participant.id, `week_${participant.currentWeek}`)}
                                  disabled={actionLoading === `labs-${participant.id}`}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors disabled:opacity-50"
                                >
                                  <TestTube className="w-4 h-4" />
                                  {actionLoading === `labs-${participant.id}` ? 'Simulating...' : 'Simulate Labs'}
                                </button>

                                {/* Trigger Reminder */}
                                <button
                                  onClick={() => triggerReminder(participant.id, `week_${participant.currentWeek}`)}
                                  disabled={actionLoading === `reminder-${participant.id}`}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors disabled:opacity-50"
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
        <div className="bg-[var(--glass-bg)] rounded-xl border border-[var(--glass-border)]">
          <div className="p-6 border-b border-[var(--glass-border)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--primary)]" />
              All Participants ({participants.length})
            </h2>
          </div>

          {participants.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No participants found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--glass-hover)] border-b border-[var(--glass-border)]">
                  <tr>
                    <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">
                      Participant
                    </th>
                    <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">
                      Study
                    </th>
                    <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">
                      Week
                    </th>
                    <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-6 py-3">
                      Enrolled
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {participants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-[var(--glass-hover)]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {participant.firstName || 'Unknown'}
                          </p>
                          <p className="text-sm text-[var(--text-secondary)]">{participant.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {participant.studyName}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(participant.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)] font-mono">
                        Week {participant.currentWeek}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
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
