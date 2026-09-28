import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { StorefrontProduct, StorefrontProductVariant } from "../api/storefront/products.api";
import { getPrimaryImage, getVariantPricing } from "../components/storefront/productPresentation";
import { CartContext, type CartContextValue, type CartItem } from "./cartContext";

const storageKey = "badminton-shop-cart";

function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((item): item is CartItem => (
      item && typeof item.key === "string" && typeof item.name === "string" &&
      typeof item.price === "number" && typeof item.quantity === "number" && typeof item.stock === "number"
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
      if (!selectedVariant || selectedVariant.stock < 1) return;
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
        variantName: selectedVariant.colorName,
        colorHex: selectedVariant.colorHex,
        price: salePrice ?? regularPrice,
        quantity: 1,
        stock: selectedVariant.stock,
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
        if (quantity <= 0) return [];
        return [{ ...item, quantity: Math.min(quantity, item.stock) }];
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
