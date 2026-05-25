import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 客户端（浏览器）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端（API routes）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type Contact = {
  id: string
  name: string
  company?: string
  title?: string
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
  fetched_at: string
}

export type AiSuggestion = {
  id: string
  contact_id: string
  reason?: string
  opener?: string
  created_at: string
}
