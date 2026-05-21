import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing Supabase environment variables' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    const radiusInMeters = parseInt(searchParams.get('radius') || '500', 10);
    const province = searchParams.get('province') || null;
    const district = searchParams.get('district') || null;

    const { data: whiteSpaces, error } = await supabase.rpc('get_white_spaces', {
      radius_meters: radiusInMeters,
      p_province: province && province.trim() !== '' ? province : null,
      p_district: district && district.trim() !== '' ? district : null
    });

    if (error) {
      console.error('get_white_spaces RPC error:', JSON.stringify(error));
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: whiteSpaces || [] });
  } catch (error: any) {
    console.error('white-space route catch:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error' 
    }, { status: 500 });
  }
}
