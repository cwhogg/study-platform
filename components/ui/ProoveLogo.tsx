interface ProoveLogoProps {
  className?: string
  size?: number
}

/**
 * Proove Platform logo icon
 * Checkmark with data dots representing evidence-based verification
 */
export function ProoveLogo({ className = '', size = 36 }: ProoveLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        {/* Primary brand gradient - deep vibrant blue */}
        <linearGradient id="proove-brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Glow effect */}
        <filter id="proove-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="50" cy="50" r="46" fill="url(#proove-brand-grad)"/>

      {/* Inner circle ring */}
      <circle cx="50" cy="50" r="36" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.2"/>

      {/* Checkmark - white, bold */}
      <path
        d="M 28 52 L 42 66 L 74 30"
        fill="none"
        stroke="#ffffff"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#proove-glow)"
      />

      {/* Data dots - representing evidence points */}
      <circle cx="70" cy="58" r="4" fill="#ffffff" opacity="0.5"/>
      <circle cx="78" cy="46" r="3" fill="#ffffff" opacity="0.3"/>
      <circle cx="26" cy="36" r="3" fill="#ffffff" opacity="0.3"/>
    </svg>
  )
}

export default ProoveLogo
