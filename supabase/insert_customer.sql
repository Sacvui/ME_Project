CREATE OR REPLACE FUNCTION insert_customer(
    p_name text, p_address text, p_lat float, p_lng float,
    p_province text, p_district text, p_customer_type text,
    p_channel text, p_status text
) RETURNS void AS $$
BEGIN
    INSERT INTO public.customers (name, address, location, province, district, customer_type, channel, status)
    VALUES (p_name, p_address, ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326), p_province, p_district, p_customer_type, p_channel, p_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon
GRANT EXECUTE ON FUNCTION insert_customer TO anon;
GRANT EXECUTE ON FUNCTION insert_customer TO authenticated;
