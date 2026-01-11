'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Calendar } from 'lucide-react'
import type { DateInputQuestion } from '@/lib/questions/types'

interface DateInputFieldProps {
  question: DateInputQuestion
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function DateInputField({
  question,
  value,
  onChange,
  disabled = false,
}: DateInputFieldProps) {
  const [inputValue, setInputValue] = useState(value ?? '')
  const [error, setError] = useState<string | null>(null)

  const validate = (dateStr: string): string | null => {
    if (!dateStr) return null

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date'
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (question.constraints) {
      if (question.constraints.allowPast === false && date < today) {
        return 'Date cannot be in the past'
      }
      if (question.constraints.allowFuture === false && date > today) {
        return 'Date cannot be in the future'
      }
    }

    return null
  }

  const handleSubmit = () => {
    const validationError = validate(inputValue)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    onChange(inputValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          error={error ?? undefined}
          className="text-lg"
          leftIcon={<Calendar className="w-5 h-5" />}
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!inputValue || disabled}
        fullWidth
        rightIcon={<ArrowRight className="w-5 h-5" />}
      >
        Continue
      </Button>
    </div>
  )
}
