import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabase();

    // 1. Tổng doanh thu + Tổng đơn hàng
    const { data: summaryData } = await supabase
      .from('orders')
      .select('total_amount, status');
    
    const completedOrders = (summaryData || []).filter(o => o.status === 'Completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalOrders = completedOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Tổng khách hàng
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Active');

    // 3. Doanh thu theo tháng (6 tháng gần nhất) — dùng raw query
    const { data: monthlyRaw } = await supabase
      .from('orders')
      .select('order_date, total_amount, status')
      .eq('status', 'Completed')
      .gte('order_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order('order_date', { ascending: true });

    // Gom theo tháng
    const monthlyMap: Record<string, number> = {};
    (monthlyRaw || []).forEach(o => {
      const d = new Date(o.order_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + Number(o.total_amount);
    });

    // Đảm bảo có đủ 6 tháng (kể cả tháng không có doanh thu)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `T${d.getMonth() + 1}/${d.getFullYear()}`;
      monthlyRevenue.push({ month: label, revenue: monthlyMap[key] || 0 });
    }

    // 4. Doanh thu theo nhóm hàng (Category)
    const { data: categoryRaw } = await supabase
      .from('order_items')
      .select(`
        subtotal,
        product:products!inner(
          category:product_categories!inner(name)
        ),
        order:orders!inner(status)
      `)
      .eq('orders.status', 'Completed');

    const categoryMap: Record<string, number> = {};
    (categoryRaw || []).forEach((item: any) => {
      const catName = item.product?.category?.name || 'Khác';
      categoryMap[catName] = (categoryMap[catName] || 0) + Number(item.subtotal);
    });

    const revenueByCategory = Object.entries(categoryMap).map(([name, value]) => ({
      name, value
    }));

    // 5. Top 5 sản phẩm bán chạy
    const { data: topProductsRaw } = await supabase
      .from('order_items')
      .select(`
        quantity,
        subtotal,
        product:products!inner(name, sku)
      `);

    const prodMap: Record<string, { name: string; sku: string; quantity: number; revenue: number }> = {};
    (topProductsRaw || []).forEach((item: any) => {
      const sku = item.product?.sku || 'N/A';
      if (!prodMap[sku]) {
        prodMap[sku] = { name: item.product?.name || '', sku, quantity: 0, revenue: 0 };
      }
      prodMap[sku].quantity += item.quantity;
      prodMap[sku].revenue += Number(item.subtotal);
    });

    const topProducts = Object.values(prodMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 7);

    // 6. Doanh thu theo kênh (GT/MT)
    const { data: channelRaw } = await supabase
      .from('orders')
      .select(`
        total_amount,
        customer:customers!inner(channel)
      `)
      .eq('status', 'Completed');

    const channelMap: Record<string, number> = {};
    (channelRaw || []).forEach((o: any) => {
      const ch = o.customer?.channel || 'GT';
      channelMap[ch] = (channelMap[ch] || 0) + Number(o.total_amount);
    });

    const revenueByChannel = Object.entries(channelMap).map(([name, value]) => ({
      name: name === 'GT' ? 'Truyền thống (GT)' : 'Hiện đại (MT)', value
    }));

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          totalRevenue,
          totalOrders,
          avgOrderValue: Math.round(avgOrderValue),
          totalCustomers: totalCustomers || 0
        },
        monthlyRevenue,
        revenueByCategory,
        revenueByChannel,
        topProducts
      }
    });
  } catch (error: any) {
    console.error('BI overview error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
