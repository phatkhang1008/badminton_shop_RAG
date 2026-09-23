import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Typography } from "antd";
import { useEffect } from "react";
import type { Category, CategoryInput } from "../../../api/admin/catalog.api";
import { ImageUploadField } from "./ImageUploadField";

type AttributeFormValue = Omit<CategoryInput["attributes"][number], "options"> & { optionsText?: string };
interface CategoryFormValues extends Omit<CategoryInput, "attributes"> { attributes: AttributeFormValue[] }

export function CategoryFormModal({
  open,
  category,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  category: Category | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (input: CategoryInput) => void;
}) {
  const [form] = Form.useForm<CategoryFormValues>();
  useEffect(() => {
    if (!open) return;
    if (category) {
      form.setFieldsValue({
        ...category,
        attributes: category.attributes.map((item) => ({ ...item, optionsText: item.options.join(", ") })),
      });
    } else {
      form.setFieldsValue({ status: "active", sortOrder: 0, description: "", imageUrl: "", attributes: [] });
    }
  }, [category, form, open]);

  return (
    <Modal
      width={940}
      title={category ? "Chỉnh sửa danh mục" : "Tạo danh mục"}
      open={open}
      okText={category ? "Lưu thay đổi" : "Tạo danh mục"}
      cancelText="Hủy"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      afterClose={() => form.resetFields()}
      destroyOnHidden
    >
      <Form<CategoryFormValues>
        form={form}
        layout="vertical"
        onFinish={(values) =>
          onSubmit({
            ...values,
            attributes: (values.attributes ?? []).map(({ optionsText, ...item }, index) => ({
              ...item,
              options: (optionsText ?? "").split(",").map((value) => value.trim()).filter(Boolean),
              sortOrder: index,
            })),
          })
        }
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Tên danh mục" name="name" rules={[{ required: true, min: 2 }]}>
              <Input placeholder="Ví dụ: Vợt cầu lông" />
            </Form.Item>
          </Col>
          <Col xs={12} md={6}>
            <Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}>
              <Select options={[{ value: "active", label: "Hoạt động" }, { value: "inactive", label: "Tạm ẩn" }]} />
            </Form.Item>
          </Col>
          <Col xs={12} md={6}>
            <Form.Item label="Thứ tự" name="sortOrder" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Ảnh danh mục" name="imageUrl">
          <ImageUploadField />
        </Form.Item>
        <Form.Item label="Mô tả" name="description"><Input.TextArea rows={2} maxLength={500} /></Form.Item>

        <div className="attribute-builder__header">
          <div>
            <Typography.Title level={5}>Cấu hình thông số</Typography.Title>
            <Typography.Text type="secondary">
              Thuộc tính biến thể tạo SKU riêng; thông số kỹ thuật dùng mô tả và bộ lọc sản phẩm.
            </Typography.Text>
          </div>
        </div>

        <Form.List name="attributes">
          {(fields, { add, remove }) => (
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              {fields.map((field) => (
                <div className="attribute-row" key={field.key}>
                  <Row gutter={12} align="bottom">
                    <Col xs={12} md={5}>
                      <Form.Item label="Tên hiển thị" name={[field.name, "label"]} rules={[{ required: true }]}>
                        <Input placeholder="Size giày" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Item label="Key" name={[field.name, "key"]} rules={[{ required: true, pattern: /^[a-z][a-zA-Z0-9]*$/ }]}>
                        <Input placeholder="size" />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Item label="Nhóm" name={[field.name, "scope"]} rules={[{ required: true }]}>
                        <Select options={[{ value: "variant", label: "Biến thể" }, { value: "specification", label: "Kỹ thuật" }]} />
                      </Form.Item>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Item label="Kiểu dữ liệu" name={[field.name, "dataType"]} rules={[{ required: true }]}>
                        <Select options={[{ value: "select", label: "Danh sách" }, { value: "text", label: "Văn bản" }, { value: "number", label: "Số" }, { value: "boolean", label: "Có/Không" }]} />
                      </Form.Item>
                    </Col>
                    <Col xs={18} md={5}>
                      <Form.Item label="Lựa chọn (cách nhau bằng dấu phẩy)" name={[field.name, "optionsText"]}>
                        <Input placeholder="S, M, L, XL" />
                      </Form.Item>
                    </Col>
                    <Col xs={6} md={2}>
                      <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                    </Col>
                    <Col xs={12} md={5}>
                      <Form.Item label="Đơn vị" name={[field.name, "unit"]}><Input placeholder="lbs, mm..." /></Form.Item>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Item name={[field.name, "required"]} valuePropName="checked"><Checkbox>Bắt buộc</Checkbox></Form.Item>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Item name={[field.name, "filterable"]} valuePropName="checked"><Checkbox>Dùng bộ lọc</Checkbox></Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={() => add({ dataType: "select", scope: "specification", required: false, filterable: true, unit: "", optionsText: "" })}
              >
                Thêm thông số
              </Button>
            </Space>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
