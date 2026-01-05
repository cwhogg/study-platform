/**
 * Error handling utilities for consistent error processing across the app.
 */

/**
 * Standard API error response format
 */
export interface ApiError {
  error: string
  code?: string
  details?: Record<string, unknown>
}

/**
 * Error codes for common scenarios
 */
export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * User-friendly error messages for common error codes
 */
const errorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.NETWORK_ERROR]: 'Unable to connect. Please check your internet connection.',
  [ErrorCodes.UNAUTHORIZED]: 'Please sign in to continue.',
  [ErrorCodes.FORBIDDEN]: 'You don\'t have permission to access this resource.',
  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.SERVER_ERROR]: 'Something went wrong on our end. Please try again later.',
  [ErrorCodes.TIMEOUT]: 'The request took too long. Please try again.',
  [ErrorCodes.UNKNOWN]: 'An unexpected error occurred. Please try again.',
}

/**
 * Get a user-friendly error message from an error code
 */
export function getErrorMessage(code: ErrorCode): string {
  return errorMessages[code] || errorMessages[ErrorCodes.UNKNOWN]
}

/**
 * Map HTTP status codes to error codes
 */
export function getErrorCodeFromStatus(status: number): ErrorCode {
  if (status === 401) return ErrorCodes.UNAUTHORIZED
  if (status === 403) return ErrorCodes.FORBIDDEN
  if (status === 404) return ErrorCodes.NOT_FOUND
  if (status === 422) return ErrorCodes.VALIDATION_ERROR
  if (status >= 500) return ErrorCodes.SERVER_ERROR
  return ErrorCodes.UNKNOWN
}

/**
 * Parse an error from a fetch response
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  const code = getErrorCodeFromStatus(response.status)

  try {
    const data = await response.json()
    return {
      error: data.error || data.message || getErrorMessage(code),
      code,
      details: data,
    }
  } catch {
    return {
      error: getErrorMessage(code),
      code,
    }
  }
}

/**
 * Extract a user-friendly message from any error
 */
export function getUserFriendlyError(error: unknown): string {
  // Network errors
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return getErrorMessage(ErrorCodes.NETWORK_ERROR)
  }

  // Abort errors (timeout)
  if (error instanceof DOMException && error.name === 'AbortError') {
    return getErrorMessage(ErrorCodes.TIMEOUT)
  }

  // Error with message
  if (error instanceof Error) {
    // Check if it's a user-friendly message already
    if (error.message.length < 100 && !error.message.includes('Error:')) {
      return error.message
    }
    return getErrorMessage(ErrorCodes.UNKNOWN)
  }

  // String error
  if (typeof error === 'string') {
    return error
  }

  // Object with error property
  if (error && typeof error === 'object' && 'error' in error) {
    return String((error as { error: unknown }).error)
  }

  return getErrorMessage(ErrorCodes.UNKNOWN)
}

/**
 * Safe fetch wrapper with error handling
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await parseApiError(response)
      return { data: null, error }
    }

    const data = await response.json()
    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: {
        error: getUserFriendlyError(error),
        code: ErrorCodes.NETWORK_ERROR,
      },
    }
  }
}

/**
 * Log error to console with context (can be extended to external service)
 */
export function logError(
  error: unknown,
  context?: { component?: string; action?: string; userId?: string }
): void {
  const errorInfo = {
    message: getUserFriendlyError(error),
    originalError: error,
    timestamp: new Date().toISOString(),
    ...context,
  }

  console.error('[Error]', errorInfo)

  // In production, you could send this to an error tracking service:
  // if (process.env.NODE_ENV === 'production') {
  //   sendToErrorTracker(errorInfo)
  // }
}
