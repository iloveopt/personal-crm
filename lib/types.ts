export type Contact = {
  id: string
  name: string
  company?: string
  title?: string
  industry?: string
  location?: string
  priority?: 'high' | 'medium' | 'low'
  tags?: string[]
  email?: string
  relationship_type?: string
  met_context?: string
  notes?: string
  last_contacted_at?: string
  created_at: string
  updated_at: string
}

export type ContactUpdate = {
  id: string
  contact_id: string
  raw_results?: object
  summary?: string
  news?: NewsItem[]
  fetched_at: string
}

export type AiSuggestion = {
  id: string
  contact_id: string
  reason?: string
  opener?: string
  created_at: string
}

export type NewsItem = {
  id: string
  title: string
  source: string
  published_at: string
  summary: string
  url: string
  topic: string
}

export type ChatMessage = {
  id: string
  contact_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export type RelationshipEdge = {
  id: string
  source: string
  target: string
  label: string
  strength: number
  reason: string
}

export type IndustryLink = {
  source: string
  target: string
  label: string
  strength: number
}

export type NetworkGraph = {
  contacts: Contact[]
  edges: RelationshipEdge[]
  industries: {
    id: string
    name: string
    contacts: Contact[]
    x: number
    y: number
  }[]
  industryLinks: IndustryLink[]
}

export type ContactDetail = Contact & {
  updates: ContactUpdate[]
  suggestions: AiSuggestion[]
  chats: ChatMessage[]
  relatedContacts: Contact[]
}
