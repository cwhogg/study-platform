interface NofOneLogoProps {
  className?: string
  size?: number
  showText?: boolean
}

/**
 * N of One logo - integrated N + 1 mark
 * The N in burnt orange, the 1 in white, with a data point accent
 */
export function NofOneLogo({ className = '', size = 36, showText = false }: NofOneLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 36 36"
        width={size}
        height={size}
        className="flex-shrink-0"
        role="img"
        aria-label="N of One logo"
      >
        {/* The N shape - burnt orange */}
        <path
          d="M6 28V8L18 22V8"
          fill="none"
          stroke="#EA580C"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* The 1 - white */}
        <path
          d="M26 8V28"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M22 12L26 8"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Data point accent */}
        <circle cx="30" cy="28" r="2" fill="#EA580C" />
      </svg>
      {showText && (
        <span className="font-semibold text-white tracking-tight">
          N <span className="text-[var(--text-tertiary)] font-normal">of</span> One
        </span>
      )}
    </div>
  )
}

/**
 * Compact logo mark only (no text)
 */
export function NofOneLogoMark({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 36"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="N of One logo"
    >
      <path
        d="M6 28V8L18 22V8"
        fill="none"
        stroke="#EA580C"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26 8V28"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M22 12L26 8"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30" cy="28" r="2" fill="#EA580C" />
    </svg>
  )
}

export default NofOneLogo
