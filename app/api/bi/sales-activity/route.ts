import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabase();

    // 1. Tất cả orders + customer info + sales_rep info
    const { data: ordersRaw, error: ordersErr } = await supabase
      .from('orders')
      .select(`
        id, order_date, total_amount, status, sales_rep_id,
        customer:customers!inner(id, name, district, province, channel, customer_type)
      `)
      .eq('status', 'Completed')
      .order('order_date', { ascending: false });

    if (ordersErr) throw ordersErr;

    // 2. Order items + product + category
    const orderIds = (ordersRaw || []).map(o => o.id);
    
    let allItems: any[] = [];
    if (orderIds.length > 0) {
      // Fetch in chunks of 50 to avoid URL length limits
      for (let i = 0; i < orderIds.length; i += 50) {
        const chunk = orderIds.slice(i, i + 50);
        const { data: itemsChunk } = await supabase
          .from('order_items')
          .select(`
            order_id, product_id, quantity, subtotal, unit_price,
            product:products!inner(name, sku, category:product_categories!inner(name))
          `)
          .in('order_id', chunk);
        if (itemsChunk) allItems = allItems.concat(itemsChunk);
      }
    }

    // Group items by order_id
    const itemsByOrder: Record<string, any[]> = {};
    allItems.forEach(item => {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push({
        product_id: item.product_id,
        product_name: item.product?.name || '',
        product_sku: item.product?.sku || '',
        category_name: item.product?.category?.name || 'Khác',
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        unit_price: Number(item.unit_price)
      });
    });

    // 3. Sales team hierarchy
    const { data: salesTeam } = await supabase
      .from('sales_teams')
      .select('id, employee_code, name, role, parent_id, province, district, status')
      .order('role')
      .order('name');

    // 4. Total active customers (for PC calculation)
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');

    // 5. Targets
    const { data: targets } = await supabase
      .from('sales_targets')
      .select('employee_id, month, revenue_target, orders_target, sku_per_order_target, dropsize_target, vpo_target, pc_target');

    // 6. Assemble orders with items
    const orders = (ordersRaw || []).map(o => ({
      id: o.id,
      order_date: o.order_date,
      total_amount: Number(o.total_amount),
      sales_rep_id: o.sales_rep_id,
      customer: o.customer,
      items: itemsByOrder[o.id] || []
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders,
        salesTeam: salesTeam || [],
        totalCustomers: totalCustomers || 0,
        targets: targets || []
      }
    });
  } catch (error: any) {
    console.error('sales-activity error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
