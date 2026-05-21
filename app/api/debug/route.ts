import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    supabase_url_set: !!supabaseUrl,
    supabase_url_prefix: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET',
    supabase_key_set: !!supabaseKey,
    supabase_key_length: supabaseKey ? supabaseKey.length : 0,
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
