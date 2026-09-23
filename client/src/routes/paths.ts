export const paths = {
  home: "/",
  products: "/products",
  productDetail: (slug: string) => `/products/${slug}`,
  aiAdvisor: "/ai-advisor",
  cart: "/cart",
  account: "/account",
  admin: {
    root: "/admin",
    login: "/admin/login",
    products: "/admin/products",
    categories: "/admin/categories",
    brands: "/admin/brands",
    orders: "/admin/orders",
    users: "/admin/users",
    customers: "/admin/customers",
  },
} as const;
