import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
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
