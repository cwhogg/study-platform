import { forwardRef, HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glow' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = `
      bg-[var(--glass-bg)]
      backdrop-blur-md
      rounded-2xl
      transition-all duration-200
    `

    const variants = {
      default: 'border border-[var(--glass-border)]',
      elevated: 'border border-[var(--glass-border)] shadow-xl shadow-black/20',
      outlined: 'border border-[var(--glass-border)] bg-transparent backdrop-blur-none',
      glow: 'border border-[var(--primary)]/30 shadow-lg shadow-[var(--primary)]/10',
      interactive: `
        border border-[var(--glass-border)]
        hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/10 hover:-translate-y-0.5
        cursor-pointer
      `,
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-5 sm:p-6',
      lg: 'p-6 sm:p-8',
    }

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${paddings[padding]}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header component
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function CardHeader({ title, subtitle, action, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`} {...props}>
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// Card Content component
export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  )
}

// Card Footer component
export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-4 pt-4 border-t border-[var(--glass-border)] ${className}`} {...props}>
      {children}
    </div>
  )
}
