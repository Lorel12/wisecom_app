"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";

export function CartButton() {
  const { open, itemCount } = useCartStore();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const count = mounted ? itemCount() : 0;

  return (
    <button
      onClick={open}
      aria-label="Panier"
      className="relative flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary"
    >
      <ShoppingBag className="size-[18px]" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {count}
        </span>
      )}
    </button>
  );
}
