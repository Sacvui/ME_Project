import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

const TEMPLATES: Record<string, { sheetName: string; headers: string[]; sampleRows: any[][] }> = {
  sales_teams: {
    sheetName: 'Nhân sự',
    headers: ['employee_code', 'name', 'role', 'parent_code', 'province', 'district', 'phone', 'email'],
    sampleRows: [
      ['ASM-001', 'Nguyễn Văn Hùng', 'ASM', '', 'TP. Hồ Chí Minh', '', '0901000001', 'hung@company.vn'],
      ['SS-001', 'Lê Hoàng Phúc', 'SS', 'ASM-001', 'TP. Hồ Chí Minh', 'Quận 1', '0902000001', 'phuc@company.vn'],
      ['SR-001', 'Huỳnh Anh Tuấn', 'SR', 'SS-001', 'TP. Hồ Chí Minh', 'Quận 1', '0903000001', 'tuan@company.vn'],
    ]
  },
  products: {
    sheetName: 'Sản phẩm',
    headers: ['sku', 'name', 'category', 'uom', 'unit_price'],
    sampleRows: [
      ['BEV-PEPSI-330', 'Pepsi 330ml Thùng 24', 'Đồ uống (Beverages)', 'Thùng', 200000],
      ['SNK-LAYS-100', 'Snack Lay\'s 100g Thùng 20', 'Đồ ăn vặt (Snacks)', 'Thùng', 120000],
    ]
  },
  customers: {
    sheetName: 'Khách hàng',
    headers: ['name', 'address', 'lat', 'lng', 'province', 'district', 'customer_type', 'channel', 'status'],
    sampleRows: [
      ['Tạp hóa ABC', '123 Lê Lợi, Quận 1', 10.7745, 106.7032, 'TP. Hồ Chí Minh', 'Quận 1', 'Tạp hóa', 'GT', 'Active'],
      ['Siêu thị Mini XYZ', '45 Nguyễn Huệ, Quận 1', 10.7738, 106.7045, 'TP. Hồ Chí Minh', 'Quận 1', 'Siêu thị mini', 'MT', 'Active'],
    ]
  },
  orders: {
    sheetName: 'Đơn hàng',
    headers: ['order_date', 'customer_name', 'sales_rep_code', 'product_sku', 'quantity', 'unit_price'],
    sampleRows: [
      ['2025-05-20', 'Tạp hóa ABC', 'SR-001', 'BEV-PEPSI-330', 5, 200000],
      ['2025-05-20', 'Tạp hóa ABC', 'SR-001', 'SNK-LAYS-100', 3, 120000],
      ['2025-05-21', 'Siêu thị Mini XYZ', 'SR-002', 'BEV-PEPSI-330', 10, 200000],
    ]
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';

    const template = TEMPLATES[type];
    if (!template) {
      return NextResponse.json({ success: false, error: `Invalid type: ${type}. Valid: ${Object.keys(TEMPLATES).join(', ')}` }, { status: 400 });
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    const data = [template.headers, ...template.sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = template.headers.map(h => ({ wch: Math.max(h.length + 5, 15) }));

    XLSX.utils.book_append_sheet(wb, ws, template.sheetName);

    // Add instruction sheet
    const instrData = [
      ['HƯỚNG DẪN SỬ DỤNG TEMPLATE'],
      [''],
      ['1. Xóa các dòng mẫu (dòng 2, 3, ...) trước khi nhập dữ liệu thật'],
      ['2. KHÔNG thay đổi tên các cột (dòng header)'],
      ['3. Lưu file dưới dạng .xlsx hoặc .csv'],
      [''],
      ['THỨ TỰ IMPORT BẮT BUỘC:'],
      ['  1️⃣ Nhân sự (sales_teams) — import trước tiên'],
      ['  2️⃣ Sản phẩm (products)'],
      ['  3️⃣ Khách hàng (customers)'],
      ['  4️⃣ Đơn hàng (orders) — import cuối cùng'],
      [''],
      ['LƯU Ý:'],
      [`  - Bảng: ${template.sheetName}`],
      [`  - Các cột: ${template.headers.join(', ')}`],
    ];

    if (type === 'sales_teams') {
      instrData.push(['  - role: chỉ được nhập ASM, SS, hoặc SR']);
      instrData.push(['  - parent_code: mã nhân viên cấp trên (ASM không cần, SS → mã ASM, SR → mã SS)']);
    }
    if (type === 'orders') {
      instrData.push(['  - customer_name: phải khớp chính xác tên khách hàng đã import']);
      instrData.push(['  - sales_rep_code: phải khớp chính xác mã nhân viên đã import']);
      instrData.push(['  - product_sku: phải khớp chính xác SKU sản phẩm đã import']);
    }

    const wsInstr = XLSX.utils.aoa_to_sheet(instrData);
    wsInstr['!cols'] = [{ wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsInstr, 'Hướng dẫn');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="template_${type}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
