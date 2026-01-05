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
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      active:scale-[0.98]
    `

    const variants = {
      primary: `
        bg-gradient-to-br from-teal-600 to-teal-500
        text-white
        shadow-md shadow-teal-900/20
        hover:shadow-lg hover:shadow-teal-900/25 hover:-translate-y-0.5
        focus-visible:ring-teal-500
      `,
      secondary: `
        bg-white
        text-stone-900
        border border-stone-200
        shadow-sm
        hover:bg-stone-50 hover:border-stone-300 hover:shadow-md
        focus-visible:ring-stone-400
      `,
      ghost: `
        bg-transparent
        text-stone-600
        hover:bg-stone-100 hover:text-stone-900
        focus-visible:ring-stone-400
      `,
      danger: `
        bg-gradient-to-br from-red-600 to-red-500
        text-white
        shadow-md shadow-red-900/20
        hover:shadow-lg hover:shadow-red-900/25 hover:-translate-y-0.5
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
