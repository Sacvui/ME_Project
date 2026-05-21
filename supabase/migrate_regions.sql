-- Thêm cột province, district
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS province text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS district text;

ALTER TABLE public.market_leads ADD COLUMN IF NOT EXISTS province text;
ALTER TABLE public.market_leads ADD COLUMN IF NOT EXISTS district text;

-- Cập nhật RPC get_white_spaces để có thể lọc
CREATE OR REPLACE FUNCTION get_white_spaces(radius_meters float, p_province text DEFAULT NULL, p_district text DEFAULT NULL)
RETURNS TABLE (id uuid, store_name text, address text, lat float, lng float, district text, province text) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ml.id, 
        ml.store_name, 
        ml.address,
        ST_Y(ml.location) AS lat, 
        ST_X(ml.location) AS lng,
        ml.district,
        ml.province
    FROM public.market_leads ml
    WHERE 
        (p_province IS NULL OR p_province = '' OR ml.province = p_province)
        AND (p_district IS NULL OR p_district = '' OR ml.district = p_district)
        AND NOT EXISTS (
            SELECT 1 
            FROM public.customers c
            WHERE 
                (p_province IS NULL OR p_province = '' OR c.province = p_province)
                AND (p_district IS NULL OR p_district = '' OR c.district = p_district)
                AND ST_DWithin(ml.location::geography, c.location::geography, radius_meters)
        );
END;
$$ LANGUAGE plpgsql;


-- Cập nhật RPC get_customers để có thể lọc
CREATE OR REPLACE FUNCTION get_customers(p_province text DEFAULT NULL, p_district text DEFAULT NULL)
RETURNS TABLE (id uuid, name text, address text, lat float, lng float, district text, province text) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id, 
        c.name, 
        c.address,
        ST_Y(c.location) AS lat,
        ST_X(c.location) AS lng,
        c.district,
        c.province
    FROM public.customers c
    WHERE 
        (p_province IS NULL OR p_province = '' OR c.province = p_province)
        AND (p_district IS NULL OR p_district = '' OR c.district = p_district);
END;
$$ LANGUAGE plpgsql;
