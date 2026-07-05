import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('landing_content')
    .select('section, content')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result: Record<string, any> = {}
  for (const row of data || []) {
    result[row.section] = row.content
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' }
  })
}
