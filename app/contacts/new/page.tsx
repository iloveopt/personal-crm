'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createContact } from '@/lib/mock-crm'
import { INDUSTRY_OPTIONS, PRIORITY_TYPES, RELATIONSHIP_TYPES } from '@/lib/utils'

export default function NewContact() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    company: '',
    title: '',
    industry: '',
    location: '',
    priority: 'medium',
    email: '',
    tags: '',
    relationship_type: '',
    met_context: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)

    try {
      const contact = createContact({
        ...form,
        priority: form.priority as 'high' | 'medium' | 'low',
        tags: form.tags
          .split(/[，,]/)
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      router.push(`/contacts/${contact.id}`)
    } catch {
      alert('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">添加联系人</h1>
        <p className="text-sm text-gray-500 mt-1">记录一个重要的人</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelClass}>姓名 *</label>
          <input
            className={inputClass}
            placeholder="张三"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>公司</label>
            <input
              className={inputClass}
              placeholder="公司名称"
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>职位</label>
            <input
              className={inputClass}
              placeholder="CEO / 投资总监"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>行业</label>
            <input
              className={inputClass}
              placeholder="AI 销售自动化"
              list="industry-options"
              value={form.industry}
              onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
            />
            <datalist id="industry-options">
              {INDUSTRY_OPTIONS.map((industry) => (
                <option key={industry} value={industry} />
              ))}
            </datalist>
          </div>
          <div>
            <label className={labelClass}>地区</label>
            <input
              className={inputClass}
              placeholder="Shanghai / Singapore"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>邮箱</label>
            <input
              className={inputClass}
              placeholder="name@company.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>标签</label>
            <input
              className={inputClass}
              placeholder="融资, SaaS, 出海"
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>关系类型</label>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_TYPES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, relationship_type: r.value }))}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all font-medium ${
                  form.relationship_type === r.value
                    ? `${r.color} border-transparent`
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>优先级</label>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_TYPES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, priority: r.value }))}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all font-medium ${
                  form.priority === r.value
                    ? `${r.color}`
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>认识场景</label>
          <input
            className={inputClass}
            placeholder="在 SLUSH 大会上认识，聊了出海方向"
            value={form.met_context}
            onChange={e => setForm(f => ({ ...f, met_context: e.target.value }))}
          />
        </div>

        <div>
          <label className={labelClass}>备注</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder="重要信息、共同话题、上次聊了什么..."
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.name.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              添加中...
            </span>
          ) : '添加联系人'}
        </button>
      </form>
    </div>
  )
}
