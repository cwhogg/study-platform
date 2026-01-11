'use client'

import type { LikertScaleQuestion } from '@/lib/questions/types'

interface LikertScaleInputProps {
  question: LikertScaleQuestion
  value: number | undefined
  onChange: (value: number) => void
  disabled?: boolean
}

export function LikertScaleInput({
  question,
  value,
  onChange,
  disabled = false,
}: LikertScaleInputProps) {
  const { points, labels } = question.scale

  return (
    <div className="space-y-3">
      {labels.map((label, idx) => {
        const isSelected = value === idx
        return (
          <button
            key={idx}
            onClick={() => onChange(idx)}
            disabled={disabled}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
              isSelected
                ? 'border-[var(--primary)] bg-[var(--primary-dim)] scale-[0.98]'
                : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)] active:scale-[0.98]'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ minHeight: '56px' }}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                  isSelected
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--glass-border)] text-[var(--text-muted)]'
                }`}
              >
                {idx}
              </span>
              <span
                className={`font-medium ${
                  isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'
                }`}
              >
                {label}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
