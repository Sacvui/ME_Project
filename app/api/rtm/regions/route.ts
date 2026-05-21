import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province');
    const version = searchParams.get('version') || 'old';

    if (!province) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 1. Tìm province_id
    const { data: provData, error: provError } = await supabase
      .from('provinces')
      .select('id')
      .eq('name', province)
      .single();

    if (provError || !provData) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Lấy districts thuộc province đó và version tương ứng
    const { data: districts, error } = await supabase
      .from('districts')
      .select('name')
      .eq('province_id', provData.id)
      .eq('version', version)
      .order('name', { ascending: true });

    if (error) {
      console.error('districts query error:', JSON.stringify(error));
      return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: (districts || []).map(d => d.name) 
    });
  } catch (error: any) {
    console.error('regions route catch:', error);
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
  }
}
