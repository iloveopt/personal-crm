import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: contact, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    const { data: updates } = await supabaseAdmin
      .from('contact_updates')
      .select('*')
      .eq('contact_id', params.id)
      .order('fetched_at', { ascending: false })
      .limit(3)

    const { data: suggestions } = await supabaseAdmin
      .from('ai_suggestions')
      .select('*')
      .eq('contact_id', params.id)
      .order('created_at', { ascending: false })
      .limit(1)

    return NextResponse.json({ ...contact, updates, suggestions })
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { name, company, title, relationship_type, met_context, notes, last_contacted_at } = body

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .update({
        name, company, title, relationship_type, met_context, notes,
        last_contacted_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
