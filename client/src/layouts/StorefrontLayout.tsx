import {
  MenuOutlined,
  RobotOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Badge, Button, Drawer } from "antd";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { StoreLogo } from "../components/storefront/StoreLogo";
import { useCart } from "../cart/useCart";
import { paths } from "../routes/paths";

const navigation = [
  { label: "Trang chủ", to: paths.home },
  { label: "Sản phẩm", to: paths.products },
  { label: "Tư vấn AI", to: paths.aiAdvisor, icon: <RobotOutlined /> },
];

export function StorefrontLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const navLinks = (
    <nav className="store-nav" aria-label="Điều hướng chính">
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === paths.home}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) => (isActive ? "store-nav-link active" : "store-nav-link")}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="store-shell">
      <header className="store-header">
        <div className="store-container store-header-inner">
          <StoreLogo />

          <div className="desktop-nav">{navLinks}</div>

          <div className="store-actions">
            <Button
              type="text"
              shape="circle"
              icon={<UserOutlined />}
              aria-label="Tài khoản"
              onClick={() => navigate(paths.account)}
            />
            <Badge count={itemCount} showZero={false}>
              <Button
                type="text"
                shape="circle"
                icon={<ShoppingCartOutlined />}
                aria-label="Giỏ hàng"
                onClick={() => navigate(paths.cart)}
              />
            </Badge>
            <Button
              className="mobile-menu-button"
              type="text"
              shape="circle"
              icon={<MenuOutlined />}
              aria-label="Mở menu"
              onClick={() => setMenuOpen(true)}
            />
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="store-footer">
        <div className="store-container store-footer-inner">
          <div>
            <StoreLogo variant="footer" />
          </div>
          <p>© {new Date().getFullYear()} Badminton Shop. Đồ án Tiểu luận chuyên ngành.</p>
        </div>
      </footer>

      <Drawer title="Danh mục" placement="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="mobile-nav">{navLinks}</div>
      </Drawer>
    </div>
  );
}
