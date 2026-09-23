import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Avatar, Button, Card, Input, Popconfirm, Select, Space, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getBrands,
  getCategories,
  getProducts,
  updateProduct,
  type Product,
  type ProductInput,
  type ProductListParams,
  type ProductStatus,
} from "../../../api/admin/catalog.api";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { ProductFormModal } from "../../../components/admin/catalog/ProductFormModal";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const errorMessage = (error: unknown) => axios.isAxiosError(error)
  ? ((error.response?.data as { error?: { message?: string } })?.error?.message ?? "Không thể thực hiện thao tác.")
  : "Không thể thực hiện thao tác.";

const statusLabels: Record<ProductStatus, { label: string; color: string }> = {
  draft: { label: "Bản nháp", color: "gold" },
  active: { label: "Đang bán", color: "success" },
  inactive: { label: "Tạm ẩn", color: "default" },
};

export function ProductManagementPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [brandId, setBrandId] = useState("all");
  const [status, setStatus] = useState<ProductListParams["status"]>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params: ProductListParams = { page, limit, search, categoryId, brandId, status };
  const query = useQuery({ queryKey: ["admin", "products", params], queryFn: () => getProducts(params), placeholderData: keepPreviousData });
  const categoriesQuery = useQuery({ queryKey: ["admin", "categories", "options"], queryFn: () => getCategories({ status: "all" }) });
  const brandsQuery = useQuery({ queryKey: ["admin", "brands", "options"], queryFn: () => getBrands({ status: "all" }) });

  const save = useMutation({
    mutationFn: (input: ProductInput) => editing ? updateProduct(editing.id, input) : createProduct(input),
    onSuccess: async () => { message.success(editing ? "Đã cập nhật sản phẩm." : "Đã tạo sản phẩm."); setOpen(false); setEditing(null); await queryClient.invalidateQueries({ queryKey: ["admin", "products"] }); },
    onError: (error) => message.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => { message.success("Đã xóa sản phẩm."); await queryClient.invalidateQueries({ queryKey: ["admin", "products"] }); },
    onError: (error) => message.error(errorMessage(error)),
  });

  const columns: TableColumnsType<Product> = [
    {
      title: "Sản phẩm",
      render: (_, item) => {
        const primaryImage = item.images.find((image) => image.isPrimary) ?? item.images[0];
        return <Space><Avatar shape="square" size={48} src={primaryImage?.url}>{item.name.charAt(0)}</Avatar><div className="product-name-cell"><Typography.Text strong>{item.name}</Typography.Text><Typography.Text type="secondary">{item.brand.name} · {item.category.name}</Typography.Text></div></Space>;
      },
    },
    { title: "Giá bán", width: 145, render: (_, item) => <div>{item.salePrice != null && <Typography.Text delete type="secondary">{currency.format(item.basePrice)}</Typography.Text>}<br />{currency.format(item.salePrice ?? item.basePrice)}</div> },
    { title: "Biến thể", width: 90, render: (_, item) => item.variants.length },
    { title: "Tồn kho", width: 100, render: (_, item) => <Tag color={item.totalStock <= 5 ? "warning" : "blue"}>{item.totalStock}</Tag> },
    { title: "Trạng thái", width: 120, render: (_, item) => <Tag color={statusLabels[item.status].color}>{statusLabels[item.status].label}</Tag> },
    {
      title: "Thao tác", width: 120, align: "right", render: (_, item) => <Space>
        <Button type="text" icon={<EditOutlined />} onClick={() => { setEditing(item); setOpen(true); }} />
        <Popconfirm title="Xóa sản phẩm?" description="Sản phẩm sẽ được xóa mềm và ẩn khỏi cửa hàng." okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }} onConfirm={() => remove.mutate(item.id)}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>,
    },
  ];

  return <div>
    <AdminPageHeader title="Quản lý sản phẩm" description="Mỗi màu sắc và bộ size/thông số là một SKU có tồn kho độc lập." actions={<Button type="primary" icon={<PlusOutlined />} disabled={!categoriesQuery.data?.length || !brandsQuery.data?.length} onClick={() => { setEditing(null); setOpen(true); }}>Tạo sản phẩm</Button>} />
    <Card className="catalog-card">
      <div className="product-toolbar">
        <Input allowClear prefix={<SearchOutlined />} placeholder="Tìm tên hoặc SKU..." value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
        <Select value={categoryId} onChange={(value) => { setCategoryId(value); setPage(1); }} options={[{ value: "all", label: "Tất cả danh mục" }, ...(categoriesQuery.data ?? []).map((item) => ({ value: item.id, label: item.name }))]} />
        <Select value={brandId} onChange={(value) => { setBrandId(value); setPage(1); }} options={[{ value: "all", label: "Tất cả thương hiệu" }, ...(brandsQuery.data ?? []).map((item) => ({ value: item.id, label: item.name }))]} />
        <Select value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={[{ value: "all", label: "Tất cả trạng thái" }, { value: "active", label: "Đang bán" }, { value: "draft", label: "Bản nháp" }, { value: "inactive", label: "Tạm ẩn" }]} />
      </div>
      <Table rowKey="id" columns={columns} dataSource={query.data?.products ?? []} loading={query.isPending || query.isFetching} scroll={{ x: 900 }} pagination={{ current: page, pageSize: limit, total: query.data?.pagination.total ?? 0, showSizeChanger: true, onChange: (nextPage, nextLimit) => { setPage(nextLimit !== limit ? 1 : nextPage); setLimit(nextLimit); } }} />
    </Card>
    <ProductFormModal open={open} product={editing} categories={categoriesQuery.data ?? []} brands={brandsQuery.data ?? []} loading={save.isPending} onCancel={() => { setOpen(false); setEditing(null); }} onSubmit={(input) => save.mutate(input)} />
  </div>;
}
