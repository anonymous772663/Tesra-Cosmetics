"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { CartItem, Product } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, shade?: string) => void;
  removeItem: (productId: string, shade?: string) => void;
  updateQuantity: (productId: string, quantity: number, shade?: string) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function lineKey(productId: string, shade?: string) {
  return `${productId}::${shade ?? "default"}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product, quantity = 1, shade?: string) => {
    setItems((prev) => {
      const key = lineKey(product.id, shade);
      const existing = prev.find((i) => lineKey(i.product.id, i.shade) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i.product.id, i.shade) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity, shade }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, shade?: string) => {
    setItems((prev) => prev.filter((i) => lineKey(i.product.id, i.shade) !== lineKey(productId, shade)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, shade?: string) => {
    setItems((prev) =>
      prev.map((i) =>
        lineKey(i.product.id, i.shade) === lineKey(productId, shade)
          ? { ...i, quantity: Math.max(1, quantity) }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.product.price, 0),
    [items]
  );

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalCount,
    subtotal,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
