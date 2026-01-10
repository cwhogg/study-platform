# Proove Platform - Design & Positioning Archive

This document captures the complete design system, positioning, and UI/UX of "The Proove Platform" as it existed before the N of One rebrand. Use this to recreate the original design.

---

## Brand Positioning

### Name
**The Proove Platform**

### Tagline
"AI-Powered Clinical Research"

### Core Value Proposition
"Launch observational clinical studies in minutes with AI-generated protocols, consent documents, and patient communications."

### Target Audience
**Primary:** B2B sponsors (telehealth companies, pharma, biotech) who want to run observational clinical studies
**Secondary:** Participants who join studies

### Voice & Tone
- Professional and credible
- AI-forward but not overly technical
- Emphasizes speed ("in minutes") and automation
- Clinical terminology used appropriately
- Confident, authoritative

### Key Messages
1. Speed: "Launch clinical studies in minutes"
2. AI-powered: Five specialized agents handle the work
3. Validated: Uses validated PRO instruments
4. Safe: Automated safety monitoring
5. Complete: End-to-end from protocol to analysis

---

## Visual Identity

### Logo Specification

The Proove logo is a checkmark inside a circle with decorative data dots:

```
- Background: Solid circle with #1E40AF blue
- Inner ring: White stroke, 20% opacity, 2px width
- Checkmark: White, 8px stroke, rounded caps/joins
  - Path: M 28 52 L 42 66 L 74 30
- Data dots: Three white circles at varying opacities
  - Large dot: cx=70, cy=58, r=4, 50% opacity
  - Medium dot: cx=78, cy=46, r=3, 30% opacity
  - Small dot: cx=26, cy=36, r=3, 30% opacity
- Glow filter on checkmark for subtle luminosity
```

Component location: `/components/ui/ProoveLogo.tsx`

### Color Palette

#### Primary Colors
```css
--color-primary: #1E40AF;        /* Deep blue - main brand color */
--color-primary-light: #1E40AF;
--color-primary-dark: #4338CA;
--color-primary-50: rgba(99, 102, 241, 0.08);
--color-primary-100: rgba(99, 102, 241, 0.15);
--color-primary-900: #312E81;
```

#### Accent Color (Burnt Orange)
```css
--color-accent: #C2410C;         /* Burnt orange - secondary accent */
--color-accent-light: #EA580C;
--color-accent-dark: #9A3412;
--color-accent-50: rgba(194, 65, 12, 0.1);
```

#### Extended Palette
```css
/* Teal */
--color-teal: #0D9488;
--color-teal-light: #14B8A6;

/* Forest Green */
--color-forest: #15803D;
--color-forest-light: #22C55E;

/* Wine */
--color-wine: #881337;
--color-wine-light: #BE123C;

/* Cyan (used in case study section) */
#0891B2 - Case study background
```

#### Neutrals
```css
--color-surface: #FFFFFF;
--color-surface-elevated: #F8FAFC;
--color-surface-sunken: #F1F5F9;
--color-text-primary: #0F172A;    /* Near black */
--color-text-secondary: #475569;  /* Medium slate */
--color-text-tertiary: #64748B;   /* Light slate */
--color-border: #E2E8F0;
```

#### Status Colors
```css
--color-success: #059669;   /* Emerald */
--color-warning: #D97706;   /* Amber */
--color-danger: #DC2626;    /* Red */
```

### Typography

#### Font Stack
```css
/* Display/Headlines - Elegant serif */
--font-display: Instrument Serif, Georgia, 'Times New Roman', serif;

/* Body - Clean modern sans */
--font-body: DM Sans, system-ui, -apple-system, sans-serif;

/* Monospace - For data/code */
--font-mono: JetBrains Mono, 'SF Mono', 'Fira Code', monospace;
```

#### Font Imports (Next.js)
```typescript
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-satoshi",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});
```

#### Heading Styles
```css
.heading-1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.heading-2 {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.heading-3 {
  font-family: var(--font-body);
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  font-weight: 600;
  line-height: 1.3;
}
```

### Spacing & Sizing

#### Border Radius
```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px - buttons */
--radius-2xl: 1.25rem;   /* 20px - cards */
--radius-full: 9999px;   /* pills */
```

#### Shadows
```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
--shadow-glow: 0 0 20px rgba(99, 102, 241, 0.12);
```

---

## UI Components

### Buttons

#### Primary Button
```css
.btn-primary {
  background: #1E40AF;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.25);
  border-radius: var(--radius-xl);
  padding: 0.75rem 1.5rem;
  font-weight: 500;
}

.btn-primary:hover {
  background: #1D4ED8;
  box-shadow: 0 10px 15px -3px rgba(30, 64, 175, 0.3);
  transform: translateY(-1px);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}
```

#### Button Sizes
- Small: `padding: 0.5rem 1rem; font-size: 0.875rem;`
- Medium: `padding: 0.75rem 1.5rem; font-size: 0.9375rem;`
- Large: `padding: 1rem 2rem; min-height: 52px;` (mobile touch target)

### Cards

```css
.card {
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 1.25rem;  /* rounded-2xl */
  box-shadow: var(--shadow-sm);
}

.card:hover {
  border-color: rgba(30, 64, 175, 0.3);  /* primary color at 30% */
  box-shadow: var(--shadow-lg);
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
}

/* Variants */
.badge-primary { background: rgba(99, 102, 241, 0.08); color: #1E40AF; }
.badge-success { background: rgba(5, 150, 105, 0.1); color: #059669; }
.badge-warning { background: rgba(217, 119, 6, 0.1); color: #D97706; }
.badge-danger { background: rgba(220, 38, 38, 0.1); color: #DC2626; }
```

### Progress Bar
```css
.progress-bar {
  height: 6px;
  background: #F1F5F9;
  border-radius: 9999px;
}

.progress-bar-fill {
  background: linear-gradient(90deg, #1E40AF 0%, #C2410C 100%);
  /* Blue to orange gradient */
}
```

---

## Homepage Structure

### Header
- Sticky, white background with backdrop blur
- Logo + "The Proove Platform" text on left
- "Demo Mode" label on right
- Height: 64px (h-16)

### Hero Section
- Light slate background (#F8FAFC / bg-slate-50)
- Decorative blur blobs: blue top-right, orange center-left, green bottom-right
- Badge: "AI-Powered Clinical Research" with sparkle icon
- Headline: "Proove [Everything/Something]" with strikethrough animation
  - "Everything" in burnt orange, positioned above
  - "Something" in light slate with hand-drawn orange strikethrough SVG
- Subheadline: "Launch clinical observational studies in minutes..."
- Two CTA cards side by side:
  - "Create a Study" (blue icon) → /sponsor
  - "Join a Study" (orange icon) → /study

### How It Works Section
- 5-step horizontal layout on desktop
- Step numbers in circles (01-05)
- Each step has colored icon, title, description
- Steps: Define Intervention → Design Protocol → Enroll Participants → Collect Outcomes → Analyze Results

### AI Agents Section
- Gray background
- "Five Specialized Agents" headline
- 5 cards: Protocol, Safety, Consent, Enrollment, Engagement
- Each with distinct icon color

### Case Study Section
- Cyan background (#0891B2)
- "TRT Outcomes Study" demo case
- Two-column: description left, stats card right
- Stats: Primary Endpoint, Population, Assessments, "Generated in ~2 min"

### Features Section
- Checklist format with green checkmarks
- Features: Validated PRO Instruments, Auto-Generated Consent, Safety Monitoring, Smart Engagement

### Footer CTA
- "Ready to explore?" with two buttons
- Gray background

---

## Animations

### Fade In Up
```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Strikethrough Animation
The hero uses a hand-drawn SVG strikethrough that animates from left to right:
```css
@keyframes draw-strike {
  to {
    stroke-dashoffset: 0;
  }
}
```

### Stagger Children
Children animate in sequence with 50ms delays between each.

### Pulse Glow
Used for active status indicators:
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
}
```

---

## Mobile-First Patterns

### Container Widths
- `container-narrow`: max-width 32rem
- `container-base`: max-width 48rem
- `container-wide`: max-width 72rem

### Mobile Components
- `MobileContainer`: max-width md (28rem) for participant pages
- `MobileBottomAction`: Fixed bottom button with safe-area padding
- Large touch targets: minimum 44px, buttons use 52px

### Safe Areas
```css
.safe-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}
```

---

## Key Files Reference

### Styling
- `/app/globals.css` - Complete design system CSS
- `/app/layout.tsx` - Font imports, metadata

### Components
- `/components/ui/ProoveLogo.tsx` - Logo component
- `/components/ui/Button.tsx` - Button variants
- `/components/ui/Card.tsx` - Card variants
- `/components/ui/Badge.tsx` - Status badges
- `/components/ui/Progress.tsx` - Progress indicators
- `/components/ui/Input.tsx` - Form inputs
- `/components/ui/MobileContainer.tsx` - Mobile layout components

### Pages
- `/app/page.tsx` - Homepage
- `/app/sponsor/` - Sponsor flow
- `/app/study/` - Participant flow

---

## Metadata

```typescript
export const metadata: Metadata = {
  title: "Study Platform | AI-Powered Clinical Research",
  description: "Launch observational clinical studies in minutes with AI-generated protocols, consent documents, and patient communications.",
  keywords: ["clinical research", "observational study", "PRO", "patient reported outcomes", "AI", "healthcare"],
};
```

---

## Recreating This Design

To recreate the Proove Platform design:

1. **Install fonts**: Instrument Serif, DM Sans, JetBrains Mono from Google Fonts
2. **Apply globals.css**: Contains complete design tokens and component styles
3. **Use the color palette**: Primary blue (#1E40AF), accent orange (#C2410C)
4. **Follow the typography**: Serif headlines, sans body, mono for data
5. **Apply card/button patterns**: rounded-2xl, shadow-sm/lg, hover states
6. **Use the animation system**: fade-in-up, stagger children, pulse-glow
7. **Keep mobile-first**: Large touch targets, bottom-fixed actions, safe areas

The design aims for "clinical credibility meets modern research" - professional but not cold, AI-forward but trustworthy.
