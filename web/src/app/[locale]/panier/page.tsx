"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatPrice, resolveImageUrl } from "@/lib/utils";

const SHIPPING_FEE = 1000;

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const router = useRouter();
  const { lines, removeItem, setQuantity, subtotal } = useCartStore();
  const { user } = useAuthStore();

  const total = subtotal() + (lines.length > 0 ? SHIPPING_FEE : 0);

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>

      {lines.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-8" />}
          title={t("empty")}
          action={
            <Link href="/produits" className="text-sm font-medium text-primary hover:underline">
              {t("emptyCta")}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <ul className="flex flex-col gap-4 lg:col-span-2">
            {lines.map((line) => (
              <li key={line.product.id} className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {line.product.images[0] ? (
                    <Image src={resolveImageUrl(line.product.images[0])} alt={line.product.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <ShoppingBag className="size-6" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/produits/${line.product.slug}`} className="text-sm font-medium text-foreground hover:text-primary">
                      {locale === "en" && line.product.nameEn ? line.product.nameEn : line.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(line.product.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={t("remove")}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(line.product.id, line.quantity - 1)}
                        className="flex size-8 items-center justify-center rounded-md border border-border hover:bg-secondary"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
                      <button
                        onClick={() => setQuantity(line.product.id, Math.min(line.quantity + 1, line.product.quantity))}
                        className="flex size-8 items-center justify-center rounded-md border border-border hover:bg-secondary"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPrice(line.product.price * line.quantity, locale)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-4 text-base font-semibold text-foreground">{t("title")}</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{t("subtotal")}</span>
                <span>{formatPrice(subtotal(), locale)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t("shipping")}</span>
                <span>{formatPrice(SHIPPING_FEE, locale)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                <span>{t("total")}</span>
                <span>{formatPrice(total, locale)}</span>
              </div>
            </div>
            <Button
              className="mt-6 w-full cursor-pointer"
              size="lg"
              onClick={() => router.push(user ? "/checkout" : "/connexion?next=/checkout")}
            >
              {t("checkout")}
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}
