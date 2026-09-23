# Mô hình danh mục, thương hiệu và sản phẩm

## Nguyên tắc chính

- Danh mục và thương hiệu là hai chiều dữ liệu độc lập. Không tạo danh mục kiểu `Vợt Yonex`.
- Menu kiểu `Vợt → Yonex, Victor, Li-Ning` được tổng hợp từ những thương hiệu có sản phẩm trong danh mục.
- Tồn kho nằm ở biến thể SKU, không nằm ở sản phẩm chung.
- Màu sắc luôn thuộc biến thể. Các thuộc tính khác do danh mục định nghĩa.

## Ví dụ biến thể

```text
Vợt Yonex Astrox 88D
├── VT-YX-88D-4U-G5-BLUE: Xanh, 4U, G5, tồn kho 4
└── VT-YX-88D-3U-G5-BLUE: Xanh, 3U, G5, tồn kho 2

Giày Victor A970
├── GI-VT-A970-W-40: Trắng, size 40, tồn kho 5
└── GI-VT-A970-W-41: Trắng, size 41, tồn kho 3
```

`4UG5` không được lưu thành một chuỗi duy nhất. Nó gồm `weightClass = 4U` và `gripSize = G5`
để có thể tìm kiếm, lọc và so sánh chính xác.

## Thuộc tính danh mục

Mỗi thuộc tính có hai loại phạm vi:

- `variant`: tạo nên một biến thể/SKU, ví dụ size giày, size áo, trọng lượng và cỡ cán vợt.
- `specification`: mô tả kỹ thuật chung của sản phẩm, ví dụ chất liệu, độ cứng, điểm cân bằng.

Các trường chung như tên, giá, thương hiệu, màu sắc, SKU và tồn kho không cần khai báo lại trong
danh mục.

## Xóa dữ liệu

Sản phẩm được xóa mềm. Danh mục hoặc thương hiệu đang được sản phẩm sử dụng sẽ không thể xóa, nhằm
tránh document sản phẩm mất tham chiếu.

## Lưu ảnh

Form danh mục, thương hiệu và sản phẩm cho phép chọn ảnh JPG, PNG hoặc WEBP từ máy tính, tối đa 5 MB
mỗi ảnh. Một sản phẩm có tối đa 12 ảnh, đúng một ảnh đại diện và có thứ tự để hiển thị gallery.
Mỗi phần tử ảnh gồm `url`, `alt`, `isPrimary` và `sortOrder`.

File được lưu trong MongoDB Atlas bằng GridFS (`catalogImages.files` và `catalogImages.chunks`);
document danh mục/thương hiệu/sản phẩm chỉ lưu URL `/uploads/catalog/:imageId` cùng metadata cần
thiết. Vì cả nhóm dùng chung Atlas, mọi máy chạy backend đều đọc được cùng ảnh mà không cần sao chép
thư mục upload. Khi triển khai quy mô lớn, có thể thay GridFS bằng Cloudinary hoặc S3 mà vẫn giữ
nguyên cách tham chiếu URL.

## Nội dung mô tả sản phẩm

`shortDescription` là văn bản thuần, tối đa 300 ký tự, dùng cho thẻ sản phẩm và phần giới thiệu ngắn.
`description` là HTML rich text được tạo bằng Tiptap, hỗ trợ tiêu đề, định dạng chữ, danh sách, liên
kết, căn lề, bảng và ảnh chèn trong bài viết. Ảnh trong nội dung dùng chung API upload GridFS với
gallery sản phẩm. Backend luôn làm sạch HTML theo allow-list trước khi lưu để loại bỏ script, event
handler và URL nguy hiểm. Storefront phải hiển thị trường này bằng component rich-text riêng, không
được render HTML chưa qua bước làm sạch.

## Dữ liệu khởi tạo

Chạy `npm run seed:catalog` để upsert danh mục và thương hiệu mẫu. Script có thể chạy nhiều lần mà
không tạo bản ghi trùng.
