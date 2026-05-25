'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Contact } from '@/lib/supabase'
import { getRelationshipStyle, getAvatarColor, getAvatarLetter, formatDaysAgo } from '@/lib/utils'

function ContactCard({ contact }: { contact: Contact }) {
  const rel = getRelationshipStyle(contact.relationship_type)
  const avatarColor = getAvatarColor(contact.name)
  const avatarLetter = getAvatarLetter(contact.name)

  return (
    <Link href={`/contacts/${contact.id}`}>
      <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900">{contact.name}</span>
              {contact.relationship_type && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rel.color}`}>
                  {rel.label}
                </span>
              )}
            </div>
            {contact.company && (
              <p className="text-sm text-gray-500 truncate">{contact.company}{contact.title ? ` · ${contact.title}` : ''}</p>
            )}
          </div>
          <div className="text-xs text-gray-400 flex-shrink-0">
            {formatDaysAgo(contact.last_contacted_at)}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [followUps, setFollowUps] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/contacts').then(r => r.json()),
      fetch('/api/dashboard').then(r => r.json()),
    ]).then(([all, needFollowUp]) => {
      setContacts(all)
      setFollowUps(needFollowUp)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 需要跟进 */}
      {followUps.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-500 text-lg">🔔</span>
            <h2 className="font-semibold text-gray-900">需要跟进</h2>
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {followUps.length}
            </span>
          </div>
          <div className="space-y-2">
            {followUps.map(c => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        </section>
      )}

      {/* 全部联系人 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-semibold text-gray-900">全部联系人</h2>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
            {contacts.length}
          </span>
        </div>

        {contacts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">👤</p>
            <p className="text-sm">还没有联系人</p>
            <Link href="/contacts/new" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
              添加第一个 →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map(c => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
