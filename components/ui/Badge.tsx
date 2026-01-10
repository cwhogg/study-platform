import { HTMLAttributes, ReactNode } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline'
  size?: 'sm' | 'md'
  dot?: boolean
  dotPulse?: boolean
  icon?: ReactNode
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  dotPulse = false,
  icon,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = `
    inline-flex items-center gap-1.5
    font-medium
    rounded-full
    transition-colors duration-150
  `

  const variants = {
    primary: 'bg-[var(--primary-dim)] text-[var(--primary-light)] border border-[var(--primary)]/30',
    success: 'bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30',
    warning: 'bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/30',
    danger: 'bg-[var(--error)]/15 text-[var(--error)] border border-[var(--error)]/30',
    neutral: 'bg-[var(--glass-bg)] text-[var(--text-secondary)] border border-[var(--glass-border)]',
    outline: 'bg-transparent border border-[var(--glass-border)] text-[var(--text-secondary)]',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  const dotColors = {
    primary: 'bg-[var(--primary)]',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    danger: 'bg-[var(--error)]',
    neutral: 'bg-[var(--text-muted)]',
    outline: 'bg-[var(--text-muted)]',
  }

  return (
    <span
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {dotPulse && (
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${dotColors[variant]} opacity-75 animate-ping`}
            />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColors[variant]}`} />
        </span>
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  )
}

// Status badge with specific variants for study/participant status
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'enrolling' | 'completed' | 'withdrawn' | 'draft' | 'pending' | 'due' | 'overdue'
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const statusConfig: Record<StatusBadgeProps['status'], { variant: BadgeProps['variant']; label: string; dot?: boolean; dotPulse?: boolean }> = {
    active: { variant: 'success', label: 'Active', dot: true, dotPulse: true },
    enrolling: { variant: 'primary', label: 'Enrolling', dot: true },
    completed: { variant: 'neutral', label: 'Completed' },
    withdrawn: { variant: 'neutral', label: 'Withdrawn' },
    draft: { variant: 'outline', label: 'Draft' },
    pending: { variant: 'warning', label: 'Pending' },
    due: { variant: 'warning', label: 'Due Now', dot: true, dotPulse: true },
    overdue: { variant: 'danger', label: 'Overdue', dot: true, dotPulse: true },
  }

  const config = statusConfig[status]

  return (
    <Badge
      variant={config.variant}
      dot={config.dot}
      dotPulse={config.dotPulse}
      {...props}
    >
      {config.label}
    </Badge>
  )
}
