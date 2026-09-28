import { createContext } from "react";
import type { StorefrontProduct, StorefrontProductVariant } from "../api/storefront/products.api";

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  imageAlt: string;
  variantSku: string;
  variantName: string;
  colorHex: string;
  price: number;
  quantity: number;
  stock: number;
}

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addProduct: (product: StorefrontProduct, variant?: StorefrontProductVariant) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
