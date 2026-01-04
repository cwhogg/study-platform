# Claude Code Prompts

## How to Use

These prompts are designed to be used in sequence with Claude Code. Each prompt builds on the previous one. After each prompt:

1. Review what was created
2. Test it visually (run `npm run dev`)
3. Fix any issues before moving to the next prompt
4. Commit to git

## Setup

Before starting, make sure you have:
- Node.js 18+
- A Supabase account (free tier works)
- An OpenAI API key
- A Resend account (free tier works)
- A GitHub account
- A Vercel account

---

## Phase 1: Project Setup

### Prompt 1.1: Initialize Project

```
Create a new Next.js 14 project with the following:

- App Router
- TypeScript
- Tailwind CSS
- ESLint

Project name: study-platform

After creating, initialize git and make the first commit.

Read CLAUDE.md for full project context.
```

### Prompt 1.2: Project Structure and Dependencies

```
Set up the project structure and install dependencies.

Structure:
/app
  /sponsor        # Sponsor pages
  /study          # Participant pages  
  /admin          # Admin/demo pages
  /api            # API routes
/components
  /ui             # Shared UI
  /sponsor        # Sponsor components
  /participant    # Participant components
/lib
  /agents         # Agent implementations
  /db             # Database queries
  /utils          # Utilities
/docs             # Already exists - don't modify

Dependencies to install:
- @supabase/supabase-js
- @supabase/ssr
- openai
- resend
- zod (for validation)
- lucide-react (for icons)

Create placeholder files in each directory with a comment explaining what goes there.

Read CLAUDE.md for context.
```

### Prompt 1.3: Environment and Supabase Setup

```
Set up environment variables and Supabase connection.

1. Create .env.local.example with all required variables (see CLAUDE.md)
2. Create lib/supabase/client.ts for browser client
3. Create lib/supabase/server.ts for server client
4. Create lib/supabase/middleware.ts for auth middleware
5. Update middleware.ts in root to use Supabase auth

Don't create actual .env.local - I'll do that manually.

Read CLAUDE.md for context.
```

### Prompt 1.4: Database Schema

```
Create the Supabase database schema.

Create a file at /supabase/schema.sql with all tables, enums, indexes, and RLS policies.

Reference docs/DATA_MODEL.md for the complete schema.

Include comments explaining each table.
```

### Prompt 1.5: Deploy to Vercel

```
Prepare the project for Vercel deployment.

1. Create vercel.json if needed
2. Ensure build works: npm run build
3. Add any necessary configuration

I will manually:
- Connect to GitHub
- Deploy to Vercel
- Add environment variables in Vercel dashboard
```

---

## Phase 2: Sponsor UI Shell

### Prompt 2.1: Sponsor Layout and Landing

```
Create the sponsor-facing UI shell.

1. Create app/sponsor/layout.tsx with a simple header (logo, nav)
2. Create app/sponsor/page.tsx as landing page with:
   - Hero: "Create Observational Studies with AI"
   - "Create a Study" button
   - Brief explanation of how it works

Mobile-friendly but primarily desktop for sponsor UI.

Use Tailwind for styling. Keep it clean and professional.
```

### Prompt 2.2: Study Builder - Intervention Input

```
Create the first step of the study builder.

app/sponsor/create/page.tsx

UI:
- "What intervention do you want to study?"
- Large text input
- Examples shown below input
- "Continue" button

On submit:
- For now, just navigate to next step with the intervention in URL params
- We'll add the AI call later

Reference docs/USER_FLOWS.md for the exact UI.
```

### Prompt 2.3: Study Builder - Configuration

```
Create the study configuration step.

app/sponsor/create/configure/page.tsx

UI showing:
- Population options (radio buttons)
- Treatment stage options (radio buttons)
- Primary endpoint options (radio buttons with recommended marker)
- Secondary endpoints (checkboxes)
- Duration options (radio buttons with recommended marker)
- "Generate Protocol" button

For now, use hardcoded options for TRT (we'll make this dynamic later).

Reference docs/USER_FLOWS.md for the exact UI.
```

### Prompt 2.4: Study Builder - Protocol Review

```
Create the protocol review step.

app/sponsor/create/review/page.tsx

UI showing:
- Study summary
- Collapsible sections for:
  - Inclusion criteria (with edit button)
  - Exclusion criteria (with edit button)
  - PRO instruments
  - Schedule
  - Safety monitoring
- "Generate Consent" button

For now, use hardcoded protocol data for TRT.

Reference docs/USER_FLOWS.md for the exact UI.
```

### Prompt 2.5: Study Builder - Consent Review

```
Create the consent review step.

app/sponsor/create/consent/page.tsx

UI showing:
- Preview of generated consent document
- Comprehension questions listed
- "Finalize Study" button

For now, use placeholder consent text.

On finalize, show success page with:
- Study ID
- Invitation link (fake for now)
- "View Dashboard" button
```

---

## Phase 3: Participant UI Shell

### Prompt 3.1: Participant Layout

```
Create the participant-facing UI shell.

IMPORTANT: This must be mobile-first. Design for 375px width primarily.

1. Create app/study/[studyId]/layout.tsx
   - Minimal header (study name only)
   - Full-height content area
   - No footer

2. Create a shared mobile container component that:
   - Centers content
   - Has appropriate padding
   - Max-width for larger screens
```

### Prompt 3.2: Join Study - Welcome

```
Create the welcome/landing page for participants.

app/study/[studyId]/join/page.tsx

Mobile UI:
- Study name
- Brief value prop (3 bullet points)
- "Get Started" button

Reference docs/USER_FLOWS.md for exact UI.

Use large tap targets (min 44px).
```

### Prompt 3.3: Join Study - Registration

```
Create the registration flow.

app/study/[studyId]/join/register/page.tsx

Mobile UI:
- Email input
- Password input
- Confirm password input
- "Continue" button

app/study/[studyId]/join/verify/page.tsx

Mobile UI:
- "Check your email" message
- 6-digit code input
- "Resend" link

For now, skip actual email verification - just navigate to next step.
```

### Prompt 3.4: Join Study - Consent Flow

```
Create the consent presentation flow.

app/study/[studyId]/join/consent/page.tsx

Mobile UI:
- Scrollable consent document
- Progress indicator (section X of Y)
- "Continue" button at bottom

app/study/[studyId]/join/consent/quiz/page.tsx

- One question at a time
- Large tap targets for answers
- Shows correct/incorrect feedback

app/study/[studyId]/join/consent/sign/page.tsx

- Signature input (typed name)
- Checkbox for agreement
- Date (auto-filled)
- "Sign & Continue" button

Use placeholder consent text for now.
```

### Prompt 3.5: Join Study - Screening

```
Create the eligibility screening flow.

app/study/[studyId]/join/screening/page.tsx

Mobile UI:
- One question at a time
- Large tap targets
- Progress indicator

If ineligible, show:
app/study/[studyId]/join/ineligible/page.tsx
- Compassionate message
- "Return" button

If eligible, show brief confirmation then navigate to baseline.

Reference docs/USER_FLOWS.md for exact flow.
```

### Prompt 3.6: Baseline PROs

```
Create the baseline PRO collection flow.

app/study/[studyId]/join/baseline/page.tsx

Mobile UI:
- One question at a time
- Large tap targets for responses
- Progress indicator (question X of Y)
- Subtle animation between questions

For now, hardcode example baseline instruments:
- A depression screener (PHQ-2, 2 questions)
- A quality of life question (1 question)
- A custom symptom question (1 question)

Use the instrument format from docs/AGENTS.md.

On completion, navigate to success page.
```

### Prompt 3.7: Enrollment Complete

```
Create the enrollment complete page.

app/study/[studyId]/join/complete/page.tsx

Mobile UI:
- Success message with checkmark
- "What's next" section
- "View Dashboard" button

Reference docs/USER_FLOWS.md for exact UI.
```

### Prompt 3.8: Participant Dashboard

```
Create the participant dashboard.

app/study/[studyId]/dashboard/page.tsx

Mobile UI:
- Progress bar (Week X of Y)
- Current/due assessment card (if any)
- Completed list
- Upcoming list

No scores shown - just completion status.

Reference docs/USER_FLOWS.md for exact UI.
```

### Prompt 3.9: Ongoing PRO Assessment

```
Create the ongoing assessment flow.

app/study/[studyId]/assessment/[timepoint]/page.tsx

Same one-question-at-a-time UI as baseline.

Dynamically load which instruments are needed for this timepoint from the study protocol.

On completion, return to dashboard.
```

---

## Phase 4: Database Integration

### Prompt 4.1: Database Types

```
Generate TypeScript types from the Supabase schema.

Create lib/db/types.ts with:
- All table types
- Enum types
- Insert/Update types

Match the schema in docs/DATA_MODEL.md
```

### Prompt 4.2: Study CRUD

```
Create database functions for studies.

lib/db/studies.ts

Functions:
- createStudy(data) - insert new study
- getStudy(id) - get study by ID
- updateStudy(id, data) - update study
- getStudyByInviteCode(code) - lookup by invite code

Use Supabase client.
```

### Prompt 4.3: Participant CRUD

```
Create database functions for participants.

lib/db/participants.ts

Functions:
- createParticipant(studyId, userId) - create enrollment record
- getParticipant(id) - get by ID
- getParticipantByUser(studyId, userId) - lookup by user
- updateParticipantStatus(id, status) - update status
- advanceParticipantWeek(id, week) - for demo time advancement
```

### Prompt 4.4: Submissions CRUD

```
Create database functions for PRO submissions.

lib/db/submissions.ts

Functions:
- createSubmission(data) - save PRO responses
- getSubmissions(participantId) - all submissions for participant
- getSubmissionsByTimepoint(participantId, timepoint) - specific timepoint
- hasCompletedTimepoint(participantId, timepoint) - check completion
```

### Prompt 4.5: Wire Up Registration

```
Connect registration flow to Supabase Auth.

Update app/study/[studyId]/join/register/page.tsx to:
- Create user with Supabase Auth
- Create participant record
- Handle errors appropriately

Update app/study/[studyId]/join/verify/page.tsx to:
- Actually verify email (or skip in demo mode)
- Update user email_verified status
```

### Prompt 4.6: Wire Up Study Creation

```
Connect study builder to database.

1. Create API route: app/api/studies/route.ts
   - POST: Create new study

2. Update sponsor create flow to:
   - Save study to database on finalize
   - Generate real invite code
   - Show real invite link

For now, store hardcoded protocol. We'll add AI generation next.
```

---

## Phase 5: Clinical Protocol Agent

### Prompt 5.1: Agent Infrastructure

```
Create the agent calling infrastructure.

lib/agents/client.ts
- Function to load agent instruction file from /agents/[name]/AGENT.md
- Function to call OpenAI with the agent instructions as system prompt
- Support for different models (gpt-4o default, o1-mini for protocol generation)
- JSON response parsing
- Error handling and logging

lib/agents/types.ts
- TypeScript types for agent inputs/outputs
- Import and export Instrument, Question, ScoringConfig types from clinical-protocol agent

The agent instruction files already exist in /agents/*/AGENT.md - read them to understand the expected input/output schemas.

Example usage pattern:
const result = await callAgent('clinical-protocol', { task: 'discover', intervention: 'TRT' }, 'o1-mini');

Reference docs/AGENTS.md for architecture overview.
Reference agents/clinical-protocol/AGENT.md for schema definitions.
```

### Prompt 5.2: Study Discovery Call

```
Implement the study discovery API endpoint.

app/api/agents/study-discovery/route.ts

1. Receive POST with { intervention: string }
2. Call the clinical-protocol agent using callAgent()
3. Pass task: 'discover' and the intervention
4. Use o1-mini model for this complex reasoning task
5. Return the structured options

The agent instructions are in agents/clinical-protocol/AGENT.md - the agent knows what to return.
The output schema is defined in that file under "Call 1: Study Discovery".

Test with: POST /api/agents/study-discovery { "intervention": "Testosterone Replacement Therapy" }
```

### Prompt 5.3: Protocol Generation Call

```
Implement the protocol generation API endpoint.

app/api/agents/protocol/route.ts

1. Receive POST with study configuration:
   { intervention, population, treatmentStage, primaryEndpoint, secondaryEndpoints, durationWeeks }
2. Call the clinical-protocol agent using callAgent()
3. Pass task: 'generate' and the configuration
4. Use o1-mini model for this complex reasoning task
5. Return the full protocol specification

The agent instructions are in agents/clinical-protocol/AGENT.md.
The output schema is defined under "Call 2: Protocol Generation".
The PRO instrument schema is also defined in that file.

Test with a full configuration object and verify:
- Inclusion/exclusion criteria are returned
- Instruments are in the correct schema with all questions
- Schedule includes all timepoints
- Safety monitoring rules are defined
```

### Prompt 5.4: Wire Up Study Builder

```
Connect study builder to Clinical Protocol Agent.

1. Create API route: app/api/agents/study-discovery/route.ts
   - POST: Call discoverStudyOptions

2. Create API route: app/api/agents/protocol/route.ts
   - POST: Call generateProtocol

3. Update app/sponsor/create/page.tsx:
   - On submit, call study-discovery API
   - Pass results to configure page

4. Update app/sponsor/create/configure/page.tsx:
   - Populate options from AI response
   - On submit, call protocol API
   - Pass results to review page

5. Update app/sponsor/create/review/page.tsx:
   - Display generated protocol
   - Allow edits (re-call API with changes)
```

---

## Phase 6: Consent & Compliance Agent

### Prompt 6.1: Consent Generation

```
Implement the consent generation API endpoint.

app/api/agents/consent/route.ts

1. Receive POST with { protocol: ProtocolSpec }
2. Call the consent-compliance agent using callAgent()
3. Pass the protocol specification
4. Use gpt-4o model
5. Return the consent document, comprehension questions, and summary

The agent instructions are in agents/consent-compliance/AGENT.md.
The output schema is defined in that file.

The consent document should be returned as markdown sections that can be displayed one at a time on mobile.
```

### Prompt 6.2: Wire Up Consent Generation

```
Connect consent generation to study builder.

1. Create API route: app/api/agents/consent/route.ts
   - POST: Call generateConsent

2. Update app/sponsor/create/review/page.tsx:
   - Add "Generate Consent" button
   - Call consent API with protocol
   - Navigate to consent review

3. Update app/sponsor/create/consent/page.tsx:
   - Display generated consent
   - Show comprehension questions
   - Save to study record on finalize
```

---

## Phase 7: Enrollment Agent

### Prompt 7.1: Enrollment Copy Generation

```
Implement enrollment copy generation API endpoint.

app/api/agents/enrollment-copy/route.ts

1. Receive POST with study summary:
   { studyName, intervention, sponsor, durationWeeks, proceduresSummary, estimatedTimePerAssessment, primaryBenefit }
2. Call the enrollment agent using callAgent()
3. Use gpt-4o model
4. Return all enrollment screen copy

The agent instructions are in agents/enrollment/AGENT.md.
The output schema is defined in that file - it includes copy for:
- Welcome screen
- Registration
- Email verification
- Pre-consent overview
- Consent guidance
- Comprehension quiz framing
- Signature screen
- Screening intro
- Eligible/ineligible messages
- Enrollment complete

Store the generated copy in the study record.
```

### Prompt 7.2: Wire Up Enrollment Copy

```
Use enrollment copy in participant flow.

1. Generate and store enrollment copy when study is created

2. Update participant join pages to use stored copy:
   - Welcome page
   - Registration page
   - Consent intro
   - Screening intro
   - Ineligible page
   - Eligible/baseline intro
   - Complete page

Make the copy dynamic based on study configuration.
```

---

## Phase 8: Patient Communication Agent

### Prompt 8.1: Message Template Generation

```
Implement message template generation API endpoint.

app/api/agents/message-templates/route.ts

1. Receive POST with:
   { studyName, sponsor, schedule, durationWeeks, assessmentMinutes }
2. Call the patient-communication agent using callAgent()
3. Use gpt-4o model
4. Return all message templates

The agent instructions are in agents/patient-communication/AGENT.md.
The output schema is defined in that file - it includes:
- Assessment reminders (initial, followUp, final) for both SMS and email
- Lab reminders
- Milestone messages (enrolled, week4, halfway, finalReminder, complete)
- Re-engagement messages (missedOne, missedMultiple, atRisk)

Templates use {{variables}} like {{firstName}}, {{link}}, {{timepoint}}.

Store the generated templates in the study record.
```

### Prompt 8.2: Email Sending

```
Set up email sending with Resend.

lib/email/client.ts
- Create Resend client
- Send email function

lib/email/templates.ts
- Base email template (HTML wrapper)
- Render template with variables

Create API route: app/api/email/send/route.ts
- POST: Send email to participant
- Use stored templates
- Personalize with participant data
```

### Prompt 8.3: Wire Up Enrollment Email

```
Send enrollment confirmation email.

When participant completes enrollment:
1. Load "enrolled" milestone template
2. Personalize with participant name, next assessment date
3. Send via Resend
4. Log in messages table
```

---

## Phase 9: Operations Engine

### Prompt 9.1: PRO Submission Handler

```
Create the PRO submission handler.

lib/operations/pro-submission.ts

Function: handleProSubmission(participantId, timepoint, instrument, responses)

1. Validate responses against instrument schema
2. Calculate scores using the scoring config from the instrument definition
3. Save to submissions table
4. Check safety thresholds (alerts defined in instrument)
5. Generate alerts if needed
6. Check if timepoint complete
7. Return result

Reference docs/AGENTS.md for instrument format and alert handling.

Create API route: app/api/submissions/route.ts
- POST: Handle PRO submission
```

### Prompt 9.2: Safety Threshold Evaluation

```
Implement safety threshold checking.

lib/operations/safety.ts

Function: evaluateSafety(submission)

For PHQ-2:
- If score >= 3, trigger PHQ-9

For PHQ-9:
- If score >= 10, create coordinator alert
- If score >= 15, create urgent alert
- If Q9 > 0, show crisis resources + urgent alert

Return:
- alerts: Array of alerts to create
- showCrisisResources: boolean
- triggerFollowUp: instrument to trigger (e.g., PHQ-9)
```

### Prompt 9.3: Schedule Engine

```
Implement the schedule engine.

lib/operations/schedule.ts

Function: getParticipantSchedule(participant, protocol)
- Calculate all timepoint dates from enrollment
- Return schedule with due dates

Function: getDueAssessments(participant)
- Get current date (or demo date)
- Find assessments in their window
- Return what's due now

Function: getUpcomingAssessments(participant)
- Return next 3 upcoming assessments

Function: isTimepointComplete(participant, timepoint)
- Check if all required instruments submitted
```

### Prompt 9.4: Reminder Triggering

```
Implement reminder job.

lib/operations/reminders.ts

Function: processReminders()

1. Get all active participants
2. For each, check what's due
3. For incomplete assessments:
   - Determine reminder stage (initial, followUp, final)
   - Check if reminder already sent today
   - If not, queue reminder
4. Send queued reminders

Create API route: app/api/cron/reminders/route.ts
- GET: Trigger reminder processing
- (Would be called by Vercel cron in production)

For demo: Add manual trigger button in admin.
```

---

## Phase 10: Demo Features

### Prompt 10.1: Admin Dashboard

```
Create admin/demo dashboard.

app/admin/page.tsx

UI showing:
- List of studies (with participant counts)
- List of participants (with status)
- Demo controls

For each participant:
- Current week
- "Advance Week" button
- "Simulate Labs" button
- "Trigger Reminder" button
```

### Prompt 10.2: Time Advancement

```
Implement demo time advancement.

lib/operations/demo.ts

Function: advanceParticipantTime(participantId, toWeek)

1. Update participant.current_week
2. Recalculate what's due
3. Return new schedule state

Create API route: app/api/admin/advance-time/route.ts
- POST: Advance participant to specified week
```

### Prompt 10.3: Simulated Labs

```
Implement simulated lab webhook.

lib/operations/demo.ts

Function: simulateLabResults(participantId, timepoint)

1. Generate realistic lab values:
   - Testosterone: 450-650 ng/dL (post-TRT)
   - Hematocrit: 42-48%
   - PSA: 0.5-2.5 ng/mL
2. Save to lab_results table
3. Run safety evaluation
4. Return results

Create API route: app/api/admin/simulate-labs/route.ts
- POST: Inject simulated lab results
```

### Prompt 10.4: Demo Mode Toggle

```
Add demo mode indicator and controls.

1. Add DEMO_MODE env variable

2. When DEMO_MODE=true:
   - Show "Demo Mode" badge in UI
   - Show time advancement controls on participant dashboard
   - Skip email verification
   - Show admin link in header

3. Create components/DemoControls.tsx
   - Floating panel with demo actions
   - Only visible in demo mode
```

---

## Phase 11: Polish

### Prompt 11.1: Loading States

```
Add loading states throughout the app.

1. Create components/ui/Spinner.tsx
2. Create components/ui/SkeletonCard.tsx

Add loading states to:
- Study builder (AI calls)
- Participant join flow
- Dashboard
- Assessment submission
```

### Prompt 11.2: Error Handling

```
Add error handling throughout.

1. Create components/ui/ErrorMessage.tsx
2. Create lib/utils/errors.ts with error types

Add error handling to:
- API routes (return proper error responses)
- Forms (show validation errors)
- AI calls (handle timeouts, failures)
- Database operations
```

### Prompt 11.3: Mobile Polish

```
Polish the mobile experience for participants.

Review and fix:
- Touch targets (min 44px)
- Font sizes (readable on mobile)
- Spacing and padding
- Form input sizes
- Button sizes
- Scroll behavior

Test at 375px width.
```

### Prompt 11.4: Study Complete Flow

```
Implement study completion.

When participant completes week 26 assessment:

1. Update participant status to 'completed'
2. Send completion email
3. Show completion page with:
   - Congratulations message
   - Option to view results

app/study/[studyId]/complete/page.tsx
- Show final message
- "View Results" button

app/study/[studyId]/results/page.tsx
- Show score trends over time
- Simple charts for qADAM, IIEF-5
- Only accessible after study complete
```

---

## Final Checklist

Before considering the demo complete:

- [ ] Sponsor can create a study with AI-generated protocol
- [ ] Sponsor can review and edit protocol
- [ ] Consent is generated from protocol
- [ ] Participant can join via invite link
- [ ] Registration and email verification work
- [ ] Consent flow with comprehension quiz works
- [ ] Screening with eligibility determination works
- [ ] Baseline PROs collect all instruments
- [ ] Dashboard shows progress accurately
- [ ] Ongoing assessments work
- [ ] Reminders can be triggered (manual for demo)
- [ ] Time advancement works for demo
- [ ] Lab simulation works
- [ ] Safety alerts generated for PHQ thresholds
- [ ] Study completion flow works
- [ ] Results viewable after completion
- [ ] Mobile experience is polished
- [ ] Deployed and working on Vercel
