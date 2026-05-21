create or replace function get_customers()
returns table (id uuid, name text, address text, lat float, lng float) as $$
begin
    return query
    select 
        c.id, 
        c.name, 
        c.address,
        st_y(c.location) as lat,
        st_x(c.location) as lng
    from public.customers c;
end;
$$ language plpgsql;
