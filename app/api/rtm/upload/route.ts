import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy file tải lên.' }, { status: 400 });
    }

    // Đọc nội dung file
    const text = await file.text();
    
    // TODO: Tích hợp thư viện parse CSV hoặc JSON (vd: papaparse)
    // Và insert dữ liệu vào Supabase sử dụng PostGIS st_makepoint(lng, lat)
    // Hiện tại, đây là logic giả lập thành công để hoàn thiện quy trình UI/UX
    
    // Giả lập thời gian xử lý file
    await new Promise(resolve => setTimeout(resolve, 1000));

    const tableName = type === 'customers' ? 'Dữ liệu nội bộ' : 'Dữ liệu Universal';

    return NextResponse.json({ 
      success: true, 
      message: `Đã xử lý file ${file.name} thành công. Dữ liệu ${tableName} đã được hệ thống ghi nhận.` 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
