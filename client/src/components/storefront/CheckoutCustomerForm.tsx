import { PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Radio, Row } from "antd";

export interface CheckoutFormValues {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  note?: string;
  paymentMethod: "cod" | "bank-transfer";
}

interface CheckoutCustomerFormProps {
  onFinish: (values: CheckoutFormValues) => void;
  initialValues?: CheckoutFormValues;
}

export function CheckoutCustomerForm({ onFinish, initialValues }: CheckoutCustomerFormProps) {
  return (
    <Form<CheckoutFormValues> className="store-checkout-form" layout="vertical" initialValues={initialValues ?? { paymentMethod: "cod" }} onFinish={onFinish}>
      <Card className="store-checkout-card" title="Thông tin giao nhận">
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: "Vui lòng nhập họ và tên." }]}>
              <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" autoComplete="name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại." },
                { pattern: /^(0|\+84)[0-9]{9,10}$/, message: "Số điện thoại chưa đúng định dạng." },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="09xx xxx xxx" inputMode="tel" autoComplete="tel" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="email" label="Email nhận thông tin đơn hàng" rules={[{ type: "email", message: "Email chưa đúng định dạng." }]}>
          <Input placeholder="email@example.com" inputMode="email" autoComplete="email" />
        </Form.Item>
        <Form.Item name="address" label="Địa chỉ nhận hàng" rules={[{ required: true, message: "Vui lòng nhập địa chỉ nhận hàng." }]}>
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" autoComplete="street-address" />
        </Form.Item>
        <Form.Item name="note" label="Ghi chú cho cửa hàng">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..." />
        </Form.Item>
      </Card>

      <Card className="store-checkout-card" title="Phương thức thanh toán">
        <Form.Item name="paymentMethod" noStyle>
          <Radio.Group className="store-payment-methods">
            <Radio value="cod">
              <strong>Thanh toán khi nhận hàng (COD)</strong>
              <span>Thanh toán cho đơn vị vận chuyển khi nhận sản phẩm.</span>
            </Radio>
            <Radio value="bank-transfer">
              <strong>Chuyển khoản ngân hàng</strong>
              <span>Thông tin chuyển khoản sẽ được cung cấp sau khi đơn được xác nhận.</span>
            </Radio>
          </Radio.Group>
        </Form.Item>
      </Card>

      <Button className="store-checkout-submit" type="primary" htmlType="submit" size="large" block>
        Kiểm tra thông tin đặt hàng
      </Button>
    </Form>
  );
}
