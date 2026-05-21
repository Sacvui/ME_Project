'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, ReferenceLine, ComposedChart
} from 'recharts';
import {
  DollarSign, ShoppingCart, TrendingUp, Users, Award,
  ChevronDown, ChevronRight, Briefcase
} from 'lucide-react';
import {
  formatVND, COLORS, ROLE_COLORS, KPICard, ChartCard, FilterBar, ActiveFilters,
  TimePeriod, getTimeCutoff, buildTrendData
} from './BiShared';

interface Order { id: string; order_date: string; total_amount: number; sales_rep_id: string; customer: any; items: any[]; }
interface SalesRep { id: string; employee_code: string; name: string; role: string; parent_id: string | null; province: string; district: string; }
interface Target { employee_id: string; month: string; revenue_target: number; orders_target: number; }

export default function OverviewDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesTeam, setSalesTeam] = useState<SalesRep[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: 'mtd' as TimePeriod,
    province: '', district: '', channel: '',
    selectedEmployee: null as string | null,
    selectedCategory: null as string | null,
    selectedChannel: null as string | null,
  });
  const [expandedASM, setExpandedASM] = useState<Record<string, boolean>>({});
  const [expandedSS, setExpandedSS] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/bi/sales-activity').then(r => r.json()).then(res => {
      if (res.success) {
        setOrders(res.data.orders);
        setSalesTeam(res.data.salesTeam);
        setTotalCustomers(res.data.totalCustomers);
        setTargets(res.data.targets || []);
        const exp: Record<string, boolean> = {};
        res.data.salesTeam.filter((t: SalesRep) => t.role === 'ASM').forEach((t: SalesRep) => { exp[t.id] = true; });
        setExpandedASM(exp);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const { srToSS, ssToASM } = useMemo(() => {
    const srToSS: Record<string, string> = {};
    const ssToASM: Record<string, string> = {};
    salesTeam.forEach(t => {
      if (t.role === 'SR' && t.parent_id) srToSS[t.id] = t.parent_id;
      if (t.role === 'SS' && t.parent_id) ssToASM[t.id] = t.parent_id;
    });
    return { srToSS, ssToASM };
  }, [salesTeam]);

  const getSRIdsUnder = useCallback((empId: string): string[] => {
    const emp = salesTeam.find(t => t.id === empId);
    if (!emp) return [];
    if (emp.role === 'SR') return [emp.id];
    if (emp.role === 'SS') return salesTeam.filter(t => t.role === 'SR' && t.parent_id === emp.id).map(t => t.id);
    const ssIds = salesTeam.filter(t => t.role === 'SS' && t.parent_id === emp.id).map(t => t.id);
    return salesTeam.filter(t => t.role === 'SR' && ssIds.includes(t.parent_id || '')).map(t => t.id);
  }, [salesTeam]);

  const provinces = useMemo(() => [...new Set(orders.map(o => o.customer?.province).filter(Boolean))].sort(), [orders]);
  const districts = useMemo(() => {
    if (!filters.province) return [];
    return [...new Set(orders.filter(o => o.customer?.province === filters.province).map(o => o.customer?.district).filter(Boolean))].sort();
  }, [orders, filters.province]);

  const filtered = useMemo(() => {
    const cutoff = getTimeCutoff(filters.period);
    return orders.filter(o => {
      if (new Date(o.order_date) < cutoff) return false;
      if (filters.province && o.customer?.province !== filters.province) return false;
      if (filters.district && o.customer?.district !== filters.district) return false;
      if (filters.channel && o.customer?.channel !== filters.channel) return false;
      if (filters.selectedEmployee) {
        const allowed = getSRIdsUnder(filters.selectedEmployee);
        if (!allowed.includes(o.sales_rep_id)) return false;
      }
      if (filters.selectedCategory) {
        if (!o.items.some((i: any) => i.category_name === filters.selectedCategory)) return false;
      }
      if (filters.selectedChannel && o.customer?.channel !== filters.selectedChannel) return false;
      return true;
    });
  }, [orders, filters, getSRIdsUnder]);

  // Monthly target sum (all employees)
  const currentMonthTarget = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    // Sum all ASM targets (top-level represents total)
    const asmIds = salesTeam.filter(t => t.role === 'ASM').map(t => t.id);
    return targets
      .filter(t => t.month?.startsWith(monthStr.substring(0, 7)) && asmIds.includes(t.employee_id))
      .reduce((s, t) => s + Number(t.revenue_target), 0) || 150000000; // fallback
  }, [targets, salesTeam]);

  const kpis = useMemo(() => {
    const rev = filtered.reduce((s, o) => s + o.total_amount, 0);
    const cnt = filtered.length;
    const custSet = new Set(filtered.map(o => o.customer?.id));
    return { revenue: rev, orders: cnt, avg: cnt > 0 ? rev / cnt : 0, customers: custSet.size };
  }, [filtered]);

  // Trend chart data with target + average lines
  const trendData = useMemo(() => {
    return buildTrendData(filtered, filters.period, currentMonthTarget);
  }, [filtered, filters.period, currentMonthTarget]);

  const avgRevenue = useMemo(() => {
    const nonZero = trendData.filter(d => d.revenue > 0);
    return nonZero.length > 0 ? nonZero.reduce((s, d) => s + d.revenue, 0) / nonZero.length : 0;
  }, [trendData]);

  // Category Pie
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(o => o.items.forEach((i: any) => { map[i.category_name] = (map[i.category_name] || 0) + i.subtotal; }));
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Top Products
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; sku: string; qty: number; rev: number }> = {};
    filtered.forEach(o => o.items.forEach((i: any) => {
      if (!map[i.product_sku]) map[i.product_sku] = { name: i.product_name, sku: i.product_sku, qty: 0, rev: 0 };
      map[i.product_sku].qty += i.quantity;
      map[i.product_sku].rev += i.subtotal;
    }));
    return Object.values(map).sort((a, b) => b.rev - a.rev).slice(0, 7);
  }, [filtered]);

  // Channel
  const channelData = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number }> = {};
    filtered.forEach(o => { const ch = o.customer?.channel || 'GT'; if (!map[ch]) map[ch] = { revenue: 0, orders: 0 }; map[ch].revenue += o.total_amount; map[ch].orders += 1; });
    return Object.entries(map).map(([ch, d]) => ({ name: ch === 'GT' ? 'Truyền thống (GT)' : 'Hiện đại (MT)', channel: ch, revenue: d.revenue, orders: d.orders }));
  }, [filtered]);

  // Team rollup
  const teamRollup = useMemo(() => {
    const repStats: Record<string, { revenue: number; orders: number }> = {};
    filtered.forEach(o => { if (!o.sales_rep_id) return; if (!repStats[o.sales_rep_id]) repStats[o.sales_rep_id] = { revenue: 0, orders: 0 }; repStats[o.sales_rep_id].revenue += o.total_amount; repStats[o.sales_rep_id].orders += 1; });
    const list = salesTeam.map(t => ({ ...t, revenue: 0, orders: 0 }));
    const tMap: Record<string, any> = {};
    list.forEach(t => { tMap[t.id] = t; });
    list.forEach(t => { if (t.role === 'SR' && repStats[t.id]) { t.revenue = repStats[t.id].revenue; t.orders = repStats[t.id].orders; } });
    list.forEach(t => { if (t.role === 'SR' && t.parent_id && tMap[t.parent_id]) { tMap[t.parent_id].revenue += t.revenue; tMap[t.parent_id].orders += t.orders; } });
    list.forEach(t => { if (t.role === 'SS' && t.parent_id && tMap[t.parent_id]) { tMap[t.parent_id].revenue += t.revenue; tMap[t.parent_id].orders += t.orders; } });
    return list;
  }, [filtered, salesTeam]);

  const clearFilter = (key: string) => setFilters(f => ({ ...f, [key]: null }));

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  const asmList = teamRollup.filter(t => t.role === 'ASM');
  const ssList = teamRollup.filter(t => t.role === 'SS');
  const srList = teamRollup.filter(t => t.role === 'SR');

  const periodLabel = filters.period === 'today' ? 'theo ngày' : filters.period === 'wtd' ? 'theo tuần' : 'theo tháng';

  return (
    <>
      <FilterBar filters={filters} setFilters={setFilters} districts={districts} provinces={provinces} showChannel />
      <ActiveFilters filters={filters} salesTeam={salesTeam} onClear={clearFilter} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon={<DollarSign className="w-5 h-5" />} label="Tổng Doanh thu" value={formatVND(kpis.revenue)} suffix="đ" color="from-indigo-500 to-blue-600" />
        <KPICard icon={<ShoppingCart className="w-5 h-5" />} label="Tổng Đơn hàng" value={kpis.orders.toString()} suffix="đơn" color="from-emerald-500 to-green-600" />
        <KPICard icon={<TrendingUp className="w-5 h-5" />} label="Trung bình / Đơn" value={formatVND(kpis.avg)} suffix="đ" color="from-amber-500 to-orange-600" />
        <KPICard icon={<Users className="w-5 h-5" />} label="Điểm bán hoạt động" value={kpis.customers.toString()} suffix="ĐB" color="from-pink-500 to-rose-600" />
      </div>

      {/* Main Trend Chart with Target + Average */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard title={`📊 Doanh thu ${periodLabel} vs Target`} className="lg:col-span-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => formatVND(v)} />
                <Tooltip formatter={(v: any, name: any) => [
                  `${Number(v).toLocaleString('vi-VN')} đ`,
                  name === 'revenue' ? 'Thực tế' : name === 'target' ? 'Target' : 'Trung bình'
                ]} contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="url(#ovBarGrad)" radius={[4, 4, 0, 0]} name="Thực tế" />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Target" />
                {avgRevenue > 0 && <ReferenceLine y={avgRevenue} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" label={{ value: `TB: ${formatVND(avgRevenue)}`, fill: '#f59e0b', fontSize: 11, position: 'insideTopRight' }} />}
                <Legend />
                <defs><linearGradient id="ovBarGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="🥧 Cơ cấu nhóm hàng">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${(name || '').toString().split('(')[0].trim()} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false} style={{ fontSize: 10 }} cursor="pointer"
                  onClick={(data: any) => setFilters(f => ({ ...f, selectedCategory: f.selectedCategory === data.name ? null : data.name }))}>
                  {categoryData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={filters.selectedCategory && filters.selectedCategory !== e.name ? 0.3 : 1} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')} đ`, 'Doanh thu']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Channel + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="🏪 So sánh kênh phân phối">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => formatVND(v)} />
                <Tooltip formatter={(v: any, name: any) => [`${Number(v).toLocaleString('vi-VN')}${name === 'revenue' ? ' đ' : ''}`, name === 'revenue' ? 'Doanh thu' : 'Số đơn']} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} name="Doanh thu" cursor="pointer"
                  onClick={(data: any) => setFilters(f => ({ ...f, selectedChannel: f.selectedChannel === data.channel ? null : data.channel }))} />
                <Bar dataKey="orders" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Số đơn" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 -mt-4">
            <Award className="w-5 h-5 text-amber-500" /> Top Sản phẩm bán chạy
          </h2>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-zinc-700">
              <th className="text-left py-2 px-2 text-gray-500 font-medium">#</th>
              <th className="text-left py-2 px-2 text-gray-500 font-medium">Sản phẩm</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">SL</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">Doanh thu</th>
            </tr></thead>
            <tbody>{topProducts.map((p, i) => (
              <tr key={p.sku} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                <td className="py-2 px-2"><span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>{i + 1}</span></td>
                <td className="py-2 px-2"><p className="font-medium text-gray-900 dark:text-white text-xs">{p.name}</p><p className="text-[10px] text-gray-400">{p.sku}</p></td>
                <td className="py-2 px-2 text-right font-mono text-xs text-gray-700 dark:text-gray-300">{p.qty}</td>
                <td className="py-2 px-2 text-right font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400">{formatVND(p.rev)}đ</td>
              </tr>
            ))}</tbody>
          </table>
        </ChartCard>
      </div>

      {/* Team Tree */}
      <ChartCard title="">
        <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 -mt-4">
          <Briefcase className="w-5 h-5 text-indigo-500" /> Doanh thu đội ngũ
        </h2>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {asmList.map(asm => (
            <div key={asm.id}>
              <button onClick={() => { setExpandedASM(p => ({ ...p, [asm.id]: !p[asm.id] })); setFilters(f => ({ ...f, selectedEmployee: f.selectedEmployee === asm.id ? null : asm.id })); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-left ${filters.selectedEmployee === asm.id ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}>
                {expandedASM[asm.id] ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: ROLE_COLORS.ASM }}>ASM</span>
                <span className="font-semibold text-gray-900 dark:text-white flex-1 text-sm">{asm.name}</span>
                <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">{formatVND(asm.revenue)}đ</span>
                <span className="text-xs text-gray-400 w-14 text-right">{asm.orders} đơn</span>
              </button>
              {expandedASM[asm.id] && ssList.filter(ss => ss.parent_id === asm.id).map(ss => (
                <div key={ss.id} className="ml-6">
                  <button onClick={() => { setExpandedSS(p => ({ ...p, [ss.id]: !p[ss.id] })); setFilters(f => ({ ...f, selectedEmployee: f.selectedEmployee === ss.id ? null : ss.id })); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left ${filters.selectedEmployee === ss.id ? 'bg-amber-100 dark:bg-amber-900/30' : 'hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}>
                    {expandedSS[ss.id] ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: ROLE_COLORS.SS }}>SS</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 flex-1 text-sm">{ss.name}</span>
                    <span className="text-sm font-mono text-amber-600 dark:text-amber-400">{formatVND(ss.revenue)}đ</span>
                    <span className="text-xs text-gray-400 w-14 text-right">{ss.orders} đơn</span>
                  </button>
                  {expandedSS[ss.id] && srList.filter(sr => sr.parent_id === ss.id).map(sr => (
                    <div key={sr.id} onClick={() => setFilters(f => ({ ...f, selectedEmployee: f.selectedEmployee === sr.id ? null : sr.id }))}
                      className={`ml-6 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${filters.selectedEmployee === sr.id ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}>
                      <div className="w-3.5 h-3.5" />
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: ROLE_COLORS.SR }}>SR</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{sr.name}</span>
                      <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400">{formatVND(sr.revenue)}đ</span>
                      <span className="text-xs text-gray-400 w-14 text-right">{sr.orders} đơn</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </ChartCard>
    </>
  );
}
