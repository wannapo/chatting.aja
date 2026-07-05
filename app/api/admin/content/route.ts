import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET: ambil semua konten landing page
export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('landing_content')
    .select('section, content')
    .order('section')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Ubah array jadi object { hero: {...}, stats: [...], ... }
  const result: Record<string, any> = {}
  for (const row of data || []) {
    result[row.section] = row.content
  }

  return NextResponse.json(result)
}

// POST: update satu section
export async function POST(req: NextRequest) {
  const { section, content } = await req.json()
  if (!section || !content) {
    return NextResponse.json({ error: 'section dan content wajib diisi' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('landing_content')
    .upsert({ section, content, updated_at: new Date().toISOString() }, { onConflict: 'section' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
