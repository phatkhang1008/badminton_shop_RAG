import {
  AppstoreOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  TeamOutlined,
  TrademarkOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../api/auth/auth.api";
import { currentUserQueryKey } from "../auth/queryKeys";
import { paths } from "../routes/paths";

const { Header, Sider, Content } = Layout;

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData<{ name: string; email: string }>(currentUserQueryKey);

  const selectedKey = useMemo(() => {
    const matching = ["products", "categories", "brands", "orders", "users"].find((segment) =>
      location.pathname.includes(`/${segment}`),
    );
    return matching ?? "dashboard";
  }, [location.pathname]);

  const logoutMutation = useMutation({
    mutationFn: logoutAdmin,
    onSettled: () => {
      queryClient.clear();
      navigate(paths.admin.login, { replace: true });
    },
  });

  return (
    <Layout className="admin-shell">
      <Sider
        width={252}
        collapsedWidth={80}
        collapsed={collapsed}
        className="admin-sider"
        trigger={null}
      >
        <div className="brand" onClick={() => navigate(paths.admin.root)} role="button" tabIndex={0}>
          <span className="brand-mark">B</span>
          {!collapsed && (
            <span>
              <strong>Badminton</strong>
              <small>Admin Portal</small>
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(key === "dashboard" ? paths.admin.root : `${paths.admin.root}/${key}`)}
          items={[
            { key: "dashboard", icon: <DashboardOutlined />, label: "Tổng quan" },
            { key: "products", icon: <AppstoreOutlined />, label: "Sản phẩm" },
            { key: "categories", icon: <TagsOutlined />, label: "Danh mục" },
            { key: "brands", icon: <TrademarkOutlined />, label: "Thương hiệu" },
            { key: "orders", icon: <ShoppingCartOutlined />, label: "Đơn hàng" },
            { key: "users", icon: <TeamOutlined />, label: "Người dùng" },
          ]}
        />
      </Sider>

      <Layout>
        <Header className="admin-header">
          <Button
            type="text"
            aria-label={collapsed ? "Mở menu" : "Thu gọn menu"}
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed((value) => !value)}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: "logout",
                  danger: true,
                  icon: <LogoutOutlined />,
                  label: "Đăng xuất",
                  onClick: () => logoutMutation.mutate(),
                },
              ],
            }}
            placement="bottomRight"
          >
            <Space className="user-menu">
              <Avatar>{user?.name?.charAt(0).toUpperCase() ?? "A"}</Avatar>
              <span className="user-copy">
                <Typography.Text strong>{user?.name ?? "Quản trị viên"}</Typography.Text>
                <Typography.Text type="secondary">{user?.email}</Typography.Text>
              </span>
            </Space>
          </Dropdown>
        </Header>
        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
