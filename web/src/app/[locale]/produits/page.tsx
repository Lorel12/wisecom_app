import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { CatalogFilters } from "@/components/products/CatalogFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CatalogPagination } from "@/components/products/CatalogPagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { PackageSearch } from "lucide-react";

type SearchParams = Record<string, string | undefined>;

async function getCategories(): Promise<Category[]> {
  try {
    const { categories } = await api.get<{ categories: Category[] }>("/categories");
    return categories;
  } catch {
    return [];
  }
}

async function getProducts(searchParams: SearchParams) {
  const params = new URLSearchParams();
  for (const key of ["category", "search", "condition", "sort", "page"]) {
    const value = searchParams[key];
    if (value) params.set(key, value);
  }
  try {
    return await api.get<{ items: Product[]; total: number; page: number; totalPages: number }>(
      `/products?${params.toString()}`,
    );
  } catch {
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const t = await getTranslations("catalog");
  const [categories, { items, total, page, totalPages }] = await Promise.all([
    getCategories(),
    getProducts(params),
  ]);

  return (
    <Container className="py-10">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("resultsCount", { count: total })}</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <CatalogFilters categories={categories} />

        <div className="flex-1">
          {items.length === 0 ? (
            <EmptyState icon={<PackageSearch className="size-8" />} title={t("noResults")} />
          ) : (
            <>
              <ProductGrid products={items} />
              <div className="mt-10">
                <CatalogPagination page={page} totalPages={totalPages} />
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
