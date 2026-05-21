import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { type, rows } = body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Không có dữ liệu để import' }, { status: 400 });
    }

    let result: { inserted: number; errors: string[] } = { inserted: 0, errors: [] };

    switch (type) {
      case 'sales_teams':
        result = await importSalesTeams(supabase, rows);
        break;
      case 'products':
        result = await importProducts(supabase, rows);
        break;
      case 'customers':
        result = await importCustomers(supabase, rows);
        break;
      case 'orders':
        result = await importOrders(supabase, rows);
        break;
      default:
        return NextResponse.json({ success: false, error: `Loại dữ liệu không hợp lệ: ${type}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Đã import ${result.inserted} dòng thành công.${result.errors.length > 0 ? ` ${result.errors.length} lỗi.` : ''}`,
      inserted: result.inserted,
      errors: result.errors
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ========================================
// IMPORT NHÂN SỰ
// ========================================
async function importSalesTeams(supabase: any, rows: any[]) {
  const errors: string[] = [];
  let inserted = 0;

  // Phase 1: Insert all WITHOUT parent_id
  const codeToId: Record<string, string> = {};
  
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.employee_code || !r.name || !r.role) {
      errors.push(`Dòng ${i + 2}: Thiếu employee_code, name hoặc role`);
      continue;
    }
    if (!['SR', 'SS', 'ASM'].includes(r.role?.toUpperCase())) {
      errors.push(`Dòng ${i + 2}: role phải là SR, SS hoặc ASM`);
      continue;
    }

    const { data, error } = await supabase.from('sales_teams').upsert({
      employee_code: r.employee_code,
      name: r.name,
      role: r.role.toUpperCase(),
      province: r.province || null,
      district: r.district || null,
      phone: r.phone?.toString() || null,
      email: r.email || null,
      status: 'Active'
    }, { onConflict: 'employee_code' }).select('id, employee_code').single();

    if (error) { errors.push(`Dòng ${i + 2}: ${error.message}`); continue; }
    codeToId[r.employee_code] = data.id;
    inserted++;
  }

  // Phase 2: Update parent_id
  for (const r of rows) {
    if (r.parent_code && codeToId[r.employee_code]) {
      // Look up parent by code
      let parentId = codeToId[r.parent_code];
      if (!parentId) {
        const { data: parentData } = await supabase.from('sales_teams').select('id').eq('employee_code', r.parent_code).single();
        if (parentData) parentId = parentData.id;
      }
      if (parentId) {
        await supabase.from('sales_teams').update({ parent_id: parentId }).eq('id', codeToId[r.employee_code]);
      } else {
        errors.push(`${r.employee_code}: parent_code "${r.parent_code}" không tìm thấy`);
      }
    }
  }

  return { inserted, errors };
}

// ========================================
// IMPORT SẢN PHẨM
// ========================================
async function importProducts(supabase: any, rows: any[]) {
  const errors: string[] = [];
  let inserted = 0;

  // Collect unique categories
  const categories = [...new Set(rows.map(r => r.category).filter(Boolean))];
  const catMap: Record<string, string> = {};

  for (const catName of categories) {
    const { data: existing } = await supabase.from('product_categories').select('id').eq('name', catName).single();
    if (existing) {
      catMap[catName] = existing.id;
    } else {
      const { data: newCat, error } = await supabase.from('product_categories').insert({ name: catName }).select('id').single();
      if (newCat) catMap[catName] = newCat.id;
      if (error) errors.push(`Category "${catName}": ${error.message}`);
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.sku || !r.name) { errors.push(`Dòng ${i + 2}: Thiếu sku hoặc name`); continue; }

    const { error } = await supabase.from('products').upsert({
      sku: r.sku,
      name: r.name,
      category_id: catMap[r.category] || null,
      uom: r.uom || 'Thùng',
      unit_price: Number(r.unit_price) || 0,
      status: 'Active'
    }, { onConflict: 'sku' });

    if (error) { errors.push(`Dòng ${i + 2}: ${error.message}`); continue; }
    inserted++;
  }

  return { inserted, errors };
}

// ========================================
// IMPORT KHÁCH HÀNG
// ========================================
async function importCustomers(supabase: any, rows: any[]) {
  const errors: string[] = [];
  let inserted = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.name || !r.lat || !r.lng) { errors.push(`Dòng ${i + 2}: Thiếu name, lat hoặc lng`); continue; }

    const lat = Number(r.lat);
    const lng = Number(r.lng);
    if (isNaN(lat) || isNaN(lng)) { errors.push(`Dòng ${i + 2}: lat/lng không hợp lệ`); continue; }

    // Insert using RPC to handle PostGIS point
    const { error } = await supabase.rpc('insert_customer', {
      p_name: r.name,
      p_address: r.address || '',
      p_lat: lat,
      p_lng: lng,
      p_province: r.province || null,
      p_district: r.district || null,
      p_customer_type: r.customer_type || 'Tạp hóa',
      p_channel: r.channel || 'GT',
      p_status: r.status || 'Active'
    });

    if (error) { errors.push(`Dòng ${i + 2}: ${error.message}`); continue; }
    inserted++;
  }

  return { inserted, errors };
}

// ========================================
// IMPORT ĐƠN HÀNG
// ========================================
async function importOrders(supabase: any, rows: any[]) {
  const errors: string[] = [];
  let inserted = 0;

  // Pre-fetch lookup tables
  const { data: allCustomers } = await supabase.from('customers').select('id, name');
  const { data: allSR } = await supabase.from('sales_teams').select('id, employee_code');
  const { data: allProducts } = await supabase.from('products').select('id, sku, unit_price');

  const custMap: Record<string, string> = {};
  (allCustomers || []).forEach((c: any) => { custMap[c.name] = c.id; });
  const srMap: Record<string, string> = {};
  (allSR || []).forEach((s: any) => { srMap[s.employee_code] = s.id; });
  const prodMap: Record<string, { id: string; price: number }> = {};
  (allProducts || []).forEach((p: any) => { prodMap[p.sku] = { id: p.id, price: Number(p.unit_price) }; });

  // Group rows by order (same date + customer + sales_rep)
  const orderGroups: Record<string, { date: string; custId: string; srId: string; items: any[] }> = {};

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.customer_name || !r.product_sku) {
      errors.push(`Dòng ${i + 2}: Thiếu customer_name hoặc product_sku`);
      continue;
    }

    const custId = custMap[r.customer_name];
    if (!custId) { errors.push(`Dòng ${i + 2}: Khách hàng "${r.customer_name}" không tìm thấy`); continue; }

    const srId = r.sales_rep_code ? srMap[r.sales_rep_code] : null;
    if (r.sales_rep_code && !srId) { errors.push(`Dòng ${i + 2}: Mã NV "${r.sales_rep_code}" không tìm thấy`); continue; }

    const prod = prodMap[r.product_sku];
    if (!prod) { errors.push(`Dòng ${i + 2}: SKU "${r.product_sku}" không tìm thấy`); continue; }

    const key = `${r.order_date || 'today'}_${custId}_${srId || 'none'}`;
    if (!orderGroups[key]) {
      orderGroups[key] = { date: r.order_date || new Date().toISOString(), custId, srId: srId || '', items: [] };
    }
    orderGroups[key].items.push({
      product_id: prod.id,
      quantity: Number(r.quantity) || 1,
      unit_price: Number(r.unit_price) || prod.price
    });
  }

  // Insert orders + items
  for (const [, group] of Object.entries(orderGroups)) {
    const totalAmount = group.items.reduce((s: number, it: any) => s + it.quantity * it.unit_price, 0);

    const { data: order, error: orderErr } = await supabase.from('orders').insert({
      customer_id: group.custId,
      order_date: group.date,
      total_amount: totalAmount,
      sales_rep_id: group.srId || null,
      status: 'Completed'
    }).select('id').single();

    if (orderErr) { errors.push(`Order: ${orderErr.message}`); continue; }

    for (const item of group.items) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      });
    }
    inserted += group.items.length;
  }

  return { inserted, errors };
}
