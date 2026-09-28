import { CheckCircleFilled, InfoCircleOutlined } from "@ant-design/icons";
import { Alert, Col, Row, Steps } from "antd";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useCart } from "../../cart/useCart";
import { CheckoutCustomerForm, type CheckoutFormValues } from "../../components/storefront/CheckoutCustomerForm";
import { CheckoutOrderSummary } from "../../components/storefront/CheckoutOrderSummary";
import { CheckoutReview } from "../../components/storefront/CheckoutReview";
import { paths } from "../../routes/paths";

export function CheckoutPage() {
  const { items, itemCount, subtotal } = useCart();
  const [submittedValues, setSubmittedValues] = useState<CheckoutFormValues | null>(null);

  if (items.length === 0) return <Navigate to={paths.cart} replace />;

  return (
    <section className="store-checkout-page">
      <div className="store-container">
        <header className="store-checkout-heading">
          <span className="eyebrow">Thanh toán</span>
          <h1>Hoàn tất thông tin đặt hàng</h1>
          <p>Kiểm tra thông tin nhận hàng và đơn hàng trước khi xác nhận.</p>
        </header>
        <Steps
          className="store-checkout-steps"
          current={submittedValues ? 1 : 0}
          items={[{ title: "Thông tin giao nhận" }, { title: "Xác nhận" }, { title: "Tạo đơn" }]}
        />
        {submittedValues && (
          <Alert
            className="store-checkout-contract-notice"
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            message="Thông tin giao nhận đã hợp lệ"
            description={`Cảm ơn ${submittedValues.fullName}. Bước tạo đơn và thanh toán sẽ được kích hoạt ngay khi API đơn hàng của backend được thống nhất.`}
          />
        )}
        <Row gutter={[28, 28]} align="top">
          <Col xs={24} lg={15}>
            {submittedValues ? <CheckoutReview values={submittedValues} onEdit={() => setSubmittedValues(null)} /> : <CheckoutCustomerForm onFinish={setSubmittedValues} />}
          </Col>
          <Col xs={24} lg={9}><CheckoutOrderSummary items={items} itemCount={itemCount} subtotal={subtotal} /></Col>
        </Row>
        <div className="store-checkout-security"><CheckCircleFilled /> Thông tin này chỉ được dùng trong phiên checkout hiện tại và không lưu access token ở trình duyệt.</div>
      </div>
    </section>
  );
}
