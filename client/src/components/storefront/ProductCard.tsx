import { ArrowRightOutlined, PictureOutlined } from "@ant-design/icons";
import { Card, Tag } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { StorefrontProduct } from "../../api/storefront/products.api";
import { paths } from "../../routes/paths";
import { formatCurrency, getPrimaryImage, getStartingPrice } from "./productPresentation";

interface ProductCardProps {
  product: StorefrontProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = getPrimaryImage(product.images);
  const [imageFailed, setImageFailed] = useState(false);
  const startingPrice = getStartingPrice(product);
  const regularPrice = product.salePrice != null && product.salePrice < product.basePrice ? product.basePrice : null;

  return (
    <Link to={paths.productDetail(product.slug)} className="store-product-link">
      <Card className="store-product-card" hoverable>
        <div className="store-product-image">
          {image && !imageFailed ? (
            <img src={image.url} alt={image.alt || product.name} onError={() => setImageFailed(true)} />
          ) : (
            <span className="store-product-image-fallback"><PictureOutlined /> Chưa có ảnh</span>
          )}
          <Tag className="store-product-brand">{product.brand.name}</Tag>
        </div>
        <div className="store-product-content">
          <span className="store-product-category">{product.category.name}</span>
          <h2>{product.name}</h2>
          <p>{product.shortDescription || "Sản phẩm cầu lông chính hãng, sẵn sàng cho mọi trận đấu."}</p>
          <div className="store-product-bottom">
            <div className="store-product-price">
              <strong>{formatCurrency(startingPrice)}</strong>
              {regularPrice && <del>{formatCurrency(regularPrice)}</del>}
            </div>
            <ArrowRightOutlined aria-hidden="true" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
