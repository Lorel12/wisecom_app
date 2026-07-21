"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import type { Product } from "@/lib/types";

export function ProductActions({ product }: { product: Product }) {
  const t = useTranslations("product");
  const [quantity, setQuantity] = React.useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const outOfStock = product.quantity <= 0;

  function cartPayload() {
    return {
      id: product.id,
      name: product.name,
      nameEn: product.nameEn,
      slug: product.slug,
      price: product.price,
      images: product.images,
      quantity: product.quantity,
    };
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">{t("quantity")}</span>
        <div className="flex items-center gap-1 rounded-lg border border-border">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-9 items-center justify-center text-foreground hover:bg-secondary"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
            className="flex size-9 items-center justify-center text-foreground hover:bg-secondary"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={outOfStock}
          onClick={() => {
            addItem(cartPayload(), quantity);
            toast.success(t("addedToCart"));
          }}
        >
          <ShoppingBag className="size-4" />
          {outOfStock ? t("outOfStock") : t("addToCart")}
        </Button>
        <Button
          size="lg"
          className="flex-1"
          disabled={outOfStock}
          onClick={() => {
            addItem(cartPayload(), quantity);
            router.push("/panier");
          }}
        >
          {t("buyNow")}
        </Button>
      </div>
    </div>
  );
}
