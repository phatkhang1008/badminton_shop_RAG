import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { StorefrontProduct, StorefrontProductVariant } from "../api/storefront/products.api";
import { getPrimaryImage, getVariantName, getVariantPricing } from "../components/storefront/productPresentation";
import { CartContext, type CartContextValue, type CartItem } from "./cartContext";

const storageKey = "badminton-shop-cart";

function isPositiveInteger(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((item): item is CartItem => (
      item && typeof item.key === "string" && typeof item.productId === "string" && typeof item.slug === "string" &&
      typeof item.name === "string" && typeof item.variantSku === "string" && typeof item.variantName === "string" &&
      typeof item.imageUrl === "string" && typeof item.imageAlt === "string" && typeof item.colorHex === "string" &&
      typeof item.price === "number" && Number.isFinite(item.price) && item.price >= 0 &&
      isPositiveInteger(item.quantity) && isPositiveInteger(item.stock) && item.quantity <= item.stock
    ));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getStoredCart);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const addProduct = (product: StorefrontProduct, variant?: StorefrontProductVariant) => {
      const selectedVariant = variant ?? product.variants[0];
      const stock = selectedVariant ? Math.floor(selectedVariant.stock) : 0;
      if (!selectedVariant || stock < 1) return;
      const key = `${product.id}:${selectedVariant.sku}`;
      const primaryImage = getPrimaryImage(product.images);
      const { regularPrice, salePrice } = getVariantPricing(product, selectedVariant);
      const item: CartItem = {
        key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: selectedVariant.imageUrl || primaryImage?.url || "",
        imageAlt: primaryImage?.alt || product.name,
        variantSku: selectedVariant.sku,
        variantName: getVariantName(selectedVariant),
        colorHex: selectedVariant.colorHex,
        price: salePrice ?? regularPrice,
        quantity: 1,
        stock,
      };

      setItems((current) => {
        const existing = current.find((currentItem) => currentItem.key === key);
        if (!existing) return [...current, item];
        return current.map((currentItem) => currentItem.key === key
          ? { ...currentItem, ...item, quantity: Math.min(currentItem.quantity + 1, item.stock) }
          : currentItem,
        );
      });
    };

    const updateQuantity = (key: string, quantity: number) => {
      setItems((current) => current.flatMap((item) => {
        if (item.key !== key) return [item];
        const stock = Math.floor(item.stock);
        const nextQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
        if (stock < 1 || nextQuantity < 1) return [];
        return [{ ...item, stock, quantity: Math.min(nextQuantity, stock) }];
      }));
    };

    return {
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addProduct,
      updateQuantity,
      removeItem: (key) => setItems((current) => current.filter((item) => item.key !== key)),
      clearCart: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
