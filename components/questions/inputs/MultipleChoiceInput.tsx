'use client'

import { Check } from 'lucide-react'
import type { MultipleChoiceQuestion } from '@/lib/questions/types'

interface MultipleChoiceInputProps {
  question: MultipleChoiceQuestion
  value: (number | string)[] | undefined
  onChange: (value: (number | string)[]) => void
  disabled?: boolean
}

export function MultipleChoiceInput({
  question,
  value = [],
  onChange,
  disabled = false,
}: MultipleChoiceInputProps) {
  const handleToggle = (optionValue: number | string, isExclusive?: boolean) => {
    if (isExclusive) {
      // Exclusive option clears all others
      if (value.includes(optionValue)) {
        onChange([])
      } else {
        onChange([optionValue])
      }
    } else {
      // Remove any exclusive options when selecting non-exclusive
      const exclusiveValues = question.options
        .filter(o => o.exclusive)
        .map(o => o.value)
      const filteredValue = value.filter(v => !exclusiveValues.includes(v))

      if (filteredValue.includes(optionValue)) {
        onChange(filteredValue.filter(v => v !== optionValue))
      } else {
        const newValue = [...filteredValue, optionValue]
        // Check max selections
        if (question.maxSelections && newValue.length > question.maxSelections) {
          return
        }
        onChange(newValue)
      }
    }
  }

  return (
    <div className="space-y-3">
      {question.options.map((option, idx) => {
        const isSelected = value.includes(option.value)
        return (
          <button
            key={idx}
            onClick={() => handleToggle(option.value, option.exclusive)}
            disabled={disabled}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
              isSelected
                ? 'border-[var(--primary)] bg-[var(--primary-dim)]'
                : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--text-muted)]'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ minHeight: '56px' }}
          >
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected
                  ? 'border-[var(--primary)] bg-[var(--primary)]'
                  : 'border-[var(--glass-border)]'
              }`}
            >
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
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
            </div>
          </button>
        )
      })}
      {question.minSelections !== undefined && question.minSelections > 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center">
          Select at least {question.minSelections}
        </p>
      )}
    </div>
  )
}
