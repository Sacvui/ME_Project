-- 1. Bật extension PostGIS để xử lý tọa độ địa lý miễn phí
create extension if not exists postgis;

-- 2. Bảng lưu trữ khách hàng hiện tại của công ty
create table public.customers (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    address text,
    location geometry(Point, 4326) not null, -- Lưu kinh độ, vĩ độ dạng PostGIS
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Bảng lưu dữ liệu khảo sát thị trường / đối thủ (Dữ liệu thô để tìm vùng trắng)
create table public.market_leads (
    id uuid default gen_random_uuid() primary key,
    store_name text not null,
    address text,
    location geometry(Point, 4326) not null,
    source text, -- 'survey', 'competitor_data', v.v.
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tạo Index địa lý để tăng tốc độ truy vấn tìm kiếm không gian (B-Tree/GIST)
create index customers_location_idx on public.customers using gist(location);
create index market_leads_location_idx on public.market_leads using gist(location);

-- 5. Hàm lấy các điểm vùng trắng (nằm ngoài bán kính của các điểm hiện có)
create or replace function get_white_spaces(radius_meters float)
returns table (id uuid, store_name text, address text, lat float, lng float) as $$
begin
    return query
    select 
        ml.id, 
        ml.store_name, 
        ml.address,
        st_y(ml.location) as lat, -- Trích xuất Vĩ độ
        st_x(ml.location) as lng  -- Trích xuất Kinh độ
    from public.market_leads ml
    where not exists (
        select 1 
        from public.customers c
        where st_dwithin(ml.location::geography, c.location::geography, radius_meters)
    );
end;
$$ language plpgsql;
