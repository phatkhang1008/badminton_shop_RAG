import { Col, Form, Input, InputNumber, Modal, Row, Select } from "antd";
import { useEffect } from "react";
import type { Brand, BrandInput } from "../../../api/admin/catalog.api";
import { ImageUploadField } from "./ImageUploadField";

export function BrandFormModal({
  open,
  brand,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  brand: Brand | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (input: BrandInput) => void;
}) {
  const [form] = Form.useForm<BrandInput>();
  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(brand ?? { name: "", description: "", logoUrl: "", status: "active", sortOrder: 0 });
  }, [brand, form, open]);

  return (
    <Modal
      title={brand ? "Chỉnh sửa thương hiệu" : "Tạo thương hiệu"}
      open={open}
      okText={brand ? "Lưu thay đổi" : "Tạo thương hiệu"}
      cancelText="Hủy"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      afterClose={() => form.resetFields()}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item label="Tên thương hiệu" name="name" rules={[{ required: true, min: 2 }]}>
          <Input placeholder="Ví dụ: Yonex" />
        </Form.Item>
        <Form.Item label="Logo thương hiệu" name="logoUrl">
          <ImageUploadField shape="logo" />
        </Form.Item>
        <Form.Item label="Mô tả" name="description"><Input.TextArea rows={3} /></Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
              <Select options={[{ value: "active", label: "Hoạt động" }, { value: "inactive", label: "Tạm ẩn" }]} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Thứ tự" name="sortOrder" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
