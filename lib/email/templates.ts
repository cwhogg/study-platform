/**
 * Email Templates
 *
 * Base HTML template and variable substitution for emails.
 */

export interface TemplateVariables {
  firstName?: string
  studyName?: string
  timepoint?: string
  link?: string
  daysRemaining?: string | number
  count?: string | number
  nextDate?: string
  progress?: string
  [key: string]: string | number | undefined
}

/**
 * Base HTML email template
 */
export function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Study Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #4f46e5;
    }
    h1 {
      color: #111;
      font-size: 24px;
      margin-bottom: 16px;
    }
    p {
      margin: 16px 0;
      color: #444;
    }
    .button {
      display: inline-block;
      background-color: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
    }
    .button:hover {
      background-color: #4338ca;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
    .footer a {
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Study Platform</div>
    </div>
    ${content}
    <div class="footer">
      <p>You're receiving this email because you're enrolled in a research study.</p>
      <p><a href="{{unsubscribeLink}}">Unsubscribe</a> | <a href="{{preferencesLink}}">Email preferences</a></p>
    </div>
  </div>
</body>
</html>
`.trim()
}

/**
 * Replace template variables with actual values
 */
export function renderTemplate(template: string, variables: TemplateVariables): string {
  let rendered = template

  // Replace all {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    rendered = rendered.replace(pattern, String(value ?? ''))
  }

  // Remove any remaining unreplaced variables
  rendered = rendered.replace(/\{\{[^}]+\}\}/g, '')

  return rendered
}

/**
 * Create a CTA button HTML
 */
export function ctaButton(text: string, link: string): string {
  return `<a href="${link}" class="button" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">${text}</a>`
}

/**
 * Convert markdown-like body to HTML
 */
export function bodyToHtml(body: string, variables: TemplateVariables): string {
  // Replace variables first
  let html = renderTemplate(body, variables)

  // Convert line breaks to paragraphs
  const paragraphs = html.split('\n\n').filter(p => p.trim())
  html = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n')

  return html
}

/**
 * Build a complete email from template content
 */
export function buildEmail(
  subject: string,
  body: string,
  variables: TemplateVariables,
  ctaText?: string,
  ctaLink?: string
): { subject: string; html: string } {
  // Render subject with variables
  const renderedSubject = renderTemplate(subject, variables)

  // Convert body to HTML
  let content = bodyToHtml(body, variables)

  // Add CTA button if provided
  if (ctaText && ctaLink) {
    const renderedLink = renderTemplate(ctaLink, variables)
    content += `<p style="text-align: center;">${ctaButton(ctaText, renderedLink)}</p>`
  }

  // Wrap in base template
  const html = baseTemplate(content)

  // Render any remaining variables in the full HTML
  const renderedHtml = renderTemplate(html, {
    ...variables,
    unsubscribeLink: variables.unsubscribeLink || '#',
    preferencesLink: variables.preferencesLink || '#',
  })

  return {
    subject: renderedSubject,
    html: renderedHtml,
  }
}

/**
 * Pre-built email templates for common messages
 */
export const emailTemplates = {
  /**
   * Enrollment confirmation email
   */
  enrollmentConfirmation: (variables: TemplateVariables & {
    nextCheckInDate: string
    dashboardLink: string
  }) => buildEmail(
    'Welcome to {{studyName}}!',
    `Hi {{firstName}},

Thank you for enrolling in {{studyName}}! Your participation will help improve treatment for future patients.

What happens next:
- Your next check-in is on {{nextCheckInDate}}
- We'll send you a reminder when it's time
- Each check-in takes about 5 minutes

You can view your study progress anytime in your dashboard.`,
    variables,
    'View Dashboard',
    '{{dashboardLink}}'
  ),

  /**
   * Assessment reminder email
   */
  assessmentReminder: (variables: TemplateVariables & {
    assessmentLink: string
  }) => buildEmail(
    'Your {{timepoint}} check-in is ready',
    `Hi {{firstName}},

It's time for your {{timepoint}} check-in for {{studyName}}.

This quick survey helps us track your progress and takes about 5 minutes to complete.`,
    variables,
    'Complete Check-in',
    '{{assessmentLink}}'
  ),

  /**
   * Study completion email
   */
  studyComplete: (variables: TemplateVariables & {
    resultsLink: string
  }) => buildEmail(
    'Congratulations! You\'ve completed {{studyName}}',
    `Hi {{firstName}},

Congratulations on completing {{studyName}}!

Thank you for your dedication over the past months. Your participation has made a real contribution to research that will help future patients.

You can now view your personal results and see how your responses changed over the course of the study.`,
    variables,
    'View Your Results',
    '{{resultsLink}}'
  ),
}
