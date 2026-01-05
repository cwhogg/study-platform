import Link from 'next/link'
import { Plus, Users, Calendar, ChevronRight } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'

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

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      )
    case 'enrolling':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Enrolling
        </span>
      )
    case 'draft':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Draft
        </span>
      )
    case 'completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Completed
        </span>
      )
    default:
      return null
  }
}

export default async function StudiesPage() {
  const studies = await getStudies()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Studies</h1>
            <p className="text-gray-600 mt-1">Manage and monitor your research studies</p>
          </div>
          <Link
            href="/sponsor/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Study
          </Link>
        </div>

        {/* Studies List */}
        <div className="space-y-4">
          {studies.map((study) => (
            <Link
              key={study.id}
              href={`/sponsor/studies/${study.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">{study.name}</h2>
                    {getStatusBadge(study.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{study.intervention}</p>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>
                        <span className="font-medium text-gray-900">{study.enrolled}</span>
                        {' / '}{study.targetEnrollment} enrolled
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{study.duration}</span>
                    </div>
                    {study.startDate && (
                      <span className="text-gray-500">Started {study.startDate}</span>
                    )}
                  </div>

                  {/* Enrollment Progress Bar */}
                  {study.targetEnrollment > 0 && (
                    <div className="mt-4">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all"
                          style={{ width: `${(study.enrolled / study.targetEnrollment) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State (shown when no studies) */}
        {studies.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No studies yet</h2>
            <p className="text-gray-600 mb-6">Create your first study to get started</p>
            <Link
              href="/sponsor/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Study
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
