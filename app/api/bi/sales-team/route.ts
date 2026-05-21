import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabase();

    // 1. Lấy danh sách nhân sự
    const { data: teams, error: teamError } = await supabase
      .from('sales_teams')
      .select('id, employee_code, name, role, parent_id, province, district, phone, status')
      .order('role', { ascending: true })
      .order('name', { ascending: true });

    if (teamError) throw teamError;

    // 2. Lấy doanh thu + số đơn theo sales_rep_id
    const { data: ordersRaw } = await supabase
      .from('orders')
      .select('sales_rep_id, total_amount, status')
      .eq('status', 'Completed')
      .not('sales_rep_id', 'is', null);

    // Gom theo sales_rep_id
    const repStats: Record<string, { revenue: number; orders: number }> = {};
    (ordersRaw || []).forEach(o => {
      const rid = o.sales_rep_id;
      if (!repStats[rid]) repStats[rid] = { revenue: 0, orders: 0 };
      repStats[rid].revenue += Number(o.total_amount);
      repStats[rid].orders += 1;
    });

    // 3. Tính doanh thu cho SS (tổng hợp từ SR dưới quyền) và ASM (tổng hợp từ SS)
    const teamList = (teams || []).map(t => ({
      ...t,
      revenue: 0,
      orders: 0
    }));

    // Map ID → team member
    const teamMap: Record<string, any> = {};
    teamList.forEach(t => { teamMap[t.id] = t; });

    // Gán revenue/orders cho SR
    teamList.forEach(t => {
      if (t.role === 'SR' && repStats[t.id]) {
        t.revenue = repStats[t.id].revenue;
        t.orders = repStats[t.id].orders;
      }
    });

    // Roll up: SS = tổng các SR dưới quyền
    teamList.forEach(t => {
      if (t.role === 'SR' && t.parent_id && teamMap[t.parent_id]) {
        teamMap[t.parent_id].revenue += t.revenue;
        teamMap[t.parent_id].orders += t.orders;
      }
    });

    // Roll up: ASM = tổng các SS dưới quyền
    teamList.forEach(t => {
      if (t.role === 'SS' && t.parent_id && teamMap[t.parent_id]) {
        teamMap[t.parent_id].revenue += t.revenue;
        teamMap[t.parent_id].orders += t.orders;
      }
    });

    return NextResponse.json({
      success: true,
      data: teamList
    });
  } catch (error: any) {
    console.error('BI sales-team error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
