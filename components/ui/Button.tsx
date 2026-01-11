import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  loadingText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium
      rounded-xl
      transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
      disabled:cursor-not-allowed disabled:transform-none
      active:scale-[0.98]
    `

    const variants = {
      primary: `
        bg-[var(--primary)]
        text-white
        shadow-lg shadow-[var(--primary)]/25
        hover:bg-[var(--primary-light)] hover:shadow-xl hover:shadow-[var(--primary)]/30 hover:-translate-y-0.5
        focus-visible:ring-[var(--primary)]
        disabled:bg-[var(--glass-border)] disabled:text-[var(--text-muted)] disabled:shadow-none
      `,
      secondary: `
        bg-[var(--glass-bg)]
        text-[var(--text-primary)]
        border border-[var(--glass-border)]
        backdrop-blur-sm
        hover:bg-[var(--glass-hover)] hover:border-[var(--text-muted)]
        focus-visible:ring-[var(--text-muted)]
        disabled:bg-transparent disabled:text-[var(--text-muted)] disabled:border-[var(--glass-border)]
      `,
      ghost: `
        bg-transparent
        text-[var(--text-secondary)]
        hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]
        focus-visible:ring-[var(--text-muted)]
      `,
      danger: `
        bg-[var(--error)]
        text-white
        shadow-lg shadow-[var(--error)]/25
        hover:bg-red-500 hover:shadow-xl hover:-translate-y-0.5
        focus-visible:ring-[var(--error)]
        disabled:bg-[var(--glass-border)] disabled:text-[var(--text-muted)] disabled:shadow-none
      `,
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-5 py-2.5 text-[15px] min-h-[44px]',
      lg: 'px-6 py-3.5 text-base min-h-[52px]',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{loadingText || 'Loading...'}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
