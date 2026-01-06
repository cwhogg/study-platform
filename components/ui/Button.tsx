import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
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
      rounded-2xl
      transition-all duration-200
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white
      disabled:cursor-not-allowed disabled:transform-none
      active:scale-[0.98]
    `

    const variants = {
      primary: `
        bg-gradient-to-b from-[#6366F1] to-[#4F46E5]
        text-white
        shadow-md shadow-indigo-500/25
        hover:from-[#818CF8] hover:to-[#6366F1] hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5
        focus-visible:ring-indigo-500
        disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-500 disabled:shadow-none
      `,
      secondary: `
        bg-white
        text-slate-700
        border border-slate-200
        shadow-sm
        hover:bg-slate-50 hover:border-slate-300 hover:shadow-md
        focus-visible:ring-slate-400
      `,
      ghost: `
        bg-transparent
        text-slate-600
        hover:bg-slate-100 hover:text-slate-900
        focus-visible:ring-slate-400
      `,
      danger: `
        bg-red-600
        text-white
        shadow-md
        hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5
        focus-visible:ring-red-500
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
            <span>Loading...</span>
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
