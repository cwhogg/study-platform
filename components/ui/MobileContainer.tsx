import { ReactNode } from 'react'

interface MobileContainerProps {
  children: ReactNode
  className?: string
  /** Center content vertically */
  centered?: boolean
  /** Add extra padding at bottom for fixed buttons */
  withBottomPadding?: boolean
}

/**
 * Mobile-first container for participant-facing pages.
 * Optimized for 375px width with appropriate padding.
 * Centers on larger screens with max-width constraint.
 */
export function MobileContainer({
  children,
  className = '',
  centered = false,
  withBottomPadding = false,
}: MobileContainerProps) {
  return (
    <div
      className={`
        w-full
        max-w-md
        mx-auto
        px-5
        py-6
        ${centered ? 'flex flex-col items-center justify-center flex-1' : ''}
        ${withBottomPadding ? 'pb-24' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

/**
 * Full-screen mobile container that fills available height.
 * Use for single-screen flows like welcome pages.
 */
export function MobileFullScreen({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`
        flex-1
        flex
        flex-col
        w-full
        max-w-md
        mx-auto
        px-5
        py-6
        ${className}
      `}
    >
      {children}
    </div>
  )
}

/**
 * Fixed bottom button container for mobile.
 * Use for primary CTAs that should always be visible.
 */
export function MobileBottomAction({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`
        fixed
        bottom-0
        left-0
        right-0
        bg-white
        border-t
        border-gray-100
        p-4
        ${className}
      `}
    >
      <div className="max-w-md mx-auto">
        {children}
      </div>
    </div>
  )
}
