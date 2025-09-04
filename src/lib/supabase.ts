import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = 'https://ftuudbxhffnbzjxgqagp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dXVkYnhoZmZuYnpqeGdxYWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjQ3MDAsImV4cCI6MjA3MjU0MDcwMH0.WVWlZ2-KZBu1fSHz9u8o7ymbMrLS4G2cglquzcFMZDs'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Server-side Supabase client for API routes
export const createServerSupabaseClient = () => {
  const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dXVkYnhoZmZuYnpqeGdxYWdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2NDcwMCwiZXhwIjoyMDcyNTQwNzAwfQ.yj3-g8atEcSI3q_gwl04GaJzwo2wkmBUwTkqofew-EQ'

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
