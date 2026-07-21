"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageSpinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

export default function EditProductPage() {
  const t = useTranslations("admin");
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = React.useState<Product | null>(null);
  const [categories, setCategories] = React.useState<Category[] | null>(null);

  React.useEffect(() => {
    Promise.all([
      api.get<{ product: Product }>(`/products/${id}`).then((res) => res.product),
      api.get<{ categories: Category[] }>("/categories").then((res) => res.categories),
    ]).then(([p, c]) => {
      setProduct(p);
      setCategories(c);
    });
  }, [id]);

  return (
    <RequireAuth roles={["ADMIN", "SUPERADMIN"]}>
      <Container className="py-10">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{t("editProduct")}</h1>
        <div className="flex flex-col gap-8 lg:flex-row">
          <AdminNav />
          <div className="max-w-2xl flex-1">
            {!product || !categories ? <PageSpinner /> : <ProductForm product={product} categories={categories} />}
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
