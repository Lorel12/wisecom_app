"use client";

import * as React from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useAuthStore } from "@/store/auth";
import { PageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ShieldAlert } from "lucide-react";
import type { Role } from "@/lib/types";

export function RequireAuth({
  roles,
  children,
}: {
  roles?: Role[];
  children: React.ReactNode;
}) {
  const { user, status } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (status === "ready" && !user) {
      router.replace(`/connexion?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, user, router, pathname]);

  if (status !== "ready" || !user) {
    return <PageSpinner />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="py-16">
        <EmptyState icon={<ShieldAlert className="size-8" />} title="Accès refusé" description="Vous n'avez pas les droits nécessaires pour accéder à cette page." />
      </div>
    );
  }

  return <>{children}</>;
}
