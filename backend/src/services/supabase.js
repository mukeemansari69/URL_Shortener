import { createClient } from '@supabase/supabase-js'
import { config } from '../config.js'

let client
let connected = false

export const getSupabase = () => client
export const isSupabaseReady = () => connected && client

export async function connectSupabase() {
  if (!config.supabaseUrl || !config.supabaseKey) {
    connected = false
    console.warn('[supabase] disabled: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set')
    return
  }

  client = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  let result

  try {
    result = await client.from('url_shortner_users').select('id', { count: 'exact', head: true })
  } catch (error) {
    connected = false
    console.warn(`[supabase] unavailable: ${error.message}`)
    return
  }

  if (result.error) {
    connected = false
    if (result.error.message.toLowerCase().includes('fetch failed')) {
      console.warn('[supabase] unavailable: fetch failed. Check Supabase URL/key and network access.')
      return
    }

    console.warn(
      `[supabase] unavailable: ${result.error.message}. Run supabase-url-shortner-schema.sql in Supabase SQL editor.`,
    )
    return
  }

  connected = true
  console.log('[supabase] connected')
}
