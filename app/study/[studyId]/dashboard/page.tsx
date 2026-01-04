'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MobileContainer } from '@/components/ui/MobileContainer'
import { CheckCircle2, Clock, FlaskConical } from 'lucide-react'

// Demo data - in production, this would come from the database
interface Assessment {
  id: string
  timepoint: string
  week: number
  status: 'completed' | 'due' | 'upcoming' | 'overdue'
  completedDate?: string
  dueDate?: string
  hasLabs?: boolean
  labsReceived?: boolean
}

const demoAssessments: Assessment[] = [
  { id: 'baseline', timepoint: 'Baseline', week: 0, status: 'completed', completedDate: 'Jan 3' },
  { id: 'week2', timepoint: 'Week 2', week: 2, status: 'completed', completedDate: 'Jan 17' },
  { id: 'week4', timepoint: 'Week 4', week: 4, status: 'completed', completedDate: 'Jan 31' },
  { id: 'week6', timepoint: 'Week 6', week: 6, status: 'completed', completedDate: 'Feb 14', hasLabs: true, labsReceived: true },
  { id: 'week8', timepoint: 'Week 8', week: 8, status: 'due', dueDate: 'Feb 28' },
  { id: 'week12', timepoint: 'Week 12', week: 12, status: 'upcoming', dueDate: 'Mar 28', hasLabs: true },
  { id: 'week16', timepoint: 'Week 16', week: 16, status: 'upcoming', dueDate: 'Apr 25' },
  { id: 'week20', timepoint: 'Week 20', week: 20, status: 'upcoming', dueDate: 'May 23' },
  { id: 'week26', timepoint: 'Week 26', week: 26, status: 'upcoming', dueDate: 'Jul 4', hasLabs: true }
]

export default function DashboardPage() {
  const params = useParams()
  const studyId = params.studyId as string

  const [assessments] = useState<Assessment[]>(demoAssessments)
  const [currentWeek, setCurrentWeek] = useState(8)
  const totalWeeks = 26

  useEffect(() => {
    // In production, calculate current week based on enrollment date
    // For demo, use week 8
    setCurrentWeek(8)
  }, [])

  const progress = (currentWeek / totalWeeks) * 100
  const dueAssessment = assessments.find(a => a.status === 'due')
  const completedAssessments = assessments.filter(a => a.status === 'completed')
  const upcomingAssessments = assessments.filter(a => a.status === 'upcoming')

  return (
    <MobileContainer className="pt-4 pb-8">
      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Your Progress</span>
          <span className="text-sm font-semibold text-gray-900">
            Week {currentWeek} of {totalWeeks}
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Due Assessment Card */}
      {dueAssessment && (
        <div className="mb-6">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-indigo-900">DUE NOW</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {dueAssessment.timepoint} Check-in
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              ~5 minutes
            </p>
            <Link
              href={`/study/${studyId}/assessment/${dueAssessment.id}`}
              className="block w-full py-3 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 transition-colors"
              style={{ minHeight: '48px' }}
            >
              Start
            </Link>
          </div>
        </div>
      )}

      {/* Completed Section */}
      {completedAssessments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Completed
          </h2>
          <div className="space-y-2">
            {completedAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div>
                    <span className="font-medium text-gray-900">{assessment.timepoint}</span>
                    {assessment.hasLabs && assessment.labsReceived && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <FlaskConical className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Labs received</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{assessment.completedDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      {upcomingAssessments.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Upcoming
          </h2>
          <div className="space-y-2">
            {upcomingAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="font-medium text-gray-700">{assessment.timepoint}</span>
                    {assessment.hasLabs && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <FlaskConical className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Labs scheduled</span>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{assessment.dueDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Questions?{' '}
          <a href="mailto:research@example.com" className="text-indigo-600 font-medium">
            Contact support
          </a>
        </p>
      </div>
    </MobileContainer>
  )
}
