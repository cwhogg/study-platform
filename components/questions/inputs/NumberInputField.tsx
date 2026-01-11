'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import type { NumberInputQuestion } from '@/lib/questions/types'

interface NumberInputFieldProps {
  question: NumberInputQuestion
  value: number | undefined
  onChange: (value: number) => void
  disabled?: boolean
  /** If true, requires explicit submit. If false, auto-submits on valid input */
  requireSubmit?: boolean
}

export function NumberInputField({
  question,
  value,
  onChange,
  disabled = false,
  requireSubmit = true,
}: NumberInputFieldProps) {
  const [inputValue, setInputValue] = useState(value?.toString() ?? '')
  const { min, max, step, unit, placeholder } = question.input

  const handleSubmit = () => {
    const num = parseFloat(inputValue)
    if (!isNaN(num)) {
      if (min !== undefined && num < min) return
      if (max !== undefined && num > max) return
      onChange(num)
    }
  }

  const isValid = () => {
    const num = parseFloat(inputValue)
    if (isNaN(num)) return false
    if (min !== undefined && num < min) return false
    if (max !== undefined && num > max) return false
    return true
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            type="number"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={placeholder ?? `Enter a number${unit ? ` (${unit})` : ''}`}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="text-lg"
          />
        </div>
        {unit && (
          <span className="text-[var(--text-muted)] pb-3 text-sm">{unit}</span>
        )}
      </div>
      {(min !== undefined || max !== undefined) && (
        <p className="text-sm text-[var(--text-muted)]">
          {min !== undefined && max !== undefined
            ? `Enter a value between ${min} and ${max}`
            : min !== undefined
            ? `Minimum: ${min}`
            : `Maximum: ${max}`}
        </p>
      )}
      {requireSubmit && (
        <Button
          onClick={handleSubmit}
          disabled={!isValid() || disabled}
          fullWidth
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Continue
        </Button>
      )}
    </div>
  )
}
