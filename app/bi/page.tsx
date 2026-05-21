'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  DollarSign, ShoppingCart, TrendingUp, Users, Award,
  ChevronDown, ChevronRight, Briefcase
} from 'lucide-react';

// Format tiền VNĐ
const formatVND = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} tr`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('vi-VN');
};

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
const ROLE_COLORS: Record<string, string> = {
  ASM: '#6366f1',
  SS: '#f59e0b',
  SR: '#10b981'
};
const ROLE_LABELS: Record<string, string> = {
  ASM: 'Area Sales Manager',
  SS: 'Sales Supervisor',
  SR: 'Sales Rep'
};

interface KPI {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
}

interface TeamMember {
  id: string;
  employee_code: string;
  name: string;
  role: string;
  parent_id: string | null;
  province: string;
  district: string;
  revenue: number;
  orders: number;
}

export default function BIPage() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<any[]>([]);
  const [revenueByChannel, setRevenueByChannel] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedASM, setExpandedASM] = useState<Record<string, boolean>>({});
  const [expandedSS, setExpandedSS] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/bi/overview').then(r => r.json()),
      fetch('/api/bi/sales-team').then(r => r.json())
    ]).then(([overview, team]) => {
      if (overview.success) {
        setKpi(overview.data.kpi);
        setMonthlyRevenue(overview.data.monthlyRevenue);
        setRevenueByCategory(overview.data.revenueByCategory);
        setRevenueByChannel(overview.data.revenueByChannel);
        setTopProducts(overview.data.topProducts);
      }
      if (team.success) {
        setTeamData(team.data);
        // Mở rộng tất cả ASM mặc định
        const expanded: Record<string, boolean> = {};
        team.data.filter((t: TeamMember) => t.role === 'ASM').forEach((t: TeamMember) => { expanded[t.id] = true; });
        setExpandedASM(expanded);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const toggleASM = (id: string) => setExpandedASM(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSS = (id: string) => setExpandedSS(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const asmList = teamData.filter(t => t.role === 'ASM');
  const ssList = teamData.filter(t => t.role === 'SS');
  const srList = teamData.filter(t => t.role === 'SR');

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950 p-4 md:p-6 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          Business Intelligence
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-[52px]">
          Tổng quan doanh thu, sản lượng và hiệu suất đội ngũ bán hàng
        </p>
      </div>

      {/* KPI Cards */}
      {kpi && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            icon={<DollarSign className="w-5 h-5" />}
            label="Tổng Doanh thu"
            value={formatVND(kpi.totalRevenue)}
            suffix="đ"
            color="from-indigo-500 to-blue-600"
          />
          <KPICard
            icon={<ShoppingCart className="w-5 h-5" />}
            label="Tổng Đơn hàng"
            value={kpi.totalOrders.toString()}
            suffix="đơn"
            color="from-emerald-500 to-green-600"
          />
          <KPICard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Trung bình / Đơn"
            value={formatVND(kpi.avgOrderValue)}
            suffix="đ"
            color="from-amber-500 to-orange-600"
          />
          <KPICard
            icon={<Users className="w-5 h-5" />}
            label="Khách hàng Active"
            value={kpi.totalCustomers.toString()}
            suffix="KH"
            color="from-pink-500 to-rose-600"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Biểu đồ cột — Doanh thu theo tháng */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">
            📊 Doanh thu theo tháng
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickFormatter={(v) => formatVND(v)}
                />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} đ`, 'Doanh thu']}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 13 }}
                />
                <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ tròn — Nhóm hàng */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">
            🥧 Cơ cấu theo nhóm hàng
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${(name || '').toString().split('(')[0].trim()} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize: 11 }}
                >
                  {revenueByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString('vi-VN')} đ`, 'Doanh thu']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row — Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top sản phẩm */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Top Sản phẩm bán chạy
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-700">
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">#</th>
                  <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Sản phẩm</th>
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">SL</th>
                  <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.sku} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-2.5 px-2">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        i === 0 ? 'bg-amber-100 text-amber-700' :
                        i === 1 ? 'bg-gray-100 text-gray-600' :
                        i === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sku}</p>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-gray-700 dark:text-gray-300">{p.quantity}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-medium text-indigo-600 dark:text-indigo-400">{formatVND(p.revenue)}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doanh thu theo đội ngũ */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Doanh thu đội ngũ bán hàng
          </h2>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {asmList.map(asm => (
              <div key={asm.id}>
                {/* ASM Row */}
                <button
                  onClick={() => toggleASM(asm.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left"
                >
                  {expandedASM[asm.id] ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: ROLE_COLORS.ASM }}>ASM</span>
                  <span className="font-semibold text-gray-900 dark:text-white flex-1 text-sm">{asm.name}</span>
                  <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">{formatVND(asm.revenue)}đ</span>
                  <span className="text-xs text-gray-400 w-14 text-right">{asm.orders} đơn</span>
                </button>

                {/* SS children */}
                {expandedASM[asm.id] && ssList.filter(ss => ss.parent_id === asm.id).map(ss => (
                  <div key={ss.id} className="ml-6">
                    <button
                      onClick={() => toggleSS(ss.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left"
                    >
                      {expandedSS[ss.id] ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: ROLE_COLORS.SS }}>SS</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 flex-1 text-sm">{ss.name}</span>
                      <span className="text-sm font-mono text-amber-600 dark:text-amber-400">{formatVND(ss.revenue)}đ</span>
                      <span className="text-xs text-gray-400 w-14 text-right">{ss.orders} đơn</span>
                    </button>

                    {/* SR children */}
                    {expandedSS[ss.id] && srList.filter(sr => sr.parent_id === ss.id).map(sr => (
                      <div key={sr.id} className="ml-6 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
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
        </div>
      </div>

      {/* Kênh phân phối — mini bar */}
      <div className="mt-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-800 dark:text-white mb-3">
          🏪 Doanh thu theo Kênh phân phối
        </h2>
        <div className="flex gap-4 items-end">
          {revenueByChannel.map((ch, i) => {
            const maxVal = Math.max(...revenueByChannel.map(c => c.value));
            const pct = maxVal > 0 ? (ch.value / maxVal) * 100 : 0;
            return (
              <div key={ch.name} className="flex-1">
                <div className="text-center mb-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{ch.name}</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatVND(ch.value)}đ</p>
                </div>
                <div className="h-24 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex items-end">
                  <div
                    className="w-full rounded-lg transition-all duration-500"
                    style={{
                      height: `${pct}%`,
                      background: i === 0 ? 'linear-gradient(to top, #6366f1, #818cf8)' : 'linear-gradient(to top, #f59e0b, #fbbf24)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({ icon, label, value, suffix, color }: {
  icon: React.ReactNode; label: string; value: string; suffix: string; color: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}<span className="text-sm text-gray-400 font-normal ml-1">{suffix}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
