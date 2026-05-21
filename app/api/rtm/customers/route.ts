import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Truy vấn bảng customers và chuyển location từ hình học (geometry) sang vĩ độ/kinh độ
    // Chúng ta có thể dùng raw query hoặc truy vấn đơn giản bằng postgREST nếu có view
    // Do location lưu dạng PostGIS, st_y và st_x được hỗ trợ. Tuy nhiên Supabase PostgREST 
    // không hỗ trợ hàm PostGIS trực tiếp trong `.select()`.
    // Vì vậy ta nên lấy dữ liệu rồi tính toán, hoặc tốt nhất là tạo một RPC / View.
    // Nếu chưa có RPC, chúng ta có thể parse chuỗi hex/wkb từ Supabase JS.
    
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province') || null;
    const district = searchParams.get('district') || null;

    const { data: customers, error } = await supabase.rpc('get_customers', {
      p_province: province,
      p_district: district
    });

    if (error) throw error;

    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
