import { NextRequest, NextResponse } from 'next/server'
import { discoverStudy } from '@/lib/agents/client'

export async function POST(request: NextRequest) {
  try {
    const { intervention } = await request.json()

    if (!intervention || typeof intervention !== 'string') {
      return NextResponse.json(
        { error: 'Intervention is required and must be a string' },
        { status: 400 }
      )
    }

    console.log(`[Study Discovery] Starting discovery for: ${intervention}`)

    // Call the clinical-protocol agent with discover task
    const result = await discoverStudy(intervention)

    if (!result.success) {
      console.error('[Study Discovery] Agent call failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to discover study options' },
        { status: 500 }
      )
    }

    console.log('[Study Discovery] Successfully generated options')

    return NextResponse.json({
      success: true,
      data: result.data,
      usage: result.usage,
    })

  } catch (error) {
    console.error('[Study Discovery] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
