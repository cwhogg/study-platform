// Shared utilities
// Helper functions used across the application:
// - Date/time formatting and manipulation
// - Validation helpers (using Zod)
// - API response helpers
// - Error handling utilities

export * from './errors'

/**
 * Convert a string to Title Case (capitalize first letter of each word).
 * Handles common edge cases like acronyms (TRT, GLP-1) and hyphenated words.
 */
export function toTitleCase(str: string): string {
  if (!str) return str

  return str
    .split(' ')
    .map(word => {
      // Preserve all-caps words (likely acronyms like TRT, GLP-1, TB-500)
      if (word === word.toUpperCase() && word.length > 1) {
        return word
      }
      // Capitalize first letter, lowercase rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Get the base URL for the application.
 * Uses NEXT_PUBLIC_APP_URL if set, otherwise detects from Vercel, or falls back to localhost.
 */
export function getBaseUrl(): string {
  // Explicit app URL takes priority
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Vercel provides VERCEL_URL automatically
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Fallback for local development
  return 'http://localhost:3000'
}
