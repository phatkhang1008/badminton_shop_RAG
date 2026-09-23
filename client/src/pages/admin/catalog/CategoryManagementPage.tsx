import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Avatar, Button, Card, Input, Popconfirm, Space, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import axios from "axios";
import { useState } from "react";
import { createCategory, deleteCategory, getCategories, updateCategory, type Category, type CategoryInput } from "../../../api/admin/catalog.api";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { CategoryFormModal } from "../../../components/admin/catalog/CategoryFormModal";

const errorMessage = (error: unknown) => axios.isAxiosError(error)
  ? ((error.response?.data as { error?: { message?: string } })?.error?.message ?? "Không thể thực hiện thao tác.")
  : "Không thể thực hiện thao tác.";

export function CategoryManagementPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const query = useQuery({ queryKey: ["admin", "categories", search], queryFn: () => getCategories({ search, status: "all" }) });
  const save = useMutation({
    mutationFn: (input: CategoryInput) => editing ? updateCategory(editing.id, input) : createCategory(input),
    onSuccess: async () => {
      message.success(editing ? "Đã cập nhật danh mục." : "Đã tạo danh mục.");
      setOpen(false); setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (error) => message.error(errorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => { message.success("Đã xóa danh mục."); await queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }); },
    onError: (error) => message.error(errorMessage(error)),
  });
  const columns: TableColumnsType<Category> = [
    { title: "Danh mục", render: (_, item) => <Space><Avatar shape="square" size={44} src={item.imageUrl || undefined}>{item.name.charAt(0)}</Avatar><div><Typography.Text strong>{item.name}</Typography.Text><br /><Typography.Text type="secondary">/{item.slug}</Typography.Text></div></Space> },
    { title: "Thuộc tính biến thể", width: 170, render: (_, item) => item.attributes.filter((a) => a.scope === "variant").length },
    { title: "Thông số kỹ thuật", width: 170, render: (_, item) => item.attributes.filter((a) => a.scope === "specification").length },
    { title: "Trạng thái", width: 130, render: (_, item) => <Tag color={item.status === "active" ? "success" : "default"}>{item.status === "active" ? "Hoạt động" : "Tạm ẩn"}</Tag> },
    { title: "Thứ tự", dataIndex: "sortOrder", width: 90 },
    {
      title: "Thao tác", width: 120, align: "right", render: (_, item) => <Space>
        <Button type="text" icon={<EditOutlined />} onClick={() => { setEditing(item); setOpen(true); }} />
        <Popconfirm title="Xóa danh mục?" description="Chỉ xóa được danh mục chưa có sản phẩm." onConfirm={() => remove.mutate(item.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>,
    },
  ];
  return <div>
    <AdminPageHeader title="Quản lý danh mục" description="Cấu hình nhóm sản phẩm và bộ thông số riêng cho từng ngành hàng." actions={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setOpen(true); }}>Tạo danh mục</Button>} />
    <Card className="catalog-card">
      <div className="catalog-toolbar"><Input allowClear prefix={<SearchOutlined />} placeholder="Tìm danh mục..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      <Table rowKey="id" columns={columns} dataSource={query.data ?? []} loading={query.isPending} pagination={{ pageSize: 10 }} scroll={{ x: 760 }} />
    </Card>
    <CategoryFormModal open={open} category={editing} loading={save.isPending} onCancel={() => { setOpen(false); setEditing(null); }} onSubmit={(input) => save.mutate(input)} />
  </div>;
}
