"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useTranslations, useLocale } from "next-intl";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/store/cart";
import { buttonVariants } from "@/components/ui/Button";
import { cn, formatPrice, resolveImageUrl } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHydrated } from "@/lib/use-hydrated";

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { isOpen, close, lines, removeItem, setQuantity, subtotal } = useCartStore();
  const mounted = useHydrated();

  React.useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm" onClick={close} aria-hidden />
      <div className="relative flex h-full w-full max-w-md flex-col bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ShoppingBag className="size-5" /> {t("title")}
          </h2>
          <button
            onClick={close}
            aria-label={t("title")}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="size-8" />}
              title={t("empty")}
              action={
                <Link href="/produits" onClick={close} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  {t("emptyCta")}
                </Link>
              }
            />
          ) : (
            <ul className="flex flex-col gap-5">
              {lines.map((line) => (
                <li key={line.product.id} className="flex gap-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {line.product.images[0] ? (
                      <Image src={resolveImageUrl(line.product.images[0])} alt={line.product.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ShoppingBag className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/produits/${line.product.slug}`}
                        onClick={close}
                        className="text-sm font-medium text-foreground hover:text-primary line-clamp-2"
                      >
                        {locale === "en" && line.product.nameEn ? line.product.nameEn : line.product.name}
                      </Link>
                      <button
                        onClick={() => removeItem(line.product.id)}
                        aria-label={t("remove")}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(line.product.price, locale)} · {t("each")}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(line.product.id, line.quantity - 1)}
                        className="flex size-7 items-center justify-center rounded-md border border-border hover:bg-secondary"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                      <button
                        onClick={() => setQuantity(line.product.id, Math.min(line.quantity + 1, line.product.quantity))}
                        className="flex size-7 items-center justify-center rounded-md border border-border hover:bg-secondary"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-border p-5">
            <div className="mb-4 flex items-center justify-between text-base font-semibold text-foreground">
              <span>{t("subtotal")}</span>
              <span>{formatPrice(subtotal(), locale)}</span>
            </div>
            <Link href="/panier" onClick={close} className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              {t("checkout")}
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
