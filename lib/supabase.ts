import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// Demo mode: If using placeholder values, the app will work in local demo mode
// For full features, create a Supabase project and update .env.local
const isDemoMode = supabaseUrl === 'https://demo.supabase.co'

if (isDemoMode) {
  console.warn('⚠️ Running in DEMO MODE - Authentication is local only. Set up Supabase for full features.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export { isDemoMode }
