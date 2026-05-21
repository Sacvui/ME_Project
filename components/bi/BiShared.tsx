import React from 'react';

// Format tiền VNĐ
export const formatVND = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} tr`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString('vi-VN');
};

export const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
export const ROLE_COLORS: Record<string, string> = { ASM: '#6366f1', SS: '#f59e0b', SR: '#10b981' };

// Time period helpers
export type TimePeriod = 'today' | 'wtd' | 'mtd' | 'ytd';

export const TIME_LABELS: Record<TimePeriod, string> = {
  today: 'Hôm nay',
  wtd: 'WTD',
  mtd: 'MTD',
  ytd: 'YTD'
};

export function getTimeCutoff(period: TimePeriod): Date {
  const now = new Date();
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'wtd': {
      const d = new Date(now);
      const day = d.getDay() || 7; // Monday = 1
      d.setDate(d.getDate() - day + 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case 'mtd':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'ytd':
      return new Date(now.getFullYear(), 0, 1);
  }
}

// KPI Card Component
export function KPICard({ icon, label, value, suffix, color, active, onClick }: {
  icon: React.ReactNode; label: string; value: string; suffix: string; color: string;
  active?: boolean; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-zinc-900 rounded-xl border p-4 shadow-sm hover:shadow-md transition-all ${
        active ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-gray-200 dark:border-zinc-800'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
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

// Chart Card wrapper
export function ChartCard({ title, children, className = '' }: {
  title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm ${className}`}>
      <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

// Filter Bar component
export function FilterBar({ filters, setFilters, districts, provinces, showRoleLevel, showChannel }: {
  filters: any; setFilters: (fn: (f: any) => any) => void;
  districts: string[]; provinces: string[];
  showRoleLevel?: boolean; showChannel?: boolean;
}) {
  const selectCls = "rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 mb-5 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Time Period */}
        <div className="flex rounded-lg border border-gray-300 dark:border-zinc-700 overflow-hidden col-span-2 md:col-span-1">
          {(['today', 'wtd', 'mtd', 'ytd'] as TimePeriod[]).map(p => (
            <button key={p} onClick={() => setFilters((f: any) => ({ ...f, period: p }))}
              className={`flex-1 text-xs font-bold py-2 transition-colors ${
                filters.period === p ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700'
              }`}>
              {TIME_LABELS[p]}
            </button>
          ))}
        </div>

        <select value={filters.province} onChange={e => setFilters((f: any) => ({ ...f, province: e.target.value, district: '' }))} className={selectCls}>
          <option value="">Tất cả Tỉnh</option>
          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={filters.district} onChange={e => setFilters((f: any) => ({ ...f, district: e.target.value }))} className={selectCls}>
          <option value="">Tất cả Quận/Huyện</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {showChannel !== false && (
          <select value={filters.channel} onChange={e => setFilters((f: any) => ({ ...f, channel: e.target.value }))} className={selectCls}>
            <option value="">Tất cả Kênh</option>
            <option value="GT">Truyền thống (GT)</option>
            <option value="MT">Hiện đại (MT)</option>
          </select>
        )}

        {showRoleLevel && (
          <select value={filters.roleLevel} onChange={e => setFilters((f: any) => ({ ...f, roleLevel: e.target.value, selectedEmployee: null }))} className={selectCls}>
            <option value="SR">Theo SR</option>
            <option value="SS">Theo SS</option>
            <option value="ASM">Theo ASM</option>
          </select>
        )}
      </div>
    </div>
  );
}

// Active filter badges
export function ActiveFilters({ filters, salesTeam, onClear }: {
  filters: any; salesTeam: any[]; onClear: (key: string) => void;
}) {
  const badges: { key: string; label: string; icon: string }[] = [];
  if (filters.selectedEmployee) {
    const emp = salesTeam.find((t: any) => t.id === filters.selectedEmployee);
    badges.push({ key: 'selectedEmployee', label: emp?.name || '', icon: '👤' });
  }
  if (filters.selectedCategory) badges.push({ key: 'selectedCategory', label: filters.selectedCategory, icon: '📦' });
  if (filters.selectedChannel) badges.push({ key: 'selectedChannel', label: filters.selectedChannel === 'GT' ? 'Truyền thống' : 'Hiện đại', icon: '🏪' });

  if (badges.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      {badges.map(b => (
        <span key={b.key} className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-1 rounded-full font-medium">
          {b.icon} {b.label}
          <button onClick={() => onClear(b.key)} className="ml-1 hover:text-red-500">×</button>
        </span>
      ))}
      <button onClick={() => { badges.forEach(b => onClear(b.key)); }} className="text-xs text-red-500 hover:text-red-700 ml-1">Xóa tất cả</button>
    </div>
  );
}
