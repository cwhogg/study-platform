# Agent Specifications

## Overview

The platform uses 4 LLM-powered agents + 1 code-based operations engine. Each agent has specific expertise and a clear goal.

| Agent | Expertise | Goal |
|-------|-----------|------|
| Clinical Protocol Agent | Research design, evidence, instruments | Design rigorous, feasible study |
| Consent & Compliance Agent | Regulatory, plain language, health literacy | Legally valid consent that's understood |
| Enrollment Agent | Onboarding, conversion, friction removal | Invited → Enrolled participant |
| Patient Communication Agent | Engagement, health comms, behavior change | Keep participants completing assessments |
| Operations Engine | System execution, scheduling, validation | Reliably execute all study operations |

## Event Ownership

| Event | Agent |
|-------|-------|
| Patient registers | Enrollment Agent |
| Patient completes consent | Enrollment Agent |
| Patient completes screening | Enrollment Agent |
| Patient needs to complete baseline PROs | Patient Communication Agent |
| Patient needs to complete baseline labs | Patient Communication Agent |
| Patient needs to complete ongoing PROs | Patient Communication Agent |
| Patient needs to complete ongoing labs | Patient Communication Agent |
| Recommending specific PROs to sponsor | Clinical Protocol Agent |

---

## PRO Instrument Output Format

When the Clinical Protocol Agent returns PRO instruments, they must follow this structure so the Operations Engine can present questions and calculate scores consistently.

### Instrument Schema

```typescript
interface Instrument {
  id: string;                    // e.g., "phq-2", "iief-5"
  name: string;                  // e.g., "PHQ-2 (Patient Health Questionnaire)"
  description: string;           // Brief description of what it measures
  instructions: string;          // Instructions shown to participant
  estimatedMinutes: number;      // Time to complete
  questions: Question[];
  scoring: ScoringConfig;
  alerts?: AlertConfig[];
  triggeredBy?: TriggerConfig;   // If this instrument is triggered by another
}

interface Question {
  id: string;                    // e.g., "q1", "q2"
  text: string;                  // The question text
  type: "single_choice" | "numeric_scale" | "text";
  options?: Option[];            // For single_choice
  scale?: { min: number; max: number; minLabel: string; maxLabel: string }; // For numeric_scale
  required: boolean;
}

interface Option {
  value: number;
  label: string;
}

interface ScoringConfig {
  method: "sum" | "average" | "custom";
  range: { min: number; max: number };
  interpretation: "higher_better" | "lower_better";
  thresholds?: { value: number; label: string }[];  // e.g., severity levels
}

interface AlertConfig {
  condition: string;             // e.g., "total >= 3", "q9 > 0"
  type: "trigger_instrument" | "coordinator_alert" | "urgent_alert" | "crisis_resources";
  target?: string;               // For trigger_instrument, which instrument to trigger
  urgency?: string;              // e.g., "24hr", "4hr", "immediate"
  message?: string;
}

interface TriggerConfig {
  instrumentId: string;          // Which instrument triggers this one
  condition: string;             // e.g., "total >= 3"
}
```

### Example Instrument: PHQ-2

```json
{
  "id": "phq-2",
  "name": "PHQ-2 (Patient Health Questionnaire - 2)",
  "description": "Brief depression screening",
  "instructions": "Over the last 2 weeks, how often have you been bothered by the following problems?",
  "estimatedMinutes": 0.5,
  "questions": [
    {
      "id": "q1",
      "text": "Little interest or pleasure in doing things",
      "type": "single_choice",
      "options": [
        { "value": 0, "label": "Not at all" },
        { "value": 1, "label": "Several days" },
        { "value": 2, "label": "More than half the days" },
        { "value": 3, "label": "Nearly every day" }
      ],
      "required": true
    },
    {
      "id": "q2",
      "text": "Feeling down, depressed, or hopeless",
      "type": "single_choice",
      "options": [
        { "value": 0, "label": "Not at all" },
        { "value": 1, "label": "Several days" },
        { "value": 2, "label": "More than half the days" },
        { "value": 3, "label": "Nearly every day" }
      ],
      "required": true
    }
  ],
  "scoring": {
    "method": "sum",
    "range": { "min": 0, "max": 6 },
    "interpretation": "lower_better"
  },
  "alerts": [
    {
      "condition": "total >= 3",
      "type": "trigger_instrument",
      "target": "phq-9"
    }
  ]
}
```

### Example: PHQ-9 with Crisis Resources

```json
{
  "id": "phq-9",
  "name": "PHQ-9 (Patient Health Questionnaire - 9)",
  "description": "Depression severity assessment",
  "triggeredBy": {
    "instrumentId": "phq-2",
    "condition": "total >= 3"
  },
  "scoring": {
    "method": "sum",
    "range": { "min": 0, "max": 27 },
    "interpretation": "lower_better",
    "thresholds": [
      { "value": 4, "label": "Minimal" },
      { "value": 9, "label": "Mild" },
      { "value": 14, "label": "Moderate" },
      { "value": 19, "label": "Moderately Severe" },
      { "value": 27, "label": "Severe" }
    ]
  },
  "alerts": [
    {
      "condition": "total >= 10",
      "type": "coordinator_alert",
      "urgency": "24hr",
      "message": "Elevated depression score requires outreach"
    },
    {
      "condition": "total >= 15",
      "type": "urgent_alert",
      "urgency": "4hr",
      "message": "High depression score requires prompt outreach"
    },
    {
      "condition": "q9 > 0",
      "type": "crisis_resources",
      "urgency": "immediate",
      "message": "Participant reported suicidal ideation"
    },
    {
      "condition": "q9 > 0",
      "type": "urgent_alert",
      "urgency": "1hr",
      "message": "URGENT: Participant reported suicidal ideation"
    }
  ]
}
```

### Crisis Resources Content

When `crisis_resources` alert is triggered, display:

```
If you're having thoughts of harming yourself, please reach out for support:

📞 National Suicide Prevention Lifeline: 988
💬 Crisis Text Line: Text HOME to 741741
🏥 Emergency: Call 911 or go to your nearest ER

A member of our team will also be reaching out to you.
```

---

## 1. Clinical Protocol Agent

### Expertise
- Clinical research design
- Evidence synthesis (PubMed, clinical trials, Reddit for emerging interventions)
- Validated PRO instruments (qADAM, IIEF-5, PHQ-2/9, etc.)
- Safety monitoring requirements
- Inclusion/exclusion criteria design

### Goal
Design a rigorous, scientifically sound, and operationally feasible observational study.

### When Called

**Study Discovery Call (first LLM call):**
- Input: Intervention name (e.g., "Testosterone Replacement Therapy")
- Output: Structured JSON with:
  - Likely endpoints (with confidence levels)
  - Likely populations
  - Treatment stages
  - Recommended duration
  - Data sources used

**Protocol Generation Call (second LLM call):**
- Input: User selections from study builder (population, primary endpoint, secondary endpoints, duration)
- Output: Complete protocol specification:
  - Inclusion criteria
  - Exclusion criteria
  - PRO instruments with full question specs
  - Safety thresholds
  - Data collection schedule
  - Lab requirements

### Prompt Structure

```
You are a clinical research expert designing observational studies.

STUDY DISCOVERY:
Given an intervention, identify the most relevant:
1. Clinical endpoints (what outcomes to measure)
2. Target populations (who to study)
3. Treatment stages (when in treatment journey)
4. Study duration (how long to follow)

For each recommendation, indicate:
- Confidence level (high/moderate/low based on evidence)
- Suggested measurement approach
- Source of recommendation

PROTOCOL GENERATION:
Given user selections, generate a complete protocol including:
- Specific inclusion/exclusion criteria with rationale
- PRO instruments with exact questions and scoring
- Safety monitoring thresholds and actions
- Data collection schedule by timepoint
```

---

## 2. Consent & Compliance Agent

### Expertise
- FDA informed consent requirements
- IRB standards
- Plain language writing (6th-8th grade reading level)
- Health literacy principles
- HIPAA/privacy requirements

### Goal
Produce a consent document that is legally valid AND genuinely understood by participants.

### When Called

**Consent Generation Call:**
- Input: Protocol specification
- Output:
  - Complete consent document (markdown)
  - 3-5 comprehension questions with correct answers
  - One-page plain language summary

### Prompt Structure

```
You are an expert in clinical research consent and health literacy.

Given a study protocol, generate:

1. INFORMED CONSENT DOCUMENT
Sections:
- Study title and sponsor
- Introduction and purpose
- Why you are being asked to participate
- Study procedures (what you will do)
- How long the study lasts
- Risks and discomforts
- Benefits
- Alternatives
- Confidentiality
- Costs and compensation
- Voluntary participation
- Right to withdraw
- Contact information
- Signature block

Requirements:
- 6th-8th grade reading level
- Short sentences (average <20 words)
- Active voice, direct address ("you will...")
- Explain all medical/technical terms
- Honest about risks

2. COMPREHENSION QUESTIONS
3-5 multiple choice questions testing understanding of key points.
Include correct answer for each.

3. PLAIN LANGUAGE SUMMARY
One-page summary of key points for quick reference.
```

---

## 3. Enrollment Agent

### Expertise
- User onboarding best practices
- Conversion optimization
- Friction removal
- Handling objections
- Compassionate communication (especially for ineligibility)

### Goal
Convert an invited participant into a registered, consented, eligible participant ready to begin the study.

### When Called

**Registration Guidance:**
- Contextual help text
- Error message framing

**Consent Guidance:**
- Section-by-section encouragement
- Handling hesitation

**Screening Flow:**
- Framing of questions
- Ineligibility messaging (compassionate, doesn't reveal specific medical reasons)

### UI Copy Generated

```
Registration:
- Welcome message
- Field labels and help text
- Error messages
- Success confirmation

Consent:
- Section introductions
- Progress encouragement
- Comprehension question framing
- Signature page copy

Screening:
- Section introduction
- Question framing
- Eligibility confirmation
- Ineligibility message (compassionate)

Handoff:
- "You're enrolled" message
- What to expect next
- How reminders will work
```

---

## 4. Patient Communication Agent

### Expertise
- Patient engagement
- Health communication
- Behavior change techniques
- SMS/email best practices
- Re-engagement strategies

### Goal
Keep participants engaged and completing all assessments throughout the study.

### When Called

**Message Template Generation (at study setup):**
- Input: Protocol schedule
- Output: Message templates for each touchpoint

**Re-engagement (if participant goes quiet):**
- Input: Participant history, what's overdue
- Output: Personalized re-engagement message

### Message Types

```
REMINDERS:
- Initial reminder (assessment due)
- Follow-up reminder (day +1)
- Urgent reminder (approaching window close)
- Final reminder (last chance)

LABS:
- Lab reminder (time to get blood drawn)
- Lab follow-up (labs not yet received)

MILESTONES:
- Enrollment complete
- Halfway point
- Final assessment coming up
- Study complete

RE-ENGAGEMENT:
- Missed assessment outreach
- Multiple missed assessments
- At risk of dropout
```

### Template Variables

```
{{first_name}}
{{study_name}}
{{timepoint_name}}
{{assessment_link}}
{{days_remaining}}
{{est_minutes}}
{{next_timepoint_date}}
```

---

## 5. Operations Engine (Code, Not LLM)

### Responsibilities

**Account Management:**
- User registration
- Email verification
- Session management

**Consent Flow:**
- Present consent document
- Track scroll/engagement
- Collect e-signature
- Store signed consent

**Screening:**
- Present screening questions
- Evaluate I/E rules against responses
- Determine eligibility

**PRO Collection:**
- Present questions one at a time
- Validate responses
- Calculate scores
- Store submissions

**Schedule Management:**
- Track enrollment date
- Calculate assessment due dates
- Determine what's due now
- Track completion status

**Reminder Triggering:**
- Check schedule daily
- Identify due reminders
- Call Patient Communication Agent for personalized messages
- Dispatch via Resend (email) or Twilio (SMS)

**Data Validation:**
- Type checking
- Range validation
- Completeness checks

**Safety Monitoring:**
- Compare incoming data to thresholds
- Generate alerts when exceeded
- PHQ-2 ≥ 3 triggers PHQ-9
- PHQ-9 Q9 > 0 triggers crisis resources

**Lab Webhook:**
- Receive simulated lab data
- Match to participant
- Store results
- Trigger safety checks

---

## Agent Interaction Flow

```
STUDY SETUP
───────────
Sponsor enters intervention
       │
       ▼
Clinical Protocol Agent (discovery call)
       │
       ▼
Sponsor configures in UI
       │
       ▼
Clinical Protocol Agent (protocol generation call)
       │
       ├──→ Consent & Compliance Agent → Consent document
       │
       └──→ Patient Communication Agent → Message templates
       │
       ▼
Study stored in database, ready for enrollment


PARTICIPANT JOURNEY
───────────────────
Participant clicks invite link
       │
       ▼
Enrollment Agent guides:
  → Registration
  → Consent presentation + signature
  → Screening evaluation
       │
       ▼
Patient Communication Agent:
  → Baseline PRO reminders
  → Baseline lab reminders
  → Ongoing PRO reminders
  → Ongoing lab reminders
  → Milestone messages
       │
       ▼
Operations Engine executes all flows


THROUGHOUT
──────────
Operations Engine:
  → Validates all data
  → Evaluates safety thresholds
  → Triggers alerts
  → Dispatches notifications
```
