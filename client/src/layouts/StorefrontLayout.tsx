import {
  CustomerServiceOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  MenuOutlined,
  RobotOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Badge, Drawer, Input } from "antd";
import { useState, type FormEvent } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { StoreLogo } from "../components/storefront/StoreLogo";
import { useCart } from "../cart/useCart";
import { paths } from "../routes/paths";

const navigation = [
  { label: "Trang chủ", to: paths.home },
  { label: "Sản phẩm", to: paths.products },
  { label: "Tư vấn AI", to: paths.aiAdvisor, icon: <RobotOutlined /> },
  { label: "Giỏ hàng", to: paths.cart },
  { label: "Tài khoản", to: paths.account },
];

export function StorefrontLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(keyword.trim() ? `${paths.products}?q=${encodeURIComponent(keyword.trim())}` : paths.products);
  };

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

          <div className="store-header-info desktop-only">
            <CustomerServiceOutlined />
            <span>Hotline: <strong>0977 508 430</strong></span>
          </div>

          <div className="store-header-info desktop-only">
            <EnvironmentOutlined />
            <span>Hệ thống cửa hàng</span>
          </div>

          <form className="store-search desktop-only" onSubmit={submitSearch}>
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm sản phẩm..."
              suffix={<SearchOutlined />}
              aria-label="Tìm kiếm sản phẩm"
            />
          </form>

          <div className="store-actions">
            <button className="store-action desktop-only" type="button" onClick={() => navigate(paths.products)}>
              <EyeOutlined /><span>Tra cứu</span>
            </button>
            <button className="store-action" type="button" onClick={() => navigate(paths.account)}>
              <UserOutlined /><span>Tài khoản</span>
            </button>
            <Badge count={itemCount} showZero={false}>
              <button className="store-action" type="button" onClick={() => navigate(paths.cart)}>
                <ShoppingCartOutlined /><span>Giỏ hàng</span>
              </button>
            </Badge>
            <button
              className="mobile-menu-button"
              type="button"
              aria-label="Mở menu"
              onClick={() => setMenuOpen(true)}
            ><MenuOutlined /></button>
          </div>
        </div>
        <div className="store-navigation-bar">
          <div className="store-container desktop-nav">{navLinks}</div>
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

      <Drawer title="Menu" placement="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <form className="store-mobile-search" onSubmit={submitSearch}>
          <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm sản phẩm..." suffix={<SearchOutlined />} />
        </form>
        <div className="mobile-nav">{navLinks}</div>
      </Drawer>
    </div>
  );
}
