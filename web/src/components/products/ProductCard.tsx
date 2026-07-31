"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { PriceTag } from "@/components/ui/PriceTag";
import { useCartStore } from "@/store/cart";
import { cn, resolveImageUrl } from "@/lib/utils";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const locale = useLocale();
  const t = useTranslations("product");
  const addItem = useCartStore((s) => s.addItem);

  const name = locale === "en" && product.nameEn ? product.nameEn : product.name;
  const outOfStock = product.quantity <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow hover:shadow-elevated">
      <Link href={`/produits/${product.slug}`} className="relative block aspect-square overflow-hidden bg-secondary">
        {product.images[0] ? (
          <Image
            src={resolveImageUrl(product.images[0])}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ShoppingBag className="size-10" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <Badge variant={product.condition === "NEUF" ? "primary" : "neutral"}>
            {product.condition === "NEUF" ? t("conditionNew") : t("conditionUsed")}
          </Badge>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <Badge variant="accent">
              -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
            </Badge>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            toast.info(t("addedToWishlist"));
          }}
          aria-label="Favoris"
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-soft transition-colors hover:text-destructive"
        >
          <Heart className="size-4" />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {locale === "en" && product.category.nameEn ? product.category.nameEn : product.category.name}
          </span>
        )}
        <Link href={`/produits/${product.slug}`} className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary">
          {name}
        </Link>
        <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} locale={locale} />

        <button
          onClick={() =>
            !outOfStock &&
            (addItem(
              {
                id: product.id,
                name: product.name,
                nameEn: product.nameEn,
                slug: product.slug,
                price: product.price,
                images: product.images,
                quantity: product.quantity,
              },
              1,
            ),
            toast.success(t("addedToCart")))
          }
          disabled={outOfStock}
          className={cn(
            "mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
            outOfStock
              ? "cursor-not-allowed bg-secondary text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary-hover",
          )}
        >
          <ShoppingBag className="size-4" />
          {outOfStock ? t("outOfStock") : t("addToCart")}
        </button>
      </div>
    </div>
  );
}
