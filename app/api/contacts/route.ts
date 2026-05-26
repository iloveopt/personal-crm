import { NextResponse } from 'next/server'
import { createContact, listContacts } from '@/lib/mock-crm'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json(listContacts())
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      name,
      company,
      title,
      industry,
      location,
      priority,
      tags,
      email,
      relationship_type,
      met_context,
      notes,
    } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: '姓名不能为空' }, { status: 400 })
    }

    return NextResponse.json(
      createContact({
        name,
        company,
        title,
        industry,
        location,
        priority,
        tags,
        email,
        relationship_type,
        met_context,
        notes,
      }),
      { status: 201 }
    )
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
