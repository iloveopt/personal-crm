import { NextResponse } from 'next/server'
import { addMockSuggestion } from '@/lib/mock-crm'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const suggestion = addMockSuggestion(params.id)

    if (!suggestion) {
      return NextResponse.json({ error: '联系人不存在' }, { status: 404 })
    }

    return NextResponse.json(suggestion)
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
