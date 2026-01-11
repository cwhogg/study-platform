/**
 * Consent Document Generation
 *
 * Pure functions for generating consent document content.
 * Used when AI-generated consent is unavailable or incomplete.
 */

export interface ConsentSection {
  id: string
  title: string
  content: string
}

export interface ConsentDocument {
  title: string
  version: string
  sections: ConsentSection[]
}

export interface ProtocolSchedule {
  timepoint: string
  labs?: string[]
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
 * Generate consent document sections personalized to the study intervention
 */
export function generateConsentSections(
  intervention: string,
  durationWeeks: number,
  schedule?: ProtocolSchedule[]
): ConsentSection[] {
  const months = Math.round(durationWeeks / 4.33)

  return [
    {
      id: 'purpose',
      title: 'Purpose of the Study',
      content: `You are being invited to participate in a research study about ${intervention}. The purpose of this study is to understand how ${intervention} affects symptoms like energy, mood, and quality of life over time.

By participating, you'll help us learn how this treatment works in real-world settings, which can improve care for future patients.

Your treatment will not change based on your participation - you'll receive the same care whether or not you join the study.`
    },
    {
      id: 'procedures',
      title: "What You'll Do",
      content: (() => {
        if (schedule && schedule.length > 0) {
          const scheduleCount = schedule.length
          const timepoints = schedule.map(tp => formatTimepoint(tp.timepoint))
          const timepointsText = scheduleCount <= 5
            ? `at ${scheduleCount} timepoints: ${timepoints.join(', ')}`
            : `at ${scheduleCount} timepoints throughout the study`

          return `If you agree to participate, you will:

- Complete short questionnaires about your symptoms ${timepointsText}
- The study lasts ${months} months total

Questionnaires take about 5 minutes each. You'll complete ${scheduleCount} questionnaires over ${months} months.`
        }
        return `If you agree to participate, you will:

- Complete short questionnaires about your symptoms at scheduled timepoints
- The study lasts ${months} months total

Questionnaires take about 5 minutes each.`
      })()
    },
    {
      id: 'risks',
      title: 'Risks and Discomforts',
      content: `This is an observational study - we're only collecting information, not changing your treatment. There are no additional medical risks from participating.

The main risk is the time required to complete questionnaires. Some questions ask about sensitive topics. You can skip any question you're not comfortable answering.`
    },
    {
      id: 'benefits',
      title: 'Benefits',
      content: `**Direct Benefits:**
- Track your progress over time
- Receive a summary of your changes throughout the study

**Indirect Benefits:**
- Help improve understanding of ${intervention} outcomes
- Contribute to better care for future patients`
    },
    {
      id: 'privacy',
      title: 'Privacy and Confidentiality',
      content: `Your information is protected:

- All data is encrypted and stored securely
- Your identity is separated from your health data
- Results are reported only in aggregate
- We never share your individual data with third parties

Only authorized research staff can access your identifiable information.`
    },
    {
      id: 'voluntary',
      title: 'Voluntary Participation',
      content: `Joining this study is completely voluntary.

- You can withdraw at any time, for any reason
- Withdrawing will not affect your treatment or care
- If you withdraw, data already collected may still be used (in de-identified form)

To withdraw, simply contact us or stop completing surveys.`
    },
    {
      id: 'compensation',
      title: 'Compensation',
      content: `There is no monetary compensation for participating in this study.

You will not be charged any fees for participating.`
    },
    {
      id: 'contact',
      title: 'Contact Information',
      content: `**Questions about the study:**
Email: support@nofone.us

**Questions about your rights as a participant:**
Contact our research team at support@nofone.us

For medical emergencies, contact your healthcare provider or call 911.`
    }
  ]
}

/**
 * Generate a complete consent document with title and version
 */
export function generateConsentDocument(
  studyName: string,
  intervention: string,
  durationWeeks: number
): ConsentDocument {
  return {
    title: `Informed Consent: ${studyName}`,
    version: '1.0',
    sections: generateConsentSections(intervention, durationWeeks)
  }
}
