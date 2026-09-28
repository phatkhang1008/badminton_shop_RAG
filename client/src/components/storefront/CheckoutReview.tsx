import { EditOutlined, EnvironmentOutlined, MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import type { CheckoutFormValues } from "./CheckoutCustomerForm";

interface CheckoutReviewProps {
  values: CheckoutFormValues;
  onEdit: () => void;
}

export function CheckoutReview({ values, onEdit }: CheckoutReviewProps) {
  const paymentMethod = values.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản ngân hàng";

  return (
    <Card className="store-checkout-card store-checkout-review" title="Xác nhận thông tin">
      <p>Hãy kiểm tra lại trước khi gửi yêu cầu tạo đơn hàng.</p>
      <dl>
        <div><dt><UserOutlined /> Người nhận</dt><dd>{values.fullName}</dd></div>
        <div><dt><PhoneOutlined /> Số điện thoại</dt><dd>{values.phone}</dd></div>
        {values.email && <div><dt><MailOutlined /> Email</dt><dd>{values.email}</dd></div>}
        <div><dt><EnvironmentOutlined /> Địa chỉ</dt><dd>{values.address}</dd></div>
        <div><dt>Thanh toán</dt><dd>{paymentMethod}</dd></div>
        {values.note && <div><dt>Ghi chú</dt><dd>{values.note}</dd></div>}
      </dl>
      <div className="store-checkout-review-actions">
        <Button icon={<EditOutlined />} onClick={onEdit}>Chỉnh sửa thông tin</Button>
        <Button type="primary" disabled>Tạo đơn hàng</Button>
      </div>
      <small>Chức năng tạo đơn sẽ được mở sau khi backend cung cấp API order/payment.</small>
    </Card>
  );
}
