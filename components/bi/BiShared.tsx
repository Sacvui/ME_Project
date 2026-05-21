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

// KPI Card Component
export function KPICard({ icon, label, value, suffix, color }: {
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

// Card wrapper
export function ChartCard({ title, children, className = '', onClick }: {
  title: string; children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm ${className}`} onClick={onClick}>
      <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}
