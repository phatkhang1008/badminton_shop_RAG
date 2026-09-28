import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthGuard } from "../auth/AuthGuard";
import { AppLoader } from "../components/common/AppLoader";
import { AdminLayout } from "../layouts/AdminLayout";
import { StorefrontLayout } from "../layouts/StorefrontLayout";
import { paths } from "./paths";

const HomePage = lazy(() => import("../pages/storefront/HomePage").then((module) => ({ default: module.HomePage })));
const ProductListPage = lazy(() =>
  import("../pages/storefront/ProductListPage").then((module) => ({ default: module.ProductListPage })),
);
const ProductDetailPage = lazy(() =>
  import("../pages/storefront/ProductDetailPage").then((module) => ({ default: module.ProductDetailPage })),
);
const CartPage = lazy(() => import("../pages/storefront/CartPage").then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import("../pages/storefront/CheckoutPage").then((module) => ({ default: module.CheckoutPage })));
const AiAdvisorPage = lazy(() =>
  import("../pages/storefront/AiAdvisorPage").then((module) => ({ default: module.AiAdvisorPage })),
);
const AccountPage = lazy(() =>
  import("../pages/storefront/AccountPage").then((module) => ({ default: module.AccountPage })),
);
const AdminLoginPage = lazy(() => import("../pages/admin/LoginPage").then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import("../pages/admin/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const ProductManagementPage = lazy(() =>
  import("../pages/admin/catalog/ProductManagementPage").then((module) => ({ default: module.ProductManagementPage })),
);
const CategoryManagementPage = lazy(() =>
  import("../pages/admin/catalog/CategoryManagementPage").then((module) => ({ default: module.CategoryManagementPage })),
);
const BrandManagementPage = lazy(() =>
  import("../pages/admin/catalog/BrandManagementPage").then((module) => ({ default: module.BrandManagementPage })),
);
const UserManagementPage = lazy(() =>
  import("../pages/admin/users/UserManagementPage").then((module) => ({ default: module.UserManagementPage })),
);
const AdminPlaceholderPage = lazy(() =>
  import("../pages/admin/AdminPlaceholderPage").then((module) => ({ default: module.AdminPlaceholderPage })),
);
const NotFoundPage = lazy(() => import("../pages/errors/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));

export function AppRoutes() {
  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        <Route path={paths.home} element={<StorefrontLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductListPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="ai-advisor" element={<AiAdvisorPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>

        <Route path={paths.admin.login} element={<AdminLoginPage />} />
        <Route path="/login" element={<Navigate to={paths.admin.login} replace />} />

        <Route element={<AuthGuard />}>
          <Route path={paths.admin.root} element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductManagementPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />
            <Route path="brands" element={<BrandManagementPage />} />
            <Route path="orders" element={<AdminPlaceholderPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="customers" element={<Navigate to={paths.admin.users} replace />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
