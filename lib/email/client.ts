import { Resend } from 'resend'

// Lazy initialize Resend client to avoid build errors
let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

// Default from address
const FROM_EMAIL = process.env.FROM_EMAIL || 'Study Platform <noreply@resend.dev>'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const { to, subject, html, text, replyTo } = options

    const client = getResendClient()

    // In development, log instead of sending if no API key
    if (!client) {
      console.log('[Email] No RESEND_API_KEY, would send:', { to, subject })
      return {
        success: true,
        id: `dev-${Date.now()}`,
      }
    }

    const result = await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text: text || stripHtml(html),
      replyTo,
    })

    if (result.error) {
      console.error('[Email] Failed to send:', result.error)
      return {
        success: false,
        error: result.error.message,
      }
    }

    console.log('[Email] Sent successfully:', result.data?.id)
    return {
      success: true,
      id: result.data?.id,
    }

  } catch (error) {
    console.error('[Email] Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}
