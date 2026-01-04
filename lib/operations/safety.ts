/**
 * Safety Threshold Evaluation
 *
 * Evaluates PRO responses against safety thresholds defined in instruments.
 * Generates alerts and determines if follow-up instruments should be triggered.
 */

import type { AlertConfig } from '@/lib/agents/types'
import type { ProResponse } from './pro-submission'

export type AlertType = 'trigger_instrument' | 'coordinator_alert' | 'urgent_alert' | 'crisis_resources'

export interface SafetyAlert {
  type: AlertType
  condition: string
  message: string
  urgency?: string
  targetInstrument?: string
}

export interface SafetyEvaluationResult {
  alerts: SafetyAlert[]
  showCrisisResources: boolean
  triggerFollowUp: string | null
}

/**
 * Evaluate safety based on submission scores and responses
 */
export async function evaluateSafety(
  participantId: string,
  instrumentId: string,
  scores: { total: number; [key: string]: number },
  responses: ProResponse[],
  alertConfigs?: AlertConfig[]
): Promise<SafetyEvaluationResult> {
  const alerts: SafetyAlert[] = []
  let showCrisisResources = false
  let triggerFollowUp: string | null = null

  // Build response lookup
  const responseMap: Record<string, number> = {}
  responses.forEach(r => {
    responseMap[r.questionId] = r.value
  })

  // Check PHQ-2 specific rules (always applied)
  if (instrumentId === 'phq-2') {
    const phq2Result = evaluatePhq2(scores.total)
    alerts.push(...phq2Result.alerts)
    if (phq2Result.triggerFollowUp) {
      triggerFollowUp = phq2Result.triggerFollowUp
    }
  }

  // Check PHQ-9 specific rules (always applied)
  if (instrumentId === 'phq-9') {
    const phq9Result = evaluatePhq9(scores.total, responseMap)
    alerts.push(...phq9Result.alerts)
    showCrisisResources = phq9Result.showCrisisResources
  }

  // Check custom alert configs from instrument definition
  if (alertConfigs) {
    for (const config of alertConfigs) {
      if (evaluateCondition(config.condition, scores, responseMap)) {
        const alert: SafetyAlert = {
          type: config.type as AlertType,
          condition: config.condition,
          message: config.message || getDefaultMessage(config.type as AlertType, instrumentId),
          urgency: config.urgency,
        }

        if (config.type === 'trigger_instrument' && config.target) {
          alert.targetInstrument = config.target
          triggerFollowUp = config.target
        }

        if (config.type === 'crisis_resources') {
          showCrisisResources = true
        }

        alerts.push(alert)
      }
    }
  }

  return {
    alerts,
    showCrisisResources,
    triggerFollowUp,
  }
}

/**
 * Evaluate PHQ-2 specific safety rules
 */
function evaluatePhq2(totalScore: number): { alerts: SafetyAlert[]; triggerFollowUp: string | null } {
  const alerts: SafetyAlert[] = []
  let triggerFollowUp: string | null = null

  // PHQ-2 >= 3 triggers PHQ-9
  if (totalScore >= 3) {
    alerts.push({
      type: 'trigger_instrument',
      condition: 'total >= 3',
      message: 'PHQ-2 score indicates possible depression. PHQ-9 follow-up triggered.',
      targetInstrument: 'phq-9',
    })
    triggerFollowUp = 'phq-9'
  }

  return { alerts, triggerFollowUp }
}

/**
 * Evaluate PHQ-9 specific safety rules
 */
function evaluatePhq9(
  totalScore: number,
  responseMap: Record<string, number>
): { alerts: SafetyAlert[]; showCrisisResources: boolean } {
  const alerts: SafetyAlert[] = []
  let showCrisisResources = false

  // Check Q9 (suicidal ideation) first - most urgent
  const q9Value = responseMap['q9'] ?? responseMap['phq9_q9'] ?? 0
  if (q9Value > 0) {
    alerts.push({
      type: 'urgent_alert',
      condition: 'q9 > 0',
      message: 'Participant reported thoughts of self-harm. Immediate follow-up required.',
      urgency: '1hr',
    })
    alerts.push({
      type: 'crisis_resources',
      condition: 'q9 > 0',
      message: 'Crisis resources displayed to participant.',
    })
    showCrisisResources = true
  }

  // Score >= 15: Urgent alert
  if (totalScore >= 15) {
    alerts.push({
      type: 'urgent_alert',
      condition: 'total >= 15',
      message: `PHQ-9 score of ${totalScore} indicates moderately severe depression. Urgent follow-up required.`,
      urgency: '4hr',
    })
  }
  // Score >= 10: Coordinator alert
  else if (totalScore >= 10) {
    alerts.push({
      type: 'coordinator_alert',
      condition: 'total >= 10',
      message: `PHQ-9 score of ${totalScore} indicates moderate depression. Coordinator review required.`,
      urgency: '24hr',
    })
  }

  return { alerts, showCrisisResources }
}

/**
 * Evaluate a condition string against scores and responses
 * Supports: "total >= 3", "q9 > 0", "total < 5"
 */
function evaluateCondition(
  condition: string,
  scores: { total: number; [key: string]: number },
  responseMap: Record<string, number>
): boolean {
  try {
    // Parse condition: "variable operator value"
    const match = condition.match(/^(\w+)\s*(>=|<=|>|<|==|!=)\s*(\d+)$/)
    if (!match) {
      console.warn(`[Safety] Invalid condition format: ${condition}`)
      return false
    }

    const [, variable, operator, valueStr] = match
    const threshold = parseInt(valueStr, 10)

    // Get the value to compare
    let value: number
    if (variable === 'total') {
      value = scores.total
    } else if (variable in scores) {
      value = scores[variable]
    } else if (variable in responseMap) {
      value = responseMap[variable]
    } else {
      // Try prefixed versions (e.g., q9 might be stored as phq9_q9)
      const prefixedKey = Object.keys(responseMap).find(k => k.endsWith(`_${variable}`))
      if (prefixedKey) {
        value = responseMap[prefixedKey]
      } else {
        console.warn(`[Safety] Unknown variable in condition: ${variable}`)
        return false
      }
    }

    // Evaluate
    switch (operator) {
      case '>=': return value >= threshold
      case '<=': return value <= threshold
      case '>': return value > threshold
      case '<': return value < threshold
      case '==': return value === threshold
      case '!=': return value !== threshold
      default: return false
    }
  } catch (error) {
    console.error(`[Safety] Error evaluating condition "${condition}":`, error)
    return false
  }
}

/**
 * Get default message for alert type
 */
function getDefaultMessage(type: AlertType, instrumentId: string): string {
  switch (type) {
    case 'trigger_instrument':
      return `Follow-up instrument triggered by ${instrumentId}`
    case 'coordinator_alert':
      return `${instrumentId} score requires coordinator review`
    case 'urgent_alert':
      return `${instrumentId} score requires urgent attention`
    case 'crisis_resources':
      return 'Crisis resources displayed to participant'
    default:
      return `Alert triggered by ${instrumentId}`
  }
}

/**
 * Crisis resources content to display
 */
export const CRISIS_RESOURCES = {
  title: "If you're having thoughts of harming yourself, please reach out for support:",
  resources: [
    {
      icon: '📞',
      name: 'National Suicide Prevention Lifeline',
      value: '988',
      type: 'phone',
    },
    {
      icon: '💬',
      name: 'Crisis Text Line',
      value: 'Text HOME to 741741',
      type: 'text',
    },
    {
      icon: '🏥',
      name: 'Emergency',
      value: 'Call 911 or go to your nearest ER',
      type: 'emergency',
    },
  ],
  footer: 'A member of our team will also be reaching out to you.',
}
