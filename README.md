# ⚡ LexiFlash Web Client - Modern English Flashcard SPA

Ứng dụng web Single Page Application (SPA) học flashcard và luyện tập từ vựng tiếng Anh thông minh, được xây dựng trên nền tảng **React 19**, **Vite**, **Tailwind CSS v4** và hệ sinh thái **TanStack** với hiệu năng tối ưu hóa chống giật lag toàn diện.

### (DỰ ÁN PHỤC VỤ VIỆC HỌC TIẾNG ANH)

---

## 📋 Mục Lục

- [1. Công Nghệ & Thư Viện Chính](#1-công-nghệ--thư-viện-chính)
- [2. Điểm Nhấn Tối Ưu Hiệu Năng (Anti-Lag Architecture)](#2-điểm-nhấn-tối-ưu-hiệu-năng-anti-lag-architecture)
- [3. Cấu Trúc Thư Mục](#3-cấu-trúc-thư-mục)
- [4. Cấu Hình Biến Môi Trường (.env)](#4-cấu-hình-biến-môi-trường-env)
- [5. Cài Đặt & Khởi Chạy](#5-cài-đặt--khởi-chạy)
- [6. Các Tính Năng Nổi Bật](#6-các-tính-năng-nổi-bật)
- [7. Hướng Dẫn Deploy Frontend (Vercel & Netlify)](#7-hướng-dẫn-deploy-frontend-vercel--netlify)

---

## 1. Công Nghệ & Thư Viện Chính

- **Core:** React 19, TypeScript, Vite 8 (Rolldown engine).
- **Styling:** Tailwind CSS v4, Lucide React Icons.
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`).
- **Data Fetching & Cache:** `@tanstack/react-query` (v5).
- **DOM Virtualization:** `@tanstack/react-virtual` (v3).
- **Headless Tables:** `@tanstack/react-table` (v8).
- **Form Handling:** `react-hook-form` (v7).
- **Routing:** React Router v7.
- **Tương tác & Âm thanh:** Web Speech API (`speakWord`), `canvas-confetti`, `xlsx` (đọc file Excel).
- **Đa Ngôn Ngữ (i18n):** Hệ thống dịch thuật nội bộ hỗ trợ song ngữ Tiếng Việt / Tiếng Anh.

---

## 2. Điểm Nhấn Tối Ưu Hiệu Năng (Anti-Lag Architecture)

Dự án áp dụng 4 kỹ thuật tối ưu hóa chuyên sâu nhằm đạt mức phản hồi tức thì 60 FPS:

1. **`createPortal` cho toàn bộ Modal:**
   Mọi Modal (`AiGenerateModal`, `CreateFolderModal`, `CreateClassModal`, `AdminCustomTagsModal`, `ConfirmModal`) đều được render trực tiếp vào thẻ `document.body`. Điều này biến modal thành một _Compositing Layer_ riêng biệt trên GPU, tránh layout reflow và không bắt trang cha phải vẽ lại khi modal hoạt động.
2. **`react-hook-form` Phản Hồi 0ms (0 Lần Re-render Khi Gõ):**
   Chuyển đổi toàn bộ các ô nhập dữ liệu sang mô hình _Uncontrolled Components_. Việc gõ phím diễn ra ở tốc độ gốc của trình duyệt mà không kích hoạt chu kỳ render của React component cha.
3. **`@tanstack/react-query` Caching:**
   Lưu trữ kết quả tìm kiếm và dữ liệu khám phá trong 1–3 phút. Chuyển trang tức thì 0ms mà không gửi lại HTTP request thừa thãi lên server.
4. **`@tanstack/react-virtual` Trong Set Editor:**
   Trong trình tạo và chỉnh sửa học phần, danh sách thẻ từ vựng được ảo hóa DOM. Chỉ render các thẻ nằm trong tầm nhìn (viewport), cho phép thao tác mượt mà với những bộ thẻ lên đến 300+ từ.

---

## 3. Cấu Trúc Thư Mục

```
client/
├── src/
│   ├── api/                # Cấu hình Axios Client & API Endpoints
│   │   ├── axiosClient.ts  # Tự động đính kèm Token và xử lý Refresh Token
│   │   ├── authApi.ts
│   │   ├── studySetApi.ts
│   │   ├── cardApi.ts
│   │   ├── studyApi.ts
│   │   ├── searchApi.ts
│   │   ├── adminApi.ts
│   │   ├── aiApi.ts
│   │   ├── classApi.ts
│   │   └── folderApi.ts
│   ├── components/         # Các thành phần giao diện tái sử dụng
│   │   └── common/         # Modal (createPortal), Button, Input, Select, Badge, Spinner...
│   ├── pages/              # Các trang chính của ứng dụng
│   │   ├── Home/           # Trang chủ, Hero 3D Deck, Tìm kiếm toàn diện
│   │   ├── Auth/           # Đăng nhập (LoginPage), Đăng ký (RegisterPage), Khôi phục mật khẩu
│   │   ├── StudySets/      # Chi tiết học phần (StudySetDetailPage)
│   │   ├── SetEditor/      # Tạo/sửa học phần, Bulk Import Excel, AI Modal
│   │   ├── StudyModes/     # 5 chế độ: Flashcards, Learn, Write, Test, Match
│   │   ├── Admin/          # Quản trị hệ thống KPI, Users, Sets, Groups, Featured Topics
│   │   ├── Classes/        # Lớp học & Nhóm học tập (ClassesPage, ClassDetailPage)
│   │   ├── Folders/        # Thư mục học tập (FoldersPage, FolderDetailPage)
│   │   ├── Profile/        # Trang cá nhân & Đổi email/mật khẩu
│   │   └── VIPPricing/     # Bảng giá & Nâng cấp tài khoản VIP
│   ├── store/              # Redux Toolkit Slices (auth, studySet, study, ui)
│   ├── i18n/               # Từ điển đa ngôn ngữ (vi, en)
│   ├── types/              # Định nghĩa Type/Interface cho toàn bộ Frontend
│   ├── utils/              # Tiện ích phát âm (Web Speech), nối class (cn)
│   ├── App.tsx             # Định tuyến Router và Layout ứng dụng
│   └── main.tsx            # Điểm khởi tạo Redux Provider & TanStack QueryClient
├── public/
│   ├── _redirects          # Hỗ trợ SPA Routing trên Netlify
│   └── logo.png
├── vercel.json             # Hỗ trợ SPA Routing trên Vercel (chống lỗi 404 khi F5)
├── package.json
├── vite.config.ts          # Cấu hình Vite & chia nhỏ vendor chunks tối ưu tải trang
└── tsconfig.json
```

---

## 4. Cấu Hình Biến Môi Trường (.env)

Tạo file `.env` (hoặc `.env.local`) tại thư mục `client/`:

```env
# Địa chỉ API của Backend (mặc định trỏ về localhost nếu không cấu hình)
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 5. Cài Đặt & Khởi Chạy

### 5.1. Cài đặt các gói phụ thuộc:

```bash
cd client
npm install
```

### 5.2. Chạy môi trường phát triển (Development):

```bash
npm run dev
```

> Ứng dụng sẽ khởi chạy tại `http://localhost:3000`.

### 5.3. Biên dịch bản chính thức (Production Build):

```bash
npm run build
```

> Mã nguồn được tự động kiểm tra kiểu dữ liệu `tsc -b` và đóng gói vào thư mục `dist/`. Mã nguồn được chia nhỏ thành các chunk chuyên biệt (`vendor-react`, `vendor-tanstack`, `vendor-core`, `vendor-xlsx`).

### 5.4. Xem trước bản build (Preview):

```bash
npm run preview
```

---

## 6. Các Tính Năng Nổi Bật

### 📖 5 Chế Độ Học Tập Toàn Diện

1. **Thẻ Ghi Nhớ (Flashcards):** Lật thẻ 3D, hỗ trợ phím tắt Space/Mũi tên, phát âm chuẩn bản ngữ.
2. **Học Chủ Động (Learn):** Điều chỉnh lịch ôn tập theo trí nhớ người học.
3. **Chính Tả & Viết (Write):** Gõ từ vựng tiếng Anh theo định nghĩa và nghe phát âm.
4. **Kiểm Tra & Đánh Giá (Test):** Tạo đề thi tự động kết hợp trắc nghiệm và tự luận, tự động chấm điểm.
5. **Nối Từ Thách Đấu (Match Game):** Trò chơi ghép thẻ đếm thời gian thực kèm bảng xếp hạng kỷ lục cá nhân.

### 🤖 Trợ Lý Trí Tuệ Nhân Tạo (AI Flashcard Generator)

- Tự động sinh danh sách 5–20 từ vựng song ngữ theo chủ đề yêu cầu.
- Giải thích chi tiết ngữ nghĩa, từ loại, phiên âm chuẩn IPA và câu ví dụ ngữ cảnh.

### 📱 Giao Diện Mobile & Trải Nghiệm Người Dùng (UX/UI)

- Giao diện đáp ứng (Responsive) mượt mà trên điện thoại di động và máy tính bảng.
- Thanh điều hướng thông minh hỗ trợ Dropdown và Sidebar tiện lợi trên màn hình nhỏ.
- Hỗ trợ đổi email cá nhân và quản lý tài khoản an toàn trong trang Profile.

### 🛡️ Trung Tâm Quản Trị (Admin Control Center)

- Quản lý người dùng, phân quyền Admin/User, khóa/mở khóa tài khoản.
- Quản lý duyệt nội dung học phần toàn sàn và tùy chỉnh danh sách chủ đề nổi bật trên trang chủ.

---

## 7. Hướng Dẫn Deploy Frontend (Vercel)

### 🚀 Triển khai lên Vercel

1. Đăng nhập vào [Vercel.com](https://vercel.com).
2. Nhấn **Add New...** ➔ **Project**.
3. Import kho lưu trữ (Repository) GitHub của dự án LexiFlash.
4. Thiết lập dự án:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Thêm **Environment Variable**:
   - **Key:** `VITE_API_URL`
   - **Value:** `YOUR_URL_BACKEND` (URL Backend đã deploy của bạn)
6. Nhấn **Deploy**.
   > _Lưu ý:_ File `client/vercel.json` đã có sẵn trong dự án sẽ tự động cấu hình URL Rewrites, giúp tránh triệt để lỗi 404 khi người dùng F5 tải lại các trang như `/profile`, `/sets/123` hay `/admin`.
