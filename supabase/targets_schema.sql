-- =============================================
-- BẢNG TARGET DOANH SỐ THÁNG
-- =============================================
CREATE TABLE IF NOT EXISTS sales_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES sales_teams(id) ON DELETE CASCADE,
    month DATE NOT NULL,  -- ngày 1 của tháng, VD: 2025-05-01
    revenue_target NUMERIC DEFAULT 0,
    orders_target INT DEFAULT 0,
    sku_per_order_target NUMERIC(4,1) DEFAULT 0,
    dropsize_target NUMERIC DEFAULT 0,
    vpo_target NUMERIC DEFAULT 0,
    pc_target NUMERIC(5,1) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(employee_id, month)
);

-- RLS off
ALTER TABLE sales_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for sales_targets" ON sales_targets FOR ALL USING (true) WITH CHECK (true);
