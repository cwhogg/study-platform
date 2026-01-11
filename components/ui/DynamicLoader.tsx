'use client'

import { useState, useEffect } from 'react'

interface DynamicLoaderProps {
  messages: string[]
  intervalMs?: number
  className?: string
}

/**
 * A loading spinner with rotating messages that change at specified intervals.
 * Used during long-running AI agent calls to keep users informed of progress.
 */
export function DynamicLoader({
  messages,
  intervalMs = 3000,
  className = ''
}: DynamicLoaderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (messages.length <= 1) return

    const interval = setInterval(() => {
      setIsTransitioning(true)

      // After fade out, change message and fade in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length)
        setIsTransitioning(false)
      }, 200) // Half of the transition duration
    }, intervalMs)

    return () => clearInterval(interval)
  }, [messages.length, intervalMs])

  return (
    <div className={`min-h-[60vh] flex items-center justify-center ${className}`}>
      <div className="text-center animate-fade-in">
        {/* Spinner */}
        <div className="w-12 h-12 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-2 border-[var(--glass-border)]" />
          <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
        </div>

        {/* Message with transition */}
        <p
          className={`text-[var(--text-secondary)] transition-opacity duration-200 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {messages[currentIndex]}
        </p>

        {/* Progress dots */}
        {messages.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {messages.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[var(--primary)] w-4'
                    : index < currentIndex
                    ? 'bg-[var(--primary)]/50'
                    : 'bg-[var(--glass-border)]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Pre-defined message sets for each agent/step

export const DISCOVERY_MESSAGES = [
  'Calling Clinical Protocol Agent...',
  'Analyzing intervention characteristics...',
  'Researching clinical evidence...',
  'Identifying relevant endpoints...',
  'Evaluating PRO instruments...',
  'Assessing safety considerations...',
  'Determining optimal study duration...',
  'Preparing configuration options...',
]

export const PROTOCOL_MESSAGES = [
  'Calling Clinical Protocol Agent...',
  'Designing study protocol...',
  'Generating inclusion criteria...',
  'Defining exclusion criteria...',
  'Selecting PRO instruments...',
  'Building assessment schedule...',
  'Optimizing data collection points...',
  'Finalizing protocol structure...',
]

export const SAFETY_MESSAGES = [
  'Calling Safety Monitoring Agent...',
  'Analyzing intervention risks...',
  'Setting PRO alert thresholds...',
  'Configuring lab value triggers...',
  'Defining escalation protocols...',
  'Finalizing safety rules...',
]

export const CONSENT_MESSAGES = [
  'Calling Consent & Compliance Agent...',
  'Drafting consent language...',
  'Explaining study procedures...',
  'Describing potential risks...',
  'Outlining participant rights...',
  'Creating comprehension questions...',
  'Generating study summary...',
  'Finalizing consent document...',
]

export const FINALIZATION_MESSAGES = [
  'Creating your study...',
  'Storing protocol configuration...',
  'Setting up consent workflow...',
  'Generating enrollment materials...',
  'Preparing invitation system...',
  'Finalizing study setup...',
]

// Button-specific messages (for inline loading states)
export const DISCOVERY_BUTTON_MESSAGES = [
  'Analyzing intervention...',
  'Researching clinical data...',
  'Identifying endpoints...',
  'Preparing options...',
]

export const PROTOCOL_GENERATION_MESSAGES = [
  'Calling Clinical Protocol Agent...',
  'Designing protocol structure...',
  'Generating inclusion criteria...',
  'Selecting PRO instruments...',
  'Building assessment schedule...',
  'Calling Safety Monitoring Agent...',
  'Analyzing intervention risks...',
  'Setting alert thresholds...',
  'Finalizing protocol...',
]

export const PROTOCOL_BUTTON_MESSAGES = [
  'Designing protocol...',
  'Selecting instruments...',
  'Building schedule...',
  'Finalizing design...',
]

export const SAFETY_BUTTON_MESSAGES = [
  'Analyzing risks...',
  'Setting thresholds...',
  'Configuring alerts...',
  'Finalizing rules...',
]

export const CONSENT_BUTTON_MESSAGES = [
  'Drafting consent...',
  'Creating questions...',
  'Building summary...',
  'Finalizing document...',
]

export const FINALIZATION_BUTTON_MESSAGES = [
  'Storing protocol...',
  'Setting up enrollment...',
  'Creating invite link...',
  'Almost there...',
]
