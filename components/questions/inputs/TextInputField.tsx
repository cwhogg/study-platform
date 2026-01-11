'use client'

import { useState } from 'react'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import type { TextInputQuestion } from '@/lib/questions/types'

interface TextInputFieldProps {
  question: TextInputQuestion
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function TextInputField({
  question,
  value,
  onChange,
  disabled = false,
}: TextInputFieldProps) {
  const [inputValue, setInputValue] = useState(value ?? '')

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onChange(inputValue.trim())
    }
  }

  const remainingChars = question.maxLength
    ? question.maxLength - inputValue.length
    : null

  return (
    <div className="space-y-4">
      {question.multiline ? (
        <Textarea
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={question.placeholder ?? 'Enter your response...'}
          maxLength={question.maxLength}
          disabled={disabled}
          hint={
            remainingChars !== null
              ? `${remainingChars} characters remaining`
              : undefined
          }
        />
      ) : (
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={question.placeholder ?? 'Enter your response...'}
          maxLength={question.maxLength}
          disabled={disabled}
          className="text-lg"
          hint={
            remainingChars !== null && remainingChars < 50
              ? `${remainingChars} characters remaining`
              : undefined
          }
        />
      )}

      <Button
        onClick={handleSubmit}
        disabled={!inputValue.trim() || disabled}
        fullWidth
        rightIcon={<ArrowRight className="w-5 h-5" />}
      >
        Continue
      </Button>
    </div>
  )
}
