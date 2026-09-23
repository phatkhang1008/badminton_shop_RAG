import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  TeamOutlined,
  UnlockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  App,
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import axios from "axios";
import { useEffect, useState, type ReactNode } from "react";
import type { AdminUser } from "../../../api/auth/auth.api";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  updateUserStatus,
  type CreateUserInput,
  type ManagedUser,
  type UpdateUserInput,
  type UserListParams,
  type UserRole,
  type UserSort,
  type UserStatus,
} from "../../../api/admin/users.api";
import { currentUserQueryKey } from "../../../auth/queryKeys";
import { AdminPageHeader } from "../../../components/admin/AdminPageHeader";
import { UserDetailsDrawer } from "../../../components/admin/users/UserDetailsDrawer";
import { UserFormModal } from "../../../components/admin/users/UserFormModal";
import { UserStatusTag } from "../../../components/admin/users/UserStatusTag";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "Chưa đăng nhập";
}

function getErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) return "Đã xảy ra lỗi. Vui lòng thử lại.";
  return (
    (error.response?.data as { error?: { message?: string } } | undefined)?.error?.message ??
    "Đã xảy ra lỗi. Vui lòng thử lại."
  );
}

export function UserManagementPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const currentAdmin = queryClient.getQueryData<AdminUser>(currentUserQueryKey);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserListParams["status"]>("all");
  const [role, setRole] = useState<UserListParams["role"]>("all");
  const [sort, setSort] = useState<UserSort>("newest");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params: UserListParams = { page, limit, search, status, role, sort };
  const usersQuery = useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  });

  const closeForm = () => {
    setFormOpen(false);
    setEditingUser(null);
  };

  const refreshUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  };

  const saveMutation = useMutation({
    mutationFn: (values: CreateUserInput | UpdateUserInput) =>
      editingUser
        ? updateUser(editingUser.id, values as UpdateUserInput)
        : createUser(values as CreateUserInput),
    onSuccess: async (savedUser) => {
      const wasEditing = Boolean(editingUser);
      if (savedUser.id === currentAdmin?.id) {
        queryClient.setQueryData<AdminUser>(currentUserQueryKey, {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          role: "admin",
          status: "active",
        });
      }
      closeForm();
      await refreshUsers();
      message.success(wasEditing ? "Đã cập nhật người dùng." : "Đã tạo tài khoản mới.");
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, nextStatus }: { userId: string; nextStatus: UserStatus }) =>
      updateUserStatus(userId, nextStatus),
    onSuccess: async (user) => {
      await refreshUsers();
      message.success(user.status === "blocked" ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.");
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await refreshUsers();
      message.success("Đã xóa người dùng khỏi hệ thống.");
    },
    onError: (error) => message.error(getErrorMessage(error)),
  });

  const columns: TableColumnsType<ManagedUser> = [
    {
      title: "Người dùng",
      key: "user",
      render: (_, user) => (
        <Space size={12}>
          <Avatar className="customer-avatar">{user.name.charAt(0).toUpperCase()}</Avatar>
          <div className="customer-name-cell">
            <Space size={6}>
              <Typography.Text strong>{user.name}</Typography.Text>
              {user.id === currentAdmin?.id && <Tag color="blue">Bạn</Tag>}
            </Space>
            <Typography.Text type="secondary">{user.email}</Typography.Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 145,
      render: (value: UserRole) =>
        value === "admin" ? (
          <Tag color="blue" icon={<SafetyCertificateOutlined />}>Quản trị viên</Tag>
        ) : (
          <Tag icon={<UserOutlined />}>Khách hàng</Tag>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 165,
      render: (value: UserStatus) => <UserStatusTag status={value} />,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 135,
      render: formatDate,
    },
    {
      title: "Đăng nhập gần nhất",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      width: 165,
      render: formatDate,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 190,
      align: "right",
      render: (_, user) => {
        const isBlocked = user.status === "blocked";
        const isSelf = user.id === currentAdmin?.id;
        return (
          <Space size={2}>
            <Tooltip title="Xem chi tiết">
              <Button type="text" icon={<EyeOutlined />} onClick={() => setSelectedUserId(user.id)} />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingUser(user);
                  setFormOpen(true);
                }}
              />
            </Tooltip>
            <Popconfirm
              disabled={isSelf}
              title={isBlocked ? "Mở khóa tài khoản?" : "Khóa tài khoản?"}
              description={
                isBlocked
                  ? "Người dùng sẽ có thể đăng nhập trở lại."
                  : "Người dùng sẽ không thể đăng nhập và phiên hiện tại sẽ bị thu hồi."
              }
              okText={isBlocked ? "Mở khóa" : "Khóa"}
              cancelText="Hủy"
              okButtonProps={{ danger: !isBlocked }}
              onConfirm={() =>
                statusMutation.mutate({ userId: user.id, nextStatus: isBlocked ? "active" : "blocked" })
              }
            >
              <Tooltip title={isSelf ? "Không thể tự khóa chính mình" : isBlocked ? "Mở khóa" : "Khóa"}>
                <Button
                  type="text"
                  disabled={isSelf}
                  danger={!isBlocked}
                  icon={isBlocked ? <UnlockOutlined /> : <LockOutlined />}
                  loading={statusMutation.isPending && statusMutation.variables?.userId === user.id}
                />
              </Tooltip>
            </Popconfirm>
            <Popconfirm
              disabled={isSelf}
              title="Xóa người dùng?"
              description="Tài khoản sẽ bị vô hiệu hóa và ẩn khỏi danh sách. Dữ liệu liên quan được giữ lại."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteMutation.mutate(user.id)}
            >
              <Tooltip title={isSelf ? "Không thể tự xóa chính mình" : "Xóa người dùng"}>
                <Button
                  type="text"
                  danger
                  disabled={isSelf}
                  icon={<DeleteOutlined />}
                  loading={deleteMutation.isPending && deleteMutation.variables === user.id}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const summary = usersQuery.data?.summary;

  return (
    <div className="customer-management-page">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Quản lý tài khoản khách hàng và quản trị viên trong cùng một nơi."
        actions={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => usersQuery.refetch()}>Làm mới</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingUser(null);
                setFormOpen(true);
              }}
            >
              Tạo tài khoản
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} className="customer-summary">
        <Col xs={12} lg={6}>
          <SummaryCard title="Tổng người dùng" value={summary?.total ?? 0} icon={<TeamOutlined />} />
        </Col>
        <Col xs={12} lg={6}>
          <SummaryCard title="Khách hàng" value={summary?.customers ?? 0} icon={<UserOutlined />} tone="success" />
        </Col>
        <Col xs={12} lg={6}>
          <SummaryCard title="Quản trị viên" value={summary?.admins ?? 0} icon={<SafetyCertificateOutlined />} tone="accent" />
        </Col>
        <Col xs={12} lg={6}>
          <SummaryCard title="Đã khóa" value={summary?.blocked ?? 0} icon={<StopOutlined />} tone="danger" />
        </Col>
      </Row>

      <Card className="customer-table-card">
        <div className="customer-toolbar user-toolbar">
          <Input
            allowClear
            value={searchInput}
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên hoặc email..."
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Select
            value={role}
            aria-label="Lọc theo vai trò"
            onChange={(value) => { setRole(value); setPage(1); }}
            options={[
              { value: "all", label: "Tất cả vai trò" },
              { value: "customer", label: "Khách hàng" },
              { value: "admin", label: "Quản trị viên" },
            ]}
          />
          <Select
            value={status}
            aria-label="Lọc theo trạng thái"
            onChange={(value) => { setStatus(value); setPage(1); }}
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "active", label: "Đang hoạt động" },
              { value: "blocked", label: "Đã khóa" },
            ]}
          />
          <Select
            value={sort}
            aria-label="Sắp xếp người dùng"
            onChange={(value) => { setSort(value); setPage(1); }}
            options={[
              { value: "newest", label: "Mới nhất" },
              { value: "oldest", label: "Cũ nhất" },
              { value: "name_asc", label: "Tên A–Z" },
              { value: "name_desc", label: "Tên Z–A" },
            ]}
          />
        </div>

        {usersQuery.isError && (
          <Alert
            className="customer-alert"
            type="error"
            showIcon
            message="Không thể tải danh sách người dùng."
            action={<Button size="small" onClick={() => usersQuery.refetch()}>Thử lại</Button>}
          />
        )}

        <Table<ManagedUser>
          rowKey="id"
          columns={columns}
          dataSource={usersQuery.data?.users ?? []}
          loading={usersQuery.isPending || usersQuery.isFetching}
          scroll={{ x: 1050 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={search || role !== "all" || status !== "all" ? "Không tìm thấy người dùng phù hợp" : "Chưa có người dùng"}
              />
            ),
          }}
          pagination={{
            current: page,
            pageSize: limit,
            total: usersQuery.data?.pagination.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total) => `${total} người dùng`,
            onChange: (nextPage, nextLimit) => {
              setPage(nextLimit !== limit ? 1 : nextPage);
              setLimit(nextLimit);
            },
          }}
        />
      </Card>

      <UserDetailsDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      <UserFormModal
        open={formOpen}
        user={editingUser}
        currentAdminId={currentAdmin?.id}
        loading={saveMutation.isPending}
        onCancel={closeForm}
        onSubmit={(values) => saveMutation.mutate(values)}
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  tone = "default",
}: {
  title: string;
  value: number;
  icon: ReactNode;
  tone?: "default" | "success" | "danger" | "accent";
}) {
  return (
    <Card className={`customer-summary-card customer-summary-card--${tone}`}>
      <span className="customer-summary-card__icon">{icon}</span>
      <Statistic title={title} value={value} />
    </Card>
  );
}
