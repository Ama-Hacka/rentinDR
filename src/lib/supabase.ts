import { createClient } from '@supabase/supabase-js'

const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseUrl = (!envUrl || envUrl.includes('your-project-ref'))
  ? 'https://mbszyrrjqxrswmmdvodt.supabase.co'
  : envUrl
const supabaseAnonKey = (!envKey || envKey.includes('your-anon-key') || envKey.includes('sb_secret_'))
  ? 'sb_publishable_Gd0T0Ic9otCIOSkrTOrzHw_x2Usr61r'
  : envKey

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key present:', Boolean(supabaseAnonKey))

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-application-name': 'rentindr',
    },
  },
})
