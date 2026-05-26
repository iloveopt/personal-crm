import { NextResponse } from 'next/server'
import { listFollowUps } from '@/lib/mock-crm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(listFollowUps())
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
