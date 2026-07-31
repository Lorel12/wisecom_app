"use client";

import { useTranslations } from "next-intl";
import { LayoutDashboard, LogOut, Package, User as UserIcon, Heart } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/store/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

export function UserMenu() {
  const t = useTranslations("nav");
  const { user, status, logout } = useAuthStore();
  const router = useRouter();

  if (status !== "ready") {
    return <div className="size-9 animate-pulse rounded-full bg-secondary" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/connexion" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          {t("login")}
        </Link>
        <Link href="/inscription" className={cn(buttonVariants({ variant: "primary", size: "sm" }), "hidden sm:inline-flex")}>
          {t("register")}
        </Link>
      </div>
    );
  }

  const isStaff = user.role === "ADMIN" || user.role === "SUPERADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatarUrl} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              {user.firstName} {user.lastName}
            </p>
            {user.role === "SUPERADMIN" && <Badge variant="accent">Super-admin</Badge>}
            {user.role === "ADMIN" && <Badge variant="primary">Admin</Badge>}
          </div>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <Link href="/compte" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">
          <UserIcon className="size-4" /> {t("account")}
        </Link>
        <Link href="/compte/commandes" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">
          <Package className="size-4" /> {t("orders")}
        </Link>
        <Link href="/compte/favoris" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">
          <Heart className="size-4" /> {t("wishlist")}
        </Link>
        {isStaff && (
          <>
            <DropdownMenuSeparator />
            <Link href="/admin" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary">
              <LayoutDashboard className="size-4" /> {t("admin")}
            </Link>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-4" /> {t("logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
