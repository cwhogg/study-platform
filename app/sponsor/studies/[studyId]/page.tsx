'use client'

import { useState, useEffect } from 'react'
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
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'

interface StudyData {
  id: string
  name: string
  status: 'active' | 'enrolling' | 'draft' | 'completed'
  intervention: string
  description: string | null
  duration: string
  startDate: string | null
  stats: {
    enrolled: number
    active: number
    completed: number
    withdrawn: number
  }
  participants: Array<{
    id: string
    email: string
    firstName: string | null
    status: string
    currentWeek: number
    enrolledAt: string
  }>
}

export default function StudyDashboardPage() {
  const params = useParams()
  const studyId = params.studyId as string

  const [copied, setCopied] = useState(false)
  const [study, setStudy] = useState<StudyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStudy() {
      try {
        const response = await fetch(`/api/studies/${studyId}`)
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to fetch study')
        }
        const data = await response.json()
        setStudy(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load study')
      } finally {
        setLoading(false)
      }
    }

    if (studyId) {
      fetchStudy()
    }
  }, [studyId])

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/study/${studyId}/join`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--glass-border)]" />
            <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
          </div>
          <p className="text-[var(--text-secondary)]">Loading protocol...</p>
        </div>
      </div>
    )
  }

  if (error || !study) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-[var(--error)]/15 border border-[var(--error)]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-[var(--error)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Protocol Not Found</h2>
          <p className="text-[var(--text-secondary)] mb-6">{error || 'Unable to load protocol data'}</p>
          <Link href="/sponsor/studies">
            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Protocols
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Enrolled',
      value: study.stats.enrolled,
      icon: Users,
      iconBg: 'bg-[var(--primary-dim)]',
      iconColor: 'text-[var(--primary)]',
    },
    {
      label: 'Active',
      value: study.stats.active,
      icon: Clock,
      iconBg: 'bg-[var(--success)]/15',
      iconColor: 'text-[var(--success)]',
    },
    {
      label: 'Completed',
      value: study.stats.completed,
      icon: UserCheck,
      iconBg: 'bg-[var(--secondary)]/15',
      iconColor: 'text-[var(--secondary)]',
    },
    {
      label: 'Withdrawn',
      value: study.stats.withdrawn,
      icon: UserX,
      iconBg: 'bg-[var(--glass-bg)]',
      iconColor: 'text-[var(--text-muted)]',
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container-wide py-8 sm:py-12">
        {/* Back Link */}
        <Link
          href="/sponsor/studies"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          All Protocols
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-2xl sm:text-3xl text-[var(--text-primary)]">{study.name}</h1>
              <StatusBadge status={study.status} />
            </div>
            {study.description && (
              <p className="text-[var(--text-secondary)] mb-2">{study.description}</p>
            )}
            <p className="text-sm text-[var(--text-muted)]">{study.intervention}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-muted)]">
              <span>{study.duration}</span>
              {study.startDate && (
                <>
                  <span>•</span>
                  <span>Started {study.startDate}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
          {statCards.map((stat) => (
            <Card key={stat.label} variant="default" padding="md">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center border border-[var(--glass-border)]`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-2xl font-semibold text-[var(--text-primary)] font-mono">{stat.value}</div>
              <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Invitation Link */}
        <Card variant="default" padding="md" className="mb-8 animate-fade-in-up">
          <CardHeader title="Invitation Link" subtitle="Share this link with eligible participants" />
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 bg-[var(--glass-bg)] rounded-xl px-4 py-3 text-sm text-[var(--text-secondary)] font-mono truncate border border-[var(--glass-border)]">
              {inviteLink}
            </div>
            <Button
              variant={copied ? 'primary' : 'secondary'}
              onClick={handleCopyLink}
              leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <a
              href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-hover)] rounded-xl transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </Card>

        {/* Participants Table */}
        <Card variant="default" padding="none" className="animate-fade-in-up">
          <div className="p-5 sm:p-6 border-b border-[var(--glass-border)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Participants</h2>
          </div>

          {study.participants && study.participants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--bg-elevated)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Enrolled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {study.participants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-[var(--glass-hover)] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[var(--text-primary)]">{participant.email}</div>
                        <div className="text-xs text-[var(--text-muted)] font-mono">
                          {participant.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        {participant.enrolledAt
                          ? new Date(participant.enrolledAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={participant.status as 'active' | 'completed' | 'withdrawn'}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[var(--text-primary)]">Week {participant.currentWeek}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--glass-bg)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--glass-border)]">
                <Users className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No participants yet</h3>
              <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                Share the invitation link with eligible participants to start enrolling.
              </p>
              <Button onClick={handleCopyLink} leftIcon={<Copy className="w-4 h-4" />}>
                Copy Invitation Link
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
