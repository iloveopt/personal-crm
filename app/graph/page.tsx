'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { Contact, NetworkGraph } from '@/lib/types'
import { getNetworkGraph } from '@/lib/mock-crm'
import { getRelationshipStyle } from '@/lib/utils'

type ViewMode = 'people' | 'industry'

const relationColors: Record<string, string> = {
  investor: '#2563eb',
  founder: '#7c3aed',
  client: '#16a34a',
  friend: '#ea580c',
  other: '#64748b',
}

function getNodeColor(contact: Contact) {
  return relationColors[contact.relationship_type || 'other'] || relationColors.other
}

export default function GraphPage() {
  const [mode, setMode] = useState<ViewMode>('people')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [graph, setGraph] = useState<NetworkGraph | null>(null)

  useEffect(() => {
    setGraph(getNetworkGraph())
  }, [])

  const peoplePositions = useMemo(() => {
    if (!graph) return []

    const centerX = 330
    const centerY = 235
    const radius = 175

    return graph.contacts.map((contact, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(graph.contacts.length, 1) - Math.PI / 2
      return {
        contact,
        x: Math.round(centerX + Math.cos(angle) * radius),
        y: Math.round(centerY + Math.sin(angle) * radius),
      }
    })
  }, [graph])

  if (!graph) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const positionById = new Map(peoplePositions.map((item) => [item.contact.id, item]))
  const selectedContact = graph.contacts.find((contact) => contact.id === selectedId)
  const selectedIndustry = graph.industries.find((industry) => industry.id === selectedId)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">返回联系人</Link>
          <h1 className="mt-2 text-xl font-bold text-gray-900">关系与行业图谱</h1>
          <p className="text-sm text-gray-500 mt-1">查看人脉之间的连接，以及这些联系人覆盖的行业版图。</p>
        </div>
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => {
              setMode('people')
              setSelectedId(null)
            }}
            className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'people' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            联系人图谱
          </button>
          <button
            onClick={() => {
              setMode('industry')
              setSelectedId(null)
            }}
            className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'industry' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            行业图谱
          </button>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
          {mode === 'people' ? (
            <svg viewBox="0 0 660 470" className="h-[520px] w-full max-h-[70vh]">
              <rect width="660" height="470" fill="#f8fafc" />
              <circle cx="330" cy="235" r="54" fill="#111827" />
              <text x="330" y="230" textAnchor="middle" fontSize="16" fontWeight="700" fill="#ffffff">我</text>
              <text x="330" y="250" textAnchor="middle" fontSize="11" fill="#d1d5db">Personal CRM</text>

              {peoplePositions.map(({ contact, x, y }) => (
                <line
                  key={`self-${contact.id}`}
                  x1="330"
                  y1="235"
                  x2={x}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="5 6"
                />
              ))}

              {graph.edges.map((edge) => {
                const source = positionById.get(edge.source)
                const target = positionById.get(edge.target)
                if (!source || !target) return null

                return (
                  <g key={edge.id}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="#2563eb"
                      strokeOpacity="0.38"
                      strokeWidth={Math.max(1.5, edge.strength / 24)}
                    />
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 6}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#475569"
                    >
                      {edge.label}
                    </text>
                  </g>
                )
              })}

              {peoplePositions.map(({ contact, x, y }) => {
                const isSelected = selectedId === contact.id
                return (
                  <g
                    key={contact.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(contact.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') setSelectedId(contact.id)
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 32 : 28}
                      fill={getNodeColor(contact)}
                      stroke={isSelected ? '#111827' : '#ffffff'}
                      strokeWidth="4"
                    />
                    <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#ffffff">
                      {contact.name.slice(0, 2)}
                    </text>
                    <text x={x} y={y + 46} textAnchor="middle" fontSize="12" fontWeight="600" fill="#111827">
                      {contact.name}
                    </text>
                    <text x={x} y={y + 62} textAnchor="middle" fontSize="11" fill="#64748b">
                      {contact.industry}
                    </text>
                  </g>
                )
              })}
            </svg>
          ) : (
            <svg viewBox="0 0 660 470" className="h-[520px] w-full max-h-[70vh]">
              <rect width="660" height="470" fill="#f8fafc" />
              {graph.industryLinks.map((link) => {
                const source = graph.industries.find((item) => item.id === link.source)
                const target = graph.industries.find((item) => item.id === link.target)
                if (!source || !target) return null

                return (
                  <g key={`${link.source}-${link.target}`}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="#0f766e"
                      strokeOpacity="0.35"
                      strokeWidth={Math.max(1.5, link.strength / 22)}
                    />
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 8}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#475569"
                    >
                      {link.label}
                    </text>
                  </g>
                )
              })}

              {graph.industries.map((industry, index) => {
                const isSelected = selectedId === industry.id
                const radius = 32 + industry.contacts.length * 7
                const fill = ['#0f766e', '#2563eb', '#7c3aed', '#ca8a04', '#dc2626', '#475569'][index % 6]

                return (
                  <g
                    key={industry.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(industry.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') setSelectedId(industry.id)
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={industry.x}
                      cy={industry.y}
                      r={isSelected ? radius + 5 : radius}
                      fill={fill}
                      fillOpacity="0.9"
                      stroke={isSelected ? '#111827' : '#ffffff'}
                      strokeWidth="4"
                    />
                    <text x={industry.x} y={industry.y - 2} textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">
                      {industry.name}
                    </text>
                    <text x={industry.x} y={industry.y + 16} textAnchor="middle" fontSize="11" fill="#e2e8f0">
                      {industry.contacts.length} 人
                    </text>
                  </g>
                )
              })}
            </svg>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-gray-100 bg-white p-4">
            <h2 className="font-semibold text-gray-900">当前选择</h2>
            {mode === 'people' && selectedContact ? (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-900">{selectedContact.name}</p>
                <p className="mt-1 text-sm text-gray-500">{selectedContact.company} · {selectedContact.title}</p>
                <p className="mt-2 text-sm text-gray-600">{selectedContact.industry} · {selectedContact.location}</p>
                <Link href={`/contacts/${selectedContact.id}`} className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700">
                  进入联系人详情
                </Link>
              </div>
            ) : mode === 'industry' && selectedIndustry ? (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-900">{selectedIndustry.name}</p>
                <p className="mt-1 text-sm text-gray-500">{selectedIndustry.contacts.length} 位联系人</p>
                <div className="mt-3 space-y-2">
                  {selectedIndustry.contacts.map((contact) => (
                    <Link key={contact.id} href={`/contacts/${contact.id}`} className="block rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:text-blue-700">
                      {contact.name} · {contact.company}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-400">点击图谱节点查看详情。</p>
            )}
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-4">
            <h2 className="font-semibold text-gray-900">关系说明</h2>
            <div className="mt-3 space-y-3">
              {mode === 'people' ? graph.edges.map((edge) => {
                const source = graph.contacts.find((contact) => contact.id === edge.source)
                const target = graph.contacts.find((contact) => contact.id === edge.target)
                if (!source || !target) return null
                return (
                  <div key={edge.id} className="rounded-md bg-gray-50 p-3">
                    <p className="text-sm font-medium text-gray-900">{source.name} → {target.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{edge.label} · 强度 {edge.strength}</p>
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed">{edge.reason}</p>
                  </div>
                )
              }) : graph.industryLinks.map((link) => (
                <div key={`${link.source}-${link.target}`} className="rounded-md bg-gray-50 p-3">
                  <p className="text-sm font-medium text-gray-900">{link.source} → {link.target}</p>
                  <p className="mt-1 text-xs text-gray-500">{link.label} · 强度 {link.strength}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-4">
            <h2 className="font-semibold text-gray-900">图例</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {['investor', 'founder', 'client', 'friend'].map((type) => {
                const style = getRelationshipStyle(type)
                return (
                  <div key={type} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="h-3 w-3 rounded-full" style={{ background: relationColors[type] }} />
                    {style.label}
                  </div>
                )
              })}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
