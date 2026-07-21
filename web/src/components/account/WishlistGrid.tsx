"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductGrid } from "@/components/products/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";

type WishlistItem = { id: string; product: Product };

export function WishlistGrid() {
  const t = useTranslations("account");
  const [items, setItems] = React.useState<WishlistItem[] | null>(null);

  React.useEffect(() => {
    api.get<{ items: WishlistItem[] }>("/wishlist").then((res) => setItems(res.items)).catch(() => setItems([]));
  }, []);

  if (items === null) return <PageSpinner />;

  if (items.length === 0) {
    return <EmptyState icon={<Heart className="size-8" />} title={t("wishlist")} description="Vous n'avez pas encore ajouté d'article à vos favoris." />;
  }

  return <ProductGrid products={items.map((i) => i.product)} />;
}
