import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // List all env vars that contain "SUPABASE" (chỉ hiện key, không hiện value)
  const envKeys = Object.keys(process.env).filter(k => k.includes('SUPABASE'));
  
  return NextResponse.json({
    found_supabase_keys: envKeys,
    NEXT_PUBLIC_SUPABASE_URL_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL_value: process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...' : 'NOT SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY_length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    // Also check non-prefixed versions
    SUPABASE_URL_set: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY_set: !!process.env.SUPABASE_ANON_KEY,
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
