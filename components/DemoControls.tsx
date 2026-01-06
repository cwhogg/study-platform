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
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 text-sm font-medium rounded-full border border-amber-500/30">
        <Beaker className="w-4 h-4" />
        Demo Mode
      </span>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 text-sm font-medium rounded-full hover:bg-slate-700 transition-colors border border-slate-700"
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
        className="fixed bottom-4 right-4 z-50 p-3 bg-slate-800 text-slate-200 rounded-full shadow-lg hover:bg-slate-700 transition-colors border border-slate-700"
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
          className="flex items-center gap-2 px-4 py-3 bg-slate-800 text-slate-200 rounded-full shadow-lg hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <Beaker className="w-5 h-5" />
          <span className="font-medium">Demo Controls</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      )}

      {/* Controls Panel */}
      {isOpen && (
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 w-72">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-slate-100">Demo Controls</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-slate-500 hover:text-slate-300 rounded"
                title="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-300 rounded"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Current State */}
          <div className="p-4 bg-slate-900 border-b border-slate-700">
            <div className="text-sm text-slate-400">Current Week</div>
            <div className="text-2xl font-bold text-slate-100">Week {currentWeek}</div>
          </div>

          {/* Actions */}
          <div className="p-4 space-y-3">
            {/* Advance Week */}
            {onAdvanceWeek && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Advance to Week
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
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
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-300 font-medium rounded-lg hover:bg-violet-500/30 transition-colors border border-violet-500/30"
              >
                <TestTube className="w-4 h-4" />
                Simulate Lab Results
              </button>
            )}

            {/* Trigger Reminder */}
            {onTriggerReminder && (
              <button
                onClick={onTriggerReminder}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 font-medium rounded-lg hover:bg-cyan-500/30 transition-colors border border-cyan-500/30"
              >
                <Bell className="w-4 h-4" />
                Send Reminder
              </button>
            )}

            {/* Admin Link */}
            <Link
              href="/admin"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 font-medium rounded-lg hover:bg-slate-600 transition-colors"
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
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Beaker className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-amber-300">Demo Controls</span>
        <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
          Week {currentWeek}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {onAdvanceWeek && (
          <select
            className="appearance-none bg-slate-800 border border-amber-500/30 rounded px-3 py-1.5 text-sm text-amber-300 cursor-pointer hover:border-amber-500/50"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-amber-500/30 rounded text-sm text-amber-300 hover:border-amber-500/50"
          >
            <TestTube className="w-3.5 h-3.5" />
            Simulate Labs
          </button>
        )}
        {onTriggerReminder && (
          <button
            onClick={onTriggerReminder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-amber-500/30 rounded text-sm text-amber-300 hover:border-amber-500/50"
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
