export const RELATIONSHIP_TYPES = [
  { value: 'investor', label: '投资人', color: 'bg-blue-100 text-blue-700' },
  { value: 'founder', label: '创业者', color: 'bg-purple-100 text-purple-700' },
  { value: 'client', label: '客户', color: 'bg-green-100 text-green-700' },
  { value: 'friend', label: '朋友', color: 'bg-orange-100 text-orange-700' },
  { value: 'other', label: '其他', color: 'bg-gray-100 text-gray-600' },
] as const

export const PRIORITY_TYPES = [
  { value: 'high', label: '高优先级', color: 'bg-red-50 text-red-700 border-red-100' },
  { value: 'medium', label: '中优先级', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { value: 'low', label: '低优先级', color: 'bg-slate-50 text-slate-600 border-slate-200' },
] as const

export const INDUSTRY_OPTIONS = [
  'AI 投资',
  'AI 销售自动化',
  'AI 基础设施',
  'B2B SaaS',
  '企业服务投资',
  '零售科技',
  '企业服务',
] as const

export function getRelationshipStyle(type?: string) {
  const found = RELATIONSHIP_TYPES.find((r) => r.value === type)
  return found || RELATIONSHIP_TYPES[RELATIONSHIP_TYPES.length - 1]
}

export function getPriorityStyle(priority?: string) {
  const found = PRIORITY_TYPES.find((item) => item.value === priority)
  return found || PRIORITY_TYPES[1]
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-rose-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % colors.length
  }
  return colors[hash]
}

export function getAvatarLetter(name: string): string {
  if (!name) return '?'
  // Chinese: first char; English: first uppercase letter
  const firstChar = name[0]
  return firstChar.toUpperCase()
}

export function formatDaysAgo(dateStr?: string): string {
  if (!dateStr) return '从未联系'
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 30) return `${days}天前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return `${Math.floor(days / 365)}年前`
}
