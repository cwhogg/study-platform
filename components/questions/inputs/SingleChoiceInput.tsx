'use client'

import type { SingleChoiceQuestion } from '@/lib/questions/types'

interface SingleChoiceInputProps {
  question: SingleChoiceQuestion
  value: number | undefined
  onChange: (value: number) => void
  disabled?: boolean
}

export function SingleChoiceInput({
  question,
  value,
  onChange,
  disabled = false,
}: SingleChoiceInputProps) {
  return (
    <div className="space-y-3">
      {question.options.map((option, idx) => {
        const isSelected = value === option.value
        return (
          <button
            key={idx}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
              isSelected
                ? 'border-[var(--primary)] bg-[var(--primary-dim)] scale-[0.98]'
                : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)] active:scale-[0.98]'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ minHeight: '56px' }}
          >
            <span
              className={`font-medium ${
                isSelected ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'
              }`}
            >
              {option.label}
            </span>
            {option.description && (
              <p className="mt-1 text-sm text-[var(--text-muted)]">{option.description}</p>
            )}
          </button>
        )
      })}
    </div>
  )
}
