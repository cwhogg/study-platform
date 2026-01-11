'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import type { DurationInputQuestion } from '@/lib/questions/types'

interface DurationInputFieldProps {
  question: DurationInputQuestion
  value: { value: number; unit: string } | undefined
  onChange: (value: { value: number; unit: string }) => void
  disabled?: boolean
}

const UNIT_LABELS: Record<string, string> = {
  minutes: 'Minutes',
  hours: 'Hours',
  days: 'Days',
  weeks: 'Weeks',
  months: 'Months',
}

export function DurationInputField({
  question,
  value,
  onChange,
  disabled = false,
}: DurationInputFieldProps) {
  const [inputValue, setInputValue] = useState(value?.value?.toString() ?? '')
  const [selectedUnit, setSelectedUnit] = useState(value?.unit ?? question.units[0])

  const handleSubmit = () => {
    const num = parseFloat(inputValue)
    if (!isNaN(num) && num >= 0) {
      onChange({ value: num, unit: selectedUnit })
    }
  }

  const isValid = () => {
    const num = parseFloat(inputValue)
    return !isNaN(num) && num >= 0
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            type="number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Enter duration"
            min={0}
            disabled={disabled}
            className="text-lg"
          />
        </div>
      </div>

      {/* Unit selection */}
      <div className="flex gap-2 flex-wrap">
        {question.units.map(unit => {
          const isSelected = selectedUnit === unit
          return (
            <button
              key={unit}
              onClick={() => setSelectedUnit(unit)}
              disabled={disabled}
              className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                isSelected
                  ? 'border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]'
                  : 'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {UNIT_LABELS[unit] ?? unit}
            </button>
          )
        })}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isValid() || disabled}
        fullWidth
        rightIcon={<ArrowRight className="w-5 h-5" />}
      >
        Continue
      </Button>
    </div>
  )
}
