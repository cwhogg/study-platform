// Shared utilities
// Helper functions used across the application:
// - Date/time formatting and manipulation
// - Validation helpers (using Zod)
// - API response helpers
// - Error handling utilities

export * from './errors'

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
