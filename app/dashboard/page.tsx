'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Contact } from '@/lib/types'
import { listContacts, listFollowUps, resetDemoData, updateContact } from '@/lib/mock-crm'
import {
  getAvatarColor,
  getAvatarLetter,
  formatDaysAgo,
  getPriorityStyle,
  getRelationshipStyle,
  PRIORITY_TYPES,
  RELATIONSHIP_TYPES,
} from '@/lib/utils'

function ContactCard({
  contact,
  onMarked,
}: {
  contact: Contact
  onMarked: () => void
}) {
  const rel = getRelationshipStyle(contact.relationship_type)
  const priority = getPriorityStyle(contact.priority)
  const avatarColor = getAvatarColor(contact.name)
  const avatarLetter = getAvatarLetter(contact.name)

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href={`/contacts/${contact.id}`} className="flex flex-1 items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
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
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priority.color}`}>
                {priority.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">
              {contact.company || '未填写公司'}{contact.title ? ` · ${contact.title}` : ''}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {contact.industry || '未填写行业'} · {contact.location || '未填写地区'}
            </p>
          </div>
        </Link>
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
          <div className="text-xs text-gray-400 whitespace-nowrap">
            {formatDaysAgo(contact.last_contacted_at)}
          </div>
          <button
            onClick={() => {
              updateContact(contact.id, { last_contacted_at: new Date().toISOString() })
              onMarked()
            }}
            className="text-xs rounded-md border border-gray-200 px-2.5 py-1.5 text-gray-600 hover:border-blue-200 hover:text-blue-700"
          >
            记录联系
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [followUps, setFollowUps] = useState<Contact[]>([])
  const [query, setQuery] = useState('')
  const [relationshipFilter, setRelationshipFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    setContacts(listContacts())
    setFollowUps(listFollowUps())
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return contacts.filter((contact) => {
      const matchesQuery = !normalizedQuery || [
        contact.name,
        contact.company,
        contact.title,
        contact.industry,
        contact.location,
        ...(contact.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)

      const matchesRelationship =
        relationshipFilter === 'all' || contact.relationship_type === relationshipFilter
      const matchesPriority = priorityFilter === 'all' || contact.priority === priorityFilter

      return matchesQuery && matchesRelationship && matchesPriority
    })
  }, [contacts, priorityFilter, query, relationshipFilter])

  const industryStats = useMemo(() => {
    const counts = new Map<string, number>()
    contacts.forEach((contact) => {
      const industry = contact.industry || '其他'
      counts.set(industry, (counts.get(industry) || 0) + 1)
    })

    return Array.from(counts.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
  }, [contacts])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <p className="text-xs text-gray-400">联系人</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{contacts.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <p className="text-xs text-gray-400">需要跟进</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{followUps.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <p className="text-xs text-gray-400">覆盖行业</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{industryStats.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <p className="text-xs text-gray-400">高优先级</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {contacts.filter((contact) => contact.priority === 'high').length}
          </p>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-gray-100 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">联系人管理</h1>
            <p className="text-sm text-gray-500 mt-1">搜索、筛选、跟进，并从详情页进入新闻与 AI 跟进。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/graph"
              className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-200 hover:text-blue-700"
            >
              查看图谱
            </Link>
            <button
              onClick={() => {
                resetDemoData()
                loadData()
              }}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:border-blue-200 hover:text-blue-700"
            >
              重置 Demo
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_160px_160px]">
          <input
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="搜索姓名、公司、行业、标签"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={relationshipFilter}
            onChange={(event) => setRelationshipFilter(event.target.value)}
          >
            <option value="all">全部关系</option>
            {RELATIONSHIP_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <select
            className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="all">全部优先级</option>
            {PRIORITY_TYPES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
      </section>

      {followUps.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">需要跟进</h2>
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {followUps.length}
              </span>
            </div>
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {followUps.slice(0, 4).map((contact) => (
              <ContactCard key={contact.id} contact={contact} onMarked={loadData} />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-gray-900">全部联系人</h2>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">
              {filteredContacts.length}
            </span>
          </div>

          {filteredContacts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-lg border border-gray-100">
              <p className="text-sm">没有匹配的联系人</p>
              <Link href="/contacts/new" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
                添加联系人
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} onMarked={loadData} />
              ))}
            </div>
          )}
        </div>

        <aside className="bg-white rounded-lg border border-gray-100 p-4 h-fit">
          <h2 className="font-semibold text-gray-900">行业覆盖</h2>
          <div className="mt-4 space-y-3">
            {industryStats.map((item) => (
              <div key={item.industry}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.industry}</span>
                  <span className="text-gray-400">{item.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${Math.max(18, (item.count / contacts.length) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}
