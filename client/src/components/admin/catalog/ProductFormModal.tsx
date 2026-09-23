import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Switch, Tabs, Typography } from "antd";
import { useEffect } from "react";
import type { Brand, Category, CategoryAttribute, Product, ProductInput } from "../../../api/admin/catalog.api";
import { MultiImageUploadField } from "./MultiImageUploadField";
import { RichTextEditor } from "./RichTextEditor";

interface VariantFormValue {
  sku: string;
  colorName: string;
  colorHex: string;
  attributeValues: Record<string, string>;
  price?: number | null;
  salePrice?: number | null;
  stock: number;
  imageUrl: string;
}
interface ProductFormValues extends Omit<ProductInput, "specifications" | "variants"> {
  specificationValues: Record<string, string | number | boolean>;
  variants: VariantFormValue[];
}

function attributeInput(definition: CategoryAttribute) {
  if (definition.dataType === "select") return <Select options={definition.options.map((value) => ({ value, label: value }))} />;
  if (definition.dataType === "number") return <InputNumber style={{ width: "100%" }} addonAfter={definition.unit || undefined} />;
  if (definition.dataType === "boolean") return <Switch checkedChildren="Có" unCheckedChildren="Không" />;
  return <Input addonAfter={definition.unit || undefined} />;
}

export function ProductFormModal({
  open,
  product,
  categories,
  brands,
  loading,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  onCancel: () => void;
  onSubmit: (input: ProductInput) => void;
}) {
  const [form] = Form.useForm<ProductFormValues>();
  const categoryId = Form.useWatch("categoryId", form);
  const selectedCategory = categories.find((item) => item.id === categoryId);
  const variantDefinitions = selectedCategory?.attributes.filter((item) => item.scope === "variant") ?? [];
  const specificationDefinitions = selectedCategory?.attributes.filter((item) => item.scope === "specification") ?? [];

  useEffect(() => {
    if (!open) return;
    if (product) {
      form.setFieldsValue({
        name: product.name,
        slug: product.slug,
        categoryId: product.category._id,
        brandId: product.brand._id,
        shortDescription: product.shortDescription,
        description: product.description,
        status: product.status,
        basePrice: product.basePrice,
        salePrice: product.salePrice,
        images: product.images,
        specificationValues: Object.fromEntries(product.specifications.map((item) => [item.key, item.value])),
        variants: product.variants.map((variant) => ({
          ...variant,
          attributeValues: Object.fromEntries(variant.attributes.map((item) => [item.key, item.value])),
        })),
      });
    } else {
      form.setFieldsValue({
        status: "draft",
        shortDescription: "",
        description: "",
        images: [],
        specificationValues: {},
        variants: [{ sku: "", colorName: "Mặc định", colorHex: "", attributeValues: {}, stock: 0, imageUrl: "" }],
      });
    }
  }, [form, open, product]);

  const changeCategory = (nextCategoryId: string) => {
    form.setFieldValue("categoryId", nextCategoryId);
    form.setFieldValue("specificationValues", {});
    const variants = (form.getFieldValue("variants") ?? []) as VariantFormValue[];
    form.setFieldValue("variants", variants.map((variant: VariantFormValue) => ({ ...variant, attributeValues: {} })));
  };

  return (
    <Modal
      width={1100}
      title={product ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm"}
      open={open}
      okText={product ? "Lưu thay đổi" : "Tạo sản phẩm"}
      cancelText="Hủy"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      afterClose={() => form.resetFields()}
      destroyOnHidden
    >
      <Form<ProductFormValues>
        form={form}
        layout="vertical"
        onFinish={(values) => {
          if (!selectedCategory) return;
          const { specificationValues, variants, ...baseValues } = values;
          onSubmit({
            ...baseValues,
            salePrice: values.salePrice ?? null,
            specifications: specificationDefinitions
              .filter((definition) => specificationValues?.[definition.key] !== undefined && specificationValues?.[definition.key] !== "")
              .map((definition) => ({
                key: definition.key,
                label: definition.label,
                value: specificationValues[definition.key],
                unit: definition.unit,
              })),
            variants: variants.map(({ attributeValues, ...variant }) => ({
              ...variant,
              price: variant.price ?? null,
              salePrice: variant.salePrice ?? null,
              attributes: variantDefinitions.map((definition) => ({
                key: definition.key,
                label: definition.label,
                value: attributeValues?.[definition.key],
              })),
            })),
          });
        }}
      >
        <Tabs
          items={[
            {
              key: "general",
              label: "Thông tin chung",
              children: <>
                <Row gutter={16}>
                  <Col xs={24} md={12}><Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, min: 2 }]}><Input /></Form.Item></Col>
                  <Col xs={12} md={6}><Form.Item label="Danh mục" name="categoryId" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" onChange={changeCategory} options={categories.filter((item) => item.status === "active").map((item) => ({ value: item.id, label: item.name }))} /></Form.Item></Col>
                  <Col xs={12} md={6}><Form.Item label="Thương hiệu" name="brandId" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" options={brands.filter((item) => item.status === "active").map((item) => ({ value: item.id, label: item.name }))} /></Form.Item></Col>
                  <Col xs={12} md={6}><Form.Item label="Giá bán" name="basePrice" rules={[{ required: true }]}><InputNumber min={0} step={1000} addonAfter="₫" style={{ width: "100%" }} /></Form.Item></Col>
                  <Col xs={12} md={6}><Form.Item label="Giá khuyến mãi" name="salePrice"><InputNumber min={0} step={1000} addonAfter="₫" style={{ width: "100%" }} /></Form.Item></Col>
                  <Col xs={12} md={6}><Form.Item label="Trạng thái" name="status" rules={[{ required: true }]}><Select options={[{ value: "draft", label: "Bản nháp" }, { value: "active", label: "Đang bán" }, { value: "inactive", label: "Tạm ẩn" }]} /></Form.Item></Col>
                  <Col xs={24}>
                    <Form.Item
                      label="Hình ảnh sản phẩm"
                      name="images"
                      rules={[{ required: true, type: "array", min: 1, message: "Vui lòng tải lên ít nhất một ảnh sản phẩm." }]}
                    >
                      <MultiImageUploadField />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Mô tả ngắn" name="shortDescription"><Input.TextArea rows={2} maxLength={300} /></Form.Item>
                <Form.Item label="Mô tả chi tiết" name="description"><RichTextEditor /></Form.Item>
              </>,
            },
            {
              key: "specifications",
              label: `Thông số kỹ thuật (${specificationDefinitions.length})`,
              children: selectedCategory ? <Row gutter={16}>
                {specificationDefinitions.map((definition) => <Col xs={24} md={12} key={definition.key}>
                  <Form.Item
                    label={definition.label}
                    name={["specificationValues", definition.key]}
                    valuePropName={definition.dataType === "boolean" ? "checked" : "value"}
                    rules={definition.required ? [{ required: true, message: `Vui lòng nhập ${definition.label}.` }] : undefined}
                  >
                    {attributeInput(definition)}
                  </Form.Item>
                </Col>)}
                {!specificationDefinitions.length && <Typography.Text type="secondary">Danh mục này chưa cấu hình thông số kỹ thuật.</Typography.Text>}
              </Row> : <Typography.Text type="secondary">Chọn danh mục trước để nhập thông số.</Typography.Text>,
            },
            {
              key: "variants",
              label: "Biến thể & tồn kho",
              children: <Form.List name="variants" rules={[{ validator: async (_, names) => { if (!names?.length) throw new Error("Sản phẩm cần ít nhất một biến thể."); } }]}>
                {(fields, { add, remove }, { errors }) => <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Typography.Text type="secondary">Mỗi tổ hợp màu sắc + size/trọng lượng/cỡ cán là một SKU và có tồn kho riêng.</Typography.Text>
                  {fields.map((field, index) => <div className="variant-row" key={field.key}>
                    <div className="variant-row__heading"><Typography.Text strong>Biến thể {index + 1}</Typography.Text><Button type="text" danger icon={<DeleteOutlined />} disabled={fields.length === 1} onClick={() => remove(field.name)} /></div>
                    <Row gutter={12}>
                      <Col xs={12} md={5}><Form.Item label="SKU" name={[field.name, "sku"]} rules={[{ required: true }]}><Input placeholder="VT-YX-4U-G5-BL" /></Form.Item></Col>
                      <Col xs={12} md={4}><Form.Item label="Màu sắc" name={[field.name, "colorName"]} rules={[{ required: true }]}><Input placeholder="Xanh dương" /></Form.Item></Col>
                      <Col xs={12} md={3}><Form.Item label="Mã màu" name={[field.name, "colorHex"]}><Input placeholder="#0369a1" /></Form.Item></Col>
                      {variantDefinitions.map((definition) => <Col xs={12} md={4} key={definition.key}><Form.Item label={definition.label} name={[field.name, "attributeValues", definition.key]} rules={definition.required ? [{ required: true, message: `Vui lòng chọn ${definition.label}.` }] : undefined}>{attributeInput(definition)}</Form.Item></Col>)}
                      <Col xs={12} md={3}><Form.Item label="Tồn kho" name={[field.name, "stock"]} rules={[{ required: true }]}><InputNumber min={0} style={{ width: "100%" }} /></Form.Item></Col>
                      <Col xs={12} md={4}><Form.Item label="Giá riêng" name={[field.name, "price"]}><InputNumber min={0} step={1000} style={{ width: "100%" }} /></Form.Item></Col>
                      <Col xs={12} md={4}><Form.Item label="Giá KM riêng" name={[field.name, "salePrice"]}><InputNumber min={0} step={1000} style={{ width: "100%" }} /></Form.Item></Col>
                      <Col xs={24} md={8}><Form.Item label="Ảnh biến thể URL" name={[field.name, "imageUrl"]}><Input /></Form.Item></Col>
                    </Row>
                  </div>)}
                  <Form.ErrorList errors={errors} />
                  <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add({ sku: "", colorName: "", colorHex: "", attributeValues: {}, stock: 0, imageUrl: "" })}>Thêm biến thể</Button>
                </Space>}
              </Form.List>,
            },
          ]}
        />
      </Form>
    </Modal>
  );
}
