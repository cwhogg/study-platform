import { MobileFullScreen } from '@/components/ui/MobileContainer'

interface StudyPageProps {
  params: Promise<{ studyId: string }>
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { studyId } = await params

  return (
    <MobileFullScreen>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-2xl">📋</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome to the Study
        </h1>
        <p className="text-gray-600 mb-8">
          Study ID: {studyId}
        </p>
        <p className="text-sm text-gray-500">
          Participant flow coming soon...
        </p>
      </div>
    </MobileFullScreen>
  )
}
