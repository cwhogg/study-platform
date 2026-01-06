interface SpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Color variant */
  variant?: 'primary' | 'white' | 'gray'
  /** Optional label for accessibility and display */
  label?: string
  /** Show label text next to spinner */
  showLabel?: boolean
  /** Additional CSS classes */
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-3',
}

const colorClasses = {
  primary: 'border-[#1E3A5F] border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-slate-400 border-t-transparent',
}

/**
 * Animated loading spinner with optional label.
 * Use inside buttons during submission or as standalone loading indicator.
 */
export function Spinner({
  size = 'md',
  variant = 'primary',
  label,
  showLabel = false,
  className = '',
}: SpinnerProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-label={label || 'Loading'}
    >
      <div
        className={`
          rounded-full
          animate-spin
          ${sizeClasses[size]}
          ${colorClasses[variant]}
        `}
      />
      {showLabel && label && (
        <span className="text-sm">{label}</span>
      )}
      {!showLabel && <span className="sr-only">{label || 'Loading'}</span>}
    </div>
  )
}

/**
 * Full-page loading spinner centered on screen.
 * Use for initial page loads or major data fetching.
 */
export function PageSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Spinner size="lg" label={label} showLabel />
    </div>
  )
}

/**
 * Inline loading state for buttons.
 * Pass this as children when button is in loading state.
 */
export function ButtonSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <>
      <Spinner size="md" variant="white" />
      <span>{label}</span>
    </>
  )
}
