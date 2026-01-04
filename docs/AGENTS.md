# Agent Architecture

## Overview

The platform uses 4 LLM-powered agents + 1 code-based operations engine. Each agent has a detailed instruction file that is loaded as the system prompt when making OpenAI calls.

```
┌─────────────────────────────────────────────────────────────────┐
│                        LLM AGENTS                               │
│   (Each has AGENT.md loaded as system prompt)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │   Clinical      │  │    Consent &    │                      │
│  │   Protocol      │  │   Compliance    │                      │
│  │                 │  │                 │                      │
│  │ - Study design  │  │ - Consent doc   │                      │
│  │ - PRO selection │  │ - Comprehension │                      │
│  │ - Safety rules  │  │ - Plain language│                      │
│  └────────┬────────┘  └────────┬────────┘                      │
│           │                    │                                │
│           └──────────┬─────────┘                                │
│                      │                                          │
│                      ▼                                          │
│           ┌─────────────────────┐                               │
│           │     Protocol +      │                               │
│           │   Consent stored    │                               │
│           └──────────┬──────────┘                               │
│                      │                                          │
│     ┌────────────────┼────────────────┐                        │
│     │                │                │                        │
│     ▼                ▼                ▼                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐        │
│  │ Enrollment  │  │  Patient    │  │   Operations    │        │
│  │   Agent     │  │ Communication│  │    Engine      │        │
│  │             │  │    Agent    │  │    (Code)      │        │
│  │ - Welcome   │  │             │  │                │        │
│  │ - Consent UX│  │ - Reminders │  │ - Present PROs │        │
│  │ - Screening │  │ - Milestones│  │ - Score/store  │        │
│  │ - Errors    │  │ - Re-engage │  │ - Safety check │        │
│  └─────────────┘  └─────────────┘  └─────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Agent Files

Each agent has detailed instructions in `/agents/[agent-name]/AGENT.md`:

| Agent | File | Model | Purpose |
|-------|------|-------|---------|
| Clinical Protocol | `agents/clinical-protocol/AGENT.md` | o1-mini | Design studies, select PROs |
| Consent & Compliance | `agents/consent-compliance/AGENT.md` | gpt-4o | Generate consent documents |
| Enrollment | `agents/enrollment/AGENT.md` | gpt-4o | Generate enrollment copy |
| Patient Communication | `agents/patient-communication/AGENT.md` | gpt-4o | Generate message templates |

## How Agents Are Called

```typescript
// lib/agents/client.ts

import OpenAI from 'openai';
import { readFileSync } from 'fs';
import path from 'path';

const openai = new OpenAI();

export async function callAgent(
  agentName: string,
  userMessage: string,
  model: string = 'gpt-4o'
) {
  // Load agent instructions
  const agentPath = path.join(process.cwd(), 'agents', agentName, 'AGENT.md');
  const systemPrompt = readFileSync(agentPath, 'utf-8');
  
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}

// Usage examples:

// Study discovery (uses o1-mini for complex reasoning)
const options = await callAgent(
  'clinical-protocol',
  JSON.stringify({ task: 'discover', intervention: 'Testosterone Replacement Therapy' }),
  'o1-mini'
);

// Consent generation (uses gpt-4o)
const consent = await callAgent(
  'consent-compliance',
  JSON.stringify({ protocol: studyProtocol })
);
```

## Event Ownership

| Event | Owner |
|-------|-------|
| Sponsor enters intervention | Clinical Protocol Agent |
| Sponsor configures study | Clinical Protocol Agent |
| Protocol needs consent | Consent & Compliance Agent |
| Study needs enrollment copy | Enrollment Agent |
| Study needs message templates | Patient Communication Agent |
| Participant registers | Operations Engine |
| Participant signs consent | Operations Engine |
| Participant completes screening | Operations Engine |
| Assessment is due | Patient Communication Agent (templates) → Operations Engine (sends) |
| PRO is submitted | Operations Engine |
| Safety threshold exceeded | Operations Engine |

## Operations Engine

The Operations Engine is **code, not an LLM**. It executes the flows designed by agents:

### Responsibilities

- **Account Management:** Registration, auth, sessions
- **Consent Flow:** Present document, collect signature, verify comprehension
- **Screening:** Present questions, evaluate eligibility rules
- **PRO Collection:** Present questions one at a time, validate, store
- **Scoring:** Calculate scores using instrument definitions
- **Safety Monitoring:** Compare scores to thresholds, generate alerts
- **Schedule Management:** Track what's due, trigger reminders
- **Message Dispatch:** Send emails via Resend, SMS via Twilio

### Key Functions

```typescript
// lib/operations/pro-submission.ts
async function handleProSubmission(
  participantId: string,
  timepoint: string,
  instrumentId: string,
  responses: Record<string, { value: number }>
) {
  // 1. Load instrument definition from protocol
  const instrument = await getInstrument(participantId, instrumentId);
  
  // 2. Validate responses
  validateResponses(instrument, responses);
  
  // 3. Calculate scores
  const scores = calculateScores(instrument, responses);
  
  // 4. Store submission
  await saveSubmission(participantId, timepoint, instrumentId, responses, scores);
  
  // 5. Check safety thresholds
  const alerts = evaluateSafety(instrument, scores, responses);
  
  // 6. Handle alerts
  if (alerts.length > 0) {
    await createAlerts(participantId, alerts);
  }
  
  // 7. Check for triggered instruments
  if (alerts.some(a => a.type === 'trigger_instrument')) {
    // Queue follow-up instrument
  }
  
  return { scores, alerts };
}
```

## Data Flow

### Study Setup
```
Sponsor Input
    │
    ▼
Clinical Protocol Agent ──────► Protocol Spec
    │                              │
    │                    ┌─────────┴─────────┐
    │                    ▼                   ▼
    │            Consent Agent        Patient Comm Agent
    │                    │                   │
    │                    ▼                   ▼
    │            Consent Doc          Message Templates
    │                    │                   │
    └────────────────────┴─────────┬─────────┘
                                   │
                                   ▼
                            Study Record
                            (in database)
```

### Participant Journey
```
Invitation Link
    │
    ▼
Enrollment Copy (from Enrollment Agent)
    │
    ├── Registration ──────────► User Account
    │
    ├── Consent ───────────────► Signed Consent
    │
    ├── Screening ─────────────► Eligible/Ineligible
    │
    └── Baseline PROs ─────────► Enrolled Participant
    
    
Ongoing (Operations Engine executes):
    
Schedule Check
    │
    ▼
Due Assessment?
    │
    ├── Yes ──► Send Reminder (using Patient Comm templates)
    │              │
    │              ▼
    │           Participant completes PRO
    │              │
    │              ▼
    │           Score & Store
    │              │
    │              ▼
    │           Safety Check ──► Alert if needed
    │
    └── No ───► Wait
```

## Detailed Agent Documentation

For complete specifications, see:

- **Clinical Protocol Agent:** `agents/clinical-protocol/AGENT.md`
  - Study discovery call (input/output schemas)
  - Protocol generation call
  - PRO instrument schema
  - Safety monitoring requirements

- **Consent & Compliance Agent:** `agents/consent-compliance/AGENT.md`
  - Required consent sections
  - Writing guidelines
  - Comprehension question design

- **Enrollment Agent:** `agents/enrollment/AGENT.md`
  - All enrollment screen copy
  - Error message templates
  - Ineligibility messaging

- **Patient Communication Agent:** `agents/patient-communication/AGENT.md`
  - Reminder escalation strategy
  - Milestone timing
  - Re-engagement triggers
  - Template variables
