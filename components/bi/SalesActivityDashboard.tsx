'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  DollarSign, ShoppingCart, Package, Target, Percent,
  Store, Filter, X
} from 'lucide-react';
import { formatVND, COLORS, ROLE_COLORS, KPICard, ChartCard } from './BiShared';

// ========================================
// TYPES
// ========================================
interface OrderItem {
  product_id: string; product_name: string; product_sku: string;
  category_name: string; quantity: number; subtotal: number;
}
interface Customer {
  id: string; name: string; district: string; province: string;
  channel: string; customer_type: string;
}
interface SalesRep {
  id: string; name: string; role: string; employee_code: string;
  parent_id: string | null; province: string; district: string; status: string;
}
interface Order {
  id: string; order_date: string; total_amount: number;
  sales_rep_id: string; customer: Customer; items: OrderItem[];
}
interface Filters {
  province: string; district: string; channel: string;
  roleLevel: 'SR' | 'SS' | 'ASM';
  days: number;
  selectedEmployee: string | null;
  selectedCategory: string | null;
}

const PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'];

export default function SalesActivityDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesTeam, setSalesTeam] = useState<SalesRep[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    province: '', district: '', channel: '', roleLevel: 'SR',
    days: 30, selectedEmployee: null, selectedCategory: null
  });

  useEffect(() => {
    fetch('/api/bi/sales-activity').then(r => r.json()).then(res => {
      if (res.success) {
        setOrders(res.data.orders);
        setSalesTeam(res.data.salesTeam);
        setTotalCustomers(res.data.totalCustomers);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Build hierarchy maps
  const { srToSS, ssToASM, parentMap } = useMemo(() => {
    const srToSS: Record<string, string> = {};
    const ssToASM: Record<string, string> = {};
    const parentMap: Record<string, string> = {};
    salesTeam.forEach(t => {
      if (t.parent_id) parentMap[t.id] = t.parent_id;
      if (t.role === 'SR' && t.parent_id) srToSS[t.id] = t.parent_id;
      if (t.role === 'SS' && t.parent_id) ssToASM[t.id] = t.parent_id;
    });
    return { srToSS, ssToASM, parentMap };
  }, [salesTeam]);

  // Get SR IDs under a given employee (for filtering by selected employee)
  const getSRIdsUnder = useCallback((employeeId: string): string[] => {
    const emp = salesTeam.find(t => t.id === employeeId);
    if (!emp) return [];
    if (emp.role === 'SR') return [emp.id];
    if (emp.role === 'SS') return salesTeam.filter(t => t.role === 'SR' && t.parent_id === emp.id).map(t => t.id);
    if (emp.role === 'ASM') {
      const ssIds = salesTeam.filter(t => t.role === 'SS' && t.parent_id === emp.id).map(t => t.id);
      return salesTeam.filter(t => t.role === 'SR' && ssIds.includes(t.parent_id || '')).map(t => t.id);
    }
    return [];
  }, [salesTeam]);

  // ========================================
  // FILTERED ORDERS (client-side cross-filter)
  // ========================================
  const filteredOrders = useMemo(() => {
    const cutoff = new Date(Date.now() - filters.days * 24 * 60 * 60 * 1000);
    return orders.filter(o => {
      if (new Date(o.order_date) < cutoff) return false;
      if (filters.province && o.customer?.province !== filters.province) return false;
      if (filters.district && o.customer?.district !== filters.district) return false;
      if (filters.channel && o.customer?.channel !== filters.channel) return false;
      if (filters.selectedEmployee) {
        const allowedSRs = getSRIdsUnder(filters.selectedEmployee);
        if (!allowedSRs.includes(o.sales_rep_id)) return false;
      }
      if (filters.selectedCategory) {
        const hasCategory = o.items.some(i => i.category_name === filters.selectedCategory);
        if (!hasCategory) return false;
      }
      return true;
    });
  }, [orders, filters, getSRIdsUnder]);

  // ========================================
  // KPI CALCULATIONS
  // ========================================
  const kpis = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((s, o) => s + o.total_amount, 0);
    const totalOrders = filteredOrders.length;
    const totalItems = filteredOrders.reduce((s, o) => s + o.items.length, 0);
    const uniqueSkus = filteredOrders.reduce((s, o) => s + new Set(o.items.map(i => i.product_id)).size, 0);
    const skuPerOrder = totalOrders > 0 ? (uniqueSkus / totalOrders) : 0;
    const dropsize = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueCustomers = new Set(filteredOrders.map(o => o.customer?.id)).size;
    const vpo = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;
    const pc = totalCustomers > 0 ? (uniqueCustomers / totalCustomers) * 100 : 0;
    return { totalRevenue, totalOrders, skuPerOrder, dropsize, vpo, pc, uniqueCustomers };
  }, [filteredOrders, totalCustomers]);

  // ========================================
  // CHART DATA — Employee Revenue (grouped by roleLevel)
  // ========================================
  const employeeChartData = useMemo(() => {
    const empMap: Record<string, { name: string; role: string; revenue: number; orders: number; id: string }> = {};

    filteredOrders.forEach(o => {
      let targetId = o.sales_rep_id;
      if (filters.roleLevel === 'SS') targetId = srToSS[o.sales_rep_id] || o.sales_rep_id;
      if (filters.roleLevel === 'ASM') {
        const ssId = srToSS[o.sales_rep_id];
        targetId = ssId ? (ssToASM[ssId] || ssId) : o.sales_rep_id;
      }
      const emp = salesTeam.find(t => t.id === targetId);
      if (!emp) return;
      if (!empMap[targetId]) empMap[targetId] = { name: emp.name, role: emp.role, revenue: 0, orders: 0, id: emp.id };
      empMap[targetId].revenue += o.total_amount;
      empMap[targetId].orders += 1;
    });

    return Object.values(empMap).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, filters.roleLevel, salesTeam, srToSS, ssToASM]);

  // ========================================
  // CHART DATA — Category Pie
  // ========================================
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    filteredOrders.forEach(o => {
      o.items.forEach(i => {
        catMap[i.category_name] = (catMap[i.category_name] || 0) + i.subtotal;
      });
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  // ========================================
  // CHART DATA — Weekly Trend
  // ========================================
  const weeklyTrend = useMemo(() => {
    const weekMap: Record<string, { revenue: number; orders: number; customers: Set<string> }> = {};
    filteredOrders.forEach(o => {
      const d = new Date(o.order_date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      if (!weekMap[key]) weekMap[key] = { revenue: 0, orders: 0, customers: new Set() };
      weekMap[key].revenue += o.total_amount;
      weekMap[key].orders += 1;
      if (o.customer?.id) weekMap[key].customers.add(o.customer.id);
    });
    return Object.entries(weekMap)
      .map(([week, d]) => ({
        week,
        revenue: d.revenue,
        dropsize: d.orders > 0 ? Math.round(d.revenue / d.orders) : 0,
        orders: d.orders
      }))
      .slice(-8);
  }, [filteredOrders]);

  // ========================================
  // CHART DATA — Channel comparison
  // ========================================
  const channelData = useMemo(() => {
    const chMap: Record<string, { revenue: number; orders: number }> = {};
    filteredOrders.forEach(o => {
      const ch = o.customer?.channel || 'GT';
      if (!chMap[ch]) chMap[ch] = { revenue: 0, orders: 0 };
      chMap[ch].revenue += o.total_amount;
      chMap[ch].orders += 1;
    });
    return Object.entries(chMap).map(([name, d]) => ({
      name: name === 'GT' ? 'Truyền thống (GT)' : 'Hiện đại (MT)',
      channel: name,
      revenue: d.revenue,
      orders: d.orders,
      dropsize: d.orders > 0 ? Math.round(d.revenue / d.orders) : 0
    }));
  }, [filteredOrders]);

  // ========================================
  // CHART DATA — Employee Detail Table
  // ========================================
  const employeeTable = useMemo(() => {
    // Build rows based on roleLevel
    const rows: any[] = [];
    const targetRole = filters.roleLevel;

    const empsOfRole = salesTeam.filter(t => t.role === targetRole);
    empsOfRole.forEach(emp => {
      const srIds = getSRIdsUnder(emp.id);
      const empOrders = filteredOrders.filter(o => srIds.includes(o.sales_rep_id));
      const revenue = empOrders.reduce((s, o) => s + o.total_amount, 0);
      const orderCount = empOrders.length;
      const uniqueSkus = empOrders.reduce((s, o) => s + new Set(o.items.map(i => i.product_id)).size, 0);
      const uniqueCust = new Set(empOrders.map(o => o.customer?.id)).size;

      rows.push({
        id: emp.id,
        code: emp.employee_code,
        name: emp.name,
        role: emp.role,
        revenue,
        orders: orderCount,
        skuPerOrder: orderCount > 0 ? (uniqueSkus / orderCount).toFixed(1) : '0',
        dropsize: orderCount > 0 ? Math.round(revenue / orderCount) : 0,
        vpo: uniqueCust > 0 ? Math.round(revenue / uniqueCust) : 0,
        customers: uniqueCust,
        // Parent info
        parentName: emp.parent_id ? salesTeam.find(t => t.id === emp.parent_id)?.name || '' : ''
      });
    });

    return rows.sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, salesTeam, filters.roleLevel, getSRIdsUnder]);

  // Districts for selected province
  const districts = useMemo(() => {
    if (!filters.province) return [];
    const dSet = new Set<string>();
    orders.forEach(o => { if (o.customer?.province === filters.province && o.customer?.district) dSet.add(o.customer.district); });
    return Array.from(dSet).sort();
  }, [orders, filters.province]);

  // Clear cross-filter
  const clearCrossFilter = () => setFilters(f => ({ ...f, selectedEmployee: null, selectedCategory: null }));
  const hasActiveFilter = filters.selectedEmployee || filters.selectedCategory;

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;
  }

  return (
    <>
      {/* Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bộ lọc</span>
          {hasActiveFilter && (
            <button onClick={clearCrossFilter} className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
              <X className="w-3.5 h-3.5" /> Xóa cross-filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select value={filters.province} onChange={e => setFilters(f => ({ ...f, province: e.target.value, district: '' }))}
            className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500">
            <option value="">Tất cả Tỉnh</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select value={filters.district} onChange={e => setFilters(f => ({ ...f, district: e.target.value }))}
            className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500">
            <option value="">Tất cả Quận/Huyện</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={filters.channel} onChange={e => setFilters(f => ({ ...f, channel: e.target.value }))}
            className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500">
            <option value="">Tất cả Kênh</option>
            <option value="GT">Truyền thống (GT)</option>
            <option value="MT">Hiện đại (MT)</option>
          </select>

          <select value={filters.roleLevel} onChange={e => setFilters(f => ({ ...f, roleLevel: e.target.value as any, selectedEmployee: null }))}
            className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500">
            <option value="SR">Theo SR</option>
            <option value="SS">Theo SS</option>
            <option value="ASM">Theo ASM</option>
          </select>

          <select value={filters.days} onChange={e => setFilters(f => ({ ...f, days: Number(e.target.value) }))}
            className="rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500">
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={90}>90 ngày</option>
          </select>
        </div>
      </div>

      {/* Active cross-filter indicator */}
      {hasActiveFilter && (
        <div className="flex items-center gap-2 mb-4 px-1">
          {filters.selectedEmployee && (
            <span className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-1 rounded-full font-medium">
              👤 {salesTeam.find(t => t.id === filters.selectedEmployee)?.name}
              <button onClick={() => setFilters(f => ({ ...f, selectedEmployee: null }))} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
          {filters.selectedCategory && (
            <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs px-2.5 py-1 rounded-full font-medium">
              📦 {filters.selectedCategory}
              <button onClick={() => setFilters(f => ({ ...f, selectedCategory: null }))} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <KPICard icon={<DollarSign className="w-5 h-5" />} label="Doanh thu" value={formatVND(kpis.totalRevenue)} suffix="đ" color="from-indigo-500 to-blue-600" />
        <KPICard icon={<ShoppingCart className="w-5 h-5" />} label="Số đơn" value={kpis.totalOrders.toString()} suffix="đơn" color="from-emerald-500 to-green-600" />
        <KPICard icon={<Package className="w-5 h-5" />} label="SKU/Order" value={kpis.skuPerOrder.toFixed(1)} suffix="SKU" color="from-violet-500 to-purple-600" />
        <KPICard icon={<Target className="w-5 h-5" />} label="Dropsize" value={formatVND(kpis.dropsize)} suffix="đ" color="from-amber-500 to-orange-600" />
        <KPICard icon={<Store className="w-5 h-5" />} label="VPO" value={formatVND(kpis.vpo)} suffix="đ" color="from-cyan-500 to-teal-600" />
        <KPICard icon={<Percent className="w-5 h-5" />} label="PC" value={kpis.pc.toFixed(1)} suffix="%" color="from-pink-500 to-rose-600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Revenue by Employee */}
        <ChartCard title={`💰 Doanh thu theo ${filters.roleLevel}`} className="lg:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeChartData} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tickFormatter={v => formatVND(v)} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')} đ`, 'Doanh thu']} />
                <Bar
                  dataKey="revenue"
                  fill="url(#empGrad)"
                  radius={[0, 6, 6, 0]}
                  cursor="pointer"
                  onClick={(data: any) => {
                    setFilters(f => ({
                      ...f,
                      selectedEmployee: f.selectedEmployee === data.id ? null : data.id
                    }));
                  }}
                />
                <defs><linearGradient id="empGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Category Pie */}
        <ChartCard title="📦 Cơ cấu nhóm hàng">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${(name || '').toString().split('(')[0].trim()} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false} style={{ fontSize: 10 }}
                  cursor="pointer"
                  onClick={(data: any) => {
                    setFilters(f => ({
                      ...f,
                      selectedCategory: f.selectedCategory === data.name ? null : data.name
                    }));
                  }}
                >
                  {categoryData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      opacity={filters.selectedCategory && filters.selectedCategory !== entry.name ? 0.3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')} đ`, 'Doanh thu']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Weekly Trend */}
        <ChartCard title="📈 Xu hướng Dropsize theo tuần">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => formatVND(v)} />
                <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')} đ`]} />
                <Line type="monotone" dataKey="dropsize" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} name="Dropsize" />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Channel comparison */}
        <ChartCard title="🏪 So sánh Kênh phân phối">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={v => formatVND(v)} />
                <Tooltip formatter={(v: any, name: any) => [`${Number(v).toLocaleString('vi-VN')}${name === 'revenue' ? ' đ' : ''}`, name === 'revenue' ? 'Doanh thu' : 'Số đơn']} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} name="Doanh thu" />
                <Bar dataKey="orders" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Số đơn" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Employee Detail Table */}
      <ChartCard title={`📋 Chi tiết hiệu suất — Cấp ${filters.roleLevel}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-700">
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">#</th>
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Mã NV</th>
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Nhân viên</th>
                {filters.roleLevel !== 'ASM' && <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Cấp trên</th>}
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Doanh thu</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Đơn</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">SKU/Đơn</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Dropsize</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">VPO</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Điểm bán</th>
              </tr>
            </thead>
            <tbody>
              {employeeTable.map((emp, i) => (
                <tr
                  key={emp.id}
                  className={`border-b border-gray-100 dark:border-zinc-800 transition-colors cursor-pointer ${
                    filters.selectedEmployee === emp.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                  }`}
                  onClick={() => setFilters(f => ({ ...f, selectedEmployee: f.selectedEmployee === emp.id ? null : emp.id }))}
                >
                  <td className="py-2.5 px-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>{i + 1}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: ROLE_COLORS[emp.role] }}>{emp.code}</span>
                  </td>
                  <td className="py-2.5 px-2 font-medium text-gray-900 dark:text-white">{emp.name}</td>
                  {filters.roleLevel !== 'ASM' && <td className="py-2.5 px-2 text-gray-500 text-xs">{emp.parentName}</td>}
                  <td className="py-2.5 px-2 text-right font-mono font-medium text-indigo-600 dark:text-indigo-400">{formatVND(emp.revenue)}đ</td>
                  <td className="py-2.5 px-2 text-right font-mono text-gray-700 dark:text-gray-300">{emp.orders}</td>
                  <td className="py-2.5 px-2 text-right font-mono text-violet-600 dark:text-violet-400">{emp.skuPerOrder}</td>
                  <td className="py-2.5 px-2 text-right font-mono text-amber-600 dark:text-amber-400">{formatVND(emp.dropsize)}đ</td>
                  <td className="py-2.5 px-2 text-right font-mono text-cyan-600 dark:text-cyan-400">{formatVND(emp.vpo)}đ</td>
                  <td className="py-2.5 px-2 text-right font-mono text-gray-700 dark:text-gray-300">{emp.customers}</td>
                </tr>
              ))}
              {employeeTable.length === 0 && (
                <tr><td colSpan={10} className="py-8 text-center text-gray-400">Không có dữ liệu phù hợp</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </>
  );
}
