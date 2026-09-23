import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Avatar, Button, Card, Input, Popconfirm, Space, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import axios from "axios";
import { useState } from "react";
import { createBrand, deleteBrand, getBrands, updateBrand, type Brand, type BrandInput } from "../../../api/admin/catalog.api";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { BrandFormModal } from "../../../components/admin/catalog/BrandFormModal";

const errorMessage = (error: unknown) => axios.isAxiosError(error)
  ? ((error.response?.data as { error?: { message?: string } })?.error?.message ?? "Không thể thực hiện thao tác.")
  : "Không thể thực hiện thao tác.";

export function BrandManagementPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const query = useQuery({ queryKey: ["admin", "brands", search], queryFn: () => getBrands({ search, status: "all" }) });
  const save = useMutation({
    mutationFn: (input: BrandInput) => editing ? updateBrand(editing.id, input) : createBrand(input),
    onSuccess: async () => { message.success(editing ? "Đã cập nhật thương hiệu." : "Đã tạo thương hiệu."); setOpen(false); setEditing(null); await queryClient.invalidateQueries({ queryKey: ["admin", "brands"] }); },
    onError: (error) => message.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: deleteBrand,
    onSuccess: async () => { message.success("Đã xóa thương hiệu."); await queryClient.invalidateQueries({ queryKey: ["admin", "brands"] }); },
    onError: (error) => message.error(errorMessage(error)),
  });
  const columns: TableColumnsType<Brand> = [
    { title: "Thương hiệu", render: (_, item) => <Space><Avatar src={item.logoUrl || undefined}>{item.name.charAt(0)}</Avatar><div><Typography.Text strong>{item.name}</Typography.Text><br /><Typography.Text type="secondary">/{item.slug}</Typography.Text></div></Space> },
    { title: "Mô tả", dataIndex: "description", ellipsis: true },
    { title: "Trạng thái", width: 130, render: (_, item) => <Tag color={item.status === "active" ? "success" : "default"}>{item.status === "active" ? "Hoạt động" : "Tạm ẩn"}</Tag> },
    { title: "Thứ tự", dataIndex: "sortOrder", width: 90 },
    { title: "Thao tác", width: 120, align: "right", render: (_, item) => <Space><Button type="text" icon={<EditOutlined />} onClick={() => { setEditing(item); setOpen(true); }} /><Popconfirm title="Xóa thương hiệu?" description="Chỉ xóa được thương hiệu chưa có sản phẩm." onConfirm={() => remove.mutate(item.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm></Space> },
  ];
  return <div>
    <AdminPageHeader title="Quản lý thương hiệu" description="Thương hiệu là bộ lọc độc lập và có thể dùng trong mọi danh mục." actions={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setOpen(true); }}>Tạo thương hiệu</Button>} />
    <Card className="catalog-card"><div className="catalog-toolbar"><Input allowClear prefix={<SearchOutlined />} placeholder="Tìm thương hiệu..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><Table rowKey="id" columns={columns} dataSource={query.data ?? []} loading={query.isPending} pagination={{ pageSize: 10 }} scroll={{ x: 700 }} /></Card>
    <BrandFormModal open={open} brand={editing} loading={save.isPending} onCancel={() => { setOpen(false); setEditing(null); }} onSubmit={(input) => save.mutate(input)} />
  </div>;
}
