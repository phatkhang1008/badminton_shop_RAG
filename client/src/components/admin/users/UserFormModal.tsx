import { Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import type {
  CreateUserInput,
  ManagedUser,
  UpdateUserInput,
} from "../../../api/admin/users.api";

interface UserFormModalProps {
  open: boolean;
  user: ManagedUser | null;
  currentAdminId?: string;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateUserInput | UpdateUserInput) => void;
}

export function UserFormModal({
  open,
  user,
  currentAdminId,
  loading,
  onCancel,
  onSubmit,
}: UserFormModalProps) {
  const [form] = Form.useForm<CreateUserInput>();
  const isEditing = Boolean(user);
  const isSelf = user?.id === currentAdminId;

  useEffect(() => {
    if (!open) return;
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      form.setFieldsValue({ role: "customer", status: "active" });
    }
  }, [form, open, user]);

  return (
    <Modal
      title={isEditing ? "Chỉnh sửa người dùng" : "Tạo tài khoản mới"}
      open={open}
      okText={isEditing ? "Lưu thay đổi" : "Tạo tài khoản"}
      cancelText="Hủy"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      afterClose={() => form.resetFields()}
      destroyOnHidden
    >
      <Form<CreateUserInput>
        form={form}
        layout="vertical"
        requiredMark="optional"
        className="user-form"
        onFinish={(values) => {
          if (isEditing && isSelf) {
            const { role: _role, status: _status, password: _password, ...safeValues } = values;
            onSubmit(safeValues);
            return;
          }
          if (isEditing) {
            const { password: _password, ...updateValues } = values;
            onSubmit(updateValues);
            return;
          }
          onSubmit(values);
        }}
      >
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập họ tên." },
            { min: 2, max: 100, message: "Họ tên phải có từ 2 đến 100 ký tự." },
          ]}
        >
          <Input placeholder="Ví dụ: Nguyễn Văn An" autoComplete="name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email." },
            { type: "email", message: "Email không đúng định dạng." },
          ]}
        >
          <Input placeholder="name@example.com" autoComplete="email" />
        </Form.Item>

        {!isEditing && (
          <Form.Item
            label="Mật khẩu ban đầu"
            name="password"
            extra="Tối thiểu 8 ký tự. Mật khẩu sẽ được mã hóa trước khi lưu."
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu." },
              { min: 8, max: 128, message: "Mật khẩu phải có từ 8 đến 128 ký tự." },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" autoComplete="new-password" />
          </Form.Item>
        )}

        <Form.Item label="Vai trò" name="role" rules={[{ required: true }]}>
          <Select
            disabled={isSelf}
            options={[
              { value: "customer", label: "Khách hàng" },
              { value: "admin", label: "Quản trị viên" },
            ]}
          />
        </Form.Item>

        <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
          <Select
            disabled={isSelf}
            options={[
              { value: "active", label: "Đang hoạt động" },
              { value: "blocked", label: "Đã khóa" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
