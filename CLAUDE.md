# Observational Study Platform

## Project Overview

A platform for quickly setting up and running observational clinical studies. Sponsors (like telehealth companies) can create studies by entering an intervention, and the platform uses AI agents to generate complete study protocols. Participants join via invitation and complete PRO (Patient-Reported Outcome) surveys throughout the study.

## Demo Context

This is a functional demo, not a production system. It should demonstrate:
1. A sponsor creating a study (TRT as the example case)
2. A participant joining and completing the study

The demo uses real AI agents and real data flow, but with simulated external integrations (labs come via simulated webhook, not real Hone integration).

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (Postgres)
- **Auth:** Supabase Auth (email/password)
- **Email:** Resend
- **AI:** OpenAI API (gpt-4o for most calls, o1-mini for protocol generation)
- **Hosting:** Vercel
- **Language:** TypeScript

## Key Design Decisions

### Mobile-First Web App
- All participant-facing UI designed for mobile screens first
- PRO questions presented one at a time with large tap targets
- No native app - responsive web only

### Agent Architecture
The platform uses 4 LLM-powered agents + 1 code-based operations engine:

1. **Clinical Protocol Agent** - Designs studies (endpoints, I/E criteria, PROs, safety thresholds)
2. **Consent & Compliance Agent** - Generates informed consent documents
3. **Enrollment Agent** - Guides participants through registration, consent, screening
4. **Patient Communication Agent** - Handles all reminders and engagement messaging
5. **Operations Engine** - Code that executes agent-designed flows

See `docs/AGENTS.md` for full specifications.

### Data Flow
- Sponsors create studies → AI generates protocol → stored in database
- Participants invited → enrollment flow → baseline PROs → ongoing PROs
- Labs simulated via admin webhook trigger
- Safety thresholds evaluated on data submission

### Demo Features
- **Time compression:** "Advance to Week X" button to skip ahead in study timeline
- **Simulated labs:** Admin can inject lab results to simulate webhook
- **Real email:** Uses Resend for actual email delivery
- **No participant data visibility:** Participants see progress (complete/incomplete) but not scores until study ends

## Project Structure

```
/app
  /sponsor           # Sponsor-facing pages (study builder)
  /study             # Participant-facing pages (enrollment, PROs, dashboard)
  /admin             # Admin/demo controls (time advance, simulate labs)
  /api               # API routes
    /agents          # Agent endpoints
    /webhooks        # Simulated lab webhook
    
/components
  /ui                # Shared UI components
  /sponsor           # Sponsor-specific components
  /participant       # Participant-specific components
  
/lib
  /agents            # Agent implementations
  /db                # Database queries and types
  /utils             # Shared utilities
  
/docs                # Documentation (for Claude Code context)
```

## Environment Variables Needed

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run linter
```

## Development Workflow

**IMPORTANT:** Always run `npm run build` before pushing to GitHub. Vercel deploys from main branch, so broken builds block the deployment.

1. Make changes
2. Test locally with `npm run dev`
3. Run `npm run build` to verify production build succeeds
4. Commit and push to GitHub
5. Vercel auto-deploys from main

## Key Files to Reference

- `docs/AGENTS.md` - Detailed agent specifications and PRO instrument format
- `docs/USER_FLOWS.md` - Step-by-step user journeys
- `docs/DATA_MODEL.md` - Database schema

## Current Status

- [x] Project scaffolding
- [x] Deployed to Vercel
- [x] Supabase schema (study_platform namespace)
- [x] Sponsor UI shell (landing page, layout)
- [x] Study builder: Step 1 (intervention input)
- [x] Study builder: Step 2 (configure options)
- [x] Study builder: Step 3 (review protocol)
- [ ] Study builder: Step 4 (consent review)
- [ ] Study builder: Step 5 (study ready)
- [ ] Participant UI shell
- [ ] Clinical Protocol Agent
- [ ] Consent & Compliance Agent
- [ ] Enrollment Agent
- [ ] Patient Communication Agent
- [ ] Operations Engine
- [ ] Demo mode (time advancement)
- [ ] Simulated labs
