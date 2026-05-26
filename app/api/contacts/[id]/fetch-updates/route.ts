import { NextResponse } from 'next/server'
import { addMockUpdate } from '@/lib/mock-crm'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const update = addMockUpdate(params.id)

    if (!update) {
      return NextResponse.json({ error: '联系人不存在' }, { status: 404 })
    }

    return NextResponse.json(update)
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
