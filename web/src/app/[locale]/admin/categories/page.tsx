"use client";

import { useTranslations } from "next-intl";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { CategoryManager } from "@/components/admin/CategoryManager";

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");

  return (
    <RequireAuth roles={["ADMIN", "SUPERADMIN"]}>
      <Container className="py-10">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{t("categories")}</h1>
        <div className="flex flex-col gap-8 lg:flex-row">
          <AdminNav />
          <div className="flex-1">
            <CategoryManager />
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
