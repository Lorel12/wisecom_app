"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function CatalogFilters({ categories }: { categories: Category[] }) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilters = ["category", "condition", "sort", "search"].some((k) => searchParams.get(k));

  const content = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">{t("allCategories")}</label>
        <Select value={searchParams.get("category") ?? ""} onChange={(e) => updateParam("category", e.target.value)}>
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">{t("condition")}</label>
        <Select value={searchParams.get("condition") ?? ""} onChange={(e) => updateParam("condition", e.target.value)}>
          <option value="">{t("allCategories")}</option>
          <option value="NEUF">Neuf</option>
          <option value="OCCASION">Occasion</option>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">{t("sortBy")}</label>
        <Select value={searchParams.get("sort") ?? "recent"} onChange={(e) => updateParam("sort", e.target.value)}>
          <option value="recent">{t("sortRecent")}</option>
          <option value="price_asc">{t("sortPriceAsc")}</option>
          <option value="price_desc">{t("sortPriceDesc")}</option>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          <X className="size-4" /> Réinitialiser
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden w-56 shrink-0 lg:block">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="size-4" /> {t("filters")}
        </h2>
        {content}
      </div>

      <div className="mb-4 lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          <SlidersHorizontal className="size-4" /> {t("filters")}
        </Button>
        {open && <div className="mt-4 rounded-xl border border-border bg-card p-4">{content}</div>}
      </div>
    </>
  );
}
