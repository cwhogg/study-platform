/**
 * Screening Question Generation and Eligibility Logic
 *
 * Pure functions for building screening questions from protocol criteria
 * and checking participant eligibility.
 */

export interface ScreeningQuestion {
  id: string
  question: string
  type: 'date' | 'yes_no' | 'select'
  options?: string[]
  disqualifyingAnswer?: string | boolean
  source: 'inclusion' | 'exclusion' | 'general'
}

export interface InclusionCriterion {
  criterion: string
  rationale: string
  assessmentMethod: string
}

export interface ExclusionCriterion {
  criterion: string
  rationale: string
  assessmentMethod: string
}

export interface Protocol {
  inclusionCriteria?: InclusionCriterion[]
  exclusionCriteria?: ExclusionCriterion[]
  schedule?: { timepoint: string; labs?: string[] }[]
}

/**
 * Convert an inclusion criterion to a screening question
 * Returns null if the criterion cannot be self-assessed (e.g., requires lab work)
 */
export function inclusionToQuestion(
  criterion: InclusionCriterion,
  index: number
): ScreeningQuestion | null {
  // Skip criteria that can't be self-assessed
  if (criterion.assessmentMethod.toLowerCase().includes('lab')) {
    return null
  }

  return {
    id: `inclusion_${index}`,
    question: `Do you meet this requirement: ${criterion.criterion}?`,
    type: 'yes_no',
    disqualifyingAnswer: false, // "No" disqualifies for inclusion criteria
    source: 'inclusion',
  }
}

/**
 * Convert an exclusion criterion to a screening question
 * Returns null if the criterion cannot be self-assessed
 */
export function exclusionToQuestion(
  criterion: ExclusionCriterion,
  index: number
): ScreeningQuestion | null {
  // Skip criteria that can't be self-assessed
  if (criterion.assessmentMethod.toLowerCase().includes('lab')) {
    return null
  }

  return {
    id: `exclusion_${index}`,
    question: criterion.criterion.includes('?')
      ? criterion.criterion
      : `Do you have: ${criterion.criterion}?`,
    type: 'yes_no',
    disqualifyingAnswer: true, // "Yes" disqualifies for exclusion criteria
    source: 'exclusion',
  }
}

/**
 * Format timepoint name for display (e.g., "week_6" -> "Week 6")
 */
function formatTimepoint(tp: string): string {
  const formatted = tp.replace(/_/g, ' ')
  return formatted
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Generate a participation willingness question based on study schedule
 */
export function generateParticipationQuestion(
  durationWeeks: number,
  schedule?: { timepoint: string }[]
): ScreeningQuestion {
  const months = Math.round(durationWeeks / 4.33)

  let question: string
  if (schedule && schedule.length > 0) {
    const scheduleCount = schedule.length
    const timepoints = schedule.map(tp => formatTimepoint(tp.timepoint))

    if (scheduleCount <= 4) {
      question = `Are you willing to complete ${scheduleCount} surveys at ${timepoints.join(', ')} over ${months} months?`
    } else {
      question = `Are you willing to complete ${scheduleCount} surveys over ${months} months?`
    }
  } else {
    question = `Are you willing to complete short surveys over ${months} months?`
  }

  return {
    id: 'willing_to_participate',
    question,
    type: 'yes_no',
    disqualifyingAnswer: false, // "No" disqualifies
    source: 'general',
  }
}

/**
 * Generate the date of birth question
 */
export function generateDobQuestion(): ScreeningQuestion {
  return {
    id: 'dob',
    question: 'What is your date of birth?',
    type: 'date',
    source: 'general',
  }
}

/**
 * Get fallback screening questions when no protocol criteria exist
 */
export function getFallbackQuestions(): ScreeningQuestion[] {
  return [
    generateDobQuestion(),
    {
      id: 'willing_to_participate',
      question: 'Are you willing to complete short surveys every 2-4 weeks for 6 months?',
      type: 'yes_no',
      disqualifyingAnswer: false,
      source: 'general',
    }
  ]
}

/**
 * Build screening questions from a study protocol
 */
export function buildScreeningQuestions(
  protocol: Protocol | null | undefined,
  durationWeeks: number
): ScreeningQuestion[] {
  const questions: ScreeningQuestion[] = []

  // Always start with date of birth
  questions.push(generateDobQuestion())

  if (protocol?.inclusionCriteria || protocol?.exclusionCriteria) {
    // Convert exclusion criteria first (these are disqualifiers)
    if (protocol.exclusionCriteria) {
      for (let i = 0; i < protocol.exclusionCriteria.length; i++) {
        const q = exclusionToQuestion(protocol.exclusionCriteria[i], i)
        if (q) questions.push(q)
      }
    }

    // Convert key inclusion criteria (limit to avoid too many questions)
    if (protocol.inclusionCriteria) {
      let added = 0
      for (let i = 0; i < protocol.inclusionCriteria.length && added < 3; i++) {
        const criterion = protocol.inclusionCriteria[i]
        // Only add self-reportable criteria
        if (!criterion.assessmentMethod.toLowerCase().includes('lab')) {
          const q = inclusionToQuestion(criterion, i)
          if (q) {
            questions.push(q)
            added++
          }
        }
      }
    }
  }

  // Always add participation willingness question at the end
  questions.push(generateParticipationQuestion(durationWeeks, protocol?.schedule))

  return questions.length > 1 ? questions : getFallbackQuestions()
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(birthDateStr: string): number {
  const birthDate = new Date(birthDateStr)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

/**
 * Check if an answer makes the participant eligible
 * Returns true if eligible, false if disqualified
 */
export function checkEligibility(
  questionId: string,
  answer: string | boolean,
  questions: ScreeningQuestion[]
): boolean {
  const question = questions.find(q => q.id === questionId)
  if (!question || question.disqualifyingAnswer === undefined) {
    return true
  }

  // For date of birth, check age (must be 18+)
  if (questionId === 'dob' && typeof answer === 'string') {
    return calculateAge(answer) >= 18
  }

  // For other questions, compare with disqualifying answer
  return answer !== question.disqualifyingAnswer
}
