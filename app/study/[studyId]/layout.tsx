import { ReactNode } from 'react'
import Link from 'next/link'
import { getStudy } from '@/lib/db/studies'
import { NofOneLogo } from '@/components/ui/NofOneLogo'

interface StudyLayoutProps {
  children: ReactNode
  params: Promise<{ studyId: string }>
}

export default async function StudyLayout({ children, params }: StudyLayoutProps) {
  const { studyId } = await params

  // Fetch actual study name from database
  const study = await getStudy(studyId)
  const studyName = study?.name || 'Protocol'

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Minimal Header */}
      <header className="flex-shrink-0 border-b border-[var(--glass-border)]">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <NofOneLogo size={24} />
          </Link>
          <h1 className="text-sm font-medium text-[var(--text-secondary)] text-center flex-1 mx-4 truncate">
            {studyName}
          </h1>
          <div className="w-6" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Full-height content area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
