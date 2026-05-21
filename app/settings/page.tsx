'use client';

import React, { useState } from 'react';
import { Settings, Users, Package, Store, FileText, AlertTriangle } from 'lucide-react';
import DataUploader from '@/components/settings/DataUploader';

const DATA_MODULES = [
  {
    id: 'sales_teams',
    label: '👥 Nhân sự',
    icon: Users,
    color: 'from-indigo-500 to-blue-600',
    order: 1,
    requiredCols: ['employee_code', 'name', 'role'],
    description: 'Import danh sách nhân viên bán hàng (SR, SS, ASM). Cột parent_code liên kết cấp trên: SR → SS, SS → ASM.',
    dependencies: [],
  },
  {
    id: 'products',
    label: '📦 Sản phẩm',
    icon: Package,
    color: 'from-violet-500 to-purple-600',
    order: 2,
    requiredCols: ['sku', 'name'],
    description: 'Import danh sách sản phẩm. Cột category sẽ tự tạo danh mục nếu chưa tồn tại.',
    dependencies: [],
  },
  {
    id: 'customers',
    label: '🏪 Khách hàng',
    icon: Store,
    color: 'from-emerald-500 to-green-600',
    order: 3,
    requiredCols: ['name', 'lat', 'lng'],
    description: 'Import danh sách khách hàng/điểm bán. Cần có tọa độ lat, lng để hiện trên bản đồ RTM.',
    dependencies: [],
  },
  {
    id: 'orders',
    label: '🧾 Đơn hàng',
    icon: FileText,
    color: 'from-amber-500 to-orange-600',
    order: 4,
    requiredCols: ['customer_name', 'product_sku', 'quantity'],
    description: 'Import đơn hàng. Mỗi dòng là 1 sản phẩm trong đơn. Các đơn cùng ngày + khách + NV sẽ gộp thành 1 đơn.',
    dependencies: ['sales_teams', 'products', 'customers'],
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('sales_teams');
  const activeModule = DATA_MODULES.find(m => m.id === activeTab)!;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950 p-4 md:p-6 font-sans">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          Cài đặt & Quản lý Dữ liệu
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-[52px]">
          Upload dữ liệu master vào hệ thống qua file Excel / CSV
        </p>
      </div>

      {/* Import Order Warning */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Thứ tự import bắt buộc</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {DATA_MODULES.map((m, i) => (
                <React.Fragment key={m.id}>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                    m.id === activeTab
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700'
                  }`}>
                    <span className="text-[10px] opacity-70">{m.order}.</span>
                    {m.label}
                  </span>
                  {i < DATA_MODULES.length - 1 && <span className="text-gray-400 text-xs">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-1 shadow-sm overflow-x-auto">
        {DATA_MODULES.map(mod => {
          const Icon = mod.icon;
          const isActive = activeTab === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveTab(mod.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${activeModule.color} flex items-center justify-center text-white`}>
            {React.createElement(activeModule.icon, { className: 'w-4.5 h-4.5' })}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeModule.label}</h2>
            <p className="text-xs text-gray-400">
              Cột bắt buộc: <span className="text-indigo-500 font-medium">{activeModule.requiredCols.join(', ')}</span>
            </p>
          </div>
        </div>

        <DataUploader
          key={activeTab}
          type={activeModule.id}
          label={activeModule.label}
          requiredCols={activeModule.requiredCols}
          description={activeModule.description}
        />
      </div>
    </div>
  );
}
