"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";

export function ProductsTable() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [products, setProducts] = React.useState<Product[] | null>(null);

  const load = React.useCallback(() => {
    api
      .get<{ items: Product[] }>("/products?includeInactive=true&perPage=100")
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]));
  }, []);

  React.useEffect(() => load(), [load]);

  async function handleDelete(id: string) {
    try {
      await api.delete(`/products/${id}`);
      toast.success("Produit désactivé.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la suppression.");
    }
  }

  if (products === null) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Link href="/admin/produits/nouveau" className="inline-flex">
          <Button>
            <Plus className="size-4" /> {t("addProduct")}
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={<Package className="size-8" />} title="Aucun produit" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t("productName")}</th>
                <th className="px-4 py-3">{t("price")}</th>
                <th className="px-4 py-3">{t("quantity")}</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground">{formatPrice(product.price, locale)}</td>
                  <td className="px-4 py-3 text-foreground">{product.quantity}</td>
                  <td className="px-4 py-3">
                    <Badge variant={product.isActive ? "success" : "neutral"}>
                      {product.isActive ? t("active") : "Inactif"}
                    </Badge>
                    {product.isFeatured && (
                      <Badge variant="accent" className="ml-1.5">
                        {t("featured")}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Link
                        href={`/admin/produits/${product.id}`}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
