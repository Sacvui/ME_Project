'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, ComposedChart
} from 'recharts';
import {
  TrendingUp, Users, Target, Activity, ArrowUpRight, ArrowDownRight,
  Package, ShoppingCart, Calendar, Database, Zap, Award, BarChart3
} from 'lucide-react';
import { formatVND, KPICard, ChartCard, ROLE_COLORS, COLORS } from './BiShared';

/* ---- Types ---- */
interface MVSummaryRow {
  sales_rep_id: string;
  month: string;
  total_revenue: number;
  total_orders: number;
  unique_customers: number;
  total_items_sold: number;
}

interface SalesTeam {
  id: string;
  name: string;
  role: string;
  parent_id: string | null;
}

interface TargetRow {
  employee_id: string;
  month: string;
  revenue_target: number;
  orders_target: number;
}

/* ---- Component ---- */
export default function ExecutiveSummaryDashboard() {
  const [data, setData] = useState<MVSummaryRow[]>([]);
  const [team, setTeam] = useState<Record<string, SalesTeam>>({});
  const [teamList, setTeamList] = useState<SalesTeam[]>([]);
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [ordersRaw, setOrdersRaw] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [dataSource, setDataSource] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetch('/api/bi/executive-summary')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setData(res.data.summary);
          const tMap: Record<string, SalesTeam> = {};
          res.data.salesTeam.forEach((t: SalesTeam) => { tMap[t.id] = t; });
          setTeam(tMap);
          setTeamList(res.data.salesTeam);
          setTargets(res.data.targets || []);
          setOrdersRaw(res.data.ordersForTrend || []);
          setCategoryData(res.data.categoryData || []);
          setDataSource(res.data.source || 'unknown');
        } else {
          setError(res.error || 'Failed to load data');
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  /* ---- Computed values ---- */
  const months = useMemo(() => {
    const s = new Set(data.map(r => r.month));
    return Array.from(s).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    let d = data;
    if (selectedMonth) d = d.filter(r => r.month === selectedMonth);
    if (selectedRole) d = d.filter(r => team[r.sales_rep_id]?.role === selectedRole);
    return d;
  }, [data, selectedMonth, selectedRole, team]);

  // Grand totals
  const totalKPIs = useMemo(() => {
    return filteredData.reduce((acc, row) => ({
      revenue: acc.revenue + Number(row.total_revenue),
      orders: acc.orders + Number(row.total_orders),
      customers: acc.customers + Number(row.unique_customers),
      items: acc.items + Number(row.total_items_sold),
    }), { revenue: 0, orders: 0, customers: 0, items: 0 });
  }, [filteredData]);

  // Targets total
  const totalTargets = useMemo(() => {
    let tgt = targets;
    if (selectedMonth) tgt = tgt.filter(t => t.month === selectedMonth);
    if (selectedRole) tgt = tgt.filter(t => team[t.employee_id]?.role === selectedRole);
    return tgt.reduce((acc, t) => ({
      revenueTarget: acc.revenueTarget + Number(t.revenue_target || 0),
      ordersTarget: acc.ordersTarget + Number(t.orders_target || 0),
    }), { revenueTarget: 0, ordersTarget: 0 });
  }, [targets, selectedMonth, selectedRole, team]);

  const revenueAchievement = totalTargets.revenueTarget > 0
    ? ((totalKPIs.revenue / totalTargets.revenueTarget) * 100)
    : 0;
  const ordersAchievement = totalTargets.ordersTarget > 0
    ? ((totalKPIs.orders / totalTargets.ordersTarget) * 100)
    : 0;

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const map: Record<string, { month: string; revenue: number; orders: number; customers: number; target: number }> = {};
    data.forEach(row => {
      if (!map[row.month]) map[row.month] = { month: row.month, revenue: 0, orders: 0, customers: 0, target: 0 };
      map[row.month].revenue += Number(row.total_revenue);
      map[row.month].orders += Number(row.total_orders);
      map[row.month].customers += Number(row.unique_customers);
    });
    targets.forEach(t => {
      if (map[t.month]) {
        map[t.month].target += Number(t.revenue_target || 0);
      }
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [data, targets]);

  // Top reps
  const topReps = useMemo(() => {
    const map: Record<string, { name: string; role: string; revenue: number; orders: number; customers: number; items: number }> = {};
    filteredData.forEach(row => {
      const rep = team[row.sales_rep_id];
      if (!rep) return;
      if (!map[rep.id]) map[rep.id] = { name: rep.name, role: rep.role, revenue: 0, orders: 0, customers: 0, items: 0 };
      map[rep.id].revenue += Number(row.total_revenue);
      map[rep.id].orders += Number(row.total_orders);
      map[rep.id].customers += Number(row.unique_customers);
      map[rep.id].items += Number(row.total_items_sold);
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredData, team]);

  // Role breakdown
  const roleBreakdown = useMemo(() => {
    const map: Record<string, { role: string; revenue: number; orders: number; count: number }> = {};
    filteredData.forEach(row => {
      const rep = team[row.sales_rep_id];
      if (!rep) return;
      if (!map[rep.role]) map[rep.role] = { role: rep.role, revenue: 0, orders: 0, count: 0 };
      map[rep.role].revenue += Number(row.total_revenue);
      map[rep.role].orders += Number(row.total_orders);
    });
    // Count unique reps per role
    const repRoles: Record<string, Set<string>> = {};
    filteredData.forEach(row => {
      const rep = team[row.sales_rep_id];
      if (!rep) return;
      if (!repRoles[rep.role]) repRoles[rep.role] = new Set();
      repRoles[rep.role].add(row.sales_rep_id);
    });
    Object.keys(map).forEach(r => { map[r].count = repRoles[r]?.size || 0; });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredData, team]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; qty: number }> = {};
    categoryData.forEach((item: any) => {
      const catName = item.product?.category?.name || 'Khác';
      if (!map[catName]) map[catName] = { name: catName, revenue: 0, qty: 0 };
      map[catName].revenue += Number(item.subtotal || 0);
      map[catName].qty += Number(item.quantity || 0);
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [categoryData]);

  // Avg order value
  const avgOrderValue = totalKPIs.orders > 0 ? totalKPIs.revenue / totalKPIs.orders : 0;
  const avgItemsPerOrder = totalKPIs.orders > 0 ? totalKPIs.items / totalKPIs.orders : 0;

  /* ---- Loading / Error ---- */
  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải dữ liệu tổng hợp...</p>
    </div>
  );
  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <Activity className="w-8 h-8 text-red-500" />
      </div>
      <p className="text-red-500 font-medium">Lỗi: {error}</p>
    </div>
  );

  const selectCls = "rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header + Source badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Báo cáo Tổng hợp (Executive Summary)</h2>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
            dataSource === 'materialized_view'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
          }`}>
            {dataSource === 'materialized_view' ? (
              <><Database className="w-3 h-3" /> MV</>
            ) : (
              <><Zap className="w-3 h-3" /> Realtime</>
            )}
          </span>
        </div>
        {/* Filters */}
        <div className="flex gap-2 items-center">
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className={selectCls}>
            <option value="">Tất cả tháng</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className={selectCls}>
            <option value="">Tất cả cấp</option>
            <option value="ASM">ASM</option>
            <option value="SS">SS</option>
            <option value="SR">SR</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={<TrendingUp className="w-5 h-5" />} label="Tổng Doanh thu" value={formatVND(totalKPIs.revenue)} suffix="đ" color="from-indigo-500 to-blue-600" />
        <KPICard icon={<ShoppingCart className="w-5 h-5" />} label="Tổng Đơn hàng" value={totalKPIs.orders.toLocaleString('vi-VN')} suffix="đơn" color="from-emerald-500 to-green-600" />
        <KPICard icon={<Users className="w-5 h-5" />} label="Khách hàng mua" value={totalKPIs.customers.toLocaleString('vi-VN')} suffix="KH" color="from-amber-500 to-orange-600" />
        <KPICard icon={<Package className="w-5 h-5" />} label="Sản phẩm bán" value={totalKPIs.items.toLocaleString('vi-VN')} suffix="SP" color="from-pink-500 to-rose-600" />
      </div>

      {/* KPI Cards Row 2 - Achievement */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Target DT</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatVND(totalTargets.revenueTarget)}<span className="text-sm text-gray-400 font-normal ml-1">đ</span></p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-700"
                style={{ width: `${Math.min(revenueAchievement, 100)}%` }} />
            </div>
            <span className={`text-xs font-bold ${revenueAchievement >= 100 ? 'text-emerald-600' : revenueAchievement >= 80 ? 'text-amber-600' : 'text-red-500'}`}>
              {revenueAchievement.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Target Đơn</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{totalTargets.ordersTarget.toLocaleString('vi-VN')}<span className="text-sm text-gray-400 font-normal ml-1">đơn</span></p>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-700"
                style={{ width: `${Math.min(ordersAchievement, 100)}%` }} />
            </div>
            <span className={`text-xs font-bold ${ordersAchievement >= 100 ? 'text-emerald-600' : ordersAchievement >= 80 ? 'text-amber-600' : 'text-red-500'}`}>
              {ordersAchievement.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">Giá trị TB/Đơn</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatVND(avgOrderValue)}<span className="text-sm text-gray-400 font-normal ml-1">đ</span></p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-1">TB SP/Đơn</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{avgItemsPerOrder.toFixed(1)}<span className="text-sm text-gray-400 font-normal ml-1">SP</span></p>
        </div>
      </div>

      {/* Charts Row 1: Monthly Trend + Role Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="📈 Xu hướng Doanh thu theo Tháng" className="lg:col-span-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => formatVND(v)} />
                <Tooltip
                  formatter={(v: any, name: any) => [
                    name === 'target' ? `${Number(v).toLocaleString('vi-VN')} đ` : `${Number(v).toLocaleString('vi-VN')} đ`,
                    name === 'revenue' ? 'Doanh thu' : name === 'target' ? 'Mục tiêu' : name
                  ]}
                  contentStyle={{ borderRadius: '12px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" name="Doanh thu" />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Mục tiêu" />
                <Legend />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="🏢 Phân bổ theo Cấp bậc">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="revenue"
                  nameKey="role"
                  label={({ role, percent }) => `${role} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {roleBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.role as keyof typeof ROLE_COLORS] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('vi-VN')} đ`}
                  contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend below */}
          <div className="mt-2 space-y-2">
            {roleBreakdown.map(r => (
              <div key={r.role} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ROLE_COLORS[r.role as keyof typeof ROLE_COLORS] || '#999' }} />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{r.role}</span>
                  <span className="text-gray-400 text-xs">({r.count} người)</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{formatVND(r.revenue)}đ</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2: Category + Orders Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="📦 Doanh thu theo Nhóm hàng">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => formatVND(v)} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={80} />
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('vi-VN')} đ`}
                  contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Doanh thu">
                  {categoryBreakdown.map((_, index) => (
                    <Cell key={`cat-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="📊 Số Đơn hàng theo Tháng">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} name="Số đơn" />
                <Bar dataKey="customers" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Khách hàng" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Top Representatives Table */}
      <ChartCard title="🏆 Bảng xếp hạng Nhân viên (theo Doanh thu tổng hợp)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-zinc-700">
                <th className="text-center py-3 px-2 text-gray-500 font-semibold w-10">#</th>
                <th className="text-left py-3 px-2 text-gray-500 font-semibold">Cấp</th>
                <th className="text-left py-3 px-2 text-gray-500 font-semibold">Nhân viên</th>
                <th className="text-right py-3 px-2 text-gray-500 font-semibold">Doanh thu</th>
                <th className="text-right py-3 px-2 text-gray-500 font-semibold">Số đơn</th>
                <th className="text-right py-3 px-2 text-gray-500 font-semibold">KH Mua</th>
                <th className="text-right py-3 px-2 text-gray-500 font-semibold">SP Bán</th>
                <th className="text-right py-3 px-2 text-gray-500 font-semibold">TB/Đơn</th>
              </tr>
            </thead>
            <tbody>
              {topReps.map((rep, i) => {
                const avgOV = rep.orders > 0 ? rep.revenue / rep.orders : 0;
                return (
                  <tr key={i} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-2.5 px-2 text-center">
                      {i < 3 ? (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white ${
                          i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-amber-700'
                        }`}>{i + 1}</span>
                      ) : (
                        <span className="text-gray-400">{i + 1}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                        style={{ backgroundColor: ROLE_COLORS[rep.role as keyof typeof ROLE_COLORS] || '#999' }}>
                        {rep.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-gray-900 dark:text-white">{rep.name}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {formatVND(rep.revenue)}đ
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-gray-700 dark:text-gray-300">{rep.orders}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-gray-700 dark:text-gray-300">{rep.customers}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-gray-700 dark:text-gray-300">{rep.items}</td>
                    <td className="py-2.5 px-2 text-right font-mono text-sm text-gray-500 dark:text-gray-400">{formatVND(avgOV)}đ</td>
                  </tr>
                );
              })}
              {/* Totals row */}
              {topReps.length > 0 && (
                <tr className="border-t-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20 font-bold">
                  <td className="py-3 px-2" colSpan={2}></td>
                  <td className="py-3 px-2 text-indigo-700 dark:text-indigo-300">TỔNG CỘNG</td>
                  <td className="py-3 px-2 text-right font-mono text-indigo-700 dark:text-indigo-300">{formatVND(totalKPIs.revenue)}đ</td>
                  <td className="py-3 px-2 text-right font-mono text-indigo-700 dark:text-indigo-300">{totalKPIs.orders}</td>
                  <td className="py-3 px-2 text-right font-mono text-indigo-700 dark:text-indigo-300">{totalKPIs.customers}</td>
                  <td className="py-3 px-2 text-right font-mono text-indigo-700 dark:text-indigo-300">{totalKPIs.items}</td>
                  <td className="py-3 px-2 text-right font-mono text-indigo-700 dark:text-indigo-300">{formatVND(avgOrderValue)}đ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Data source info */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-600 py-2">
        <Calendar className="w-3 h-3 inline mr-1" />
        Nguồn dữ liệu: {dataSource === 'materialized_view' ? 'Materialized View (mv_sales_summary_by_rep_month)' : 'Tính toán realtime từ bảng orders/order_items'}
        {' • '} Cập nhật lúc {new Date().toLocaleString('vi-VN')}
      </div>
    </div>
  );
}
