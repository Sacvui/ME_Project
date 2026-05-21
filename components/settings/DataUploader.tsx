'use client';

import React, { useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, CheckCircle, AlertTriangle, FileSpreadsheet, X, Loader2 } from 'lucide-react';

interface DataUploaderProps {
  type: string;
  label: string;
  requiredCols: string[];
  description: string;
}

export default function DataUploader({ type, label, requiredCols, description }: DataUploaderProps) {
  const [rows, setRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; errors?: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback((file: File) => {
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (json.length === 0) {
          setResult({ success: false, message: 'File rỗng hoặc không có dữ liệu' });
          return;
        }
        const hdrs = Object.keys(json[0] as object);
        setHeaders(hdrs);
        setRows(json as any[]);

        // Validate required columns
        const missing = requiredCols.filter(c => !hdrs.includes(c));
        if (missing.length > 0) {
          setResult({ success: false, message: `Thiếu các cột bắt buộc: ${missing.join(', ')}` });
        }
      } catch {
        setResult({ success: false, message: 'Không thể đọc file. Hãy chắc chắn file đúng định dạng .xlsx hoặc .csv' });
      }
    };
    reader.readAsArrayBuffer(file);
  }, [requiredCols]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleImport = async () => {
    setImporting(true); setResult(null);
    try {
      const res = await fetch('/api/settings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, rows })
      });
      const data = await res.json();
      setResult({
        success: data.success,
        message: data.message || data.error,
        errors: data.errors
      });
      if (data.success) { setRows([]); setHeaders([]); }
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setImporting(false);
    }
  };

  const clearData = () => { setRows([]); setHeaders([]); setResult(null); if (fileRef.current) fileRef.current.value = ''; };

  return (
    <div className="space-y-4">
      {/* Description + Download Template */}
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        <a
          href={`/api/settings/template?type=${type}`}
          download
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Tải Template
        </a>
      </div>

      {/* Upload Zone */}
      {rows.length === 0 ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-zinc-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
          }`}
        >
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Kéo thả file vào đây hoặc <span className="text-indigo-600 dark:text-indigo-400">chọn file</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Hỗ trợ .xlsx, .csv</p>
          <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls" onChange={handleFileChange} className="hidden" />
        </div>
      ) : (
        <>
          {/* Preview Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                Xem trước: {rows.length} dòng dữ liệu
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearData} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded transition-colors">
                <X className="w-3.5 h-3.5" /> Xóa
              </button>
              <button
                onClick={handleImport}
                disabled={importing || (result?.success === false && result.message.startsWith('Thiếu'))}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {importing ? 'Đang import...' : `Import ${rows.length} dòng`}
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800">
                  <th className="py-2 px-3 text-left text-gray-500 font-medium">#</th>
                  {headers.map(h => (
                    <th key={h} className={`py-2 px-3 text-left font-medium ${requiredCols.includes(h) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
                      {h}{requiredCols.includes(h) ? ' *' : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                    {headers.map(h => (
                      <td key={h} className="py-2 px-3 text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                        {String(row[h] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && (
              <div className="py-2 text-center text-xs text-gray-400 bg-gray-50 dark:bg-zinc-800">
                ... và {rows.length - 10} dòng nữa
              </div>
            )}
          </div>
        </>
      )}

      {/* Result Message */}
      {result && (
        <div className={`rounded-lg p-4 text-sm ${result.success ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'}`}>
          <div className="flex items-center gap-2 font-medium">
            {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {result.message}
          </div>
          {result.errors && result.errors.length > 0 && (
            <ul className="mt-2 ml-6 list-disc space-y-0.5 text-xs opacity-80 max-h-32 overflow-y-auto">
              {result.errors.slice(0, 20).map((e, i) => <li key={i}>{e}</li>)}
              {result.errors.length > 20 && <li>... và {result.errors.length - 20} lỗi khác</li>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
