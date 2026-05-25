import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generateSuggestion } from '@/lib/ai'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (contactError || !contact) {
      return NextResponse.json({ error: '联系人不存在' }, { status: 404 })
    }

    const { data: latestUpdate } = await supabaseAdmin
      .from('contact_updates')
      .select('summary')
      .eq('contact_id', params.id)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single()

    const suggestion = await generateSuggestion({
      name: contact.name,
      company: contact.company,
      met_context: contact.met_context,
      relationship_type: contact.relationship_type,
      notes: contact.notes,
      last_contacted_at: contact.last_contacted_at,
      recent_update: latestUpdate?.summary,
    })

    const { data, error } = await supabaseAdmin
      .from('ai_suggestions')
      .insert({ contact_id: params.id, ...suggestion })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
