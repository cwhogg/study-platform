'use client'

import type { YesNoQuestion } from '@/lib/questions/types'

interface YesNoInputProps {
  question: YesNoQuestion
  value: 0 | 1 | undefined
  onChange: (value: 0 | 1) => void
  disabled?: boolean
}

export function YesNoInput({
  question,
  value,
  onChange,
  disabled = false,
}: YesNoInputProps) {
  const yesLabel = question.labels?.yes ?? 'Yes'
  const noLabel = question.labels?.no ?? 'No'

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onChange(1)}
        disabled={disabled}
        className={`p-6 rounded-xl border-2 transition-all duration-200 ${
          value === 1
            ? 'border-[var(--primary)] bg-[var(--primary-dim)] scale-[0.98]'
            : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)] active:scale-[0.98]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`text-lg font-semibold ${
            value === 1 ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'
          }`}
        >
          {yesLabel}
        </span>
      </button>

      <button
        onClick={() => onChange(0)}
        disabled={disabled}
        className={`p-6 rounded-xl border-2 transition-all duration-200 ${
          value === 0
            ? 'border-[var(--primary)] bg-[var(--primary-dim)] scale-[0.98]'
            : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)] active:scale-[0.98]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`text-lg font-semibold ${
            value === 0 ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'
          }`}
        >
          {noLabel}
        </span>
      </button>
    </div>
  )
}
