'use client';

import React, { useState } from 'react';
import { UploadCloud, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'customers' | 'market_leads';
  onSuccess?: () => void;
};

export default function UploadModal({ isOpen, onClose, title, type, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus('idle');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/rtm/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Tải lên dữ liệu thành công!');
        if (onSuccess) {
          setTimeout(onSuccess, 1500);
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Có lỗi xảy ra khi tải lên dữ liệu.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-500" />
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Vui lòng tải lên file định dạng <strong>.csv</strong> hoặc <strong>.xlsx / .xls</strong>. Đảm bảo file có chứa cột <code>lat</code> (vĩ độ) và <code>lng</code> (kinh độ).
          </p>

          <label className={`
            flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer
            transition-colors duration-200
            ${file ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-zinc-700 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800'}
          `}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              {file ? (
                <>
                  <FileText className="w-10 h-10 text-blue-500 mb-2" />
                  <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-white truncate max-w-full">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Nhấn để chọn file</span> hoặc kéo thả vào đây
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">CSV, Excel (Tối đa 10MB)</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" 
              onChange={handleFileChange} 
            />
          </label>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg flex items-start gap-2 text-sm border border-green-200 dark:border-green-900/30">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-start gap-2 text-sm border border-red-200 dark:border-red-900/30">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || uploading || status === 'success'}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-400 flex items-center gap-2 transition-colors shadow-sm"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang xử lý...
              </>
            ) : (
              'Tải lên'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
