"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PaymentProvider } from "@/lib/types";

const PROVIDERS: { id: PaymentProvider; color: string; label: (t: (k: string) => string) => string }[] = [
  { id: "ORANGE_MONEY", color: "#FF6600", label: (t) => t("orangeMoney") },
  { id: "MTN_MOMO", color: "#FFCC00", label: (t) => t("mtnMomo") },
];

export function PaymentMethodPicker({
  value,
  onChange,
}: {
  value: PaymentProvider | null;
  onChange: (provider: PaymentProvider) => void;
}) {
  const t = useTranslations("checkout");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => onChange(provider.id)}
          className={cn(
            "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
            value === provider.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary",
          )}
        >
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: provider.color }}
          >
            {provider.id === "ORANGE_MONEY" ? "OM" : "MoMo"}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{provider.label(t)}</p>
            <p className="text-xs text-muted-foreground">Paiement mobile sécurisé</p>
          </div>
        </button>
      ))}
    </div>
  );
}
