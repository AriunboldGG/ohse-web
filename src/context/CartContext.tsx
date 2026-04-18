"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: number;
  name: string;
  priceNum: number;
  price: string;
  img: string;
  modelNumber: string;
  product_code?: string; // Product code from backend
  color?: string;
  size?: string;
  brand?: string;
  theme?: string;
  stock?: number; // Stock count from Firebase
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (id: number, qty: number, item?: CartItem) => void;
  removeItem: (id: number, item?: CartItem) => void;
  clear: () => void;
  count: number;
  total: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart_items");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cart_items", JSON.stringify(items));
    } catch {}
  }, [items]);

  // Helper function to create unique cart item key
  const getCartItemKey = (item: CartItem | Omit<CartItem, "qty">): string => {
    return `${item.id}-${item.size || ''}-${item.color || ''}-${item.theme || ''}-${item.modelNumber || ''}`;
  };

  const addItem = (item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const itemKey = getCartItemKey(item);
      const existing = prev.find((p) => getCartItemKey(p) === itemKey);
      if (existing) {
        // If exact same item (same id, size, color, theme, modelNumber), increase quantity and update stock
        return prev.map((p) => (getCartItemKey(p) === itemKey ? { ...p, qty: p.qty + qty, stock: item.stock ?? p.stock } : p));
      }
      // Different item, add as new
      return [...prev, { ...item, qty }];
    });
  };

  const updateQty = (id: number, qty: number, item?: CartItem) => {
    if (qty < 1) {
      if (item) {
        // Remove specific item by unique key
        const itemKey = getCartItemKey(item);
        setItems((prev) => prev.filter((p) => getCartItemKey(p) !== itemKey));
      } else {
        removeItem(id);
      }
    } else {
      if (item) {
        // Update specific item by unique key
        const itemKey = getCartItemKey(item);
        setItems((prev) => prev.map((p) => (getCartItemKey(p) === itemKey ? { ...p, qty } : p)));
      } else {
        // Fallback: update by id (for backward compatibility)
        setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
      }
    }
  };

  const removeItem = (id: number, item?: CartItem) => {
    if (item) {
      // Remove specific item by unique key
      const itemKey = getCartItemKey(item);
      setItems((prev) => prev.filter((p) => getCartItemKey(p) !== itemKey));
    } else {
      // Fallback: remove by id (for backward compatibility)
      setItems((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((n, p) => n + p.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, p) => s + p.qty * p.priceNum, 0), [items]);

  const value: CartContextValue = { items, addItem, updateQty, removeItem, clear, count, total };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


