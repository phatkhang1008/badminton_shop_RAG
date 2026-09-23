import {
  CalendarOutlined,
  ClockCircleOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Descriptions, Drawer, Empty, Skeleton, Space, Typography } from "antd";
import { getUser } from "../../../api/admin/users.api";
import { UserStatusTag } from "./UserStatusTag";

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value: string | null) {
  return value ? dateTimeFormatter.format(new Date(value)) : "Chưa đăng nhập";
}

interface UserDetailsDrawerProps {
  userId: string | null;
  onClose: () => void;
}

export function UserDetailsDrawer({ userId, onClose }: UserDetailsDrawerProps) {
  const userQuery = useQuery({
    queryKey: ["admin", "users", "detail", userId],
    queryFn: () => getUser(userId!),
    enabled: Boolean(userId),
  });

  const user = userQuery.data;

  return (
    <Drawer
      title="Chi tiết người dùng"
      width={460}
      open={Boolean(userId)}
      onClose={onClose}
      destroyOnHidden
    >
      {userQuery.isPending ? (
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      ) : userQuery.isError || !user ? (
        <Empty description="Không thể tải thông tin người dùng" />
      ) : (
        <div className="customer-detail">
          <Space size={14} align="center" className="customer-detail__identity">
            <Avatar size={58} className="customer-avatar">
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Typography.Title level={4}>{user.name}</Typography.Title>
              <Typography.Text type="secondary">{user.email}</Typography.Text>
            </div>
          </Space>

          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={<><UserOutlined /> Trạng thái</>}>
              <UserStatusTag status={user.status} />
            </Descriptions.Item>
            <Descriptions.Item label={<><UserOutlined /> Vai trò</>}>
              {user.role === "admin" ? "Quản trị viên" : "Khách hàng"}
            </Descriptions.Item>
            <Descriptions.Item label={<><MailOutlined /> Email</>}>
              {user.email}
            </Descriptions.Item>
            <Descriptions.Item label={<><CalendarOutlined /> Ngày đăng ký</>}>
              {formatDateTime(user.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label={<><ClockCircleOutlined /> Đăng nhập gần nhất</>}>
              {formatDateTime(user.lastLoginAt)}
            </Descriptions.Item>
          </Descriptions>

          <Typography.Paragraph type="secondary" className="customer-detail__note">
            Mã người dùng: <Typography.Text copyable>{user.id}</Typography.Text>
          </Typography.Paragraph>
        </div>
      )}
    </Drawer>
  );
}
