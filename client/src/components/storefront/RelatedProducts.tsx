import { ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Col, Row, Skeleton } from "antd";
import { getStorefrontProducts, type StorefrontProductListParams } from "../../api/storefront/products.api";
import { ProductCard } from "./ProductCard";

interface RelatedProductsProps {
  productId: string;
  category: string;
}

export function RelatedProducts({ productId, category }: RelatedProductsProps) {
  const params: StorefrontProductListParams = {
    page: 1,
    limit: 6,
    search: "",
    category,
    brand: "all",
    sort: "newest",
  };
  const relatedProductsQuery = useQuery({
    queryKey: ["storefront", "related-products", productId, category],
    queryFn: () => getStorefrontProducts(params),
    enabled: Boolean(category),
  });
  const relatedProducts = relatedProductsQuery.data?.products.filter((product) => product.id !== productId).slice(0, 4) ?? [];

  if (relatedProductsQuery.isError) {
    return (
      <section className="store-related-products">
        <Alert
          type="warning"
          showIcon
          message="Không thể tải sản phẩm cùng danh mục"
          action={<Button size="small" icon={<ReloadOutlined />} onClick={() => relatedProductsQuery.refetch()}>Thử lại</Button>}
        />
      </section>
    );
  }

  if (!relatedProductsQuery.isPending && relatedProducts.length === 0) return null;

  return (
    <section className="store-related-products">
      <header className="store-related-heading">
        <span className="eyebrow">Khám phá thêm</span>
        <h2>Sản phẩm cùng danh mục</h2>
      </header>
      {relatedProductsQuery.isPending ? (
        <Row gutter={[20, 20]}>
          {Array.from({ length: 4 }, (_, index) => (
            <Col xs={24} sm={12} lg={6} key={index}><Card className="store-product-skeleton"><Skeleton active paragraph={{ rows: 3 }} /></Card></Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[20, 20]}>
          {relatedProducts.map((product) => (
            <Col xs={24} sm={12} lg={6} key={product.id}><ProductCard product={product} /></Col>
          ))}
        </Row>
      )}
    </section>
  );
}
