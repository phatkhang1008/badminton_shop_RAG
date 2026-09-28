import { HistoryOutlined, SafetyCertificateOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Col, Row } from "antd";
import { GuestAccountPanel } from "../../components/storefront/GuestAccountPanel";

const accountBenefits = [
  { icon: <HistoryOutlined />, title: "Theo dõi đơn hàng", text: "Xem tiến trình giao hàng và lịch sử mua sắm." },
  { icon: <ShoppingOutlined />, title: "Mua sắm nhanh hơn", text: "Lưu thông tin để đặt những đơn tiếp theo thuận tiện hơn." },
  { icon: <SafetyCertificateOutlined />, title: "Thông tin riêng tư", text: "Sẵn sàng dùng luồng cookie httpOnly khi API khách hàng được triển khai." },
];

export function AccountPage() {
  return (
    <section className="store-account-page">
      <div className="store-container">
        <Row gutter={[38, 30]} align="middle">
          <Col xs={24} lg={12}>
            <span className="eyebrow">Tài khoản khách hàng</span>
            <h1>Mua sắm thuận tiện hơn qua từng lần ghé thăm.</h1>
            <p className="store-account-intro">Tài khoản sẽ giúp bạn quản lý đơn hàng và thông tin giao nhận. Phần xác thực khách hàng sẽ được nối với backend theo contract của nhóm.</p>
            <div className="store-account-benefits">
              {accountBenefits.map((benefit) => (
                <div key={benefit.title}><span>{benefit.icon}</span><div><strong>{benefit.title}</strong><p>{benefit.text}</p></div></div>
              ))}
            </div>
          </Col>
          <Col xs={24} lg={12}><GuestAccountPanel /></Col>
        </Row>
      </div>
    </section>
  );
}
