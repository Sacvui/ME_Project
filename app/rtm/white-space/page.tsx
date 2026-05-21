'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Filter, MapPin, Lightbulb, Map as MapIcon, ChevronRight, Upload } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import UploadModal from '@/components/UploadModal';

const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });

export default function WhiteSpacePage() {
  const [whiteSpaces, setWhiteSpaces] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(1000); // 1km
  const [L, setL] = useState<any>(null);
  
  // Filter States
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  
  const [flyToLoc, setFlyToLoc] = useState<{lat: number, lng: number, zoom?: number} | null>(null);
  const [mapRef, setMapRef] = useState<any>(null);

  // Upload Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'customers'|'market_leads'>('customers');

  const openUploadModal = (type: 'customers' | 'market_leads') => {
    setUploadType(type);
    setIsUploadModalOpen(true);
  };

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  useEffect(() => {
    if (flyToLoc && mapRef) {
      mapRef.flyTo([flyToLoc.lat, flyToLoc.lng], flyToLoc.zoom || 14, { duration: 1.5 });
    }
  }, [flyToLoc, mapRef]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const queryParams = new URLSearchParams();
    queryParams.append('radius', radius.toString());
    if (province) queryParams.append('province', province);
    if (district) queryParams.append('district', district);

    Promise.all([
      fetch(`/api/rtm/white-space?${queryParams.toString()}`).then(res => res.json()),
      fetch(`/api/rtm/customers?province=${province}&district=${district}`).then(res => res.json())
    ]).then(([wsData, custData]) => {
      if (!isMounted) return;
      if (wsData.success) setWhiteSpaces(wsData.data || []);
      if (custData.success) setCustomers(custData.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [radius, province, district]);

  const createCustomerIcon = () => {
    if (!L) return null;
    return new L.DivIcon({
      html: `<div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  const createWhiteSpaceIcon = () => {
    if (!L) return null;
    return new L.DivIcon({
      html: `<div style="background-color: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  const custIcon = createCustomerIcon();
  const wsIcon = createWhiteSpaceIcon();

  // Recommendations: Gom nhóm dữ liệu Universal theo Quận/Huyện
  const recommendations = useMemo(() => {
    const counts: Record<string, { count: number, lat: number, lng: number }> = {};
    whiteSpaces.forEach((ws: any) => {
      const d = ws.district || 'Không xác định';
      if (!counts[d]) counts[d] = { count: 0, lat: 0, lng: 0 };
      counts[d].count += 1;
      counts[d].lat += ws.lat;
      counts[d].lng += ws.lng;
    });
    
    return Object.entries(counts).map(([dist, data]) => ({
      district: dist,
      count: data.count,
      centerLat: data.lat / data.count,
      centerLng: data.lng / data.count
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [whiteSpaces]);

  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-gray-50 dark:bg-zinc-950 font-sans overflow-hidden">
      
      {/* Cột chính: Bản đồ */}
      <div className="flex-1 flex flex-col p-4 h-full relative">
        {/* Header & Filters */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="text-orange-500 w-6 h-6" />
              Phân Tích Phủ Sóng & Universal
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Quản lý và tìm kiếm điểm bán tiềm năng.
            </p>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => openUploadModal('customers')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-md transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Import Dữ liệu nền
              </button>
              <button 
                onClick={() => openUploadModal('market_leads')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-md transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Import Dữ liệu Universal
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-zinc-800 p-2 rounded-lg border border-gray-200 dark:border-zinc-700">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            
            <select value={province} onChange={(e) => setProvince(e.target.value)} className="text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 rounded-md px-2 py-1 outline-none text-gray-900 dark:text-white">
              <option value="">Tất cả Tỉnh/Thành</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            </select>
            
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 rounded-md px-2 py-1 outline-none text-gray-900 dark:text-white">
              <option value="">Tất cả Quận/Huyện</option>
              <option value="Quận 1">Quận 1</option>
              <option value="Quận 3">Quận 3</option>
              <option value="Quận 5">Quận 5</option>
              <option value="Quận 6">Quận 6</option>
              <option value="Quận 7">Quận 7</option>
              <option value="Bình Thạnh">Bình Thạnh</option>
              <option value="Gò Vấp">Gò Vấp</option>
              <option value="Phú Nhuận">Phú Nhuận</option>
              <option value="Thủ Đức">Thủ Đức</option>
            </select>

            <div className="w-px h-5 bg-gray-300 dark:bg-zinc-600 mx-1"></div>

            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Độ Phủ:</label>
            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="text-sm bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 rounded-md px-2 py-1 outline-none text-gray-900 dark:text-white">
              <option value={500}>500 mét</option>
              <option value={1000}>1 km</option>
              <option value={3000}>3 km</option>
            </select>
          </div>
        </div>
        
        {/* Bản đồ */}
        <div className="relative w-full flex-1 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-inner bg-gray-100 dark:bg-zinc-800">
          {loading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {L && (
            <MapContainer ref={setMapRef} center={[10.762622, 106.660172]} zoom={12} style={{ height: '100%', width: '100%', zIndex: 1 }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {customers.map((cust: any) => (
                <React.Fragment key={`cust-group-${cust.id}`}>
                  <Circle center={[cust.lat, cust.lng]} radius={radius} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }} />
                  <Marker position={[cust.lat, cust.lng]} icon={custIcon}>
                    <Popup>
                      <div className="p-1 min-w-[200px]">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block">Dữ liệu nền</span>
                        <p className="font-bold text-gray-900 text-base mb-1">{cust.name}</p>
                        <p className="text-gray-600 text-sm">{cust.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              ))}

              {whiteSpaces.map((item: any) => (
                <Marker key={`ws-${item.id}`} position={[item.lat, item.lng]} icon={wsIcon}>
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded uppercase mb-2 inline-block">Dữ liệu Universal</span>
                      <p className="font-bold text-gray-900 text-base mb-1">{item.store_name}</p>
                      <p className="text-gray-600 text-sm mb-3">{item.address}</p>
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 rounded transition-colors text-sm">
                        Mở tuyến mới
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Cột phải: Panel Tư vấn (Suggestions) */}
      <div className="w-80 lg:w-96 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 flex flex-col h-full shadow-lg z-10 overflow-hidden shrink-0">
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Tư vấn chiến lược
          </h2>
          <p className="text-xs text-gray-500 mt-1">Đề xuất khai thác dữ liệu Universal dựa trên mật độ điểm chạm.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div 
                key={rec.district} 
                onClick={() => setFlyToLoc({ lat: rec.centerLat, lng: rec.centerLng, zoom: 15 })}
                className="group p-4 bg-white dark:bg-zinc-800 border border-orange-200 dark:border-orange-900/30 rounded-xl hover:border-orange-500 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 group-hover:bg-orange-600"></div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {rec.district}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Phát hiện <span className="font-bold text-red-500">{rec.count}</span> điểm bán tiềm năng chưa được khai thác.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                    #{index + 1}
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <MapIcon className="w-3.5 h-3.5 mr-1" />
                  Xem trên bản đồ
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-6 text-gray-500 dark:text-gray-400">
              <p>Không có dữ liệu Universal nào trong khu vực này để đề xuất.</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 flex justify-between items-center text-xs text-gray-500">
          <span>Dữ liệu nền: {customers.length}</span>
          <span>Universal: {whiteSpaces.length}</span>
        </div>
      </div>
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        title={uploadType === 'customers' ? 'Import Dữ liệu nền (Base Data)' : 'Import Dữ liệu Universal (Thị trường)'}
        type={uploadType}
        onSuccess={() => {
          setIsUploadModalOpen(false);
          // Reload trang hoặc gọi lại API để load data mới
          window.location.reload();
        }}
      />
    </div>
  );
}
