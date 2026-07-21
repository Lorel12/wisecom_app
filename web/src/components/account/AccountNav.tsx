"use client";

import { useTranslations } from "next-intl";
import { Heart, MapPin, Package, User } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function AccountNav() {
  const t = useTranslations("account");
  const pathname = usePathname();

  const items = [
    { href: "/compte", label: t("profile"), icon: User },
    { href: "/compte/commandes", label: t("orders"), icon: Package },
    { href: "/compte/adresses", label: t("addresses"), icon: MapPin },
    { href: "/compte/favoris", label: t("wishlist"), icon: Heart },
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
