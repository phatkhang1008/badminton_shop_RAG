import { FilterOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Col, Empty, Input, Pagination, Row, Select, Skeleton, Space } from "antd";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getStorefrontProducts, type StorefrontProductListParams } from "../../api/storefront/products.api";
import { ProductCard } from "../../components/storefront/ProductCard";

const pageSize = 12;

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

interface ProductSearchProps {
  initialSearch: string;
  onSearch: (value: string) => void;
}

function ProductSearch({ initialSearch, onSearch }: ProductSearchProps) {
  const [value, setValue] = useState(initialSearch);

  return (
    <Input.Search
      allowClear
      enterButton={<SearchOutlined />}
      placeholder="Tìm theo tên sản phẩm hoặc SKU"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onSearch={() => onSearch(value)}
    />
  );
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";
  const brand = searchParams.get("brand") ?? "all";
  const sort = (searchParams.get("sort") ?? "newest") as StorefrontProductListParams["sort"];
  const page = positiveInteger(searchParams.get("page"), 1);

  const params = useMemo<StorefrontProductListParams>(() => ({
    page,
    limit: pageSize,
    search,
    category,
    brand,
    sort: ["newest", "price-asc", "price-desc"].includes(sort) ? sort : "newest",
  }), [brand, category, page, search, sort]);

  const productsQuery = useQuery({
    queryKey: ["storefront", "products", params],
    queryFn: () => getStorefrontProducts(params),
    placeholderData: keepPreviousData,
  });

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all" || (key === "sort" && value === "newest")) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  const applySearch = (value: string) => updateParams({ q: value.trim(), page: "1" });
  const filters = productsQuery.data?.filters;

  return (
    <section className="store-catalog">
      <div className="store-container">
        <header className="store-catalog-heading">
          <span className="eyebrow">Bộ sưu tập</span>
          <h1>Tìm đúng dụng cụ cho trận đấu của bạn.</h1>
          <p>Khám phá các sản phẩm đang có sẵn, chọn theo thương hiệu, danh mục và khoảng giá phù hợp.</p>
        </header>

        <Card className="store-filter-card">
          <div className="store-filter-main">
            <ProductSearch key={search} initialSearch={search} onSearch={applySearch} />
            <Select
              aria-label="Lọc theo danh mục"
              value={category}
              onChange={(value) => updateParams({ category: value, page: "1" })}
              options={[{ label: "Tất cả danh mục", value: "all" }, ...(filters?.categories.map((item) => ({ label: item.name, value: item.slug })) ?? [])]}
            />
            <Select
              aria-label="Lọc theo thương hiệu"
              value={brand}
              onChange={(value) => updateParams({ brand: value, page: "1" })}
              options={[{ label: "Tất cả thương hiệu", value: "all" }, ...(filters?.brands.map((item) => ({ label: item.name, value: item.slug })) ?? [])]}
            />
            <Select
              aria-label="Sắp xếp sản phẩm"
              value={params.sort}
              onChange={(value) => updateParams({ sort: value, page: "1" })}
              options={[
                { label: "Mới nhất", value: "newest" },
                { label: "Giá thấp đến cao", value: "price-asc" },
                { label: "Giá cao đến thấp", value: "price-desc" },
              ]}
            />
          </div>
          <div className="store-filter-meta">
            <span><FilterOutlined /> {productsQuery.data ? `${productsQuery.data.pagination.total} sản phẩm` : "Đang tải sản phẩm"}</span>
            {(search || category !== "all" || brand !== "all" || params.sort !== "newest") && (
              <Button type="link" icon={<ReloadOutlined />} onClick={() => setSearchParams({})}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </Card>

        {productsQuery.isError && (
          <Alert
            className="store-catalog-alert"
            type="error"
            showIcon
            message="Không thể tải danh sách sản phẩm"
            description="Hãy kiểm tra kết nối rồi thử lại."
            action={<Button size="small" onClick={() => productsQuery.refetch()}>Thử lại</Button>}
          />
        )}

        {productsQuery.isPending ? (
          <Row gutter={[20, 20]}>
            {Array.from({ length: 8 }, (_, index) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={index}><Card className="store-product-skeleton"><Skeleton active paragraph={{ rows: 3 }} /></Card></Col>
            ))}
          </Row>
        ) : productsQuery.data && productsQuery.data.products.length > 0 ? (
          <>
            <Row gutter={[20, 20]}>
              {productsQuery.data.products.map((product) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={product.id}><ProductCard product={product} /></Col>
              ))}
            </Row>
            {productsQuery.data.pagination.totalPages > 1 && (
              <div className="store-pagination">
                <Pagination
                  current={productsQuery.data.pagination.page}
                  pageSize={productsQuery.data.pagination.limit}
                  total={productsQuery.data.pagination.total}
                  showSizeChanger={false}
                  responsive
                  onChange={(nextPage) => updateParams({ page: String(nextPage) })}
                />
              </div>
            )}
          </>
        ) : !productsQuery.isError ? (
          <div className="store-catalog-empty">
            <Empty description="Chưa tìm thấy sản phẩm phù hợp">
              <Space>
                <Button type="primary" onClick={() => setSearchParams({})}>Xem tất cả sản phẩm</Button>
              </Space>
            </Empty>
          </div>
        ) : null}
      </div>
    </section>
  );
}
