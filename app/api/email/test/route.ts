import { sendEmail } from '@/lib/email/client'
import { NextRequest, NextResponse } from 'next/server'

async function send(to: string) {
  return sendEmail({
    to,
    subject: 'N of One — Test Email',
    html: '<h2>Hello from N of One</h2><p>This is a test email confirming that Resend is configured correctly for <strong>nofone.us</strong>.</p><p style="color:#6B7280;font-size:14px;">If you received this, email delivery is working.</p>',
  })
}

export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get('to')

  if (!to) {
    return NextResponse.json({ error: 'Missing "to" query param, e.g. ?to=you@example.com' }, { status: 400 })
  }

  const result = await send(to)
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const { to } = await request.json()

  if (!to) {
    return NextResponse.json({ error: 'Missing "to" field' }, { status: 400 })
  }

  const result = await send(to)
  return NextResponse.json(result)
}
