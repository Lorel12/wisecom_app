"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageSpinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function NewProductPage() {
  const t = useTranslations("admin");
  const [categories, setCategories] = React.useState<Category[] | null>(null);

  React.useEffect(() => {
    api.get<{ categories: Category[] }>("/categories").then((res) => setCategories(res.categories)).catch(() => setCategories([]));
  }, []);

  return (
    <RequireAuth roles={["ADMIN", "SUPERADMIN"]}>
      <Container className="py-10">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{t("addProduct")}</h1>
        <div className="flex flex-col gap-8 lg:flex-row">
          <AdminNav />
          <div className="max-w-2xl flex-1">
            {categories === null ? <PageSpinner /> : <ProductForm categories={categories} />}
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
