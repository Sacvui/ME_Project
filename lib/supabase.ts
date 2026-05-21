import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  // Try NEXT_PUBLIC_ prefixed first, then non-prefixed fallback
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL 
    || process.env.SUPABASE_URL 
    || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
    || process.env.SUPABASE_ANON_KEY 
    || '';

  if (!url || !key) {
    throw new Error(
      `Missing Supabase config. ` +
      `NEXT_PUBLIC_SUPABASE_URL=${!!process.env.NEXT_PUBLIC_SUPABASE_URL}, ` +
      `SUPABASE_URL=${!!process.env.SUPABASE_URL}, ` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}, ` +
      `SUPABASE_ANON_KEY=${!!process.env.SUPABASE_ANON_KEY}`
    );
  }

  _supabase = createClient(url, key);
  return _supabase;
}
