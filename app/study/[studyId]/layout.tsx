import { ReactNode } from 'react'

interface StudyLayoutProps {
  children: ReactNode
  params: Promise<{ studyId: string }>
}

export default async function StudyLayout({ children, params }: StudyLayoutProps) {
  const { studyId } = await params

  // In production, fetch study name from database
  // For now, use placeholder
  const studyName = 'TRT Outcomes Study'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal Header */}
      <header className="flex-shrink-0 border-b border-gray-100">
        <div className="px-4 py-3">
          <h1 className="text-sm font-medium text-gray-900 text-center">
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
