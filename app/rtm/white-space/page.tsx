'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Filter, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Import động Map Component để tránh lỗi "window is not defined" trong Next.js SSR
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

export default function WhiteSpacePage() {
  const [whiteSpaces, setWhiteSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(1000); // Mặc định 1km

  useEffect(() => {
    setLoading(true);
    // Gọi API Route Next.js để lấy danh sách vùng trắng với bán kính hiện tại
    fetch(`/api/rtm/white-space?radius=${radius}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setWhiteSpaces(resData.data || []);
        setLoading(false);
      });
  }, [radius]);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] bg-gray-50 dark:bg-zinc-950 p-4 font-sans">
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="text-orange-500 w-6 h-6" />
            Bản Đồ Phân Tích Vùng Trắng
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tìm kiếm điểm bán tiềm năng chưa được khai thác bởi các khách hàng hiện tại.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800 p-2 rounded-lg border border-gray-200 dark:border-zinc-700">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bán kính lọc:</label>
          <select 
            value={radius} 
            onChange={(e) => setRadius(Number(e.target.value))}
            className="text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
          >
            <option value={500}>500 mét</option>
            <option value={1000}>1 km</option>
            <option value={3000}>3 km</option>
            <option value={5000}>5 km</option>
          </select>
        </div>
      </div>
      
      {/* Khởi tạo bản đồ nền OpenStreetMap, vị trí trung tâm TP.HCM */}
      <div className="relative w-full flex-1 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-inner bg-gray-100 dark:bg-zinc-800">
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <MapContainer center={[10.762622, 106.660172]} zoom={12} style={{ height: '100%', width: '100%', zIndex: 1 }}>
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Vẽ các điểm vùng trắng lên bản đồ */}
          {whiteSpaces.map((item: any) => (
            <Marker key={item.id} position={[item.lat, item.lng]}>
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center gap-1 mb-2 border-b pb-2">
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Vùng Trắng</span>
                  </div>
                  <p className="font-bold text-gray-900 text-base mb-1">{item.store_name}</p>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.address}</p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 rounded transition-colors text-sm">
                    Thêm vào tuyến Sales
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <span>Hiển thị <strong>{whiteSpaces.length}</strong> điểm bán tiềm năng</span>
        <span>Dữ liệu được truy xuất trực tiếp từ Cơ sở dữ liệu (Supabase PostGIS)</span>
      </div>
    </div>
  );
}
