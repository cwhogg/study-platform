'use client'

import type { Question, QuestionResponseValue } from '@/lib/questions/types'
import {
  SingleChoiceInput,
  MultipleChoiceInput,
  NumericScaleInput,
  LikertScaleInput,
  NumberInputField,
  TimeInputField,
  DateInputField,
  DurationInputField,
  TextInputField,
  YesNoInput,
  VisualAnalogScaleInput,
} from './inputs'

interface QuestionRendererProps {
  question: Question
  value: QuestionResponseValue | undefined
  onChange: (value: QuestionResponseValue) => void
  disabled?: boolean
}

/**
 * Renders the appropriate input component based on question type.
 * Uses discriminated union pattern to ensure type safety.
 */
export function QuestionRenderer({
  question,
  value,
  onChange,
  disabled = false,
}: QuestionRendererProps) {
  switch (question.type) {
    case 'single_choice':
      return (
        <SingleChoiceInput
          question={question}
          value={value as number | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )

    case 'multiple_choice':
      return (
        <MultipleChoiceInput
          question={question}
          value={value as (number | string)[] | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )

    case 'numeric_scale':
      return (
        <NumericScaleInput
          question={question}
          value={value as number | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )

    case 'likert_scale':
      return (
        <LikertScaleInput
          question={question}
          value={value as number | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )

    case 'number_input':
      return (
        <NumberInputField
          question={question}
          value={value as number | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )

    case 'time_input':
      return (
        <TimeInputField
          question={question}
          value={value as string | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )

    case 'date_input':
      return (
        <DateInputField
          question={question}
          value={value as string | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )

    case 'duration_input':
      return (
        <DurationInputField
          question={question}
          value={value as { value: number; unit: string } | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )

    case 'text_input':
      return (
        <TextInputField
          question={question}
          value={value as string | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )

    case 'yes_no':
      return (
        <YesNoInput
          question={question}
          value={value as 0 | 1 | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )

    case 'visual_analog_scale':
      return (
        <VisualAnalogScaleInput
          question={question}
          value={value as number | undefined}
          onChange={onChange}
          disabled={disabled}
        />
      )

    default:
      // This should never happen with proper TypeScript, but handle gracefully
      return (
        <div className="p-4 bg-[var(--error)]/10 border border-[var(--error)] rounded-xl">
          <p className="text-[var(--error)] text-sm">
            Unknown question type: {(question as { type: string }).type}
          </p>
        </div>
      )
  }
}

/**
 * Export a barrel for the questions module
 */
export { QuestionRenderer as default }
