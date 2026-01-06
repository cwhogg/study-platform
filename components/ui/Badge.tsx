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
    primary: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/30',
    neutral: 'bg-slate-700/50 text-slate-300 border border-slate-600',
    outline: 'bg-transparent border border-slate-600 text-slate-400',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  const dotColors = {
    primary: 'bg-indigo-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    neutral: 'bg-slate-400',
    outline: 'bg-slate-400',
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
