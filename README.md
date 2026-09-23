# Badminton Shop RAG

Website thương mại điện tử cầu lông xây dựng bằng MERN Stack, định hướng tích hợp trợ lý tư vấn sản phẩm bằng Retrieval-Augmented Generation (RAG).

## Trạng thái hiện tại

Sprint nền tảng trang quản trị gồm:

- React + TypeScript + Vite và Ant Design.
- Express + TypeScript + MongoDB/Mongoose.
- Đăng nhập admin bằng access token và refresh token trong cookie `httpOnly`.
- Phân quyền route `admin` ở cả frontend và backend.
- Dashboard đọc thống kê cơ bản từ MongoDB.
- Quản lý người dùng: tạo, sửa, xóa mềm, tìm kiếm, lọc, xem chi tiết và khóa/mở khóa.
- Quản lý danh mục với bộ thông số/thuộc tính biến thể riêng theo ngành hàng.
- Quản lý thương hiệu độc lập với danh mục.
- Upload ảnh danh mục, logo thương hiệu và gallery nhiều ảnh sản phẩm từ máy vào MongoDB GridFS dùng chung, giới hạn 5 MB/ảnh.
- Quản lý sản phẩm, SKU, màu sắc, size/thông số biến thể và tồn kho theo từng SKU.
- Soạn mô tả sản phẩm dạng rich text với định dạng chữ, liên kết, bảng và ảnh chèn từ máy; HTML được lọc an toàn ở backend.
- Script tạo hoặc cập nhật tài khoản admin.
- Menu khung cho sản phẩm, danh mục, thương hiệu, đơn hàng và khách hàng.
- Storefront công khai với Home page cơ bản và route tách biệt khỏi trang quản trị.

## Cấu trúc

```text
client/   React admin application
server/   Express REST API
docs/     Tài liệu kỹ thuật và kế hoạch
```

## Chuẩn bị MongoDB Atlas

Trong Atlas project:

1. Mở **Database & Network Access** và tạo một Database User.
2. Thêm địa chỉ IP hiện tại trong **Network Access**. Chỉ dùng `0.0.0.0/0` tạm thời khi phát triển và phải dùng mật khẩu mạnh.
3. Tại `Cluster0`, chọn **Connect → Drivers → Node.js** rồi sao chép connection string.
4. Thêm tên database `badminton_shop` vào connection string.
5. Không commit hoặc gửi connection string có mật khẩu lên GitHub.

Ví dụ hình thức connection string:

```text
mongodb+srv://USERNAME:PASSWORD@HOST/badminton_shop?retryWrites=true&w=majority
```

Nếu mật khẩu chứa ký tự đặc biệt, URL-encode mật khẩu hoặc tạo mật khẩu chỉ gồm chữ và số cho môi trường phát triển.

## Chạy dự án

```bash
npm install
```

Sao chép `.env.example` thành `server/.env`, sau đó thay:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Tạo tài khoản quản trị:

```bash
npm run seed:admin
```

Chạy frontend và backend cùng lúc:

```bash
npm run dev
```

- Trang chủ: http://localhost:5173/
- Admin: http://localhost:5173/admin/login
- API health check: http://localhost:5000/api/health

## Routes frontend

```text
/                    Trang chủ công khai
/products            Danh sách sản phẩm (khung chờ phát triển)
/products/:slug      Chi tiết sản phẩm (khung chờ phát triển)
/ai-advisor          Trợ lý tư vấn AI (khung chờ phát triển)
/cart                Giỏ hàng (khung chờ phát triển)
/account             Tài khoản khách hàng (khung chờ phát triển)

/admin/login         Đăng nhập quản trị
/admin               Dashboard quản trị (được bảo vệ)
/admin/products      Quản lý sản phẩm, biến thể và tồn kho
/admin/categories    Quản lý danh mục và cấu hình thông số
/admin/brands        Quản lý thương hiệu
/admin/orders        Quản lý đơn hàng
/admin/users         Quản lý người dùng (khách hàng và quản trị viên)
/admin/customers     Chuyển hướng tương thích sang /admin/users
```

Route constants nằm tại `client/src/routes/paths.ts`. Cấu hình route tập trung nằm tại
`client/src/routes/AppRoutes.tsx`. Các trang được lazy-load để tách bundle giữa storefront và admin.

Thành viên phát triển phía người dùng cần đọc
[`docs/storefront-development-guide.md`](docs/storefront-development-guide.md) trước khi bắt đầu để
tránh ảnh hưởng route, CSS, xác thực và phần quản trị.

Toàn bộ thành viên nên đọc [`docs/project-structure.md`](docs/project-structure.md) để thống nhất vị
trí page, component, API và backend module.

Thành viên làm sản phẩm cần đọc [`docs/catalog-domain-model.md`](docs/catalog-domain-model.md) để
không nhầm danh mục với thương hiệu và không lưu tồn kho ở sai cấp.

CSS được chia tại `client/src/styles/`: `base.css` cho style dùng chung, `admin.css` cho trang quản
trị và `storefront.css` cho trang khách hàng. `app.css` chỉ có nhiệm vụ import các file này.

## API quản lý người dùng

Các endpoint dưới đây chỉ dành cho tài khoản `admin` đã đăng nhập. Admin có thể tạo tài khoản
`customer` hoặc `admin`, nhưng không thể tự khóa, tự xóa hay tự hạ quyền tài khoản đang đăng nhập.

```text
GET    /api/admin/users                  Danh sách, tìm kiếm, lọc và phân trang
POST   /api/admin/users                  Tạo tài khoản khách hàng hoặc quản trị viên
GET    /api/admin/users/:userId          Chi tiết người dùng
PATCH  /api/admin/users/:userId          Sửa tên, email, vai trò hoặc trạng thái
PATCH  /api/admin/users/:userId/status   Khóa hoặc mở khóa tài khoản
DELETE /api/admin/users/:userId          Xóa mềm tài khoản
```

Endpoint danh sách nhận các query `page`, `limit`, `search`, `role`, `status` và `sort`. Xóa là xóa
mềm để giữ liên kết với đơn hàng trong tương lai. Khi khóa, hạ quyền hoặc xóa, refresh token đang lưu
sẽ bị thu hồi. Hệ thống luôn bảo vệ ít nhất một quản trị viên đang hoạt động.

## Scripts

```bash
npm run dev         # Chạy client và server
npm run build       # Kiểm tra TypeScript và build production
npm run lint        # Chạy kiểm tra tĩnh
npm run seed:admin  # Tạo/cập nhật tài khoản admin từ server/.env
npm run seed:catalog # Upsert danh mục và thương hiệu cầu lông mẫu
```

## Quy tắc bảo mật

- Không lưu `.env` vào Git.
- Không tạo admin thông qua API đăng ký công khai.
- Đổi mật khẩu seed sau khi thiết lập.
- Production phải chạy HTTPS để cookie có thuộc tính `secure`.
