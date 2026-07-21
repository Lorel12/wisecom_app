"use client";

import { useTranslations } from "next-intl";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default function AdminProductsPage() {
  const t = useTranslations("admin");

  return (
    <RequireAuth roles={["ADMIN", "SUPERADMIN"]}>
      <Container className="py-10">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{t("products")}</h1>
        <div className="flex flex-col gap-8 lg:flex-row">
          <AdminNav />
          <div className="flex-1">
            <ProductsTable />
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
