'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Import động Map Component để tránh lỗi "window is not defined" trong Next.js SSR
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

export default function WhiteSpacePage() {
  const [whiteSpaces, setWhiteSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API Route Next.js vừa viết ở trên để lấy danh sách vùng trắng bán kính 500m
    fetch('/api/rtm/white-space?radius=500')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) setWhiteSpaces(resData.data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Đang tải bản đồ vùng trắng...</div>;

  return (
    <div className="w-full h-screen p-4">
      <h1 className="text-xl font-bold mb-4">Bản Đồ Phân Tích Vùng Trắng (Miễn Phí)</h1>
      
      {/* Khởi tạo bản đồ nền OpenStreetMap, vị trí trung tâm mặc định tại Việt Nam */}
      <div className="w-full h-[calc(100%-4rem)] rounded-lg overflow-hidden border">
        <MapContainer center={[10.762622, 106.660172]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Vẽ các điểm vùng trắng lên bản đồ */}
          {whiteSpaces.map((item: any) => (
            <Marker key={item.id} position={[item.lat, item.lng]}>
              <Popup>
                <div className="text-sm">
                  <strong className="text-red-600">Vùng Trắng Tiềm Năng</strong>
                  <p>Tên tiệm: {item.store_name}</p>
                  <p>Địa chỉ: {item.address}</p>
                  <button className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    Thêm vào tuyến Sales
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
