"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

type StockMap = Record<number, number>;

type StockContextValue = {
  getStock: (productId: number) => number;
  decreaseStock: (productId: number, quantity: number) => void;
  increaseStock: (productId: number, quantity: number) => void;
  setInitialStock: (productId: number, stock: number) => void;
};

const StockContext = createContext<StockContextValue | undefined>(undefined);

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [stocks, setStocks] = useState<StockMap>({});

  // Load stocks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("product_stocks");
      if (stored) {
        setStocks(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Save stocks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("product_stocks", JSON.stringify(stocks));
    } catch {}
  }, [stocks]);

  const getStock = useCallback(
    (productId: number) => {
      return stocks[productId] ?? 0;
    },
    [stocks]
  );

  const setInitialStock = useCallback((productId: number, stock: number) => {
    setStocks((prev) => {
      // Only set if not already set (preserve existing values)
      if (prev[productId] === undefined) {
        return { ...prev, [productId]: stock };
      }
      return prev;
    });
  }, []);

  const decreaseStock = useCallback((productId: number, quantity: number) => {
    setStocks((prev) => {
      const current = prev[productId] ?? 0;
      return {
        ...prev,
        [productId]: Math.max(0, current - quantity),
      };
    });
  }, []);

  const increaseStock = useCallback((productId: number, quantity: number) => {
    setStocks((prev) => {
      const current = prev[productId] ?? 0;
      return {
        ...prev,
        [productId]: current + quantity,
      };
    });
  }, []);

  const value: StockContextValue = {
    getStock,
    decreaseStock,
    increaseStock,
    setInitialStock,
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStock() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStock must be used within StockProvider");
  return ctx;
}

