import { AppstoreOutlined, ArrowRightOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Col, Empty, Row, Skeleton } from "antd";
import { Link } from "react-router-dom";
import { getStorefrontProducts, type StorefrontProductListParams } from "../../api/storefront/products.api";
import { paths } from "../../routes/paths";
import { ProductCard } from "./ProductCard";

const latestProductsParams: StorefrontProductListParams = {
  page: 1,
  limit: 4,
  search: "",
  category: "all",
  brand: "all",
  sort: "newest",
};

export function HomeFeaturedProducts() {
  const productsQuery = useQuery({
    queryKey: ["storefront", "featured-products"],
    queryFn: () => getStorefrontProducts(latestProductsParams),
  });

  return (
    <>
      <section className="home-section home-products-section">
        <div className="store-container">
          <div className="home-section-heading">
            <span>Sản phẩm mới</span>
            <h2>Trang bị tốt hơn cho trận cầu hay hơn</h2>
            <p>Những sản phẩm mới nhất đang có tại cửa hàng.</p>
          </div>

          {productsQuery.isPending ? (
            <Row gutter={[20, 20]}>
              {Array.from({ length: 4 }, (_, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <Card className="store-product-skeleton"><Skeleton active paragraph={{ rows: 3 }} /></Card>
                </Col>
              ))}
            </Row>
          ) : productsQuery.isError ? (
            <div className="home-products-feedback">
              <Alert
                type="error"
                showIcon
                message="Không thể tải sản phẩm mới"
                description="Hãy kiểm tra kết nối rồi thử lại."
                action={<Button size="small" icon={<ReloadOutlined />} onClick={() => productsQuery.refetch()}>Thử lại</Button>}
              />
            </div>
          ) : productsQuery.data && productsQuery.data.products.length > 0 ? (
            <>
              <Row gutter={[20, 20]}>
                {productsQuery.data.products.map((product) => (
                  <Col xs={24} sm={12} lg={6} key={product.id}><ProductCard product={product} /></Col>
                ))}
              </Row>
              <div className="home-products-action">
                <Link to={paths.products}>Xem tất cả sản phẩm</Link>
              </div>
            </>
          ) : (
            <div className="home-products-feedback">
              <Empty description="Sản phẩm mới sẽ sớm được cập nhật">
                <Link to={paths.products}><Button type="primary">Khám phá cửa hàng</Button></Link>
              </Empty>
            </div>
          )}
        </div>
      </section>

      {productsQuery.data && productsQuery.data.filters.categories.length > 0 && (
        <section className="home-section home-featured-section">
          <div className="store-container">
            <div className="home-section-heading">
              <span>Danh mục nổi bật</span>
              <h2>Tìm dụng cụ theo nhu cầu của bạn</h2>
              <p>Chọn nhanh nhóm sản phẩm phù hợp với phong cách thi đấu của bạn.</p>
            </div>
            <Row gutter={[18, 18]}>
              {productsQuery.data.filters.categories.slice(0, 4).map((category) => (
                <Col xs={24} sm={12} lg={6} key={category.slug}>
                  <Link to={paths.productsByCategory(category.slug)} className="home-category-link">
                    <Card className="home-category-card" hoverable>
                      <span className="home-category-icon"><AppstoreOutlined /></span>
                      <h3>{category.name}</h3>
                      <p>Khám phá các sản phẩm đang có trong danh mục này.</p>
                      <span className="home-category-arrow">Khám phá <ArrowRightOutlined /></span>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          </div>
        </section>
      )}
    </>
  );
}
