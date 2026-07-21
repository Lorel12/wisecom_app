"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Users as UsersIcon } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Role, User } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { useAuthStore } from "@/store/auth";

const ROLE_VARIANT: Record<Role, "neutral" | "primary" | "accent"> = {
  CLIENT: "neutral",
  ADMIN: "primary",
  SUPERADMIN: "accent",
};

export function UsersTable() {
  const t = useTranslations("admin");
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = React.useState<User[] | null>(null);

  const load = React.useCallback(() => {
    api.get<{ users: User[] }>("/admin/users").then((res) => setUsers(res.users)).catch(() => setUsers([]));
  }, []);

  React.useEffect(() => load(), [load]);

  async function setRole(id: string, role: "CLIENT" | "ADMIN") {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      toast.success("Rôle mis à jour.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la mise à jour du rôle.");
    }
  }

  if (currentUser?.role !== "SUPERADMIN") {
    return <EmptyState icon={<ShieldOff className="size-8" />} title={t("onlySuperadmin")} />;
  }

  if (users === null) return <PageSpinner />;
  if (users.length === 0) return <EmptyState icon={<UsersIcon className="size-8" />} title="Aucun utilisateur" />;

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">{t("role")}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium text-foreground">
                {user.firstName} {user.lastName}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3">
                <Badge variant={ROLE_VARIANT[user.role]}>
                  {user.role === "CLIENT" ? t("roleClient") : user.role === "ADMIN" ? t("roleAdmin") : t("roleSuperadmin")}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                {user.role === "SUPERADMIN" ? null : user.id === currentUser.id ? null : user.role === "ADMIN" ? (
                  <Button variant="outline" size="sm" onClick={() => setRole(user.id, "CLIENT")}>
                    <ShieldOff className="size-3.5" /> {t("revokeAdmin")}
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => setRole(user.id, "ADMIN")}>
                    <ShieldCheck className="size-3.5" /> {t("promoteToAdmin")}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
