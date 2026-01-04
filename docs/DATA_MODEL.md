# Data Model

## Overview

Core entities for the observational study platform.

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Study     │       │ Participant │       │    User     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │───┐   │ id          │   ┌───│ id          │
│ name        │   │   │ study_id    │───┘   │ email       │
│ intervention│   └───│ user_id     │───────│ password    │
│ status      │       │ status      │       │ role        │
│ protocol    │       │ enrolled_at │       └─────────────┘
│ consent_doc │       │ current_week│
│ config      │       └──────┬──────┘
└─────────────┘              │
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Consent    │       │ Submission  │       │  LabResult  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ participant │       │ participant │       │ participant │
│ signed_at   │       │ timepoint   │       │ timepoint   │
│ signature   │       │ instrument  │       │ marker      │
│ document    │       │ responses   │       │ value       │
│ ip_address  │       │ score       │       │ received_at │
└─────────────┘       │ submitted_at│       └─────────────┘
                      └─────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │   Alert     │
                      ├─────────────┤
                      │ id          │
                      │ participant │
                      │ type        │
                      │ trigger     │
                      │ status      │
                      │ created_at  │
                      └─────────────┘
```

---

## Tables

### users

Platform users (both sponsors and participants).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | Unique email |
| encrypted_password | text | Hashed password |
| role | enum | 'sponsor', 'participant', 'admin' |
| first_name | text | First name |
| last_name | text | Last name |
| phone | text | Phone number (for SMS) |
| email_verified | boolean | Email verification status |
| created_at | timestamp | Account creation time |
| updated_at | timestamp | Last update time |

### studies

Study definitions created by sponsors.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| sponsor_id | uuid | FK to users |
| name | text | Study name |
| intervention | text | Intervention being studied |
| status | enum | 'draft', 'active', 'paused', 'completed' |
| protocol | jsonb | Full protocol specification |
| consent_document | text | Generated consent (markdown) |
| comprehension_questions | jsonb | Questions with correct answers |
| message_templates | jsonb | Generated reminder templates |
| config | jsonb | Study configuration (duration, etc.) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Last update time |

**protocol jsonb structure:**
```json
{
  "population": "Newly diagnosed hypogonadal men initiating TRT",
  "treatment_stage": "Treatment initiation",
  "primary_endpoint": {
    "name": "qADAM",
    "timepoint": "week_12"
  },
  "secondary_endpoints": ["IIEF-5", "PHQ-2", "energy", "adherence"],
  "duration_weeks": 26,
  "inclusion_criteria": [...],
  "exclusion_criteria": [...],
  "instruments": {...},
  "schedule": {...},
  "safety_thresholds": {...}
}
```

### participants

Enrollment records linking users to studies.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| study_id | uuid | FK to studies |
| user_id | uuid | FK to users |
| status | enum | 'invited', 'registered', 'consented', 'screening', 'enrolled', 'active', 'completed', 'withdrawn', 'ineligible' |
| enrolled_at | timestamp | When enrollment completed |
| current_week | integer | Current study week (for demo time compression) |
| screening_responses | jsonb | I/E screening answers |
| metadata | jsonb | Additional participant data |
| created_at | timestamp | Record creation |
| updated_at | timestamp | Last update |

### consents

Signed consent records.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| participant_id | uuid | FK to participants |
| document_version | text | Version of consent signed |
| document_hash | text | SHA256 of document content |
| signature_name | text | Typed signature |
| signature_timestamp | timestamp | When signed |
| ip_address | text | IP at signing |
| user_agent | text | Browser at signing |
| comprehension_results | jsonb | Question answers |
| created_at | timestamp | Record creation |

### submissions

PRO survey submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| participant_id | uuid | FK to participants |
| timepoint | text | e.g., 'baseline', 'week_2', 'week_4' |
| instrument | text | e.g., 'qADAM', 'IIEF-5', 'PHQ-2' |
| responses | jsonb | Question-by-question responses |
| scores | jsonb | Calculated scores (total, subscales) |
| duration_seconds | integer | Time to complete |
| submitted_at | timestamp | Submission time |
| created_at | timestamp | Record creation |

**responses jsonb structure:**
```json
{
  "q1": { "value": 2, "label": "Poor" },
  "q2": { "value": 3, "label": "Fair" },
  ...
}
```

**scores jsonb structure:**
```json
{
  "total": 28,
  "subscales": {
    "libido": 2,
    "energy": 5,
    "physical": 9,
    ...
  }
}
```

### lab_results

Lab data (received via webhook in production, simulated in demo).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| participant_id | uuid | FK to participants |
| timepoint | text | e.g., 'baseline', 'week_6' |
| marker | text | e.g., 'testosterone', 'hematocrit', 'psa' |
| value | numeric | Lab value |
| unit | text | e.g., 'ng/dL', '%' |
| reference_range | text | e.g., '300-1000' |
| abnormal_flag | text | 'H', 'L', or null |
| collection_date | date | When blood was drawn |
| received_at | timestamp | When we received result |
| created_at | timestamp | Record creation |

### alerts

Safety and operational alerts.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| participant_id | uuid | FK to participants |
| type | enum | 'safety', 'non_response', 'lab_threshold' |
| trigger_source | text | What triggered (e.g., 'PHQ-2', 'hematocrit') |
| trigger_value | text | The value that triggered |
| threshold | text | The threshold exceeded |
| message | text | Alert description |
| status | enum | 'open', 'acknowledged', 'resolved' |
| acknowledged_by | uuid | FK to users |
| acknowledged_at | timestamp | When acknowledged |
| resolution_notes | text | How resolved |
| resolved_at | timestamp | When resolved |
| created_at | timestamp | Alert creation |

### messages

Sent messages log.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| participant_id | uuid | FK to participants |
| type | enum | 'reminder', 'milestone', 're_engagement' |
| channel | enum | 'email', 'sms' |
| template_id | text | Which template used |
| subject | text | Email subject (if email) |
| body | text | Message content |
| status | enum | 'queued', 'sent', 'delivered', 'failed', 'bounced' |
| external_id | text | ID from Resend/Twilio |
| sent_at | timestamp | When sent |
| delivered_at | timestamp | When delivered (if known) |
| created_at | timestamp | Record creation |

---

## Enums

```sql
CREATE TYPE user_role AS ENUM ('sponsor', 'participant', 'admin');

CREATE TYPE study_status AS ENUM ('draft', 'active', 'paused', 'completed');

CREATE TYPE participant_status AS ENUM (
  'invited',
  'registered', 
  'consented',
  'screening',
  'enrolled',
  'active',
  'completed',
  'withdrawn',
  'ineligible'
);

CREATE TYPE alert_type AS ENUM ('safety', 'non_response', 'lab_threshold');

CREATE TYPE alert_status AS ENUM ('open', 'acknowledged', 'resolved');

CREATE TYPE message_channel AS ENUM ('email', 'sms');

CREATE TYPE message_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'bounced');
```

---

## Indexes

```sql
-- Fast lookup of participants by study
CREATE INDEX idx_participants_study ON participants(study_id);

-- Fast lookup of submissions by participant and timepoint
CREATE INDEX idx_submissions_participant ON submissions(participant_id);
CREATE INDEX idx_submissions_timepoint ON submissions(participant_id, timepoint);

-- Fast lookup of open alerts
CREATE INDEX idx_alerts_open ON alerts(status) WHERE status = 'open';

-- Fast lookup of messages by participant
CREATE INDEX idx_messages_participant ON messages(participant_id);
```

---

## Row Level Security (Supabase)

```sql
-- Participants can only see their own data
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants see own submissions" ON submissions
  FOR SELECT USING (
    participant_id IN (
      SELECT id FROM participants WHERE user_id = auth.uid()
    )
  );

-- Sponsors can see all data for their studies
CREATE POLICY "Sponsors see study submissions" ON submissions
  FOR SELECT USING (
    participant_id IN (
      SELECT p.id FROM participants p
      JOIN studies s ON p.study_id = s.id
      WHERE s.sponsor_id = auth.uid()
    )
  );
```

---

## Notes

1. **Protocol stored as JSONB:** The full protocol is stored as JSON rather than normalized tables. This keeps it flexible as protocol structure evolves.

2. **Scores calculated on submission:** PRO scores are calculated when submitted and stored, not calculated on read.

3. **Messages logged:** All outbound messages are logged for audit trail and debugging.

4. **Soft deletes not implemented:** For demo simplicity. Production would need soft delete for HIPAA compliance.

5. **Demo time compression:** The `current_week` on participants allows jumping forward in time for demo purposes.
