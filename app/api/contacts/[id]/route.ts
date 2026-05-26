import { NextResponse } from 'next/server'
import { deleteContact, getContactDetail, updateContact } from '@/lib/mock-crm'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const contact = getContactDetail(params.id)

    if (!contact) {
      return NextResponse.json({ error: '联系人不存在' }, { status: 404 })
    }

    return NextResponse.json(contact)
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
      last_contacted_at,
    } = body

    const contact = updateContact(params.id, {
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
      last_contacted_at,
    })

    if (!contact) {
      return NextResponse.json({ error: '联系人不存在' }, { status: 404 })
    }

    return NextResponse.json(contact)
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!deleteContact(params.id)) {
      return NextResponse.json({ error: '联系人不存在' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const err = e as Error
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
