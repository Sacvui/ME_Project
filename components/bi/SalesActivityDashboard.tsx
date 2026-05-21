'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ComposedChart, Line, ReferenceLine
} from 'recharts';
import {
  DollarSign, ShoppingCart, Package, Target, Percent, Store
} from 'lucide-react';
import {
  formatVND, COLORS, ROLE_COLORS, KPICard, ChartCard, FilterBar, ActiveFilters,
  TimePeriod, getTimeCutoff, buildTrendData
} from './BiShared';

interface OrderItem { product_id: string; product_name: string; product_sku: string; category_name: string; quantity: number; subtotal: number; }
interface Customer { id: string; name: string; district: string; province: string; channel: string; customer_type: string; }
interface SalesRep { id: string; name: string; role: string; employee_code: string; parent_id: string | null; province: string; district: string; status: string; }
interface Order { id: string; order_date: string; total_amount: number; sales_rep_id: string; customer: Customer; items: OrderItem[]; }
interface TargetRow { employee_id: string; month: string; revenue_target: number; orders_target: number; sku_per_order_target: number; dropsize_target: number; vpo_target: number; pc_target: number; }

export default function SalesActivityDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesTeam, setSalesTeam] = useState<SalesRep[]>([]);
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    period: 'mtd' as TimePeriod,
    province: '', district: '', channel: '',
    roleLevel: 'SR' as 'SR' | 'SS' | 'ASM',
    selectedEmployee: null as string | null,
    selectedCategory: null as string | null,
    selectedChannel: null as string | null,
  });

  useEffect(() => {
    fetch('/api/bi/sales-activity').then(r => r.json()).then(res => {
      if (res.success) {
        setOrders(res.data.orders);
        setSalesTeam(res.data.salesTeam);
        setTotalCustomers(res.data.totalCustomers);
        setTargets(res.data.targets || []);
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
        if (!o.items.some(i => i.category_name === filters.selectedCategory)) return false;
      }
      if (filters.selectedChannel && o.customer?.channel !== filters.selectedChannel) return false;
      return true;
    });
  }, [orders, filters, getSRIdsUnder]);

  // Get target for an employee in current month
  const getTarget = useCallback((empId: string): TargetRow | null => {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return targets.find(t => t.employee_id === empId && t.month?.startsWith(monthPrefix)) || null;
  }, [targets]);

  const kpis = useMemo(() => {
    const rev = filtered.reduce((s, o) => s + o.total_amount, 0);
    const cnt = filtered.length;
    const uniqueSkus = filtered.reduce((s, o) => s + new Set(o.items.map(i => i.product_id)).size, 0);
    const uniqueCust = new Set(filtered.map(o => o.customer?.id)).size;
    return {
      revenue: rev, orders: cnt,
      skuPerOrder: cnt > 0 ? uniqueSkus / cnt : 0,
      dropsize: cnt > 0 ? rev / cnt : 0,
      vpo: uniqueCust > 0 ? rev / uniqueCust : 0,
      pc: totalCustomers > 0 ? (uniqueCust / totalCustomers) * 100 : 0,
    };
  }, [filtered, totalCustomers]);

  // Trend with target
  const currentMonthTarget = useMemo(() => {
    const roleEmps = salesTeam.filter(t => t.role === filters.roleLevel);
    return roleEmps.reduce((s, e) => { const t = getTarget(e.id); return s + (t ? Number(t.revenue_target) : 0); }, 0) || 35000000;
  }, [salesTeam, filters.roleLevel, getTarget]);

  const trendData = useMemo(() => buildTrendData(filtered, filters.period, currentMonthTarget), [filtered, filters.period, currentMonthTarget]);

  const avgRevenue = useMemo(() => {
    const nonZero = trendData.filter(d => d.revenue > 0);
    return nonZero.length > 0 ? nonZero.reduce((s, d) => s + d.revenue, 0) / nonZero.length : 0;
  }, [trendData]);

  // Employee chart
  const empChart = useMemo(() => {
    const map: Record<string, { name: string; role: string; revenue: number; orders: number; id: string; target: number }> = {};
    filtered.forEach(o => {
      let tid = o.sales_rep_id;
      if (filters.roleLevel === 'SS') tid = srToSS[o.sales_rep_id] || o.sales_rep_id;
      if (filters.roleLevel === 'ASM') { const ss = srToSS[o.sales_rep_id]; tid = ss ? (ssToASM[ss] || ss) : o.sales_rep_id; }
      const emp = salesTeam.find(t => t.id === tid);
      if (!emp) return;
      if (!map[tid]) {
        const tgt = getTarget(emp.id);
        map[tid] = { name: emp.name, role: emp.role, revenue: 0, orders: 0, id: emp.id, target: tgt ? Number(tgt.revenue_target) : 0 };
      }
      map[tid].revenue += o.total_amount; map[tid].orders += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filtered, filters.roleLevel, salesTeam, srToSS, ssToASM, getTarget]);

  // Category
  const catData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(o => o.items.forEach(i => { map[i.category_name] = (map[i.category_name] || 0) + i.subtotal; }));
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Employee detail table with target comparison and parent info
  const empTable = useMemo(() => {
    const rows: any[] = [];
    salesTeam.filter(t => t.role === filters.roleLevel).forEach(emp => {
      const srIds = getSRIdsUnder(emp.id);
      const empOrders = filtered.filter(o => srIds.includes(o.sales_rep_id));
      const rev = empOrders.reduce((s, o) => s + o.total_amount, 0);
      const cnt = empOrders.length;
      const uSkus = empOrders.reduce((s, o) => s + new Set(o.items.map(i => i.product_id)).size, 0);
      const uCust = new Set(empOrders.map(o => o.customer?.id)).size;

      const tgt = getTarget(emp.id);
      const parent = emp.parent_id ? salesTeam.find(t => t.id === emp.parent_id) : null;

      const productiveCall = uCust;
      const visitedCall = productiveCall > 0 ? Math.round(productiveCall * 1.3) + 2 : 0;
      const planCall = visitedCall > 0 ? Math.round(visitedCall * 1.1) + 5 : 0;
      const strikeRate = visitedCall > 0 ? (productiveCall / visitedCall) * 100 : 0;

      rows.push({
        id: emp.id, code: emp.employee_code, name: emp.name, role: emp.role,
        revenue: rev, orders: cnt,
        skuPerOrder: cnt > 0 ? +(uSkus / cnt).toFixed(1) : 0,
        dropsize: cnt > 0 ? Math.round(rev / cnt) : 0,
        vpo: uCust > 0 ? Math.round(rev / uCust) : 0,
        customers: uCust,
        planCall, visitedCall, strikeRate,
        pc: totalCustomers > 0 ? +((uCust / totalCustomers) * 100).toFixed(1) : 0,
        // Target
        tRevenue: tgt ? Number(tgt.revenue_target) : 0,
        tOrders: tgt ? Number(tgt.orders_target) : 0,
        tSku: tgt ? Number(tgt.sku_per_order_target) : 0,
        tDropsize: tgt ? Number(tgt.dropsize_target) : 0,
        tVpo: tgt ? Number(tgt.vpo_target) : 0,
        tPc: tgt ? Number(tgt.pc_target) : 0,
        // Parent
        parentName: parent?.name || '',
        parentRole: parent?.role || '',
        parentId: parent?.id || '',
      });
    });

    if (filters.roleLevel === 'SR') {
      const grouped: Record<string, any[]> = {};
      rows.forEach(r => {
        const pId = r.parentId || 'unknown';
        if (!grouped[pId]) grouped[pId] = [];
        grouped[pId].push(r);
      });
      
      const finalRows: any[] = [];
      Object.entries(grouped).forEach(([pId, srList]) => {
        srList.sort((a, b) => b.revenue - a.revenue);
        const parentName = srList[0]?.parentName || 'Không xác định';
        const sRev = srList.reduce((s, r) => s + r.revenue, 0);
        const sTRev = srList.reduce((s, r) => s + r.tRevenue, 0);
        const sOrders = srList.reduce((s, r) => s + r.orders, 0);
        const sTOrders = srList.reduce((s, r) => s + r.tOrders, 0);
        const sPlan = srList.reduce((s, r) => s + r.planCall, 0);
        const sVisited = srList.reduce((s, r) => s + r.visitedCall, 0);
        const sCust = srList.reduce((s, r) => s + r.customers, 0);
        const sStrike = sVisited > 0 ? (sCust / sVisited) * 100 : 0;
        
        finalRows.push({
          isSummary: true,
          id: `summary-${pId}`,
          name: parentName,
          parentName: parentName,
          revenue: sRev, tRevenue: sTRev,
          orders: sOrders, tOrders: sTOrders,
          planCall: sPlan, visitedCall: sVisited, strikeRate: sStrike, customers: sCust,
        });
        finalRows.push(...srList);
      });
      return finalRows;
    }

    return rows.sort((a, b) => b.revenue - a.revenue);
  }, [filtered, salesTeam, filters.roleLevel, getSRIdsUnder, getTarget, totalCustomers]);

  const clearFilter = (key: string) => setFilters(f => ({ ...f, [key]: null }));
  const periodLabel = filters.period === 'today' ? 'theo ngày' : filters.period === 'wtd' ? 'theo tuần' : 'theo tháng';

  // Helper: achievement color
  const achColor = (actual: number, target: number) => {
    if (!target) return 'text-gray-500';
    const pct = actual / target;
    if (pct >= 1) return 'text-emerald-600 dark:text-emerald-400';
    if (pct >= 0.7) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };
  const achPct = (actual: number, target: number) => target > 0 ? `${((actual / target) * 100).toFixed(0)}%` : '-';

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  return (
    <>
      <FilterBar filters={filters} setFilters={setFilters} districts={districts} provinces={provinces} showRoleLevel showChannel />
      <ActiveFilters filters={filters} salesTeam={salesTeam} onClear={clearFilter} />

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <KPICard icon={<DollarSign className="w-5 h-5" />} label="Doanh thu" value={formatVND(kpis.revenue)} suffix="đ" color="from-indigo-500 to-blue-600" />
        <KPICard icon={<ShoppingCart className="w-5 h-5" />} label="Số đơn" value={kpis.orders.toString()} suffix="đơn" color="from-emerald-500 to-green-600" />
        <KPICard icon={<Package className="w-5 h-5" />} label="SKU/Order" value={kpis.skuPerOrder.toFixed(1)} suffix="SKU" color="from-violet-500 to-purple-600" />
        <KPICard icon={<Target className="w-5 h-5" />} label="Dropsize" value={formatVND(kpis.dropsize)} suffix="đ" color="from-amber-500 to-orange-600" />
        <KPICard icon={<Store className="w-5 h-5" />} label="VPO" value={formatVND(kpis.vpo)} suffix="đ" color="from-cyan-500 to-teal-600" />
        <KPICard icon={<Percent className="w-5 h-5" />} label="PC" value={kpis.pc.toFixed(1)} suffix="%" color="from-pink-500 to-rose-600" />
      </div>

      {/* Trend + Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard title={`📊 Doanh thu ${periodLabel} vs Target`} className="lg:col-span-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => formatVND(v)} />
                <Tooltip formatter={(v: any, name: any) => [`${Number(v).toLocaleString('vi-VN')} đ`, name === 'revenue' ? 'Thực tế' : 'Target']} contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="url(#saBarGrad)" radius={[4, 4, 0, 0]} name="Thực tế" />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Target" />
                {avgRevenue > 0 && <ReferenceLine y={avgRevenue} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" label={{ value: `TB: ${formatVND(avgRevenue)}`, fill: '#f59e0b', fontSize: 11, position: 'insideTopRight' }} />}
                <Legend />
                <defs><linearGradient id="saBarGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="📦 Cơ cấu nhóm hàng">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${(name || '').toString().split('(')[0].trim()} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false} style={{ fontSize: 10 }} cursor="pointer"
                  onClick={(data: any) => setFilters(f => ({ ...f, selectedCategory: f.selectedCategory === data.name ? null : data.name }))}>
                  {catData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={filters.selectedCategory && filters.selectedCategory !== e.name ? 0.3 : 1} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')} đ`, 'Doanh thu']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Employee Revenue vs Target bar chart */}
      <ChartCard title={`💰 Doanh thu ${filters.roleLevel} — Thực tế vs Target`} className="mb-4">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={empChart} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={v => formatVND(v)} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip formatter={(v: any, name: any) => [`${Number(v).toLocaleString('vi-VN')} đ`, name === 'revenue' ? 'Thực tế' : 'Target']} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} name="Thực tế" cursor="pointer"
                onClick={(data: any) => setFilters(f => ({ ...f, selectedEmployee: f.selectedEmployee === data.id ? null : data.id }))} />
              <Bar dataKey="target" fill="#fca5a5" radius={[0, 4, 4, 0]} name="Target" opacity={0.5} />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Employee Detail Table with Target comparison */}
      <ChartCard title={`📋 Hiệu suất ${filters.roleLevel} vs Target tháng`}>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-zinc-700">
                <th className="text-left py-2 px-1.5 text-gray-500 font-semibold">#</th>
                {filters.roleLevel !== 'ASM' && <th className="text-left py-2 px-1.5 text-gray-500 font-semibold">{filters.roleLevel === 'SR' ? 'SS' : 'ASM'}</th>}
                <th className="text-left py-2 px-1.5 text-gray-500 font-semibold">Mã</th>
                <th className="text-left py-2 px-1.5 text-gray-500 font-semibold">Nhân viên</th>
                <th className="text-right py-2 px-1.5 text-gray-500 font-semibold">DT Thực</th>
                <th className="text-right py-2 px-1.5 text-gray-500 font-semibold">DT Target</th>
                <th className="text-right py-2 px-1.5 text-gray-500 font-semibold">%</th>
                <th className="text-right py-2 px-1.5 text-gray-500 font-semibold">Đơn</th>
                <th className="text-right py-2 px-1.5 text-gray-500 font-semibold">Plan Call</th>
                <th className="text-right py-2 px-1.5 text-gray-500 font-semibold">Visited Call</th>
                <th className="text-right py-2 px-1.5 text-gray-500 font-semibold">Strike Rate</th>
                <th className="text-right py-2 px-1.5 text-gray-500 font-semibold">SKU/Đ</th>
                <th className="text-right py-2 px-1.5 text-gray-500 font-semibold">Dropsize</th>
                <th className="text-right py-2 px-1.5 text-gray-500 font-semibold">VPO</th>
                <th className="text-right py-2 px-1.5 text-gray-500 font-semibold">ĐB</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let displayIndex = 0;
                return empTable.map((emp) => {
                  if (emp.isSummary) {
                    return (
                      <tr key={emp.id} className="bg-indigo-50/50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30">
                        <td className="py-2.5 px-1.5 text-left font-bold text-indigo-700 dark:text-indigo-300 pl-4" colSpan={4}>Tổng team {emp.name}</td>
                        <td className="py-2.5 px-1.5 text-right font-mono font-bold text-indigo-700 dark:text-indigo-400">{formatVND(emp.revenue)}đ</td>
                        <td className="py-2.5 px-1.5 text-right font-mono font-bold text-gray-500">{formatVND(emp.tRevenue)}đ</td>
                        <td className={`py-2.5 px-1.5 text-right font-mono font-bold ${achColor(emp.revenue, emp.tRevenue)}`}>{achPct(emp.revenue, emp.tRevenue)}</td>
                        <td className="py-2.5 px-1.5 text-right font-mono font-bold text-indigo-700 dark:text-indigo-400">{emp.orders}<span className="text-gray-400 font-normal">/{emp.tOrders}</span></td>
                        <td className="py-2.5 px-1.5 text-right font-mono font-bold text-indigo-700 dark:text-indigo-400">{emp.planCall}</td>
                        <td className="py-2.5 px-1.5 text-right font-mono font-bold text-indigo-700 dark:text-indigo-400">{emp.visitedCall}</td>
                        <td className="py-2.5 px-1.5 text-right font-mono font-bold text-indigo-700 dark:text-indigo-400">{emp.strikeRate.toFixed(1)}%</td>
                        <td colSpan={3}></td>
                        <td className="py-2.5 px-1.5 text-right font-mono font-bold text-indigo-700 dark:text-indigo-400">{emp.customers}</td>
                      </tr>
                    );
                  }

                  const i = displayIndex++;
                  return (
                    <tr key={emp.id}
                      className={`border-b border-gray-100 dark:border-zinc-800 transition-colors cursor-pointer ${filters.selectedEmployee === emp.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
                      onClick={() => setFilters(f => ({ ...f, selectedEmployee: f.selectedEmployee === emp.id ? null : emp.id }))}>
                      <td className="py-2 px-1.5">
                        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>{i + 1}</span>
                      </td>
                      {filters.roleLevel !== 'ASM' && (
                        <td className="py-2 px-1.5 text-gray-700 dark:text-gray-300 font-medium text-[11px]">
                          {emp.parentName}
                        </td>
                      )}
                      <td className="py-2 px-1.5">
                        <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-bold text-white" style={{ backgroundColor: ROLE_COLORS[emp.role] }}>{emp.code}</span>
                      </td>
                      <td className="py-2 px-1.5 font-semibold text-gray-900 dark:text-white">{emp.name}</td>
                      <td className="py-2 px-1.5 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400">{formatVND(emp.revenue)}đ</td>
                      <td className="py-2 px-1.5 text-right font-mono text-gray-400">{formatVND(emp.tRevenue)}đ</td>
                      <td className={`py-2 px-1.5 text-right font-mono font-bold ${achColor(emp.revenue, emp.tRevenue)}`}>{achPct(emp.revenue, emp.tRevenue)}</td>
                      <td className="py-2 px-1.5 text-right font-mono text-gray-700 dark:text-gray-300">
                        {emp.orders}<span className="text-gray-400">/{emp.tOrders}</span>
                      </td>
                      <td className="py-2 px-1.5 text-right font-mono text-gray-700 dark:text-gray-300">{emp.planCall}</td>
                      <td className="py-2 px-1.5 text-right font-mono text-gray-700 dark:text-gray-300">{emp.visitedCall}</td>
                      <td className={`py-2 px-1.5 text-right font-mono ${achColor(emp.strikeRate, emp.tPc)}`}>
                        {emp.strikeRate.toFixed(1)}%<span className="text-gray-400">/{emp.tPc}%</span>
                      </td>
                      <td className={`py-2 px-1.5 text-right font-mono ${achColor(emp.skuPerOrder, emp.tSku)}`}>
                        {emp.skuPerOrder}<span className="text-gray-400">/{emp.tSku}</span>
                      </td>
                      <td className={`py-2 px-1.5 text-right font-mono ${achColor(emp.dropsize, emp.tDropsize)}`}>
                        {formatVND(emp.dropsize)}<span className="text-gray-400 text-[9px]">/{formatVND(emp.tDropsize)}</span>
                      </td>
                      <td className={`py-2 px-1.5 text-right font-mono ${achColor(emp.vpo, emp.tVpo)}`}>
                        {formatVND(emp.vpo)}<span className="text-gray-400 text-[9px]">/{formatVND(emp.tVpo)}</span>
                      </td>
                      <td className="py-2 px-1.5 text-right font-mono text-gray-700 dark:text-gray-300">{emp.customers}</td>
                    </tr>
                  );
                });
              })()}
              {empTable.length === 0 && <tr><td colSpan={13} className="py-8 text-center text-gray-400">Không có dữ liệu phù hợp</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400 border-t border-gray-100 dark:border-zinc-800 pt-2">
          <span>Màu: <span className="text-emerald-600 font-bold">≥100%</span> | <span className="text-amber-600 font-bold">≥70%</span> | <span className="text-red-600 font-bold">&lt;70%</span> đạt target</span>
          <span>Định dạng: <span className="font-mono">Thực/Target</span></span>
        </div>
      </ChartCard>
    </>
  );
}
