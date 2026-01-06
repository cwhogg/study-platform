import { AlertCircle, RefreshCw, XCircle } from 'lucide-react'
import { ReactNode } from 'react'

interface ErrorMessageProps {
  /** The error message to display */
  message: string
  /** Optional title for the error */
  title?: string
  /** Error severity */
  variant?: 'error' | 'warning'
  /** Callback when retry button is clicked */
  onRetry?: () => void
  /** Callback when dismiss button is clicked */
  onDismiss?: () => void
  /** Additional content to render below the message */
  children?: ReactNode
  /** Additional CSS classes */
  className?: string
}

const variantStyles = {
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    message: 'text-red-700',
    button: 'text-red-600 hover:text-red-800',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
    button: 'text-yellow-600 hover:text-yellow-800',
  },
}

/**
 * Reusable error message component with optional retry and dismiss actions.
 */
export function ErrorMessage({
  message,
  title,
  variant = 'error',
  onRetry,
  onDismiss,
  children,
  className = '',
}: ErrorMessageProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={`rounded-xl border p-4 ${styles.container} ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`font-medium mb-1 ${styles.title}`}>{title}</h3>
          )}
          <p className={`text-sm ${styles.message}`}>{message}</p>
          {children}
          {(onRetry || onDismiss) && (
            <div className="flex items-center gap-4 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`inline-flex items-center gap-1 text-sm font-medium ${styles.button}`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`text-sm ${styles.button}`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        {onDismiss && !onRetry && (
          <button
            onClick={onDismiss}
            className={`p-1 rounded hover:bg-black/5 ${styles.button}`}
            aria-label="Dismiss"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Inline error message for form fields.
 */
export function FieldError({
  message,
  className = '',
}: {
  message: string
  className?: string
}) {
  return (
    <p className={`text-sm text-red-600 mt-1 ${className}`} role="alert">
      {message}
    </p>
  )
}

/**
 * Full-page error state with retry option.
 */
export function PageError({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh] p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E40AF] text-white font-medium rounded-lg hover:bg-[#1E40AF] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        )}
      </div>
    </div>
  )
}
