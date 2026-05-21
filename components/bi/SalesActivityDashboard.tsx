'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  DollarSign, ShoppingCart, Package, Target, Percent, Store
} from 'lucide-react';
import {
  formatVND, COLORS, ROLE_COLORS, KPICard, ChartCard, FilterBar, ActiveFilters,
  TimePeriod, getTimeCutoff
} from './BiShared';

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

export default function SalesActivityDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesTeam, setSalesTeam] = useState<SalesRep[]>([]);
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

  // FILTERED
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

  // KPIs
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
      uniqueCust
    };
  }, [filtered, totalCustomers]);

  // Employee chart
  const empChart = useMemo(() => {
    const map: Record<string, { name: string; role: string; revenue: number; orders: number; id: string }> = {};
    filtered.forEach(o => {
      let tid = o.sales_rep_id;
      if (filters.roleLevel === 'SS') tid = srToSS[o.sales_rep_id] || o.sales_rep_id;
      if (filters.roleLevel === 'ASM') { const ss = srToSS[o.sales_rep_id]; tid = ss ? (ssToASM[ss] || ss) : o.sales_rep_id; }
      const emp = salesTeam.find(t => t.id === tid);
      if (!emp) return;
      if (!map[tid]) map[tid] = { name: emp.name, role: emp.role, revenue: 0, orders: 0, id: emp.id };
      map[tid].revenue += o.total_amount; map[tid].orders += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filtered, filters.roleLevel, salesTeam, srToSS, ssToASM]);

  // Category
  const catData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(o => o.items.forEach(i => { map[i.category_name] = (map[i.category_name] || 0) + i.subtotal; }));
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Weekly trend
  const trend = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number; custs: Set<string> }> = {};
    filtered.forEach(o => {
      const d = new Date(o.order_date);
      const ws = new Date(d); ws.setDate(d.getDate() - (d.getDay() || 7) + 1);
      const key = `${ws.getDate()}/${ws.getMonth() + 1}`;
      if (!map[key]) map[key] = { revenue: 0, orders: 0, custs: new Set() };
      map[key].revenue += o.total_amount; map[key].orders += 1;
      if (o.customer?.id) map[key].custs.add(o.customer.id);
    });
    return Object.entries(map).map(([week, d]) => ({
      week, dropsize: d.orders > 0 ? Math.round(d.revenue / d.orders) : 0, orders: d.orders
    })).slice(-8);
  }, [filtered]);

  // Channel
  const chData = useMemo(() => {
    const map: Record<string, { revenue: number; orders: number }> = {};
    filtered.forEach(o => { const ch = o.customer?.channel || 'GT'; if (!map[ch]) map[ch] = { revenue: 0, orders: 0 }; map[ch].revenue += o.total_amount; map[ch].orders += 1; });
    return Object.entries(map).map(([ch, d]) => ({ name: ch === 'GT' ? 'GT' : 'MT', channel: ch, revenue: d.revenue, orders: d.orders, dropsize: d.orders > 0 ? Math.round(d.revenue / d.orders) : 0 }));
  }, [filtered]);

  // Employee detail table
  const empTable = useMemo(() => {
    const rows: any[] = [];
    salesTeam.filter(t => t.role === filters.roleLevel).forEach(emp => {
      const srIds = getSRIdsUnder(emp.id);
      const empOrders = filtered.filter(o => srIds.includes(o.sales_rep_id));
      const rev = empOrders.reduce((s, o) => s + o.total_amount, 0);
      const cnt = empOrders.length;
      const uSkus = empOrders.reduce((s, o) => s + new Set(o.items.map(i => i.product_id)).size, 0);
      const uCust = new Set(empOrders.map(o => o.customer?.id)).size;
      rows.push({
        id: emp.id, code: emp.employee_code, name: emp.name, role: emp.role,
        revenue: rev, orders: cnt,
        skuPerOrder: cnt > 0 ? (uSkus / cnt).toFixed(1) : '0',
        dropsize: cnt > 0 ? Math.round(rev / cnt) : 0,
        vpo: uCust > 0 ? Math.round(rev / uCust) : 0,
        customers: uCust,
        parentName: emp.parent_id ? salesTeam.find(t => t.id === emp.parent_id)?.name || '' : ''
      });
    });
    return rows.sort((a, b) => b.revenue - a.revenue);
  }, [filtered, salesTeam, filters.roleLevel, getSRIdsUnder]);

  const clearFilter = (key: string) => setFilters(f => ({ ...f, [key]: null }));

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>;

  return (
    <>
      <FilterBar filters={filters} setFilters={setFilters} districts={districts} provinces={provinces} showRoleLevel showChannel />
      <ActiveFilters filters={filters} salesTeam={salesTeam} onClear={clearFilter} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        <KPICard icon={<DollarSign className="w-5 h-5" />} label="Doanh thu" value={formatVND(kpis.revenue)} suffix="đ" color="from-indigo-500 to-blue-600" />
        <KPICard icon={<ShoppingCart className="w-5 h-5" />} label="Số đơn" value={kpis.orders.toString()} suffix="đơn" color="from-emerald-500 to-green-600" />
        <KPICard icon={<Package className="w-5 h-5" />} label="SKU/Order" value={kpis.skuPerOrder.toFixed(1)} suffix="SKU" color="from-violet-500 to-purple-600" />
        <KPICard icon={<Target className="w-5 h-5" />} label="Dropsize" value={formatVND(kpis.dropsize)} suffix="đ" color="from-amber-500 to-orange-600" />
        <KPICard icon={<Store className="w-5 h-5" />} label="VPO" value={formatVND(kpis.vpo)} suffix="đ" color="from-cyan-500 to-teal-600" />
        <KPICard icon={<Percent className="w-5 h-5" />} label="PC" value={kpis.pc.toFixed(1)} suffix="%" color="from-pink-500 to-rose-600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard title={`💰 Doanh thu theo ${filters.roleLevel}`} className="lg:col-span-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={empChart} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tickFormatter={v => formatVND(v)} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')} đ`, 'Doanh thu']} />
                <Bar dataKey="revenue" fill="url(#saEmpGrad)" radius={[0, 6, 6, 0]} cursor="pointer"
                  onClick={(data: any) => setFilters(f => ({ ...f, selectedEmployee: f.selectedEmployee === data.id ? null : data.id }))} />
                <defs><linearGradient id="saEmpGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="📦 Cơ cấu nhóm hàng">
          <div className="h-[280px]">
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="📈 Xu hướng Dropsize theo tuần">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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

        <ChartCard title="🏪 So sánh Kênh">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
      </div>

      {/* Employee Detail Table */}
      <ChartCard title={`📋 Chi tiết hiệu suất — Cấp ${filters.roleLevel}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-zinc-700">
              <th className="text-left py-2 px-2 text-gray-500 font-medium">#</th>
              <th className="text-left py-2 px-2 text-gray-500 font-medium">Mã NV</th>
              <th className="text-left py-2 px-2 text-gray-500 font-medium">Nhân viên</th>
              {filters.roleLevel !== 'ASM' && <th className="text-left py-2 px-2 text-gray-500 font-medium">Cấp trên</th>}
              <th className="text-right py-2 px-2 text-gray-500 font-medium">Doanh thu</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">Đơn</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">SKU/Đơn</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">Dropsize</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">VPO</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">Điểm bán</th>
            </tr></thead>
            <tbody>
              {empTable.map((emp, i) => (
                <tr key={emp.id}
                  className={`border-b border-gray-100 dark:border-zinc-800 transition-colors cursor-pointer ${filters.selectedEmployee === emp.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
                  onClick={() => setFilters(f => ({ ...f, selectedEmployee: f.selectedEmployee === emp.id ? null : emp.id }))}>
                  <td className="py-2.5 px-2"><span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>{i + 1}</span></td>
                  <td className="py-2.5 px-2"><span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: ROLE_COLORS[emp.role] }}>{emp.code}</span></td>
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
              {empTable.length === 0 && <tr><td colSpan={10} className="py-8 text-center text-gray-400">Không có dữ liệu phù hợp</td></tr>}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </>
  );
}
