'use client'

import type { NumericScaleQuestion } from '@/lib/questions/types'

interface NumericScaleInputProps {
  question: NumericScaleQuestion
  value: number | undefined
  onChange: (value: number) => void
  disabled?: boolean
}

export function NumericScaleInput({
  question,
  value,
  onChange,
  disabled = false,
}: NumericScaleInputProps) {
  const { min, max, minLabel, maxLabel, step = 1 } = question.scale
  const values = Array.from(
    { length: Math.floor((max - min) / step) + 1 },
    (_, i) => min + i * step
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-[var(--text-muted)]">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {values.map(v => {
          const isSelected = value === v
          return (
            <button
              key={v}
              onClick={() => onChange(v)}
              disabled={disabled}
              className={`w-12 h-12 rounded-xl border-2 font-medium transition-all ${
                isSelected
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                  : 'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}
