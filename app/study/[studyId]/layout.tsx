import { ReactNode } from 'react'
import { getStudy } from '@/lib/db/studies'

interface StudyLayoutProps {
  children: ReactNode
  params: Promise<{ studyId: string }>
}

export default async function StudyLayout({ children, params }: StudyLayoutProps) {
  const { studyId } = await params

  // Fetch actual study name from database
  const study = await getStudy(studyId)
  const studyName = study?.name || 'Research Study'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal Header */}
      <header className="flex-shrink-0 border-b border-slate-200">
        <div className="px-4 py-3">
          <h1 className="text-sm font-medium text-slate-900 text-center">
            {studyName}
          </h1>
        </div>
      </header>

      {/* Full-height content area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
