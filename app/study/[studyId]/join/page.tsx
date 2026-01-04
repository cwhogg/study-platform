import Link from 'next/link'
import { MobileFullScreen, MobileBottomAction } from '@/components/ui/MobileContainer'
import { ClipboardList, Clock, Heart } from 'lucide-react'

interface JoinPageProps {
  params: Promise<{ studyId: string }>
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { studyId } = await params

  // In production, fetch study details from database
  const studyName = 'TRT Outcomes Study'

  return (
    <>
      <MobileFullScreen className="pb-24">
        {/* Study Name */}
        <div className="text-center mb-8 pt-4">
          <h1 className="text-2xl font-bold text-gray-900">{studyName}</h1>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-6" />

        {/* Value Proposition */}
        <div className="flex-1">
          <p className="text-gray-700 text-center mb-8 text-lg">
            Help us improve testosterone therapy for future patients.
          </p>

          {/* 3 Bullet Points */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Short surveys</div>
                <div className="text-gray-600 text-sm">
                  Quick check-ins about your symptoms every 2-4 weeks
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">6 months total</div>
                <div className="text-gray-600 text-sm">
                  Your treatment doesn&apos;t change based on participation
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Make an impact</div>
                <div className="text-gray-600 text-sm">
                  Your data helps improve care for others
                </div>
              </div>
            </div>
          </div>
        </div>
      </MobileFullScreen>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <Link
          href={`/study/${studyId}/join/register`}
          className="block w-full py-4 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 transition-colors"
          style={{ minHeight: '52px' }}
        >
          Get Started
        </Link>
      </MobileBottomAction>
    </>
  )
}
