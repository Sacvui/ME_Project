-- =============================================
-- SEED DỮ LIỆU 13 TỈNH MIỀN TÂY NAM BỘ
-- (Đồng bằng sông Cửu Long)
-- =============================================

-- 1. Long An
INSERT INTO public.provinces (id, name) VALUES
('aa000001-0000-0000-0000-000000000001', 'Long An')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000001-0000-0000-0000-000000000001', 'Thành phố Tân An', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Thị xã Kiến Tường', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Tân Hưng', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Vĩnh Hưng', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Mộc Hóa', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Tân Thạnh', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Thạnh Hóa', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Đức Huệ', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Đức Hòa', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Bến Lức', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Thủ Thừa', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Tân Trụ', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Cần Đước', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Cần Giuộc', 'old'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Châu Thành', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000001-0000-0000-0000-000000000001', 'Thành phố Tân An', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Thị xã Kiến Tường', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Tân Hưng', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Vĩnh Hưng', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Mộc Hóa', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Tân Thạnh', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Thạnh Hóa', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Đức Huệ', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Đức Hòa', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Bến Lức', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Thủ Thừa', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Tân Trụ', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Cần Đước', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Cần Giuộc', 'new'),
('aa000001-0000-0000-0000-000000000001', 'Huyện Châu Thành', 'new');

-- 2. Tiền Giang
INSERT INTO public.provinces (id, name) VALUES
('aa000002-0000-0000-0000-000000000002', 'Tiền Giang')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000002-0000-0000-0000-000000000002', 'Thành phố Mỹ Tho', 'old'),
('aa000002-0000-0000-0000-000000000002', 'Thị xã Gò Công', 'old'),
('aa000002-0000-0000-0000-000000000002', 'Thị xã Cai Lậy', 'old'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Tân Phước', 'old'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Cai Lậy', 'old'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Châu Thành', 'old'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Chợ Gạo', 'old'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Gò Công Tây', 'old'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Gò Công Đông', 'old'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Tân Phú Đông', 'old'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Cái Bè', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000002-0000-0000-0000-000000000002', 'Thành phố Mỹ Tho', 'new'),
('aa000002-0000-0000-0000-000000000002', 'Thị xã Gò Công', 'new'),
('aa000002-0000-0000-0000-000000000002', 'Thị xã Cai Lậy', 'new'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Tân Phước', 'new'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Cai Lậy', 'new'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Châu Thành', 'new'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Chợ Gạo', 'new'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Gò Công Tây', 'new'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Gò Công Đông', 'new'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Tân Phú Đông', 'new'),
('aa000002-0000-0000-0000-000000000002', 'Huyện Cái Bè', 'new');

-- 3. Bến Tre
INSERT INTO public.provinces (id, name) VALUES
('aa000003-0000-0000-0000-000000000003', 'Bến Tre')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000003-0000-0000-0000-000000000003', 'Thành phố Bến Tre', 'old'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Châu Thành', 'old'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Chợ Lách', 'old'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Mỏ Cày Nam', 'old'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Mỏ Cày Bắc', 'old'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Giồng Trôm', 'old'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Bình Đại', 'old'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Ba Tri', 'old'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Thạnh Phú', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000003-0000-0000-0000-000000000003', 'Thành phố Bến Tre', 'new'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Châu Thành', 'new'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Chợ Lách', 'new'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Mỏ Cày Nam', 'new'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Mỏ Cày Bắc', 'new'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Giồng Trôm', 'new'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Bình Đại', 'new'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Ba Tri', 'new'),
('aa000003-0000-0000-0000-000000000003', 'Huyện Thạnh Phú', 'new');

-- 4. Trà Vinh
INSERT INTO public.provinces (id, name) VALUES
('aa000004-0000-0000-0000-000000000004', 'Trà Vinh')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000004-0000-0000-0000-000000000004', 'Thành phố Trà Vinh', 'old'),
('aa000004-0000-0000-0000-000000000004', 'Thị xã Duyên Hải', 'old'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Càng Long', 'old'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Cầu Kè', 'old'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Tiểu Cần', 'old'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Châu Thành', 'old'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Cầu Ngang', 'old'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Trà Cú', 'old'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Duyên Hải', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000004-0000-0000-0000-000000000004', 'Thành phố Trà Vinh', 'new'),
('aa000004-0000-0000-0000-000000000004', 'Thị xã Duyên Hải', 'new'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Càng Long', 'new'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Cầu Kè', 'new'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Tiểu Cần', 'new'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Châu Thành', 'new'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Cầu Ngang', 'new'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Trà Cú', 'new'),
('aa000004-0000-0000-0000-000000000004', 'Huyện Duyên Hải', 'new');

-- 5. Vĩnh Long
INSERT INTO public.provinces (id, name) VALUES
('aa000005-0000-0000-0000-000000000005', 'Vĩnh Long')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000005-0000-0000-0000-000000000005', 'Thành phố Vĩnh Long', 'old'),
('aa000005-0000-0000-0000-000000000005', 'Thị xã Bình Minh', 'old'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Long Hồ', 'old'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Mang Thít', 'old'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Vũng Liêm', 'old'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Tam Bình', 'old'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Bình Tân', 'old'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Trà Ôn', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000005-0000-0000-0000-000000000005', 'Thành phố Vĩnh Long', 'new'),
('aa000005-0000-0000-0000-000000000005', 'Thị xã Bình Minh', 'new'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Long Hồ', 'new'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Mang Thít', 'new'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Vũng Liêm', 'new'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Tam Bình', 'new'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Bình Tân', 'new'),
('aa000005-0000-0000-0000-000000000005', 'Huyện Trà Ôn', 'new');

-- 6. Đồng Tháp
INSERT INTO public.provinces (id, name) VALUES
('aa000006-0000-0000-0000-000000000006', 'Đồng Tháp')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000006-0000-0000-0000-000000000006', 'Thành phố Cao Lãnh', 'old'),
('aa000006-0000-0000-0000-000000000006', 'Thành phố Sa Đéc', 'old'),
('aa000006-0000-0000-0000-000000000006', 'Thành phố Hồng Ngự', 'old'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Tân Hồng', 'old'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Hồng Ngự', 'old'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Tam Nông', 'old'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Tháp Mười', 'old'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Cao Lãnh', 'old'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Thanh Bình', 'old'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Lấp Vò', 'old'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Lai Vung', 'old'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Châu Thành', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000006-0000-0000-0000-000000000006', 'Thành phố Cao Lãnh', 'new'),
('aa000006-0000-0000-0000-000000000006', 'Thành phố Sa Đéc', 'new'),
('aa000006-0000-0000-0000-000000000006', 'Thành phố Hồng Ngự', 'new'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Tân Hồng', 'new'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Hồng Ngự', 'new'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Tam Nông', 'new'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Tháp Mười', 'new'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Cao Lãnh', 'new'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Thanh Bình', 'new'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Lấp Vò', 'new'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Lai Vung', 'new'),
('aa000006-0000-0000-0000-000000000006', 'Huyện Châu Thành', 'new');

-- 7. An Giang
INSERT INTO public.provinces (id, name) VALUES
('aa000007-0000-0000-0000-000000000007', 'An Giang')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000007-0000-0000-0000-000000000007', 'Thành phố Long Xuyên', 'old'),
('aa000007-0000-0000-0000-000000000007', 'Thành phố Châu Đốc', 'old'),
('aa000007-0000-0000-0000-000000000007', 'Thị xã Tân Châu', 'old'),
('aa000007-0000-0000-0000-000000000007', 'Huyện An Phú', 'old'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Phú Tân', 'old'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Châu Phú', 'old'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Tịnh Biên', 'old'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Tri Tôn', 'old'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Châu Thành', 'old'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Chợ Mới', 'old'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Thoại Sơn', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000007-0000-0000-0000-000000000007', 'Thành phố Long Xuyên', 'new'),
('aa000007-0000-0000-0000-000000000007', 'Thành phố Châu Đốc', 'new'),
('aa000007-0000-0000-0000-000000000007', 'Thị xã Tân Châu', 'new'),
('aa000007-0000-0000-0000-000000000007', 'Huyện An Phú', 'new'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Phú Tân', 'new'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Châu Phú', 'new'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Tịnh Biên', 'new'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Tri Tôn', 'new'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Châu Thành', 'new'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Chợ Mới', 'new'),
('aa000007-0000-0000-0000-000000000007', 'Huyện Thoại Sơn', 'new');

-- 8. Kiên Giang
INSERT INTO public.provinces (id, name) VALUES
('aa000008-0000-0000-0000-000000000008', 'Kiên Giang')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000008-0000-0000-0000-000000000008', 'Thành phố Rạch Giá', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Thành phố Hà Tiên', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Kiên Lương', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Hòn Đất', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Tân Hiệp', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Châu Thành', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Giồng Riềng', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Gò Quao', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện An Biên', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện An Minh', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Vĩnh Thuận', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Phú Quốc', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Kiên Hải', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện U Minh Thượng', 'old'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Giang Thành', 'old');

-- Kiên Giang - Mới (Phú Quốc lên Thành phố)
INSERT INTO public.districts (province_id, name, version) VALUES
('aa000008-0000-0000-0000-000000000008', 'Thành phố Rạch Giá', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Thành phố Hà Tiên', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Thành phố Phú Quốc', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Kiên Lương', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Hòn Đất', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Tân Hiệp', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Châu Thành', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Giồng Riềng', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Gò Quao', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện An Biên', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện An Minh', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Vĩnh Thuận', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Kiên Hải', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện U Minh Thượng', 'new'),
('aa000008-0000-0000-0000-000000000008', 'Huyện Giang Thành', 'new');

-- 9. Cần Thơ
INSERT INTO public.provinces (id, name) VALUES
('aa000009-0000-0000-0000-000000000009', 'Cần Thơ')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000009-0000-0000-0000-000000000009', 'Quận Ninh Kiều', 'old'),
('aa000009-0000-0000-0000-000000000009', 'Quận Ô Môn', 'old'),
('aa000009-0000-0000-0000-000000000009', 'Quận Bình Thủy', 'old'),
('aa000009-0000-0000-0000-000000000009', 'Quận Cái Răng', 'old'),
('aa000009-0000-0000-0000-000000000009', 'Quận Thốt Nốt', 'old'),
('aa000009-0000-0000-0000-000000000009', 'Huyện Vĩnh Thạnh', 'old'),
('aa000009-0000-0000-0000-000000000009', 'Huyện Cờ Đỏ', 'old'),
('aa000009-0000-0000-0000-000000000009', 'Huyện Phong Điền', 'old'),
('aa000009-0000-0000-0000-000000000009', 'Huyện Thới Lai', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000009-0000-0000-0000-000000000009', 'Quận Ninh Kiều', 'new'),
('aa000009-0000-0000-0000-000000000009', 'Quận Ô Môn', 'new'),
('aa000009-0000-0000-0000-000000000009', 'Quận Bình Thủy', 'new'),
('aa000009-0000-0000-0000-000000000009', 'Quận Cái Răng', 'new'),
('aa000009-0000-0000-0000-000000000009', 'Quận Thốt Nốt', 'new'),
('aa000009-0000-0000-0000-000000000009', 'Huyện Vĩnh Thạnh', 'new'),
('aa000009-0000-0000-0000-000000000009', 'Huyện Cờ Đỏ', 'new'),
('aa000009-0000-0000-0000-000000000009', 'Huyện Phong Điền', 'new'),
('aa000009-0000-0000-0000-000000000009', 'Huyện Thới Lai', 'new');

-- 10. Hậu Giang
INSERT INTO public.provinces (id, name) VALUES
('aa000010-0000-0000-0000-000000000010', 'Hậu Giang')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000010-0000-0000-0000-000000000010', 'Thành phố Vị Thanh', 'old'),
('aa000010-0000-0000-0000-000000000010', 'Thành phố Ngã Bảy', 'old'),
('aa000010-0000-0000-0000-000000000010', 'Huyện Châu Thành A', 'old'),
('aa000010-0000-0000-0000-000000000010', 'Huyện Châu Thành', 'old'),
('aa000010-0000-0000-0000-000000000010', 'Huyện Phụng Hiệp', 'old'),
('aa000010-0000-0000-0000-000000000010', 'Huyện Vị Thủy', 'old'),
('aa000010-0000-0000-0000-000000000010', 'Huyện Long Mỹ', 'old'),
('aa000010-0000-0000-0000-000000000010', 'Thị xã Long Mỹ', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000010-0000-0000-0000-000000000010', 'Thành phố Vị Thanh', 'new'),
('aa000010-0000-0000-0000-000000000010', 'Thành phố Ngã Bảy', 'new'),
('aa000010-0000-0000-0000-000000000010', 'Huyện Châu Thành A', 'new'),
('aa000010-0000-0000-0000-000000000010', 'Huyện Châu Thành', 'new'),
('aa000010-0000-0000-0000-000000000010', 'Huyện Phụng Hiệp', 'new'),
('aa000010-0000-0000-0000-000000000010', 'Huyện Vị Thủy', 'new'),
('aa000010-0000-0000-0000-000000000010', 'Huyện Long Mỹ', 'new'),
('aa000010-0000-0000-0000-000000000010', 'Thị xã Long Mỹ', 'new');

-- 11. Sóc Trăng
INSERT INTO public.provinces (id, name) VALUES
('aa000011-0000-0000-0000-000000000011', 'Sóc Trăng')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000011-0000-0000-0000-000000000011', 'Thành phố Sóc Trăng', 'old'),
('aa000011-0000-0000-0000-000000000011', 'Thị xã Vĩnh Châu', 'old'),
('aa000011-0000-0000-0000-000000000011', 'Thị xã Ngã Năm', 'old'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Châu Thành', 'old'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Kế Sách', 'old'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Mỹ Tú', 'old'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Cù Lao Dung', 'old'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Long Phú', 'old'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Mỹ Xuyên', 'old'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Thạnh Trị', 'old'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Trần Đề', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000011-0000-0000-0000-000000000011', 'Thành phố Sóc Trăng', 'new'),
('aa000011-0000-0000-0000-000000000011', 'Thị xã Vĩnh Châu', 'new'),
('aa000011-0000-0000-0000-000000000011', 'Thị xã Ngã Năm', 'new'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Châu Thành', 'new'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Kế Sách', 'new'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Mỹ Tú', 'new'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Cù Lao Dung', 'new'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Long Phú', 'new'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Mỹ Xuyên', 'new'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Thạnh Trị', 'new'),
('aa000011-0000-0000-0000-000000000011', 'Huyện Trần Đề', 'new');

-- 12. Bạc Liêu
INSERT INTO public.provinces (id, name) VALUES
('aa000012-0000-0000-0000-000000000012', 'Bạc Liêu')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000012-0000-0000-0000-000000000012', 'Thành phố Bạc Liêu', 'old'),
('aa000012-0000-0000-0000-000000000012', 'Huyện Hồng Dân', 'old'),
('aa000012-0000-0000-0000-000000000012', 'Huyện Phước Long', 'old'),
('aa000012-0000-0000-0000-000000000012', 'Huyện Vĩnh Lợi', 'old'),
('aa000012-0000-0000-0000-000000000012', 'Thị xã Giá Rai', 'old'),
('aa000012-0000-0000-0000-000000000012', 'Huyện Đông Hải', 'old'),
('aa000012-0000-0000-0000-000000000012', 'Huyện Hòa Bình', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000012-0000-0000-0000-000000000012', 'Thành phố Bạc Liêu', 'new'),
('aa000012-0000-0000-0000-000000000012', 'Huyện Hồng Dân', 'new'),
('aa000012-0000-0000-0000-000000000012', 'Huyện Phước Long', 'new'),
('aa000012-0000-0000-0000-000000000012', 'Huyện Vĩnh Lợi', 'new'),
('aa000012-0000-0000-0000-000000000012', 'Thị xã Giá Rai', 'new'),
('aa000012-0000-0000-0000-000000000012', 'Huyện Đông Hải', 'new'),
('aa000012-0000-0000-0000-000000000012', 'Huyện Hòa Bình', 'new');

-- 13. Cà Mau
INSERT INTO public.provinces (id, name) VALUES
('aa000013-0000-0000-0000-000000000013', 'Cà Mau')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000013-0000-0000-0000-000000000013', 'Thành phố Cà Mau', 'old'),
('aa000013-0000-0000-0000-000000000013', 'Huyện U Minh', 'old'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Thới Bình', 'old'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Trần Văn Thời', 'old'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Cái Nước', 'old'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Đầm Dơi', 'old'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Năm Căn', 'old'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Phú Tân', 'old'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Ngọc Hiển', 'old');

INSERT INTO public.districts (province_id, name, version) VALUES
('aa000013-0000-0000-0000-000000000013', 'Thành phố Cà Mau', 'new'),
('aa000013-0000-0000-0000-000000000013', 'Huyện U Minh', 'new'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Thới Bình', 'new'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Trần Văn Thời', 'new'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Cái Nước', 'new'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Đầm Dơi', 'new'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Năm Căn', 'new'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Phú Tân', 'new'),
('aa000013-0000-0000-0000-000000000013', 'Huyện Ngọc Hiển', 'new');
