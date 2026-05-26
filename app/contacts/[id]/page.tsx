'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ContactDetail as ContactDetailType } from '@/lib/types'
import {
  addMockSuggestion,
  addMockUpdate,
  deleteContact,
  getContactDetail,
  sendFollowUpChat,
  updateContact,
} from '@/lib/mock-crm'
import {
  formatDaysAgo,
  getAvatarColor,
  getAvatarLetter,
  getPriorityStyle,
  getRelationshipStyle,
  INDUSTRY_OPTIONS,
  PRIORITY_TYPES,
  RELATIONSHIP_TYPES,
} from '@/lib/utils'

const demoDelay = () => new Promise((resolve) => setTimeout(resolve, 450))
const quickPrompts = [
  '帮我写一条自然的微信跟进消息',
  '判断现在联系他的理由',
  '给我一个 20 分钟请教型邀约',
]

type EditForm = {
  name: string
  company: string
  title: string
  industry: string
  location: string
  priority: 'high' | 'medium' | 'low'
  email: string
  tags: string
  relationship_type: string
  met_context: string
  notes: string
}

function toEditForm(contact: ContactDetailType): EditForm {
  return {
    name: contact.name,
    company: contact.company || '',
    title: contact.title || '',
    industry: contact.industry || '',
    location: contact.location || '',
    priority: contact.priority || 'medium',
    email: contact.email || '',
    tags: (contact.tags || []).join(', '),
    relationship_type: contact.relationship_type || '',
    met_context: contact.met_context || '',
    notes: contact.notes || '',
  }
}

export default function ContactDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [contact, setContact] = useState<ContactDetailType | null>(null)
  const [form, setForm] = useState<EditForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [fetchingUpdates, setFetchingUpdates] = useState(false)
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false)
  const [markingContact, setMarkingContact] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatting, setChatting] = useState(false)

  const loadContact = useCallback(() => {
    const detail = getContactDetail(params.id)
    setContact(detail)
    setForm(detail ? toEditForm(detail) : null)
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    loadContact()
  }, [loadContact])

  const handleFetchUpdates = async () => {
    setFetchingUpdates(true)
    try {
      await demoDelay()
      const update = addMockUpdate(params.id)
      if (update) loadContact()
      else alert('获取失败')
    } catch {
      alert('网络错误')
    } finally {
      setFetchingUpdates(false)
    }
  }

  const handleGenerateSuggestion = async () => {
    setGeneratingSuggestion(true)
    try {
      await demoDelay()
      const suggestion = addMockSuggestion(params.id)
      if (suggestion) loadContact()
      else alert('生成失败')
    } catch {
      alert('网络错误')
    } finally {
      setGeneratingSuggestion(false)
    }
  }

  const handleMarkContacted = async () => {
    setMarkingContact(true)
    try {
      await demoDelay()
      updateContact(params.id, { last_contacted_at: new Date().toISOString() })
      loadContact()
    } catch {
      alert('更新失败')
    } finally {
      setMarkingContact(false)
    }
  }

  const handleSave = () => {
    if (!form?.name.trim()) {
      alert('姓名不能为空')
      return
    }

    updateContact(params.id, {
      ...form,
      tags: form.tags
        .split(/[，,]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    })
    setEditMode(false)
    loadContact()
  }

  const handleDelete = () => {
    if (!confirm('确认删除这个联系人？')) return

    if (deleteContact(params.id)) {
      router.push('/dashboard')
    }
  }

  const handleSendChat = async (message = chatInput) => {
    if (!message.trim()) return

    setChatting(true)
    try {
      await demoDelay()
      sendFollowUpChat(params.id, message)
      setChatInput('')
      loadContact()
    } finally {
      setChatting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!contact || !form) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">找不到该联系人</p>
        <Link href="/dashboard" className="text-blue-600 text-sm mt-2 inline-block">返回联系人</Link>
      </div>
    )
  }

  const rel = getRelationshipStyle(contact.relationship_type)
  const priority = getPriorityStyle(contact.priority)
  const avatarColor = getAvatarColor(contact.name)
  const avatarLetter = getAvatarLetter(contact.name)
  const latestUpdate = contact.updates?.[0]
  const latestSuggestion = contact.suggestions?.[0]
  const latestNews = latestUpdate?.news || []
  const inputClass = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 bg-white'
  const labelClass = 'block text-xs font-medium text-gray-500 mb-1'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          返回联系人
        </Link>
        <Link href="/graph" className="text-sm text-blue-600 hover:text-blue-700">
          查看图谱
        </Link>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="bg-white rounded-lg p-5 border border-gray-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className={`w-14 h-14 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
              {avatarLetter}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{contact.name}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rel.color}`}>
                  {rel.label}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priority.color}`}>
                  {priority.label}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                {contact.company || '未填写公司'}{contact.title ? ` · ${contact.title}` : ''}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {contact.industry || '未填写行业'} · {contact.location || '未填写地区'} · 最后联系：{formatDaysAgo(contact.last_contacted_at)}
              </p>
              {contact.tags && contact.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {contact.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode((value) => !value)}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-blue-200 hover:text-blue-700"
              >
                {editMode ? '取消' : '编辑'}
              </button>
              <button
                onClick={handleDelete}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:border-red-200 hover:text-red-600"
              >
                删除
              </button>
            </div>
          </div>

          {editMode ? (
            <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>姓名</label>
                <input className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </div>
              <div>
                <label className={labelClass}>邮箱</label>
                <input className={inputClass} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </div>
              <div>
                <label className={labelClass}>公司</label>
                <input className={inputClass} value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
              </div>
              <div>
                <label className={labelClass}>职位</label>
                <input className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </div>
              <div>
                <label className={labelClass}>行业</label>
                <input
                  className={inputClass}
                  list="detail-industry-options"
                  value={form.industry}
                  onChange={(event) => setForm({ ...form, industry: event.target.value })}
                />
                <datalist id="detail-industry-options">
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <option key={industry} value={industry} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className={labelClass}>地区</label>
                <input className={inputClass} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
              </div>
              <div>
                <label className={labelClass}>关系</label>
                <select className={inputClass} value={form.relationship_type} onChange={(event) => setForm({ ...form, relationship_type: event.target.value })}>
                  <option value="">未分类</option>
                  {RELATIONSHIP_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>优先级</label>
                <select className={inputClass} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as EditForm['priority'] })}>
                  {PRIORITY_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>标签</label>
                <input className={inputClass} value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>认识场景</label>
                <input className={inputClass} value={form.met_context} onChange={(event) => setForm({ ...form, met_context: event.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>备注</label>
                <textarea className={`${inputClass} resize-none`} rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button onClick={handleSave} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  保存资料
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">认识场景</p>
                <p className="text-sm text-gray-700">{contact.met_context || '未记录'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">联系方式</p>
                <p className="text-sm text-gray-700">{contact.email || '未记录'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 font-medium mb-1">备注</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes || '未记录'}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleMarkContacted}
            disabled={markingContact}
            className="mt-5 rounded-md border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            {markingContact ? '记录中...' : '记录今天联系过'}
          </button>
        </div>

        <aside className="bg-white rounded-lg p-5 border border-gray-100 h-fit">
          <h2 className="font-semibold text-gray-900">相关联系人</h2>
          <div className="mt-3 space-y-2">
            {contact.relatedContacts.length > 0 ? contact.relatedContacts.map((item) => (
              <Link
                key={item.id}
                href={`/contacts/${item.id}`}
                className="block rounded-md border border-gray-100 p-3 hover:border-blue-200"
              >
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500 mt-1">{item.company || '未填写公司'} · {item.industry || '未填写行业'}</p>
              </Link>
            )) : (
              <p className="text-sm text-gray-400">暂无关联关系</p>
            )}
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="bg-white rounded-lg p-5 border border-gray-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">新闻与动态</h2>
            <button
              onClick={handleFetchUpdates}
              disabled={fetchingUpdates}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {fetchingUpdates ? '抓取中...' : '刷新动态'}
            </button>
          </div>

          {latestUpdate ? (
            <div className="mt-4">
              <p className="text-sm text-gray-700 leading-relaxed">{latestUpdate.summary}</p>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(latestUpdate.fetched_at).toLocaleDateString('zh-CN')} 更新
              </p>
              <div className="mt-4 grid gap-3">
                {latestNews.map((news) => (
                  <div key={news.id} className="rounded-md border border-gray-100 p-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span>{news.source}</span>
                      <span>{new Date(news.published_at).toLocaleDateString('zh-CN')}</span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">{news.topic}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900">{news.title}</p>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">{news.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400">暂无动态，点击刷新生成新闻摘要。</p>
          )}
        </div>

        <aside className="bg-white rounded-lg p-5 border border-gray-100 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">AI 联系建议</h2>
            <button
              onClick={handleGenerateSuggestion}
              disabled={generatingSuggestion}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {generatingSuggestion ? '生成中...' : '生成建议'}
            </button>
          </div>

          {latestSuggestion ? (
            <div className="mt-4 space-y-3">
              <div className="bg-blue-50 rounded-md p-3">
                <p className="text-xs text-blue-500 font-medium mb-1">现在联系的理由</p>
                <p className="text-sm text-gray-700">{latestSuggestion.reason}</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-xs text-gray-400 font-medium mb-1">建议开场白</p>
                <p className="text-sm text-gray-700 leading-relaxed">{latestSuggestion.opener}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-400">点击生成建议，AI 会给出跟进理由和开场白。</p>
          )}
        </aside>
      </section>

      <section className="bg-white rounded-lg p-5 border border-gray-100">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">AI Chat 跟进</h2>
            <p className="text-sm text-gray-500 mt-1">围绕这个联系人生成跟进策略、邀约话术和下一步行动。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendChat(prompt)}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto rounded-lg bg-gray-50 p-3">
          {contact.chats.length > 0 ? contact.chats.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[82%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-100'
              }`}
              >
                {message.content}
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-400">还没有对话，可以直接输入你的跟进问题。</p>
          )}
        </div>

        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            handleSendChat()
          }}
        >
          <input
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="例如：帮我写一条不突兀的跟进消息"
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
          />
          <button
            type="submit"
            disabled={chatting || !chatInput.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {chatting ? '生成中...' : '发送'}
          </button>
        </form>
      </section>
    </div>
  )
}
