import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

// Base Input
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full
              px-4 py-3
              text-base text-slate-900
              placeholder:text-slate-400
              bg-white
              border-[1.5px] rounded-xl
              transition-all duration-150
              focus:outline-none
              ${error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-slate-200 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10'
              }
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || hint) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}>
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Textarea
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const textareaId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full
            px-4 py-3
            text-base text-slate-900
            placeholder:text-slate-400
            bg-white
            border-[1.5px] rounded-xl
            transition-all duration-150
            resize-y min-h-[120px]
            focus:outline-none
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-200 focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10'
            }
            ${className}
          `}
          {...props}
        />
        {(error || hint) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-slate-500'}`}>
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
