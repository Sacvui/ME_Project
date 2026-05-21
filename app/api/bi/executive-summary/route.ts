import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabase();

    // --- Try MV first, fallback to raw tables ---
    let summaryData: any[] = [];
    let usedMV = false;

    const { data: mvData, error: mvErr } = await supabase
      .from('mv_sales_summary_by_rep_month')
      .select('*');

    if (!mvErr && mvData && mvData.length > 0) {
      summaryData = mvData;
      usedMV = true;
    } else {
      // Fallback: compute from orders + order_items directly
      const { data: rawOrders } = await supabase
        .from('orders')
        .select('id, sales_rep_id, customer_id, order_date, total_amount, status')
        .eq('status', 'Completed');

      const { data: rawItems } = await supabase
        .from('order_items')
        .select('order_id, quantity');

      // Build items-per-order map
      const itemsMap: Record<string, number> = {};
      (rawItems || []).forEach((item: any) => {
        itemsMap[item.order_id] = (itemsMap[item.order_id] || 0) + Number(item.quantity);
      });

      // Aggregate by (sales_rep_id, month)
      const aggMap: Record<string, {
        sales_rep_id: string; month: string;
        total_revenue: number; total_orders: number;
        customers: Set<string>; total_items_sold: number;
      }> = {};

      (rawOrders || []).forEach((o: any) => {
        if (!o.sales_rep_id) return;
        const d = new Date(o.order_date);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const key = `${o.sales_rep_id}__${month}`;
        if (!aggMap[key]) {
          aggMap[key] = {
            sales_rep_id: o.sales_rep_id,
            month,
            total_revenue: 0,
            total_orders: 0,
            customers: new Set(),
            total_items_sold: 0,
          };
        }
        aggMap[key].total_revenue += Number(o.total_amount);
        aggMap[key].total_orders += 1;
        aggMap[key].customers.add(o.customer_id);
        aggMap[key].total_items_sold += itemsMap[o.id] || 0;
      });

      summaryData = Object.values(aggMap).map(r => ({
        sales_rep_id: r.sales_rep_id,
        month: r.month,
        total_revenue: r.total_revenue,
        total_orders: r.total_orders,
        unique_customers: r.customers.size,
        total_items_sold: r.total_items_sold,
      }));
    }

    // Fetch sales team
    const { data: salesTeam, error: teamErr } = await supabase
      .from('sales_teams')
      .select('id, name, role, parent_id');

    if (teamErr) throw teamErr;

    // Fetch targets
    const { data: targets, error: targetErr } = await supabase
      .from('sales_targets')
      .select('employee_id, month, revenue_target, orders_target');

    if (targetErr) throw targetErr;

    // Fetch order-level data for trend charts
    const { data: ordersForTrend } = await supabase
      .from('orders')
      .select('sales_rep_id, order_date, total_amount, customer_id, status')
      .eq('status', 'Completed')
      .order('order_date', { ascending: true });

    // Revenue by category per rep
    const { data: categoryData } = await supabase
      .from('order_items')
      .select(`
        subtotal, quantity,
        product:products!inner(name, category_id,
          category:product_categories!inner(name)
        ),
        order:orders!inner(sales_rep_id, status)
      `)
      .eq('orders.status', 'Completed');

    return NextResponse.json({
      success: true,
      data: {
        summary: summaryData,
        salesTeam: salesTeam || [],
        targets: targets || [],
        ordersForTrend: ordersForTrend || [],
        categoryData: categoryData || [],
        source: usedMV ? 'materialized_view' : 'computed_realtime'
      }
    });
  } catch (error: any) {
    console.error('executive-summary api error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
