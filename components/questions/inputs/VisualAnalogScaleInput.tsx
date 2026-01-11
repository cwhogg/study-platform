'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import type { VisualAnalogScaleQuestion } from '@/lib/questions/types'

interface VisualAnalogScaleInputProps {
  question: VisualAnalogScaleQuestion
  value: number | undefined
  onChange: (value: number) => void
  disabled?: boolean
}

export function VisualAnalogScaleInput({
  question,
  value,
  onChange,
  disabled = false,
}: VisualAnalogScaleInputProps) {
  const { min, max, minLabel, maxLabel, showValue = true } = question.scale
  const [sliderValue, setSliderValue] = useState(value ?? Math.round((min + max) / 2))
  const [hasInteracted, setHasInteracted] = useState(value !== undefined)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value))
    setHasInteracted(true)
  }

  const handleSubmit = () => {
    onChange(sliderValue)
  }

  // Calculate percentage for visual feedback
  const percentage = ((sliderValue - min) / (max - min)) * 100

  return (
    <div className="space-y-6">
      {/* Labels */}
      <div className="flex justify-between text-sm text-[var(--text-muted)]">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>

      {/* Slider container */}
      <div className="relative pt-6 pb-2">
        {/* Value display */}
        {showValue && (
          <div
            className="absolute -top-1 transform -translate-x-1/2 transition-all"
            style={{ left: `${percentage}%` }}
          >
            <div className="bg-[var(--primary)] text-white px-3 py-1 rounded-lg text-sm font-bold">
              {sliderValue}
            </div>
            <div
              className="w-0 h-0 mx-auto border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[var(--primary)]"
            />
          </div>
        )}

        {/* Track background */}
        <div className="absolute top-1/2 left-0 right-0 h-3 bg-[var(--glass-border)] rounded-full -translate-y-1/2" />

        {/* Track fill */}
        <div
          className="absolute top-1/2 left-0 h-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-full -translate-y-1/2 transition-all"
          style={{ width: `${percentage}%` }}
        />

        {/* Slider input */}
        <input
          type="range"
          min={min}
          max={max}
          value={sliderValue}
          onChange={handleChange}
          disabled={disabled}
          className="relative w-full h-6 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-8
            [&::-webkit-slider-thumb]:h-8
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-4
            [&::-webkit-slider-thumb]:border-[var(--primary)]
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-8
            [&::-moz-range-thumb]:h-8
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-4
            [&::-moz-range-thumb]:border-[var(--primary)]
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />
      </div>

      {/* Min/Max indicators */}
      <div className="flex justify-between text-xs text-[var(--text-muted)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!hasInteracted || disabled}
        fullWidth
        rightIcon={<ArrowRight className="w-5 h-5" />}
      >
        Continue
      </Button>
    </div>
  )
}
