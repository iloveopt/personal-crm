import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null
let supabaseAdminClient: SupabaseClient | null = null

function requireEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`缺少 ${name} 环境变量`)
  }

  return value
}

// 客户端（浏览器）
export function getSupabase() {
  supabaseClient ??= createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  )

  return supabaseClient
}

// 服务端（API routes）
export function getSupabaseAdmin() {
  supabaseAdminClient ??= createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  )

  return supabaseAdminClient
}

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
