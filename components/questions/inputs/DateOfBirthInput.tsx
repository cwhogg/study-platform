'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

interface DateOfBirthInputProps {
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Generate years from current year back to 1920
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 1919 }, (_, i) => currentYear - i)

// Generate days 1-31
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

export function DateOfBirthInput({
  value,
  onChange,
  disabled = false,
}: DateOfBirthInputProps) {
  // Parse initial value
  const parseDate = (dateStr?: string) => {
    if (!dateStr) {
      return { month: '', day: '', year: '' }
    }
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return { month: '', day: '', year: '' }
    }
    return {
      month: String(date.getMonth() + 1),
      day: String(date.getDate()),
      year: String(date.getFullYear()),
    }
  }

  const initial = parseDate(value)
  const [month, setMonth] = useState(initial.month)
  const [day, setDay] = useState(initial.day)
  const [year, setYear] = useState(initial.year)

  // Calculate max days for selected month/year
  const maxDays = month && year
    ? new Date(parseInt(year), parseInt(month), 0).getDate()
    : 31

  // Validate and adjust day if month changes
  useEffect(() => {
    if (day && parseInt(day) > maxDays) {
      setDay(String(maxDays))
    }
  }, [month, year, day, maxDays])

  const isComplete = month && day && year

  const handleSubmit = () => {
    if (!isComplete) return
    // Format as YYYY-MM-DD
    const m = month.padStart(2, '0')
    const d = day.padStart(2, '0')
    onChange(`${year}-${m}-${d}`)
  }

  const selectStyles = `
    appearance-none w-full px-4 py-4
    bg-[var(--glass-bg)] border border-[var(--glass-border)]
    text-[var(--text-primary)] text-lg font-medium
    rounded-xl cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]
    transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  return (
    <div className="space-y-4">
      {/* Month */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Month</label>
        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            disabled={disabled}
            className={selectStyles}
          >
            <option value="" disabled>Select month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Day and Year in a row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Day */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Day</label>
          <div className="relative">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              disabled={disabled}
              className={selectStyles}
            >
              <option value="" disabled>Day</option>
              {DAYS.slice(0, maxDays).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Year</label>
          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={disabled}
              className={selectStyles}
            >
              <option value="" disabled>Year</option>
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      {isComplete && (
        <div className="text-center py-2 text-[var(--text-secondary)]">
          {MONTHS[parseInt(month) - 1]} {day}, {year}
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!isComplete || disabled}
        fullWidth
        rightIcon={<ArrowRight className="w-5 h-5" />}
      >
        Continue
      </Button>
    </div>
  )
}
