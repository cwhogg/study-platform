import Link from 'next/link'
import { Plus, Users, Calendar, ChevronRight, FolderOpen } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/Progress'

// Force dynamic rendering - this page fetches from the database
export const dynamic = 'force-dynamic'

interface Study {
  id: string
  name: string
  status: string
  intervention: string
  enrolled: number
  targetEnrollment: number
  startDate: string | null
  duration: string
}

async function getStudies(): Promise<Study[]> {
  const supabase = createServiceClient()

  // Get all studies
  const { data: studies, error: studiesError } = await supabase
    .from('sp_studies')
    .select('id, name, intervention, status, created_at, config, protocol')
    .order('created_at', { ascending: false })

  if (studiesError || !studies) {
    console.error('[Sponsor Studies] Failed to fetch studies:', studiesError)
    return []
  }

  // Get participant counts per study
  const { data: participants } = await supabase
    .from('sp_participants')
    .select('study_id')

  const countsByStudy = new Map<string, number>()
  participants?.forEach(p => {
    countsByStudy.set(p.study_id, (countsByStudy.get(p.study_id) || 0) + 1)
  })

  return studies.map(study => {
    const durationWeeks = study.protocol?.durationWeeks || study.config?.duration_weeks || 26
    return {
      id: study.id,
      name: study.name,
      status: study.status,
      intervention: study.intervention,
      enrolled: countsByStudy.get(study.id) || 0,
      targetEnrollment: study.config?.target_enrollment || 100,
      startDate: study.created_at
        ? new Date(study.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null,
      duration: `${durationWeeks} weeks`,
    }
  })
}

export default async function StudiesPage() {
  const studies = await getStudies()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-wide py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-slate-900">Your Studies</h1>
            <p className="text-slate-600 mt-1">Manage and monitor your research studies</p>
          </div>
          <Link href="/sponsor/create">
            <Button leftIcon={<Plus className="w-5 h-5" />}>
              New Study
            </Button>
          </Link>
        </div>

        {/* Studies List */}
        {studies.length > 0 ? (
          <div className="space-y-4 stagger-children">
            {studies.map((study) => (
              <Link
                key={study.id}
                href={`/sponsor/studies/${study.id}`}
                className="block"
              >
                <Card variant="interactive" padding="md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title and status */}
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg font-semibold text-slate-900 truncate">
                          {study.name}
                        </h2>
                        <StatusBadge
                          status={study.status as 'active' | 'enrolling' | 'draft' | 'completed'}
                        />
                      </div>

                      {/* Intervention */}
                      <p className="text-slate-600 text-sm mb-4 truncate">
                        {study.intervention}
                      </p>

                      {/* Stats row */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="w-4 h-4" />
                          <span>
                            <span className="font-semibold text-slate-900">{study.enrolled}</span>
                            <span className="text-slate-500"> / {study.targetEnrollment}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>{study.duration}</span>
                        </div>
                        {study.startDate && (
                          <span className="text-slate-500 hidden sm:block">
                            Started {study.startDate}
                          </span>
                        )}
                      </div>

                      {/* Enrollment Progress Bar */}
                      {study.targetEnrollment > 0 && (
                        <div className="mt-4">
                          <ProgressBar
                            value={study.enrolled}
                            max={study.targetEnrollment}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card variant="default" padding="lg" className="text-center">
            <div className="py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
                <FolderOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No studies yet</h2>
              <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                Create your first study to get started with AI-powered clinical research.
              </p>
              <Link href="/sponsor/create">
                <Button leftIcon={<Plus className="w-5 h-5" />}>
                  Create Study
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
