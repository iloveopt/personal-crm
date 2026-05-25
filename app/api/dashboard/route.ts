import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const FOLLOW_UP_DAYS = 30

export async function GET() {
  try {
    const cutoff = new Date(Date.now() - FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .or(`last_contacted_at.lt.${cutoff},last_contacted_at.is.null`)
      .order('last_contacted_at', { ascending: true, nullsFirst: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
