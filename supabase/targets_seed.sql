-- =============================================
-- SEED TARGET THÁNG 5/2025 CHO TẤT CẢ NV
-- =============================================

-- Target cho ASM (cao nhất)
INSERT INTO sales_targets (employee_id, month, revenue_target, orders_target, sku_per_order_target, dropsize_target, vpo_target, pc_target)
SELECT id, '2025-05-01'::date, 150000000, 60, 3.5, 2500000, 8000000, 70
FROM sales_teams WHERE role = 'ASM'
ON CONFLICT (employee_id, month) DO NOTHING;

-- Target cho SS
INSERT INTO sales_targets (employee_id, month, revenue_target, orders_target, sku_per_order_target, dropsize_target, vpo_target, pc_target)
SELECT id, '2025-05-01'::date, 70000000, 28, 3.0, 2500000, 7000000, 65
FROM sales_teams WHERE role = 'SS'
ON CONFLICT (employee_id, month) DO NOTHING;

-- Target cho SR
INSERT INTO sales_targets (employee_id, month, revenue_target, orders_target, sku_per_order_target, dropsize_target, vpo_target, pc_target)
SELECT id, '2025-05-01'::date, 35000000, 14, 2.5, 2500000, 5000000, 60
FROM sales_teams WHERE role = 'SR'
ON CONFLICT (employee_id, month) DO NOTHING;

-- Tháng 4/2025 (để có data WTD/YTD)
INSERT INTO sales_targets (employee_id, month, revenue_target, orders_target, sku_per_order_target, dropsize_target, vpo_target, pc_target)
SELECT id, '2025-04-01'::date, 140000000, 55, 3.5, 2500000, 8000000, 70
FROM sales_teams WHERE role = 'ASM'
ON CONFLICT (employee_id, month) DO NOTHING;

INSERT INTO sales_targets (employee_id, month, revenue_target, orders_target, sku_per_order_target, dropsize_target, vpo_target, pc_target)
SELECT id, '2025-04-01'::date, 65000000, 26, 3.0, 2500000, 7000000, 65
FROM sales_teams WHERE role = 'SS'
ON CONFLICT (employee_id, month) DO NOTHING;

INSERT INTO sales_targets (employee_id, month, revenue_target, orders_target, sku_per_order_target, dropsize_target, vpo_target, pc_target)
SELECT id, '2025-04-01'::date, 30000000, 12, 2.5, 2500000, 5000000, 60
FROM sales_teams WHERE role = 'SR'
ON CONFLICT (employee_id, month) DO NOTHING;

-- Tháng 3
INSERT INTO sales_targets (employee_id, month, revenue_target, orders_target, sku_per_order_target, dropsize_target, vpo_target, pc_target)
SELECT id, '2025-03-01'::date, 130000000, 50, 3.5, 2500000, 8000000, 70
FROM sales_teams WHERE role = 'ASM'
ON CONFLICT (employee_id, month) DO NOTHING;

INSERT INTO sales_targets (employee_id, month, revenue_target, orders_target, sku_per_order_target, dropsize_target, vpo_target, pc_target)
SELECT id, '2025-03-01'::date, 60000000, 24, 3.0, 2500000, 7000000, 65
FROM sales_teams WHERE role = 'SS'
ON CONFLICT (employee_id, month) DO NOTHING;

INSERT INTO sales_targets (employee_id, month, revenue_target, orders_target, sku_per_order_target, dropsize_target, vpo_target, pc_target)
SELECT id, '2025-03-01'::date, 28000000, 11, 2.5, 2500000, 5000000, 60
FROM sales_teams WHERE role = 'SR'
ON CONFLICT (employee_id, month) DO NOTHING;
