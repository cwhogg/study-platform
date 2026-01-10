import { MobileFullScreen } from '@/components/ui/MobileContainer'

interface StudyPageProps {
  params: Promise<{ studyId: string }>
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { studyId } = await params

  return (
    <MobileFullScreen>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[var(--primary-dim)] rounded-full flex items-center justify-center mb-6 border border-[var(--primary)]/30">
          <span className="text-2xl">📋</span>
        </div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          Welcome to the Protocol
        </h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Protocol ID: {studyId}
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          Participant flow coming soon...
        </p>
      </div>
    </MobileFullScreen>
  )
}
