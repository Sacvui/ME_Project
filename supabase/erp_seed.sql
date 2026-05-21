-- Xóa dữ liệu cũ nếu chạy lại
TRUNCATE TABLE public.order_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.product_categories RESTART IDENTITY CASCADE;

-- 1. Thêm Danh mục (Categories)
INSERT INTO public.product_categories (id, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Đồ uống (Beverages)', 'Nước ngọt, Bia, Nước suối'),
('22222222-2222-2222-2222-222222222222', 'Đồ ăn vặt (Snacks)', 'Bánh kẹo, Snack, Socola'),
('33333333-3333-3333-3333-333333333333', 'Gia vị (Condiments)', 'Nước mắm, Hạt nêm, Tương ớt');

-- 2. Thêm Sản phẩm (Products)
INSERT INTO public.products (id, category_id, sku, name, uom, unit_price) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'BEV-BIA-TIGER', 'Bia Tiger Thùng 24 Lon', 'Thùng', 350000),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'BEV-COKE-330', 'Coca Cola 330ml (Thùng 24)', 'Thùng', 210000),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'BEV-AQUA-500', 'Nước suối Aquafina 500ml', 'Thùng', 90000),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'SNK-CHOCO-PIE', 'Bánh ChocoPie Orion (Hộp 12)', 'Hộp', 55000),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'SNK-OISHI-SPICY', 'Snack Oishi Cay (Thùng 20)', 'Thùng', 100000),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '33333333-3333-3333-3333-333333333333', 'CON-CHINSU-250', 'Tương ớt Chinsu 250g (Thùng 24)', 'Thùng', 250000),
('00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'CON-MAM-NAMNGU', 'Nước mắm Nam Ngư (Thùng 12)', 'Thùng', 300000);

-- 3. Sinh Đơn hàng Mẫu cho Khách hàng hiện hữu
-- Dùng hàm DO để sinh ngẫu nhiên
DO $$
DECLARE
    cust_record RECORD;
    prod_record RECORD;
    new_order_id uuid;
    random_qty integer;
    random_days integer;
    order_total numeric;
BEGIN
    FOR cust_record IN SELECT id FROM public.customers LOOP
        -- Mỗi khách hàng tạo 2-4 đơn hàng ngẫu nhiên trong 30 ngày qua
        FOR i IN 1..floor(random() * 3 + 2) LOOP
            random_days := floor(random() * 30);
            new_order_id := gen_random_uuid();
            order_total := 0;

            -- Tạo đơn hàng tạm thời (sẽ update total sau)
            INSERT INTO public.orders (id, customer_id, order_date, total_amount)
            VALUES (new_order_id, cust_record.id, now() - (random_days || ' days')::interval, 0);

            -- Thêm 2-5 mặt hàng ngẫu nhiên vào đơn
            FOR prod_record IN (SELECT id, unit_price FROM public.products ORDER BY random() LIMIT floor(random() * 4 + 2)) LOOP
                random_qty := floor(random() * 10 + 1); -- Số lượng từ 1-10
                
                INSERT INTO public.order_items (order_id, product_id, quantity, unit_price)
                VALUES (new_order_id, prod_record.id, random_qty, prod_record.unit_price);
                
                order_total := order_total + (random_qty * prod_record.unit_price);
            END LOOP;

            -- Cập nhật lại tổng tiền đơn hàng
            UPDATE public.orders SET total_amount = order_total WHERE id = new_order_id;
        END LOOP;
    END LOOP;
END $$;
