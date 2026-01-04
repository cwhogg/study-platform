import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SCHEMA = 'study_platform'

// Public endpoint to get active studies open for enrollment
// Uses service client to bypass RLS since this is public data
export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data: studies, error: studiesError } = await supabase
      .schema(SCHEMA)
      .from('studies')
      .select('id, name, intervention')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10)

    if (studiesError) {
      console.error('Failed to get active studies:', studiesError)
      return NextResponse.json(
        { error: 'Failed to get studies' },
        { status: 500 }
      )
    }

    return NextResponse.json({ studies: studies || [] })

  } catch (error) {
    console.error('Get active studies error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
