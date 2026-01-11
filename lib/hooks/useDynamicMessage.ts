'use client'

import { useState, useEffect } from 'react'

/**
 * Hook that cycles through an array of messages at a specified interval.
 * Useful for button loading states during long AI operations.
 *
 * @param messages - Array of messages to cycle through
 * @param intervalMs - Time between message changes (default 2500ms)
 * @param isActive - Whether the cycling is active (usually tied to loading state)
 * @returns The current message to display
 */
export function useDynamicMessage(
  messages: string[],
  intervalMs: number = 2500,
  isActive: boolean = true
): string {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Reset to first message when becoming active
    if (isActive) {
      setCurrentIndex(0)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive || messages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, intervalMs)

    return () => clearInterval(interval)
  }, [messages.length, intervalMs, isActive])

  return messages[currentIndex] || messages[0]
}
