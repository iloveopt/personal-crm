'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Contact, ContactUpdate, AiSuggestion } from '@/lib/supabase'
import { getRelationshipStyle, getAvatarColor, getAvatarLetter, formatDaysAgo } from '@/lib/utils'

type ContactDetail = Contact & {
  updates: ContactUpdate[]
  suggestions: AiSuggestion[]
}

export default function ContactDetail({ params }: { params: { id: string } }) {
  const [contact, setContact] = useState<ContactDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchingUpdates, setFetchingUpdates] = useState(false)
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false)
  const [markingContact, setMarkingContact] = useState(false)

  const loadContact = useCallback(async () => {
    const res = await fetch(`/api/contacts/${params.id}`)
    if (res.ok) {
      const data = await res.json()
      setContact(data)
    }
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    loadContact()
  }, [loadContact])

  const handleFetchUpdates = async () => {
    setFetchingUpdates(true)
    try {
      const res = await fetch(`/api/contacts/${params.id}/fetch-updates`, { method: 'POST' })
      if (res.ok) await loadContact()
      else {
        const err = await res.json()
        alert(err.error || '获取失败')
      }
    } catch {
      alert('网络错误')
    } finally {
      setFetchingUpdates(false)
    }
  }

  const handleGenerateSuggestion = async () => {
    setGeneratingSuggestion(true)
    try {
      const res = await fetch(`/api/contacts/${params.id}/ai-suggest`, { method: 'POST' })
      if (res.ok) await loadContact()
      else {
        const err = await res.json()
        alert(err.error || '生成失败')
      }
    } catch {
      alert('网络错误')
    } finally {
      setGeneratingSuggestion(false)
    }
  }

  const handleMarkContacted = async () => {
    setMarkingContact(true)
    try {
      const res = await fetch(`/api/contacts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_contacted_at: new Date().toISOString() }),
      })
      if (res.ok) await loadContact()
    } catch {
      alert('更新失败')
    } finally {
      setMarkingContact(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">找不到该联系人</p>
        <Link href="/" className="text-blue-600 text-sm mt-2 inline-block">← 返回</Link>
      </div>
    )
  }

  const rel = getRelationshipStyle(contact.relationship_type)
  const avatarColor = getAvatarColor(contact.name)
  const avatarLetter = getAvatarLetter(contact.name)
  const latestUpdate = contact.updates?.[0]
  const latestSuggestion = contact.suggestions?.[0]

  return (
    <div className="space-y-4">
      {/* 返回 */}
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        ← 返回
      </Link>

      {/* 基本信息卡片 */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
            {avatarLetter}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{contact.name}</h1>
              {contact.relationship_type && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rel.color}`}>
                  {rel.label}
                </span>
              )}
            </div>
            {contact.company && (
              <p className="text-gray-600 mt-0.5">
                {contact.company}{contact.title ? ` · ${contact.title}` : ''}
              </p>
            )}
            <p className="text-sm text-gray-400 mt-1">
              最后联系：{formatDaysAgo(contact.last_contacted_at)}
            </p>
          </div>
        </div>

        {contact.met_context && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400 font-medium mb-1">认识场景</p>
            <p className="text-sm text-gray-600">{contact.met_context}</p>
          </div>
        )}

        {contact.notes && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 font-medium mb-1">备注</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{contact.notes}</p>
          </div>
        )}

        <button
          onClick={handleMarkContacted}
          disabled={markingContact}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
        >
          {markingContact ? '记录中...' : '✓ 记录今天联系过'}
        </button>
      </div>

      {/* 最近动态 */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">最近动态</h2>
          <button
            onClick={handleFetchUpdates}
            disabled={fetchingUpdates}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 flex items-center gap-1"
          >
            {fetchingUpdates ? (
              <>
                <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block" />
                抓取中...
              </>
            ) : '🔍 更新动态'}
          </button>
        </div>

        {latestUpdate ? (
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">{latestUpdate.summary}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(latestUpdate.fetched_at).toLocaleDateString('zh-CN')} 更新
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">暂无动态，点击右上方按钮获取</p>
        )}
      </div>

      {/* AI 建议 */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">AI 联系建议</h2>
          <button
            onClick={handleGenerateSuggestion}
            disabled={generatingSuggestion}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 flex items-center gap-1"
          >
            {generatingSuggestion ? (
              <>
                <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block" />
                生成中...
              </>
            ) : '✨ 生成建议'}
          </button>
        </div>

        {latestSuggestion ? (
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-500 font-medium mb-1">现在联系的理由</p>
              <p className="text-sm text-gray-700">{latestSuggestion.reason}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-medium mb-1">建议开场白</p>
              <p className="text-sm text-gray-700 leading-relaxed">{latestSuggestion.opener}</p>
            </div>
            <p className="text-xs text-gray-400">
              {new Date(latestSuggestion.created_at).toLocaleDateString('zh-CN')} 生成
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">点击右上方按钮，AI 帮你想怎么开口</p>
        )}
      </div>

      {/* 历史动态 */}
      {contact.updates && contact.updates.length > 1 && (
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">历史动态</h2>
          <div className="space-y-3">
            {contact.updates.slice(1).map(u => (
              <div key={u.id} className="border-l-2 border-gray-100 pl-3">
                <p className="text-sm text-gray-600">{u.summary}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(u.fetched_at).toLocaleDateString('zh-CN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
