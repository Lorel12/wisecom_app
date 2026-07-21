"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";

const STATUSES: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED"];

const STATUS_VARIANT: Record<OrderStatus, "neutral" | "primary" | "success" | "warning" | "danger"> = {
  PENDING: "neutral",
  PAID: "primary",
  PROCESSING: "primary",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
  FAILED: "danger",
};

export function OrdersTable() {
  const t = useTranslations("admin");
  const tOrderStatus = useTranslations("orderStatus");
  const locale = useLocale();
  const [orders, setOrders] = React.useState<Order[] | null>(null);

  const load = React.useCallback(() => {
    api.get<{ orders: Order[] }>("/orders").then((res) => setOrders(res.orders)).catch(() => setOrders([]));
  }, []);

  React.useEffect(() => load(), [load]);

  async function updateStatus(id: string, status: OrderStatus) {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success("Statut mis à jour.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la mise à jour.");
    }
  }

  if (orders === null) return <PageSpinner />;
  if (orders.length === 0) return <EmptyState icon={<ShoppingCart className="size-8" />} title="Aucune commande" />;

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{t("orders")}</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Statut</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium text-foreground">#{order.orderNumber}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {order.user?.firstName} {order.user?.lastName}
              </td>
              <td className="px-4 py-3 text-foreground">{formatPrice(order.total, locale)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt, locale)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[order.status]}>{tOrderStatus(order.status)}</Badge>
                  <Select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                    className="h-8 w-36 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {tOrderStatus(s)}
                      </option>
                    ))}
                  </Select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
