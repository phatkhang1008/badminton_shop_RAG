import type { StorefrontProduct, StorefrontProductImage, StorefrontProductVariant } from "../../api/storefront/products.api";

const currencyFormatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function getPrimaryImage(images: StorefrontProductImage[]) {
  return [...images].sort((first, second) => first.sortOrder - second.sortOrder).find((image) => image.isPrimary) ?? images[0];
}

export function getVariantPricing(product: StorefrontProduct, variant?: StorefrontProductVariant) {
  const regularPrice = variant?.price ?? product.basePrice;
  const salePrice = variant?.salePrice ?? product.salePrice ?? null;
  return { regularPrice, salePrice: salePrice != null && salePrice < regularPrice ? salePrice : null };
}

export function getStartingPrice(product: StorefrontProduct) {
  const prices = product.variants.map((variant) => getVariantPricing(product, variant).salePrice ?? getVariantPricing(product, variant).regularPrice);
  return Math.min(product.salePrice ?? product.basePrice, ...prices);
}
