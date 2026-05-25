'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RELATIONSHIP_TYPES } from '@/lib/utils'

export default function NewContact() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    company: '',
    title: '',
    relationship_type: '',
    met_context: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/contacts/${data.id}`)
      } else {
        alert(data.error || '添加失败')
      }
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

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-2 gap-3">
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
