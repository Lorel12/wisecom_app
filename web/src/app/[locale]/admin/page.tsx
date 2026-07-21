"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Package, ShoppingCart, Users, Wallet } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { StatCard } from "@/components/admin/StatCard";
import { PageSpinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

type Stats = { productCount: number; orderCount: number; userCount: number; revenue: number };

export default function AdminDashboardPage() {
  return (
    <RequireAuth roles={["ADMIN", "SUPERADMIN"]}>
      <DashboardContent />
    </RequireAuth>
  );
}

function DashboardContent() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [stats, setStats] = React.useState<Stats | null>(null);

  React.useEffect(() => {
    api.get<Stats>("/admin/stats").then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{t("dashboard")}</h1>
      <div className="flex flex-col gap-8 lg:flex-row">
        <AdminNav />
        <div className="flex-1">
          {!stats ? (
            <PageSpinner />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Package} label={t("totalProducts")} value={stats.productCount} />
              <StatCard icon={ShoppingCart} label={t("totalOrders")} value={stats.orderCount} />
              <StatCard icon={Users} label={t("totalUsers")} value={stats.userCount} />
              <StatCard icon={Wallet} label={t("totalRevenue")} value={formatPrice(stats.revenue, locale)} />
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
