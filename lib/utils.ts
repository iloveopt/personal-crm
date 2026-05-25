export const RELATIONSHIP_TYPES = [
  { value: 'investor', label: '投资人', color: 'bg-blue-100 text-blue-700' },
  { value: 'founder', label: '创业者', color: 'bg-purple-100 text-purple-700' },
  { value: 'client', label: '客户', color: 'bg-green-100 text-green-700' },
  { value: 'friend', label: '朋友', color: 'bg-orange-100 text-orange-700' },
  { value: 'other', label: '其他', color: 'bg-gray-100 text-gray-600' },
] as const

export function getRelationshipStyle(type?: string) {
  const found = RELATIONSHIP_TYPES.find((r) => r.value === type)
  return found || RELATIONSHIP_TYPES[RELATIONSHIP_TYPES.length - 1]
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
