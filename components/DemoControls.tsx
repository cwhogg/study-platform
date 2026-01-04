'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Beaker,
  X,
  Clock,
  TestTube,
  Bell,
  Settings,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'

interface DemoControlsProps {
  participantId?: string
  currentWeek?: number
  onAdvanceWeek?: (week: number) => void
  onSimulateLabs?: () => void
  onTriggerReminder?: () => void
  compact?: boolean
}

/**
 * Demo Mode Badge - Shows when NEXT_PUBLIC_DEMO_MODE=true
 */
export function DemoBadge() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  if (!isDemoMode) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 text-sm font-medium rounded-full border border-amber-200">
        <Beaker className="w-4 h-4" />
        Demo Mode
      </span>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
      >
        <Settings className="w-4 h-4" />
        Admin
      </Link>
    </div>
  )
}

/**
 * Floating Demo Controls Panel
 * Shows demo actions for participant pages
 */
export function DemoControlsPanel({
  participantId,
  currentWeek = 0,
  onAdvanceWeek,
  onSimulateLabs,
  onTriggerReminder,
}: DemoControlsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  if (!isDemoMode || !participantId) return null

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Show Demo Controls"
      >
        <Beaker className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        >
          <Beaker className="w-5 h-5" />
          <span className="font-medium">Demo Controls</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* Controls Panel */}
      {isOpen && (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-72">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-gray-900">Demo Controls</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                title="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current State */}
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="text-sm text-gray-600">Current Week</div>
            <div className="text-2xl font-bold text-gray-900">Week {currentWeek}</div>
          </div>

          {/* Actions */}
          <div className="p-4 space-y-3">
            {/* Advance Week */}
            {onAdvanceWeek && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance to Week
                </label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      onAdvanceWeek(parseInt(e.target.value))
                    }
                  }}
                  defaultValue=""
                >
                  <option value="">Select week...</option>
                  {[1, 2, 4, 8, 12, 16, 20, 24, 26]
                    .filter(w => w > currentWeek)
                    .map(week => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                </select>
              </div>
            )}

            {/* Simulate Labs */}
            {onSimulateLabs && (
              <button
                onClick={onSimulateLabs}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 font-medium rounded-lg hover:bg-purple-100 transition-colors"
              >
                <TestTube className="w-4 h-4" />
                Simulate Lab Results
              </button>
            )}

            {/* Trigger Reminder */}
            {onTriggerReminder && (
              <button
                onClick={onTriggerReminder}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Bell className="w-4 h-4" />
                Send Reminder
              </button>
            )}

            {/* Admin Link */}
            <Link
              href="/admin"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Open Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Inline Demo Controls for compact display
 */
export function DemoControlsInline({
  participantId,
  currentWeek = 0,
  onAdvanceWeek,
  onSimulateLabs,
  onTriggerReminder,
}: DemoControlsProps) {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  if (!isDemoMode || !participantId) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Beaker className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">Demo Controls</span>
        <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
          Week {currentWeek}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {onAdvanceWeek && (
          <select
            className="appearance-none bg-white border border-amber-200 rounded px-3 py-1.5 text-sm text-amber-800 cursor-pointer hover:border-amber-300"
            onChange={(e) => {
              if (e.target.value) {
                onAdvanceWeek(parseInt(e.target.value))
              }
            }}
            defaultValue=""
          >
            <option value="">Advance to...</option>
            {[1, 2, 4, 8, 12, 16, 20, 24, 26]
              .filter(w => w > currentWeek)
              .map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
          </select>
        )}
        {onSimulateLabs && (
          <button
            onClick={onSimulateLabs}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded text-sm text-amber-800 hover:border-amber-300"
          >
            <TestTube className="w-3.5 h-3.5" />
            Simulate Labs
          </button>
        )}
        {onTriggerReminder && (
          <button
            onClick={onTriggerReminder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded text-sm text-amber-800 hover:border-amber-300"
          >
            <Bell className="w-3.5 h-3.5" />
            Send Reminder
          </button>
        )}
      </div>
    </div>
  )
}

export default DemoControlsPanel
