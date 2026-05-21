-- 1. Mở rộng Bảng Dữ liệu nền (Customers)
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_type text DEFAULT 'Tạp hóa';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS channel text DEFAULT 'GT'; -- GT: General Trade (Truyền thống), MT: Modern Trade (Hiện đại)

-- 2. Khởi tạo Bảng Danh mục (Product Categories)
CREATE TABLE IF NOT EXISTS public.product_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    parent_id uuid REFERENCES public.product_categories(id),
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Khởi tạo Bảng Sản phẩm (Products)
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id uuid REFERENCES public.product_categories(id),
    sku text UNIQUE NOT NULL,
    name text NOT NULL,
    uom text NOT NULL DEFAULT 'Thùng', -- Unit of Measure
    unit_price numeric(15, 2) NOT NULL DEFAULT 0,
    status text DEFAULT 'Active',
    created_at timestamp with time zone DEFAULT now()
);

-- 4. Khởi tạo Bảng Đơn hàng (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
    order_date timestamp with time zone DEFAULT now(),
    total_amount numeric(15, 2) NOT NULL DEFAULT 0,
    status text DEFAULT 'Completed', -- Pending, Completed, Cancelled
    sales_rep_id uuid, -- Sẽ link với bảng auth.users sau này nếu cần
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Khởi tạo Bảng Chi tiết Đơn hàng (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric(15, 2) NOT NULL,
    subtotal numeric(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at timestamp with time zone DEFAULT now()
);

-- Bật (Tắt) RLS cho tiện trong môi trường phát triển (Tương tự như Customers)
ALTER TABLE public.product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
