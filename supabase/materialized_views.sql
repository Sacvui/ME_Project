-- =============================================
-- MATERIALIZED VIEWS CHO BI DASHBOARD
-- =============================================

-- 1. View tổng hợp doanh số theo Nhân viên và Tháng
CREATE MATERIALIZED VIEW IF NOT EXISTS public.mv_sales_summary_by_rep_month AS
SELECT 
    o.sales_rep_id,
    to_char(o.order_date, 'YYYY-MM') as month,
    SUM(o.total_amount) as total_revenue,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT o.customer_id) as unique_customers,
    COALESCE(SUM(oi.quantity), 0) as total_items_sold
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
WHERE o.status = 'Completed'
GROUP BY o.sales_rep_id, to_char(o.order_date, 'YYYY-MM');

-- 2. Index để hỗ trợ Refresh Concurrently (Cập nhật không khoá bảng)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_sales_summary_rep_month 
ON public.mv_sales_summary_by_rep_month(sales_rep_id, month);

-- 3. Hàm tiện ích để Refresh View
CREATE OR REPLACE FUNCTION public.refresh_mv_sales_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_sales_summary_by_rep_month;
END;
$$ LANGUAGE plpgsql;
