'use client'

import { MobileContainer, MobileBottomAction } from '@/components/ui/MobileContainer'
import { Heart } from 'lucide-react'

export default function IneligiblePage() {
  return (
    <>
      <MobileContainer centered>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Thank You
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Based on your answers, you&apos;re not eligible for this particular study.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-gray-600 text-sm text-center">
            This doesn&apos;t mean anything is wrong — research studies have specific requirements to ensure accurate results.
          </p>
        </div>

        <p className="text-gray-600 text-center text-sm">
          Your regular treatment continues as normal. Thank you for your interest in helping advance research.
        </p>
      </MobileContainer>

      {/* Fixed Bottom CTA */}
      <MobileBottomAction>
        <a
          href="/"
          className="block w-full py-4 bg-indigo-600 text-white text-center font-semibold rounded-xl active:bg-indigo-700 transition-colors"
          style={{ minHeight: '52px' }}
        >
          Return Home
        </a>
      </MobileBottomAction>
    </>
  )
}
