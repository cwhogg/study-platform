'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowRight, ChevronUp, ChevronDown } from 'lucide-react'
import type { TimeInputQuestion } from '@/lib/questions/types'

interface TimeInputFieldProps {
  question: TimeInputQuestion
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function TimeInputField({
  question,
  value,
  onChange,
  disabled = false,
}: TimeInputFieldProps) {
  const is12h = question.format === '12h'

  // Parse initial value or use default
  const parseTime = (timeStr?: string) => {
    if (!timeStr) {
      return { hours: 12, minutes: 0, period: 'PM' as const }
    }
    // Handle both HH:MM and H:MM AM/PM formats
    const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/)
    const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)

    if (match12) {
      return {
        hours: parseInt(match12[1]),
        minutes: parseInt(match12[2]),
        period: match12[3].toUpperCase() as 'AM' | 'PM',
      }
    }
    if (match24) {
      const h = parseInt(match24[1])
      return {
        hours: is12h ? (h % 12 || 12) : h,
        minutes: parseInt(match24[2]),
        period: (h >= 12 ? 'PM' : 'AM') as 'AM' | 'PM',
      }
    }
    return { hours: 12, minutes: 0, period: 'PM' as const }
  }

  const initialTime = parseTime(value || question.defaultValue)
  const [hours, setHours] = useState(initialTime.hours)
  const [minutes, setMinutes] = useState(initialTime.minutes)
  const [period, setPeriod] = useState<'AM' | 'PM'>(initialTime.period)

  const formatOutput = () => {
    if (is12h) {
      return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`
    }
    let h24 = hours
    if (is12h) {
      h24 = period === 'PM' ? (hours % 12) + 12 : hours % 12
    }
    return `${h24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const adjustHours = (delta: number) => {
    const maxHours = is12h ? 12 : 23
    const minHours = is12h ? 1 : 0
    let newHours = hours + delta
    if (newHours > maxHours) newHours = minHours
    if (newHours < minHours) newHours = maxHours
    setHours(newHours)
  }

  const adjustMinutes = (delta: number) => {
    let newMinutes = minutes + delta
    if (newMinutes >= 60) newMinutes = 0
    if (newMinutes < 0) newMinutes = 55
    setMinutes(newMinutes)
  }

  const handleSubmit = () => {
    onChange(formatOutput())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-4">
        {/* Hours */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => adjustHours(1)}
            disabled={disabled}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <div className="w-16 h-16 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center">
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {hours.toString().padStart(2, '0')}
            </span>
          </div>
          <button
            onClick={() => adjustHours(-1)}
            disabled={disabled}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        <span className="text-2xl font-bold text-[var(--text-muted)]">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => adjustMinutes(5)}
            disabled={disabled}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <div className="w-16 h-16 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center">
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              {minutes.toString().padStart(2, '0')}
            </span>
          </div>
          <button
            onClick={() => adjustMinutes(-5)}
            disabled={disabled}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* AM/PM toggle for 12h format */}
        {is12h && (
          <div className="flex flex-col gap-2 ml-2">
            <button
              onClick={() => setPeriod('AM')}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === 'AM'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--glass-bg)] text-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
              }`}
            >
              AM
            </button>
            <button
              onClick={() => setPeriod('PM')}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === 'PM'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--glass-bg)] text-[var(--text-muted)] hover:bg-[var(--glass-hover)]'
              }`}
            >
              PM
            </button>
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={disabled}
        fullWidth
        rightIcon={<ArrowRight className="w-5 h-5" />}
      >
        Continue
      </Button>
    </div>
  )
}
