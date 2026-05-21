# Sales-DMS Dashboard

Hệ thống quản lý phân phối và bán hàng toàn diện, tập trung vào Route To Market (RTM), Business Intelligence (BI) và Sales Force Effectiveness (SFE).

Dự án được xây dựng với:
- **Frontend**: Next.js 14+ (App Router), React, TailwindCSS, React-Leaflet.
- **Backend & Database**: Supabase (PostgreSQL), tích hợp PostGIS để xử lý và phân tích không gian địa lý (bản đồ vùng trắng).

## 🚀 Tính năng nổi bật
- **RTM (Route To Market)**: Bản đồ hiển thị và phân tích "Vùng Trắng" (những điểm bán tiềm năng nhưng chưa có khách hàng hiện hữu trong bán kính nhất định).
- *Các tính năng khác (BI, SFE) đang trong quá trình phát triển.*

---

## 🛠 Hướng dẫn Cài đặt & Cấu hình

### 1. Cài đặt các thư viện (Dependencies)
```bash
npm install
# hoặc
yarn install
```

### 2. Thiết lập Môi trường (Environment Variables)
Tạo một file `.env.local` ở thư mục gốc của dự án với nội dung như sau:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```
Bạn có thể lấy các giá trị này trong mục **Settings > API** trên trang quản trị (Dashboard) của Supabase.

### 3. Thiết lập Database (Supabase)
Dự án yêu cầu extension `postgis` và một số bảng để lưu tọa độ không gian. Để triển khai cấu trúc cơ sở dữ liệu lên dự án Supabase, bạn cần có Supabase CLI.

**Bước 3.1: Đăng nhập Supabase CLI**
```bash
npx supabase login
```

**Bước 3.2: Khởi tạo dữ liệu (Schema & Seed)**
Có 2 cách để đưa dữ liệu lên:

- **Cách 1: Chạy trực tiếp qua Management API bằng Access Token**
  Nếu bạn đã thiết lập biến môi trường `SUPABASE_ACCESS_TOKEN`, bạn có thể chạy thẳng các lệnh sau:
  ```bash
  npx supabase link --project-ref <your-project-id>
  npx supabase db query -f supabase/schema.sql --linked
  npx supabase db query -f supabase/seed.sql --linked
  ```

- **Cách 2: Chạy trực tiếp trên giao diện (Dashboard)**
  Nếu bạn không có quyền dùng CLI, hãy mở file `supabase/schema.sql` và `supabase/seed.sql`, copy nội dung và dán vào phần **SQL Editor** trên Supabase Dashboard và nhấn Run.

---

## 💻 Chạy Dự Án (Local Development)

Sau khi hoàn tất cài đặt, hãy khởi động server phát triển:

```bash
npm run dev
# hoặc
yarn dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000) để xem kết quả.
Ứng dụng sẽ tự động tải lại (hot-reload) khi bạn sửa code.

## 🗺 Lưu ý về Bản đồ (Leaflet) trong Next.js
Do thư viện Leaflet truy cập vào `window` (chỉ có ở phía Client), nên các Component chứa bản đồ (`MapContainer`, `Marker`) phải được import động (Dynamic Import) với tùy chọn `ssr: false` để tránh lỗi "window is not defined".
