'use client';

import React, { useState } from 'react';
import { TrendingUp, BarChart3, Store, PieChart } from 'lucide-react';
import OverviewDashboard from '@/components/bi/OverviewDashboard';
import SalesActivityDashboard from '@/components/bi/SalesActivityDashboard';
import ExecutiveSummaryDashboard from '@/components/bi/ExecutiveSummaryDashboard';

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
  { id: 'sales-activity', label: 'Hoạt động Điểm bán', icon: Store },
  { id: 'executive-summary', label: 'Báo cáo Tổng hợp (MV)', icon: PieChart },
];

export default function BIPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950 p-4 md:p-6 font-sans">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          Business Intelligence
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-1 w-fit shadow-sm">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dashboard Content */}
      {activeTab === 'overview' && <OverviewDashboard />}
      {activeTab === 'sales-activity' && <SalesActivityDashboard />}
      {activeTab === 'executive-summary' && <ExecutiveSummaryDashboard />}
    </div>
  );
}
