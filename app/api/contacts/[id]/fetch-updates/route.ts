import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { searchPerson } from '@/lib/search'
import { summarizeUpdates } from '@/lib/ai'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .select('name, company')
      .eq('id', params.id)
      .single()

    if (contactError || !contact) {
      return NextResponse.json({ error: '联系人不存在' }, { status: 404 })
    }

    const rawResults = await searchPerson(contact.name, contact.company)
    const summary = await summarizeUpdates(contact.name, contact.company || '', rawResults)

    const { data: update, error } = await supabaseAdmin
      .from('contact_updates')
      .insert({
        contact_id: params.id,
        raw_results: { text: rawResults },
        summary,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(update)
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
