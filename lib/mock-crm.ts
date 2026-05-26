import type {
  AiSuggestion,
  ChatMessage,
  Contact,
  ContactDetail,
  ContactUpdate,
  IndustryLink,
  NetworkGraph,
  NewsItem,
  RelationshipEdge,
} from '@/lib/types'

type CrmState = {
  schemaVersion: number
  contacts: Contact[]
  updates: ContactUpdate[]
  suggestions: AiSuggestion[]
  chats: ChatMessage[]
  relationships: RelationshipEdge[]
}

type ContactInput = Pick<
  Contact,
  | 'name'
  | 'company'
  | 'title'
  | 'industry'
  | 'location'
  | 'priority'
  | 'tags'
  | 'email'
  | 'relationship_type'
  | 'met_context'
  | 'notes'
>

const STORAGE_KEY = 'personal-crm-demo-state'
const STATE_VERSION = 2
const FOLLOW_UP_DAYS = 30

let serverState: CrmState | null = null

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function makeNews(contact: Contact, index = 0): NewsItem[] {
  const company = contact.company || contact.name
  const industry = contact.industry || '企业服务'
  const baseDate = index === 0 ? 4 : 1

  return [
    {
      id: makeId('news'),
      title: `${company} 发布 ${industry} 场景新进展`,
      source: 'Demo News',
      published_at: daysAgo(baseDate),
      summary: `${contact.name} 所在团队最近围绕 ${industry} 的落地效率做了公开分享，重点提到客户验证和商业化节奏。`,
      url: '#',
      topic: industry,
    },
    {
      id: makeId('news'),
      title: `${contact.name} 参与行业闭门交流`,
      source: 'Founder Weekly',
      published_at: daysAgo(baseDate + 6),
      summary: `讨论集中在预算收紧后的增长策略、AI 工具采购标准，以及如何用更小团队完成交付。`,
      url: '#',
      topic: contact.relationship_type === 'investor' ? '投资趋势' : '市场动向',
    },
  ]
}

function createSeedContacts(): Contact[] {
  return [
    {
      id: 'contact-anna',
      name: 'Anna Zhang',
      company: 'Northstar Ventures',
      title: 'Partner',
      industry: 'AI 投资',
      location: 'Singapore',
      priority: 'high',
      tags: ['AI 应用', '融资', '出海'],
      email: 'anna@northstar.example',
      relationship_type: 'investor',
      met_context: '在 AI Demo Day 认识，聊过企业服务和出海方向',
      notes: '偏好清晰的增长数据和产品留存指标，适合下次同步进展。',
      last_contacted_at: daysAgo(42),
      created_at: daysAgo(90),
      updated_at: daysAgo(42),
    },
    {
      id: 'contact-ming',
      name: '陈明',
      company: 'Orbit AI',
      title: 'Founder',
      industry: 'AI 销售自动化',
      location: 'Shanghai',
      priority: 'high',
      tags: ['SaaS', '销售科技', '早期客户'],
      email: 'ming@orbit.example',
      relationship_type: 'founder',
      met_context: '朋友介绍认识，正在做销售自动化产品',
      notes: '上次提到想找早期设计合伙人。',
      last_contacted_at: daysAgo(8),
      created_at: daysAgo(50),
      updated_at: daysAgo(8),
    },
    {
      id: 'contact-sarah',
      name: 'Sarah Lee',
      company: 'LatticeWorks',
      title: 'Head of Growth',
      industry: 'B2B SaaS',
      location: 'San Francisco',
      priority: 'medium',
      tags: ['增长', '客户成功', 'PLG'],
      email: 'sarah@lattice.example',
      relationship_type: 'client',
      met_context: '线上 workshop 后主动加了微信',
      notes: '关心团队知识库和客户成功流程。',
      created_at: daysAgo(21),
      updated_at: daysAgo(21),
    },
    {
      id: 'contact-priya',
      name: 'Priya Rao',
      company: 'HelioStack',
      title: 'VP Product',
      industry: 'AI 基础设施',
      location: 'Bangalore',
      priority: 'medium',
      tags: ['Infra', '数据平台', '产品合作'],
      email: 'priya@helio.example',
      relationship_type: 'friend',
      met_context: '在开源社区 meetup 认识，聊过模型评估和数据管线',
      notes: '可以介绍给做企业 AI 应用的 founder。',
      last_contacted_at: daysAgo(33),
      created_at: daysAgo(130),
      updated_at: daysAgo(33),
    },
    {
      id: 'contact-lei',
      name: '王磊',
      company: 'BluePeak Capital',
      title: 'Investment Director',
      industry: '企业服务投资',
      location: 'Beijing',
      priority: 'medium',
      tags: ['企业服务', '投资', '渠道'],
      email: 'lei@bluepeak.example',
      relationship_type: 'investor',
      met_context: '朋友晚餐局认识，对垂直 SaaS 很熟',
      notes: '关注中美两边企业软件机会。',
      last_contacted_at: daysAgo(61),
      created_at: daysAgo(160),
      updated_at: daysAgo(61),
    },
    {
      id: 'contact-david',
      name: 'David Kim',
      company: 'Mercury Retail',
      title: 'GM, Digital',
      industry: '零售科技',
      location: 'Seoul',
      priority: 'low',
      tags: ['零售', 'CRM', '试点机会'],
      email: 'david@mercury.example',
      relationship_type: 'client',
      met_context: '客户转介绍，想了解 AI 驱动的私域运营',
      notes: '预算周期在 Q3，适合提前铺垫。',
      last_contacted_at: daysAgo(18),
      created_at: daysAgo(40),
      updated_at: daysAgo(18),
    },
  ]
}

function createSeedState(): CrmState {
  const contacts = createSeedContacts()
  const updates: ContactUpdate[] = contacts.slice(0, 5).map((contact, index) => ({
    id: `update-${contact.id}`,
    contact_id: contact.id,
    raw_results: { source: 'mock', query: `${contact.name} ${contact.company}` },
    summary: buildUpdateSummary(contact),
    news: makeNews(contact, index),
    fetched_at: daysAgo(index + 2),
  }))

  return {
    schemaVersion: STATE_VERSION,
    contacts,
    updates,
    suggestions: [
      {
        id: 'suggestion-anna-1',
        contact_id: 'contact-anna',
        reason: '距离上次联系已经超过一个月，而且她最近关注的垂直 AI 与你的方向匹配。',
        opener: 'Anna，最近看到你在分享垂直 AI 的判断，很受启发。我这边也有一些产品验证进展，想找你请教 20 分钟，看看哪些指标最值得补强。',
        created_at: daysAgo(2),
      },
      {
        id: 'suggestion-priya-1',
        contact_id: 'contact-priya',
        reason: '她的 AI 基础设施经验能帮你判断产品数据链路是否扎实。',
        opener: 'Priya，最近我在梳理 AI 应用里的评估和数据闭环，想到你之前分享过很多实战经验。想找你请教几个具体问题，也看看有没有可以互相介绍的项目。',
        created_at: daysAgo(1),
      },
    ],
    chats: [
      {
        id: 'chat-anna-1',
        contact_id: 'contact-anna',
        role: 'user',
        content: '帮我判断现在适不适合联系 Anna。',
        created_at: daysAgo(2),
      },
      {
        id: 'chat-anna-2',
        contact_id: 'contact-anna',
        role: 'assistant',
        content: '适合。她最近关注垂直 AI，而你可以用产品验证进展切入。建议先发一个低压力的请教型消息，不要直接进入融资话题。',
        created_at: daysAgo(2),
      },
    ],
    relationships: [
      {
        id: 'edge-anna-ming',
        source: 'contact-anna',
        target: 'contact-ming',
        label: '投资关注',
        strength: 86,
        reason: 'Anna 关注 AI 应用层，陈明的销售自动化产品在她的投资范围内。',
      },
      {
        id: 'edge-ming-sarah',
        source: 'contact-ming',
        target: 'contact-sarah',
        label: '潜在客户',
        strength: 72,
        reason: 'Sarah 负责 B2B 增长，可能会试用 Orbit AI 的销售线索评分。',
      },
      {
        id: 'edge-anna-lei',
        source: 'contact-anna',
        target: 'contact-lei',
        label: '共同投资主题',
        strength: 64,
        reason: '两人都覆盖企业服务与 AI 应用投资。',
      },
      {
        id: 'edge-priya-ming',
        source: 'contact-priya',
        target: 'contact-ming',
        label: '技术合作',
        strength: 58,
        reason: 'Priya 的模型评估经验可以帮助陈明完善产品可信度。',
      },
      {
        id: 'edge-sarah-david',
        source: 'contact-sarah',
        target: 'contact-david',
        label: '增长运营',
        strength: 51,
        reason: '两人都在做客户增长和运营效率提升。',
      },
    ],
  }
}

function cloneState(state: CrmState): CrmState {
  return JSON.parse(JSON.stringify(state)) as CrmState
}

function guessContactDefaults(contact: Contact): Contact {
  const lowerCompany = contact.company?.toLowerCase() || ''
  const relationship = contact.relationship_type
  let industry = contact.industry

  if (!industry && relationship === 'investor') industry = '企业服务投资'
  if (!industry && lowerCompany.includes('ai')) industry = 'AI 应用'
  if (!industry) industry = '企业服务'

  return {
    ...contact,
    industry,
    location: contact.location || 'Remote',
    priority: contact.priority || (relationship === 'investor' ? 'high' : 'medium'),
    tags: contact.tags || [industry],
  }
}

function normalizeState(value: unknown): CrmState {
  const seed = createSeedState()

  if (!value || typeof value !== 'object') return seed

  const state = value as Partial<CrmState>
  if (state.schemaVersion !== STATE_VERSION) return seed

  const contacts = Array.isArray(state.contacts) && state.contacts.length > 0
    ? state.contacts.map(guessContactDefaults)
    : seed.contacts

  const contactIds = new Set(contacts.map((contact) => contact.id))
  const updates = Array.isArray(state.updates) && state.updates.length > 0
    ? state.updates
        .filter((update) => contactIds.has(update.contact_id))
        .map((update) => {
          const contact = contacts.find((item) => item.id === update.contact_id)
          return {
            ...update,
            news: update.news || (contact ? makeNews(contact) : []),
          }
        })
    : seed.updates

  return {
    schemaVersion: STATE_VERSION,
    contacts,
    updates,
    suggestions: Array.isArray(state.suggestions) ? state.suggestions : seed.suggestions,
    chats: Array.isArray(state.chats) ? state.chats : seed.chats,
    relationships: Array.isArray(state.relationships) ? state.relationships : seed.relationships,
  }
}

function getInitialState() {
  return createSeedState()
}

function readState(): CrmState {
  if (typeof window === 'undefined') {
    serverState ??= getInitialState()
    return cloneState(serverState)
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const initialState = getInitialState()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState))
    return initialState
  }

  try {
    const state = normalizeState(JSON.parse(raw))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return state
  } catch {
    const initialState = getInitialState()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState))
    return initialState
  }
}

function writeState(state: CrmState) {
  if (typeof window === 'undefined') {
    serverState = cloneState(state)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function sortByUpdatedAt(a: Contact, b: Contact) {
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
}

function isFollowUpDue(contact: Contact) {
  if (!contact.last_contacted_at) return true

  const daysSinceContact = Math.floor(
    (Date.now() - new Date(contact.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysSinceContact >= FOLLOW_UP_DAYS
}

function buildUpdateSummary(contact: Contact) {
  const company = contact.company || '当前项目'
  const role = contact.relationship_type || '联系人'
  const industry = contact.industry || '企业服务'

  if (role === 'investor') {
    return `${company} 最近持续关注 ${industry} 机会，${contact.name} 公开提到更看重真实使用频次和客户续费信号。`
  }

  if (role === 'founder') {
    return `${company} 最近在推进新版本发布，${contact.name} 可能正在寻找早期用户反馈和合作资源。`
  }

  if (role === 'client') {
    return `${company} 团队近期在优化增长和客户运营流程，适合用一个具体案例重新开启沟通。`
  }

  return `${contact.name} 最近围绕 ${industry} 有一些新的职业动态，适合用轻量近况同步重新建立联系。`
}

function buildSuggestion(contact: Contact, recentUpdate?: string): Pick<AiSuggestion, 'reason' | 'opener'> {
  const reason = recentUpdate
    ? `可以围绕最近动态切入，沟通会显得自然且有上下文。`
    : `你们已经有一段时间没有互动，适合用近况同步保持关系温度。`

  const opener = recentUpdate
    ? `${contact.name}，看到你们最近关于 ${contact.industry || '行业'} 的动态，感觉和我这边正在做的事情有不少交集。想找你请教一下这个方向的判断，也顺便同步下我最近的进展。`
    : `${contact.name}，最近怎么样？之前聊到的方向我这边有些新进展，想找个时间和你简单同步，也听听你的近况。`

  return { reason, opener }
}

function buildAssistantReply(contact: Contact, prompt: string, recentUpdate?: string) {
  const topic = contact.industry || '你们共同关注的方向'
  const promptHint = prompt.trim() ? `针对你问的「${prompt.trim()}」，` : ''
  const updateContext = recentUpdate ? `可以引用这条近况：「${recentUpdate}」` : '可以先从上次见面的上下文切入'

  return `${promptHint}建议用“具体近况 + 轻量请教 + 明确时间”的结构。${updateContext}。可发送：${contact.name}，最近看到你们在 ${topic} 上有新进展，我这边也在验证一个相关方向。想找你请教 20 分钟，看看我的判断有没有偏差，这周三或周四哪个时间方便？`
}

function getRelatedContacts(state: CrmState, id: string) {
  const relatedIds = new Set(
    state.relationships
      .filter((edge) => edge.source === id || edge.target === id)
      .map((edge) => (edge.source === id ? edge.target : edge.source))
  )

  return state.contacts.filter((contact) => relatedIds.has(contact.id))
}

function buildIndustryLinks(contacts: Contact[]): IndustryLink[] {
  const links: IndustryLink[] = []
  const byIndustry = new Map<string, Contact[]>()

  contacts.forEach((contact) => {
    const industry = contact.industry || '其他'
    byIndustry.set(industry, [...(byIndustry.get(industry) || []), contact])
  })

  const industries = Array.from(byIndustry.keys())
  industries.forEach((industry, index) => {
    const next = industries[index + 1]
    if (!next) return

    links.push({
      source: industry,
      target: next,
      label: index % 2 === 0 ? '客户场景相邻' : '资本与技术互补',
      strength: 44 + index * 8,
    })
  })

  return links
}

export function resetDemoData() {
  const state = getInitialState()
  writeState(state)
  return state
}

export function listContacts() {
  return readState().contacts.sort(sortByUpdatedAt)
}

export function listFollowUps() {
  return readState().contacts.filter(isFollowUpDue).sort((a, b) => {
    const aTime = a.last_contacted_at ? new Date(a.last_contacted_at).getTime() : 0
    const bTime = b.last_contacted_at ? new Date(b.last_contacted_at).getTime() : 0
    return aTime - bTime
  })
}

export function getContactDetail(id: string): ContactDetail | null {
  const state = readState()
  const contact = state.contacts.find((item) => item.id === id)

  if (!contact) return null

  return {
    ...contact,
    updates: state.updates
      .filter((item) => item.contact_id === id)
      .sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime()),
    suggestions: state.suggestions
      .filter((item) => item.contact_id === id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    chats: state.chats
      .filter((item) => item.contact_id === id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    relatedContacts: getRelatedContacts(state, id),
  }
}

export function createContact(input: ContactInput) {
  const state = readState()
  const now = new Date().toISOString()
  const contact: Contact = guessContactDefaults({
    id: makeId('contact'),
    name: input.name.trim(),
    company: input.company?.trim() || undefined,
    title: input.title?.trim() || undefined,
    industry: input.industry?.trim() || undefined,
    location: input.location?.trim() || undefined,
    priority: input.priority || 'medium',
    tags: input.tags?.filter(Boolean) || [],
    email: input.email?.trim() || undefined,
    relationship_type: input.relationship_type || undefined,
    met_context: input.met_context?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    created_at: now,
    updated_at: now,
  })

  writeState({
    ...state,
    schemaVersion: STATE_VERSION,
    contacts: [contact, ...state.contacts],
  })

  return contact
}

export function updateContact(id: string, patch: Partial<Contact>) {
  const state = readState()
  let updatedContact: Contact | null = null
  const now = new Date().toISOString()
  const cleanPatch = Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined)
  ) as Partial<Contact>

  const contacts = state.contacts.map((contact) => {
    if (contact.id !== id) return contact

    const nextContact = guessContactDefaults({
      ...contact,
      ...cleanPatch,
      updated_at: now,
    })

    updatedContact = nextContact
    return nextContact
  })

  writeState({ ...state, contacts })
  return updatedContact
}

export function deleteContact(id: string) {
  const state = readState()
  const contactExists = state.contacts.some((contact) => contact.id === id)
  if (!contactExists) return false

  writeState({
    schemaVersion: STATE_VERSION,
    contacts: state.contacts.filter((contact) => contact.id !== id),
    updates: state.updates.filter((update) => update.contact_id !== id),
    suggestions: state.suggestions.filter((suggestion) => suggestion.contact_id !== id),
    chats: state.chats.filter((message) => message.contact_id !== id),
    relationships: state.relationships.filter((edge) => edge.source !== id && edge.target !== id),
  })

  return true
}

export function addMockUpdate(contactId: string) {
  const state = readState()
  const contact = state.contacts.find((item) => item.id === contactId)

  if (!contact) return null

  const update: ContactUpdate = {
    id: makeId('update'),
    contact_id: contactId,
    raw_results: { source: 'mock', query: `${contact.name} ${contact.company || ''}`.trim() },
    summary: buildUpdateSummary(contact),
    news: makeNews(contact, 1),
    fetched_at: new Date().toISOString(),
  }

  writeState({
    ...state,
    schemaVersion: STATE_VERSION,
    updates: [update, ...state.updates],
  })

  return update
}

export function addMockSuggestion(contactId: string) {
  const state = readState()
  const contact = state.contacts.find((item) => item.id === contactId)

  if (!contact) return null

  const latestUpdate = state.updates
    .filter((item) => item.contact_id === contactId)
    .sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime())[0]

  const suggestion: AiSuggestion = {
    id: makeId('suggestion'),
    contact_id: contactId,
    ...buildSuggestion(contact, latestUpdate?.summary),
    created_at: new Date().toISOString(),
  }

  writeState({
    ...state,
    schemaVersion: STATE_VERSION,
    suggestions: [suggestion, ...state.suggestions],
  })

  return suggestion
}

export function sendFollowUpChat(contactId: string, content: string) {
  const state = readState()
  const contact = state.contacts.find((item) => item.id === contactId)

  if (!contact || !content.trim()) return null

  const latestUpdate = state.updates
    .filter((item) => item.contact_id === contactId)
    .sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime())[0]

  const now = new Date().toISOString()
  const userMessage: ChatMessage = {
    id: makeId('chat'),
    contact_id: contactId,
    role: 'user',
    content: content.trim(),
    created_at: now,
  }
  const assistantMessage: ChatMessage = {
    id: makeId('chat'),
    contact_id: contactId,
    role: 'assistant',
    content: buildAssistantReply(contact, content, latestUpdate?.summary),
    created_at: new Date(Date.now() + 500).toISOString(),
  }

  writeState({
    ...state,
    schemaVersion: STATE_VERSION,
    chats: [...state.chats, userMessage, assistantMessage],
  })

  return [userMessage, assistantMessage]
}

export function getNetworkGraph(): NetworkGraph {
  const state = readState()
  const industryNames = Array.from(new Set(state.contacts.map((contact) => contact.industry || '其他')))
  const radius = 180
  const centerX = 300
  const centerY = 230
  const industries = industryNames.map((name, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(industryNames.length, 1) - Math.PI / 2
    return {
      id: name,
      name,
      contacts: state.contacts.filter((contact) => (contact.industry || '其他') === name),
      x: Math.round(centerX + Math.cos(angle) * radius),
      y: Math.round(centerY + Math.sin(angle) * radius),
    }
  })

  return {
    contacts: state.contacts,
    edges: state.relationships,
    industries,
    industryLinks: buildIndustryLinks(state.contacts),
  }
}
