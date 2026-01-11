'use client'

import { useState, useEffect } from 'react'

const DEFAULT_MESSAGE = 'Processing...'

/**
 * Hook that progresses through an array of messages at a specified interval.
 * Stops at the last message instead of cycling back to the beginning.
 * Useful for button loading states during long AI operations.
 *
 * @param messages - Array of messages to progress through
 * @param intervalMs - Time between message changes (default 2500ms)
 * @param isActive - Whether the progression is active (usually tied to loading state)
 * @returns The current message to display
 */
export function useDynamicMessage(
  messages: string[],
  intervalMs: number = 2500,
  isActive: boolean = true
): string {
  // Defensive: ensure messages is a valid array with non-empty strings
  const safeMessages = Array.isArray(messages) && messages.length > 0
    ? messages.filter(m => typeof m === 'string' && m.trim().length > 0)
    : []

  // Fallback if no valid messages
  const finalMessages = safeMessages.length > 0 ? safeMessages : [DEFAULT_MESSAGE]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Reset to first message when becoming active
    if (isActive) {
      setCurrentIndex(0)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive || finalMessages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // Stop at the last message instead of cycling
        if (prev >= finalMessages.length - 1) {
          return prev
        }
        return prev + 1
      })
    }, intervalMs)

    return () => clearInterval(interval)
  }, [finalMessages.length, intervalMs, isActive])

  // Triple fallback: current index -> first message -> default
  return finalMessages[currentIndex] || finalMessages[0] || DEFAULT_MESSAGE
}
