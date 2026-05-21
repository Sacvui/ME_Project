-- =============================================
-- BẢNG NHÂN SỰ BÁN HÀNG (Sales Teams)
-- Phân cấp: SR → SS → ASM
-- =============================================

CREATE TABLE IF NOT EXISTS public.sales_teams (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_code text UNIQUE NOT NULL,
    name text NOT NULL,
    role text NOT NULL CHECK (role IN ('SR', 'SS', 'ASM')),
    parent_id uuid REFERENCES public.sales_teams(id), -- SR -> SS, SS -> ASM
    province text,
    district text,
    phone text,
    email text,
    status text DEFAULT 'Active',
    created_at timestamp with time zone DEFAULT now()
);

-- Index cho tìm kiếm nhanh
CREATE INDEX IF NOT EXISTS idx_sales_teams_role ON public.sales_teams(role);
CREATE INDEX IF NOT EXISTS idx_sales_teams_parent ON public.sales_teams(parent_id);

-- Gắn FK cho orders.sales_rep_id (nếu chưa có constraint)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_sales_rep_fk'
    ) THEN
        ALTER TABLE public.orders 
            ADD CONSTRAINT orders_sales_rep_fk 
            FOREIGN KEY (sales_rep_id) REFERENCES public.sales_teams(id);
    END IF;
END $$;

-- Tắt RLS cho dev
ALTER TABLE public.sales_teams DISABLE ROW LEVEL SECURITY;
