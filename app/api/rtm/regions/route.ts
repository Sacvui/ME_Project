import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
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
      // Nếu không tìm thấy Tỉnh/Thành trong DB, trả về rỗng
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Lấy districts thuộc province đó và version tương ứng
    const { data: districts, error } = await supabase
      .from('districts')
      .select('name')
      .eq('province_id', provData.id)
      .eq('version', version)
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      data: districts.map(d => d.name) 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
