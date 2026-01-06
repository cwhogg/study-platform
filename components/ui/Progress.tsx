import { HTMLAttributes } from 'react'

// Linear Progress Bar
export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number // 0-100
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  label,
  className = '',
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={`w-full ${className}`} {...props}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
          {showLabel && (
            <span className="text-sm font-mono text-slate-400">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`
            ${sizes[size]}
            bg-gradient-to-r from-indigo-600 to-cyan-500
            rounded-full
            transition-all duration-700 ease-out
            shadow-[0_0_10px_rgba(99,102,241,0.4)]
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Circular Progress Ring
export interface ProgressRingProps {
  value: number // 0-100
  max?: number
  size?: number // in pixels
  strokeWidth?: number
  showValue?: boolean
  label?: string
  className?: string
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  showValue = true,
  label,
  className = '',
}: ProgressRingProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700"
        />
        {/* Progress fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      {(showValue || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className="text-2xl font-semibold text-slate-100 font-mono">
              {Math.round(percentage)}%
            </span>
          )}
          {label && (
            <span className="text-xs text-slate-400 mt-0.5">{label}</span>
          )}
        </div>
      )}
    </div>
  )
}

// Step Progress (for multi-step flows)
export interface StepProgressProps {
  steps: string[]
  currentStep: number // 0-indexed
  className?: string
}

export function StepProgress({ steps, currentStep, className = '' }: StepProgressProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  text-sm font-medium
                  transition-all duration-300
                  ${index < currentStep
                    ? 'bg-indigo-600 text-white'
                    : index === currentStep
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30'
                      : 'bg-slate-700 text-slate-500'
                  }
                `}
              >
                {index < currentStep ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`
                  mt-2 text-xs font-medium
                  ${index <= currentStep ? 'text-slate-100' : 'text-slate-500'}
                `}
              >
                {step}
              </span>
            </div>
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-2 -mt-6
                  transition-colors duration-300
                  ${index < currentStep ? 'bg-indigo-600' : 'bg-slate-700'}
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
