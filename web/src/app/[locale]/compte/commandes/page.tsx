"use client";

import { useTranslations } from "next-intl";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { AccountNav } from "@/components/account/AccountNav";
import { OrdersList } from "@/components/account/OrdersList";

export default function OrdersPage() {
  const t = useTranslations("account");

  return (
    <RequireAuth>
      <Container className="py-10">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>
        <div className="flex flex-col gap-8 lg:flex-row">
          <AccountNav />
          <div className="flex-1">
            <OrdersList />
          </div>
        </div>
      </Container>
    </RequireAuth>
  );
}
