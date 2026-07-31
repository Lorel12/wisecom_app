"use client";

import { useTranslations } from "next-intl";
import { LayoutDashboard, Package, ShoppingCart, Tags, Users } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

export function AdminNav() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const items = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/produits", label: t("products"), icon: Package },
    { href: "/admin/categories", label: t("categories"), icon: Tags },
    { href: "/admin/commandes", label: t("orders"), icon: ShoppingCart },
    ...(user?.role === "SUPERADMIN" ? [{ href: "/admin/utilisateurs", label: t("users"), icon: Users }] : []),
  ];

  return (
    <nav className="flex gap-2 overflow-x-auto lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4" /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
