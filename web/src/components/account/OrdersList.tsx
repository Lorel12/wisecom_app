"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Package } from "lucide-react";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";

const STATUS_VARIANT: Record<Order["status"], "neutral" | "primary" | "success" | "warning" | "danger"> = {
  PENDING: "neutral",
  PAID: "primary",
  PROCESSING: "primary",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
  FAILED: "danger",
};

export function OrdersList() {
  const t = useTranslations("account");
  const tOrderStatus = useTranslations("orderStatus");
  const locale = useLocale();
  const [orders, setOrders] = React.useState<Order[] | null>(null);

  React.useEffect(() => {
    api.get<{ orders: Order[] }>("/orders/mine").then((res) => setOrders(res.orders)).catch(() => setOrders([]));
  }, []);

  if (orders === null) return <PageSpinner />;

  if (orders.length === 0) {
    return <EmptyState icon={<Package className="size-8" />} title={t("noOrders")} />;
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order.id} className="rounded-xl border border-border bg-card p-5 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t("orderNumber")} #{order.orderNumber}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("orderDate")} {formatDate(order.createdAt, locale)}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[order.status]}>{tOrderStatus(order.status)}</Badge>
          </div>
          <ul className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm font-semibold text-foreground">
            <span>Total</span>
            <span>{formatPrice(order.total, locale)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
