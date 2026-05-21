import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Bán kính loại trừ (mặc định là 500 mét nếu không truyền vào)
    const radiusInMeters = parseInt(searchParams.get('radius') || '500', 10);

    // Sử dụng truy vấn SQL thuần qua RPC hoặc raw query của Supabase để tận dụng PostGIS
    // Hàm st_distance(st_transform(a, 3857)) giúp tính khoảng cách theo mét chính xác
    const { data: whiteSpaces, error } = await supabase.rpc('get_white_spaces', {
      radius_meters: radiusInMeters
    });

    if (error) throw error;

    return NextResponse.json({ success: true, data: whiteSpaces });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
