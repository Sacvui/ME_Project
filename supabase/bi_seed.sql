-- =============================================
-- SEED DỮ LIỆU NHÂN SỰ BÁN HÀNG + ĐƠN HÀNG MỞ RỘNG
-- Khu vực: TP. Hồ Chí Minh
-- =============================================

-- Xóa dữ liệu cũ (nếu seed lại)
-- Phải xóa orders trước vì có FK
UPDATE public.orders SET sales_rep_id = NULL;
DELETE FROM public.sales_teams;

-- ========================================
-- 1. NHÂN SỰ BÁN HÀNG
-- ========================================

-- ASM (Area Sales Manager) — 2 người
INSERT INTO public.sales_teams (id, employee_code, name, role, parent_id, province, phone, email) VALUES
('a1000000-0000-0000-0000-000000000001', 'ASM-001', 'Nguyễn Văn Hùng', 'ASM', NULL, 'TP. Hồ Chí Minh', '0901000001', 'hung.nguyen@company.vn'),
('a1000000-0000-0000-0000-000000000002', 'ASM-002', 'Trần Thị Mai', 'ASM', NULL, 'TP. Hồ Chí Minh', '0901000002', 'mai.tran@company.vn');

-- SS (Sales Supervisor) — 4 người, mỗi ASM quản 2 SS
INSERT INTO public.sales_teams (id, employee_code, name, role, parent_id, province, district, phone, email) VALUES
('b2000000-0000-0000-0000-000000000001', 'SS-001', 'Lê Hoàng Phúc', 'SS', 'a1000000-0000-0000-0000-000000000001', 'TP. Hồ Chí Minh', 'Quận 1', '0902000001', 'phuc.le@company.vn'),
('b2000000-0000-0000-0000-000000000002', 'SS-002', 'Phạm Minh Tú', 'SS', 'a1000000-0000-0000-0000-000000000001', 'TP. Hồ Chí Minh', 'Quận 3', '0902000002', 'tu.pham@company.vn'),
('b2000000-0000-0000-0000-000000000003', 'SS-003', 'Võ Thanh Sơn', 'SS', 'a1000000-0000-0000-0000-000000000002', 'TP. Hồ Chí Minh', 'Quận Bình Thạnh', '0902000003', 'son.vo@company.vn'),
('b2000000-0000-0000-0000-000000000004', 'SS-004', 'Đặng Thùy Linh', 'SS', 'a1000000-0000-0000-0000-000000000002', 'TP. Hồ Chí Minh', 'Quận Thủ Đức', '0902000004', 'linh.dang@company.vn');

-- SR (Sales Rep) — 8 người, mỗi SS quản 2 SR
INSERT INTO public.sales_teams (id, employee_code, name, role, parent_id, province, district, phone, email) VALUES
('c3000000-0000-0000-0000-000000000001', 'SR-001', 'Huỳnh Anh Tuấn', 'SR', 'b2000000-0000-0000-0000-000000000001', 'TP. Hồ Chí Minh', 'Quận 1', '0903000001', 'tuan.huynh@company.vn'),
('c3000000-0000-0000-0000-000000000002', 'SR-002', 'Ngô Bích Ngọc', 'SR', 'b2000000-0000-0000-0000-000000000001', 'TP. Hồ Chí Minh', 'Quận 1', '0903000002', 'ngoc.ngo@company.vn'),
('c3000000-0000-0000-0000-000000000003', 'SR-003', 'Bùi Quốc Đạt', 'SR', 'b2000000-0000-0000-0000-000000000002', 'TP. Hồ Chí Minh', 'Quận 3', '0903000003', 'dat.bui@company.vn'),
('c3000000-0000-0000-0000-000000000004', 'SR-004', 'Lý Thanh Hà', 'SR', 'b2000000-0000-0000-0000-000000000002', 'TP. Hồ Chí Minh', 'Quận 3', '0903000004', 'ha.ly@company.vn'),
('c3000000-0000-0000-0000-000000000005', 'SR-005', 'Trịnh Văn Bình', 'SR', 'b2000000-0000-0000-0000-000000000003', 'TP. Hồ Chí Minh', 'Quận Bình Thạnh', '0903000005', 'binh.trinh@company.vn'),
('c3000000-0000-0000-0000-000000000006', 'SR-006', 'Mai Xuân Hương', 'SR', 'b2000000-0000-0000-0000-000000000003', 'TP. Hồ Chí Minh', 'Quận Bình Thạnh', '0903000006', 'huong.mai@company.vn'),
('c3000000-0000-0000-0000-000000000007', 'SR-007', 'Đinh Công Minh', 'SR', 'b2000000-0000-0000-0000-000000000004', 'TP. Hồ Chí Minh', 'Quận Thủ Đức', '0903000007', 'minh.dinh@company.vn'),
('c3000000-0000-0000-0000-000000000008', 'SR-008', 'Phan Thị Yến', 'SR', 'b2000000-0000-0000-0000-000000000004', 'TP. Hồ Chí Minh', 'Quận Thủ Đức', '0903000008', 'yen.phan@company.vn');

-- ========================================
-- 2. THÊM KHÁCH HÀNG MỚI (15 khách nữa trải đều HCM)
-- ========================================
INSERT INTO public.customers (id, name, address, location, province, district, customer_type, channel) VALUES
('d4000000-0000-0000-0000-000000000001', 'Tạp hóa Anh Phát', '88 Trần Hưng Đạo, Q.1', ST_SetSRID(ST_MakePoint(106.6930, 10.7680), 4326), 'TP. Hồ Chí Minh', 'Quận 1', 'Tạp hóa', 'GT'),
('d4000000-0000-0000-0000-000000000002', 'Mini Mart Hoa Sen', '25 Nguyễn Thái Học, Q.1', ST_SetSRID(ST_MakePoint(106.6950, 10.7730), 4326), 'TP. Hồ Chí Minh', 'Quận 1', 'Siêu thị mini', 'MT'),
('d4000000-0000-0000-0000-000000000003', 'Đại lý Thành Công', '150 Võ Văn Tần, Q.3', ST_SetSRID(ST_MakePoint(106.6890, 10.7790), 4326), 'TP. Hồ Chí Minh', 'Quận 3', 'Đại lý', 'GT'),
('d4000000-0000-0000-0000-000000000004', 'Tạp hóa Bà Năm', '60 Lý Chính Thắng, Q.3', ST_SetSRID(ST_MakePoint(106.6870, 10.7880), 4326), 'TP. Hồ Chí Minh', 'Quận 3', 'Tạp hóa', 'GT'),
('d4000000-0000-0000-0000-000000000005', 'Shop Tiện Ích 24h', '300 Điện Biên Phủ, Bình Thạnh', ST_SetSRID(ST_MakePoint(106.7000, 10.8020), 4326), 'TP. Hồ Chí Minh', 'Quận Bình Thạnh', 'Siêu thị mini', 'MT'),
('d4000000-0000-0000-0000-000000000006', 'Tạp hóa Cô Tám', '45 Bạch Đằng, Bình Thạnh', ST_SetSRID(ST_MakePoint(106.7030, 10.8050), 4326), 'TP. Hồ Chí Minh', 'Quận Bình Thạnh', 'Tạp hóa', 'GT'),
('d4000000-0000-0000-0000-000000000007', 'Đại lý Hoàng Long', '18 Xô Viết Nghệ Tĩnh, Bình Thạnh', ST_SetSRID(ST_MakePoint(106.7050, 10.7980), 4326), 'TP. Hồ Chí Minh', 'Quận Bình Thạnh', 'Đại lý', 'GT'),
('d4000000-0000-0000-0000-000000000008', 'Cửa hàng Minh Châu', '200 Võ Văn Ngân, Thủ Đức', ST_SetSRID(ST_MakePoint(106.7580, 10.8500), 4326), 'TP. Hồ Chí Minh', 'Quận Thủ Đức', 'Tạp hóa', 'GT'),
('d4000000-0000-0000-0000-000000000009', 'Siêu thị Co.op Food Thủ Đức', '100 Kha Vạn Cân, Thủ Đức', ST_SetSRID(ST_MakePoint(106.7530, 10.8550), 4326), 'TP. Hồ Chí Minh', 'Quận Thủ Đức', 'Siêu thị', 'MT'),
('d4000000-0000-0000-0000-000000000010', 'Tạp hóa Chú Sáu', '80 Lê Văn Việt, Thủ Đức', ST_SetSRID(ST_MakePoint(106.7700, 10.8450), 4326), 'TP. Hồ Chí Minh', 'Quận Thủ Đức', 'Tạp hóa', 'GT'),
('d4000000-0000-0000-0000-000000000011', 'Shop Bảo Ngọc', '55 Hai Bà Trưng, Q.1', ST_SetSRID(ST_MakePoint(106.7010, 10.7760), 4326), 'TP. Hồ Chí Minh', 'Quận 1', 'Siêu thị mini', 'MT'),
('d4000000-0000-0000-0000-000000000012', 'Đại lý Phước Lộc', '120 Pasteur, Q.3', ST_SetSRID(ST_MakePoint(106.6950, 10.7830), 4326), 'TP. Hồ Chí Minh', 'Quận 3', 'Đại lý', 'GT'),
('d4000000-0000-0000-0000-000000000013', 'Tạp hóa Mỹ Hạnh', '33 Nơ Trang Long, Bình Thạnh', ST_SetSRID(ST_MakePoint(106.6950, 10.8100), 4326), 'TP. Hồ Chí Minh', 'Quận Bình Thạnh', 'Tạp hóa', 'GT'),
('d4000000-0000-0000-0000-000000000014', 'GS25 Linh Trung', '10 Xa Lộ Hà Nội, Thủ Đức', ST_SetSRID(ST_MakePoint(106.7650, 10.8600), 4326), 'TP. Hồ Chí Minh', 'Quận Thủ Đức', 'Cửa hàng tiện lợi', 'MT'),
('d4000000-0000-0000-0000-000000000015', 'Tạp hóa Ông Bảy', '99 Phan Xích Long, Phú Nhuận', ST_SetSRID(ST_MakePoint(106.6820, 10.7950), 4326), 'TP. Hồ Chí Minh', 'Quận Phú Nhuận', 'Tạp hóa', 'GT');

-- ========================================
-- 3. GÁN SALES REP CHO CÁC ĐƠN HÀNG HIỆN CÓ
-- ========================================
-- Gán ngẫu nhiên các đơn hàng hiện có cho 8 SR
DO $$
DECLARE
    sr_ids uuid[] := ARRAY[
        'c3000000-0000-0000-0000-000000000001',
        'c3000000-0000-0000-0000-000000000002',
        'c3000000-0000-0000-0000-000000000003',
        'c3000000-0000-0000-0000-000000000004',
        'c3000000-0000-0000-0000-000000000005',
        'c3000000-0000-0000-0000-000000000006',
        'c3000000-0000-0000-0000-000000000007',
        'c3000000-0000-0000-0000-000000000008'
    ];
    order_rec RECORD;
    idx integer := 0;
BEGIN
    FOR order_rec IN SELECT id FROM public.orders ORDER BY order_date LOOP
        UPDATE public.orders SET sales_rep_id = sr_ids[(idx % 8) + 1] WHERE id = order_rec.id;
        idx := idx + 1;
    END LOOP;
END $$;

-- ========================================
-- 4. SINH THÊM ~50 ĐƠN HÀNG MỚI TRẢI ĐỀU 90 NGÀY
-- ========================================
DO $$
DECLARE
    all_cust_ids uuid[];
    all_sr_ids uuid[] := ARRAY[
        'c3000000-0000-0000-0000-000000000001',
        'c3000000-0000-0000-0000-000000000002',
        'c3000000-0000-0000-0000-000000000003',
        'c3000000-0000-0000-0000-000000000004',
        'c3000000-0000-0000-0000-000000000005',
        'c3000000-0000-0000-0000-000000000006',
        'c3000000-0000-0000-0000-000000000007',
        'c3000000-0000-0000-0000-000000000008'
    ];
    prod_record RECORD;
    new_order_id uuid;
    random_days integer;
    random_qty integer;
    order_total numeric;
    cust_id uuid;
    sr_id uuid;
BEGIN
    -- Lấy tất cả customer IDs
    SELECT array_agg(id) INTO all_cust_ids FROM public.customers;

    FOR i IN 1..50 LOOP
        random_days := floor(random() * 90); -- 0-90 ngày trước
        new_order_id := gen_random_uuid();
        order_total := 0;
        
        -- Chọn customer ngẫu nhiên
        cust_id := all_cust_ids[floor(random() * array_length(all_cust_ids, 1) + 1)];
        -- Chọn SR ngẫu nhiên
        sr_id := all_sr_ids[floor(random() * 8 + 1)];

        -- Tạo đơn hàng
        INSERT INTO public.orders (id, customer_id, order_date, total_amount, sales_rep_id, status)
        VALUES (
            new_order_id, 
            cust_id, 
            now() - (random_days || ' days')::interval,
            0,
            sr_id,
            CASE WHEN random() > 0.1 THEN 'Completed' ELSE 'Pending' END
        );

        -- Thêm 2-5 sản phẩm ngẫu nhiên vào mỗi đơn
        FOR prod_record IN (SELECT id, unit_price FROM public.products ORDER BY random() LIMIT floor(random() * 4 + 2)) LOOP
            random_qty := floor(random() * 15 + 1); -- 1-15 thùng/hộp

            INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
            VALUES (new_order_id, prod_record.id, random_qty, prod_record.unit_price);

            order_total := order_total + (random_qty * prod_record.unit_price);
        END LOOP;

        -- Cập nhật tổng tiền
        UPDATE public.orders SET total_amount = order_total WHERE id = new_order_id;
    END LOOP;
END $$;
