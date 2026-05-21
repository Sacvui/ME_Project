-- Xóa dữ liệu cũ nếu chạy lại file này
TRUNCATE TABLE public.customers RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.market_leads RESTART IDENTITY CASCADE;

-- Insert dữ liệu Khách hàng hiện tại (Customers) - Tọa độ quanh khu vực Quận 1 & Quận 3 (TP.HCM)
INSERT INTO public.customers (name, address, province, district, location) VALUES
('Tạp hóa Cô Ba', '15 Lê Lợi, Bến Nghé, Quận 1', 'TP. Hồ Chí Minh', 'Quận 1', ST_SetSRID(ST_MakePoint(106.7032, 10.7745), 4326)),
('Siêu thị Mini Mart 1', '42 Nguyễn Huệ, Quận 1', 'TP. Hồ Chí Minh', 'Quận 1', ST_SetSRID(ST_MakePoint(106.7045, 10.7738), 4326)),
('Cửa hàng Tiện lợi Bảy', '125 Hai Bà Trưng, Quận 3', 'TP. Hồ Chí Minh', 'Quận 3', ST_SetSRID(ST_MakePoint(106.6961, 10.7853), 4326)),
('Tạp hóa Chú Tư', '200 Cách Mạng Tháng 8, Quận 3', 'TP. Hồ Chí Minh', 'Quận 3', ST_SetSRID(ST_MakePoint(106.6830, 10.7770), 4326)),
('Đại lý Bánh Kẹo Hùng', '50 Tôn Đức Thắng, Quận 1', 'TP. Hồ Chí Minh', 'Quận 1', ST_SetSRID(ST_MakePoint(106.7060, 10.7800), 4326));

-- Insert dữ liệu Điểm bán tiềm năng (Market Leads) - Rải rác khắp TP.HCM để tạo "Vùng Trắng"
INSERT INTO public.market_leads (store_name, address, source, province, district, location) VALUES
('Tạp hóa Nga', '10 Nguyễn Trãi, Quận 1', 'survey', 'TP. Hồ Chí Minh', 'Quận 1', ST_SetSRID(ST_MakePoint(106.6912, 10.7681), 4326)),
('Kiosk Công Viên', 'Công viên Tao Đàn, Quận 1', 'competitor_data', 'TP. Hồ Chí Minh', 'Quận 1', ST_SetSRID(ST_MakePoint(106.6925, 10.7740), 4326)),
('Tạp hóa An Bình', '150 Trần Hưng Đạo, Quận 5', 'survey', 'TP. Hồ Chí Minh', 'Quận 5', ST_SetSRID(ST_MakePoint(106.6800, 10.7580), 4326)),
('Mini Stop 24h', '300 An Dương Vương, Quận 5', 'competitor_data', 'TP. Hồ Chí Minh', 'Quận 5', ST_SetSRID(ST_MakePoint(106.6710, 10.7550), 4326)),
('Cửa hàng số 9', '45 Lê Văn Sỹ, Quận Phú Nhuận', 'survey', 'TP. Hồ Chí Minh', 'Phú Nhuận', ST_SetSRID(ST_MakePoint(106.6780, 10.7930), 4326)),
('Tạp hóa Xuân', '90 Nguyễn Văn Trỗi, Phú Nhuận', 'survey', 'TP. Hồ Chí Minh', 'Phú Nhuận', ST_SetSRID(ST_MakePoint(106.6810, 10.7950), 4326)),
('Chợ Lớn Kiosk 1', 'Chợ Bình Tây, Quận 6', 'competitor_data', 'TP. Hồ Chí Minh', 'Quận 6', ST_SetSRID(ST_MakePoint(106.6500, 10.7490), 4326)),
('Chợ Lớn Kiosk 2', 'Chợ Bình Tây, Quận 6', 'survey', 'TP. Hồ Chí Minh', 'Quận 6', ST_SetSRID(ST_MakePoint(106.6510, 10.7500), 4326)),
('Tạp hóa 365', '12 Quang Trung, Gò Vấp', 'competitor_data', 'TP. Hồ Chí Minh', 'Gò Vấp', ST_SetSRID(ST_MakePoint(106.6660, 10.8250), 4326)),
('Bách Hóa Gò Vấp', '40 Phan Văn Trị, Gò Vấp', 'survey', 'TP. Hồ Chí Minh', 'Gò Vấp', ST_SetSRID(ST_MakePoint(106.6800, 10.8200), 4326)),
('Tạp hóa Lộc Phát', '100 Đinh Bộ Lĩnh, Bình Thạnh', 'competitor_data', 'TP. Hồ Chí Minh', 'Bình Thạnh', ST_SetSRID(ST_MakePoint(106.7090, 10.8060), 4326)),
('Điểm bán Bình Quới', 'Thanh Đa, Bình Thạnh', 'survey', 'TP. Hồ Chí Minh', 'Bình Thạnh', ST_SetSRID(ST_MakePoint(106.7200, 10.8120), 4326)),
('Tiệm đồ ăn vặt', 'Bến xe Miền Đông', 'competitor_data', 'TP. Hồ Chí Minh', 'Bình Thạnh', ST_SetSRID(ST_MakePoint(106.7110, 10.8100), 4326)),
('Kiosk Sinh Viên', 'Làng Đại Học Thủ Đức', 'survey', 'TP. Hồ Chí Minh', 'Thủ Đức', ST_SetSRID(ST_MakePoint(106.7900, 10.8750), 4326)),
('Tạp hóa Chú Năm', 'KCX Tân Thuận, Quận 7', 'competitor_data', 'TP. Hồ Chí Minh', 'Quận 7', ST_SetSRID(ST_MakePoint(106.7450, 10.7520), 4326));
