import { CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import type { UserStatus } from "../../../api/admin/users.api";

export function UserStatusTag({ status }: { status: UserStatus }) {
  return status === "active" ? (
    <Tag color="success" icon={<CheckCircleOutlined />} className="customer-status-tag">
      Đang hoạt động
    </Tag>
  ) : (
    <Tag color="error" icon={<StopOutlined />} className="customer-status-tag">
      Đã khóa
    </Tag>
  );
}
