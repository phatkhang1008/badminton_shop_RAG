import { HistoryOutlined, ShoppingOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { Link } from "react-router-dom";
import { paths } from "../../routes/paths";

export function GuestAccountPanel() {
  return (
    <Card className="store-guest-account-card">
      <div className="store-guest-account-icon"><UserOutlined /></div>
      <h2>Chào bạn!</h2>
      <p>Đăng nhập tài khoản khách hàng sẽ được kết nối khi nhóm hoàn thiện API xác thực dành cho storefront.</p>
      <div className="store-guest-account-actions">
        <Link to={paths.products}><Button type="primary" icon={<ShoppingOutlined />}>Khám phá sản phẩm</Button></Link>
        <Link to={paths.cart}><Button icon={<HistoryOutlined />}>Xem giỏ hàng</Button></Link>
      </div>
    </Card>
  );
}
