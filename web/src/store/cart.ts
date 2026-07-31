"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

export type CartLine = {
  product: Pick<Product, "id" | "name" | "nameEn" | "slug" | "price" | "images" | "quantity">;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (product: CartLine["product"], quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.product.id === product.id);
          if (existing) {
            const nextQty = Math.min(existing.quantity + quantity, product.quantity);
            return {
              lines: state.lines.map((l) => (l.product.id === product.id ? { ...l, quantity: nextQty } : l)),
              isOpen: true,
            };
          }
          return { lines: [...state.lines, { product, quantity: Math.min(quantity, product.quantity) }], isOpen: true };
        }),
      removeItem: (productId) => set((state) => ({ lines: state.lines.filter((l) => l.product.id !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (l.product.id === productId ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
      itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: "wisecom-cart" },
  ),
);
