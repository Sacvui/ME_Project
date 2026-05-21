-- Bảng danh sách Tỉnh / Thành
CREATE TABLE IF NOT EXISTS public.provinces (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Bảng danh sách Quận / Huyện
-- Cột version để phân biệt ranh giới cũ/mới (old / new)
CREATE TABLE IF NOT EXISTS public.districts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    province_id uuid REFERENCES public.provinces(id) ON DELETE CASCADE,
    name text NOT NULL,
    version text DEFAULT 'old', -- 'old' hoặc 'new'
    created_at timestamp with time zone DEFAULT now()
);

-- Disable RLS cho mục đích demo nhanh
ALTER TABLE public.provinces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts DISABLE ROW LEVEL SECURITY;
