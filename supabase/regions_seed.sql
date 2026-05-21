TRUNCATE TABLE public.districts RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.provinces RESTART IDENTITY CASCADE;

-- Thêm Tỉnh Thành mẫu
INSERT INTO public.provinces (id, name) VALUES 
('11111111-0000-0000-0000-111111111111', 'TP. Hồ Chí Minh'),
('22222222-0000-0000-0000-222222222222', 'Hà Nội'),
('33333333-0000-0000-0000-333333333333', 'Đà Nẵng');

-- Thêm Quận Huyện (Hồ Chí Minh - Cũ)
INSERT INTO public.districts (province_id, name, version) VALUES
('11111111-0000-0000-0000-111111111111', 'Quận 1', 'old'),
('11111111-0000-0000-0000-111111111111', 'Quận 2', 'old'),
('11111111-0000-0000-0000-111111111111', 'Quận 3', 'old'),
('11111111-0000-0000-0000-111111111111', 'Quận 9', 'old'),
('11111111-0000-0000-0000-111111111111', 'Quận Thủ Đức', 'old'),
('11111111-0000-0000-0000-111111111111', 'Quận Bình Thạnh', 'old');

-- Thêm Quận Huyện (Hồ Chí Minh - Mới, Quận 2, 9, Thủ Đức sát nhập thành TP Thủ Đức)
INSERT INTO public.districts (province_id, name, version) VALUES
('11111111-0000-0000-0000-111111111111', 'Quận 1', 'new'),
('11111111-0000-0000-0000-111111111111', 'Quận 3', 'new'),
('11111111-0000-0000-0000-111111111111', 'Thành phố Thủ Đức', 'new'),
('11111111-0000-0000-0000-111111111111', 'Quận Bình Thạnh', 'new');

-- Thêm Quận Huyện (Hà Nội - Cũ, chưa sát nhập Hà Tây)
INSERT INTO public.districts (province_id, name, version) VALUES
('22222222-0000-0000-0000-222222222222', 'Quận Hoàn Kiếm', 'old'),
('22222222-0000-0000-0000-222222222222', 'Quận Ba Đình', 'old'),
('22222222-0000-0000-0000-222222222222', 'Quận Đống Đa', 'old');

-- Thêm Quận Huyện (Hà Nội - Mới, có thêm các huyện của Hà Tây cũ như Ba Vì, Sơn Tây...)
INSERT INTO public.districts (province_id, name, version) VALUES
('22222222-0000-0000-0000-222222222222', 'Quận Hoàn Kiếm', 'new'),
('22222222-0000-0000-0000-222222222222', 'Quận Ba Đình', 'new'),
('22222222-0000-0000-0000-222222222222', 'Quận Đống Đa', 'new'),
('22222222-0000-0000-0000-222222222222', 'Quận Hà Đông', 'new'),
('22222222-0000-0000-0000-222222222222', 'Thị xã Sơn Tây', 'new'),
('22222222-0000-0000-0000-222222222222', 'Huyện Ba Vì', 'new');

-- Thêm Quận Huyện Đà Nẵng (Dùng chung 1 chuẩn cho cả old và new để test)
INSERT INTO public.districts (province_id, name, version) VALUES
('33333333-0000-0000-0000-333333333333', 'Quận Hải Châu', 'old'),
('33333333-0000-0000-0000-333333333333', 'Quận Sơn Trà', 'old'),
('33333333-0000-0000-0000-333333333333', 'Quận Hải Châu', 'new'),
('33333333-0000-0000-0000-333333333333', 'Quận Sơn Trà', 'new');
