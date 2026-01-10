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
        ${withBottomPadding ? 'pb-28' : ''}
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
        safe-top
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
 * Features a subtle blur backdrop and safe area padding.
 */
export function MobileBottomAction({
  children,
  className = '',
  variant = 'solid',
}: {
  children: ReactNode
  className?: string
  variant?: 'solid' | 'blur'
}) {
  return (
    <div
      className={`
        fixed
        bottom-0
        left-0
        right-0
        z-50
        ${variant === 'blur'
          ? 'bg-[var(--bg-primary)]/80 backdrop-blur-lg border-t border-[var(--glass-border)]'
          : 'bg-[var(--bg-primary)] border-t border-[var(--glass-border)]'
        }
        ${className}
      `}
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-md mx-auto px-5 pt-4">
        {children}
      </div>
    </div>
  )
}

/**
 * Mobile page header with optional back button and title
 */
export function MobileHeader({
  title,
  subtitle,
  backHref,
  backLabel = 'Back',
  action,
  className = '',
}: {
  title?: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <header className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {backHref ? (
          <a
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors -ml-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </a>
        ) : (
          <div />
        )}
        {action && <div>{action}</div>}
      </div>
      {title && (
        <div className="mt-4">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>}
        </div>
      )}
    </header>
  )
}

/**
 * Divider component for mobile layouts
 */
export function MobileDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        h-px
        bg-gradient-to-r
        from-transparent
        via-[var(--glass-border)]
        to-transparent
        my-6
        ${className}
      `}
    />
  )
}

/**
 * Section component for grouping related content
 */
export function MobileSection({
  title,
  children,
  className = '',
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`mb-6 ${className}`}>
      {title && (
        <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}

/**
 * List item for mobile lists
 */
export function MobileListItem({
  children,
  leftIcon,
  rightContent,
  onClick,
  href,
  className = '',
}: {
  children: ReactNode
  leftIcon?: ReactNode
  rightContent?: ReactNode
  onClick?: () => void
  href?: string
  className?: string
}) {
  const Component = href ? 'a' : onClick ? 'button' : 'div'
  const interactive = href || onClick

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3
        w-full
        p-3.5
        bg-[var(--glass-bg)]
        rounded-xl
        border border-[var(--glass-border)]
        ${interactive
          ? 'hover:bg-[var(--glass-hover)] hover:border-[var(--primary)]/30 active:scale-[0.99] transition-all duration-150 cursor-pointer'
          : ''
        }
        ${className}
      `}
    >
      {leftIcon && (
        <div className="flex-shrink-0 w-10 h-10 bg-[var(--glass-hover)] rounded-xl flex items-center justify-center text-[var(--text-secondary)]">
          {leftIcon}
        </div>
      )}
      <div className="flex-1 min-w-0">{children}</div>
      {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
    </Component>
  )
}
