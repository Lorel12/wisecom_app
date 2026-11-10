"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, MapPin, Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PaymentMethodPicker } from "@/components/checkout/PaymentMethodPicker";
import { api, ApiError } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import type { Address, Order, PaymentProvider } from "@/lib/types";

const SHIPPING_FEE = 1000;
type Step = "form" | "processing" | "pending" | "success";

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutContent />
    </RequireAuth>
  );
}

function CheckoutContent() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const { lines, subtotal, clear } = useCartStore();

  const [addresses, setAddresses] = React.useState<Address[]>([]);
  const [addressId, setAddressId] = React.useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = React.useState(false);
  const [newAddress, setNewAddress] = React.useState({ fullName: "", phone: "", district: "", landmark: "" });
  const [provider, setProvider] = React.useState<PaymentProvider | null>(null);
  const [paymentPhone, setPaymentPhone] = React.useState("");
  const [note, setNote] = React.useState("");
  const [step, setStep] = React.useState<Step>("form");
  const [order, setOrder] = React.useState<Order | null>(null);

  React.useEffect(() => {
    api
      .get<{ addresses: Address[] }>("/addresses")
      .then((res) => {
        setAddresses(res.addresses);
        const def = res.addresses.find((a) => a.isDefault) ?? res.addresses[0];
        if (def) setAddressId(def.id);
        else setShowNewAddress(true);
      })
      .catch(() => setShowNewAddress(true));
  }, []);

  React.useEffect(() => {
    if (lines.length === 0 && step === "form") {
      router.replace("/panier");
    }
  }, [lines.length, router, step]);

  const total = subtotal() + SHIPPING_FEE;

  async function ensureAddress(): Promise<string | undefined> {
    if (!showNewAddress && addressId) return addressId;
    if (!newAddress.fullName || !newAddress.phone || !newAddress.district) {
      toast.error("Merci de renseigner votre adresse de livraison.");
      return undefined;
    }
    const { address } = await api.post<{ address: Address }>("/addresses", {
      label: "Livraison",
      fullName: newAddress.fullName,
      phone: newAddress.phone,
      district: newAddress.district,
      landmark: newAddress.landmark || undefined,
      isDefault: addresses.length === 0,
    });
    return address.id;
  }

  async function handlePay() {
    if (!provider) return toast.error(t("paymentMethod"));
    if (!paymentPhone) return toast.error(t("phoneNumberForPayment"));

    setStep("processing");
    try {
      const resolvedAddressId = await ensureAddress();
      if (!resolvedAddressId) {
        setStep("form");
        return;
      }

      const { order: createdOrder } = await api.post<{ order: Order }>("/orders", {
        addressId: resolvedAddressId,
        note: note || undefined,
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      });
      setOrder(createdOrder);

      const { redirectUrl } = await api.post<{ redirectUrl: string | null }>("/payments/initiate", {
        orderId: createdOrder.id,
        provider,
        phoneNumber: paymentPhone,
      });

      if (redirectUrl) {
        window.location.assign(redirectUrl);
        return;
      }

      setStep("pending");
      pollPaymentStatus(createdOrder.id);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la commande.");
      setStep("form");
    }
  }

  function pollPaymentStatus(orderId: string, attempt = 0) {
    if (attempt > 15) {
      setStep("pending");
      return;
    }
    setTimeout(async () => {
      try {
        const { payment } = await api.get<{ payment: { status: string } }>(`/payments/${orderId}/status`);
        if (payment.status === "SUCCESS") {
          clear();
          setStep("success");
        } else if (payment.status === "FAILED") {
          toast.error("Le paiement a échoué. Veuillez réessayer.");
          setStep("form");
        } else {
          pollPaymentStatus(orderId, attempt + 1);
        }
      } catch {
        pollPaymentStatus(orderId, attempt + 1);
      }
    }, 2000);
  }

  if (step === "success" && order) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle2 className="size-16 text-success" />
        <h1 className="text-2xl font-semibold text-foreground">{t("orderPlaced")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{t("orderPlacedDesc")}</p>
        <p className="text-sm font-medium text-foreground">#{order.orderNumber}</p>
        <Button onClick={() => router.push("/compte/commandes")} className="mt-4">
          Voir mes commandes
        </Button>
      </Container>
    );
  }

  if (step === "pending") {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="size-16 animate-pulse rounded-full bg-primary/10" />
        <h1 className="text-xl font-semibold text-foreground">{t("paymentPending")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Validez la transaction sur votre téléphone ({paymentPhone}) pour finaliser votre commande.
        </p>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
              <MapPin className="size-4" /> {t("deliveryAddress")}
            </h2>

            {addresses.length > 0 && !showNewAddress && (
              <div className="flex flex-col gap-2">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    onClick={() => setAddressId(address.id)}
                    className={cn(
                      "rounded-xl border-2 p-4 text-left text-sm transition-colors",
                      addressId === address.id ? "border-primary bg-primary/5" : "border-border hover:bg-secondary",
                    )}
                  >
                    <p className="font-medium text-foreground">
                      {address.label} — {address.fullName}
                    </p>
                    <p className="text-muted-foreground">
                      {address.phone} · {address.district}, {address.city}
                    </p>
                  </button>
                ))}
                <Button variant="outline" size="sm" className="w-fit" onClick={() => setShowNewAddress(true)}>
                  <Plus className="size-4" /> {t("addAddress")}
                </Button>
              </div>
            )}

            {(showNewAddress || addresses.length === 0) && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label={t("fullName")}>
                    <Input value={newAddress.fullName} onChange={(e) => setNewAddress((a) => ({ ...a, fullName: e.target.value }))} />
                  </Field>
                  <Field label={t("phone")}>
                    <Input value={newAddress.phone} onChange={(e) => setNewAddress((a) => ({ ...a, phone: e.target.value }))} />
                  </Field>
                </div>
                <Field label={t("district")}>
                  <Input value={newAddress.district} onChange={(e) => setNewAddress((a) => ({ ...a, district: e.target.value }))} />
                </Field>
                <Field label={t("landmark")}>
                  <Input value={newAddress.landmark} onChange={(e) => setNewAddress((a) => ({ ...a, landmark: e.target.value }))} />
                </Field>
                {addresses.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-fit" onClick={() => setShowNewAddress(false)}>
                    Utiliser une adresse existante
                  </Button>
                )}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">{t("paymentMethod")}</h2>
            <PaymentMethodPicker value={provider} onChange={setProvider} />
            {provider && (
              <Field label={t("phoneNumberForPayment")} className="mt-4" hint="+237 6XX XXX XXX">
                <Input value={paymentPhone} onChange={(e) => setPaymentPhone(e.target.value)} placeholder="6XX XXX XXX" />
              </Field>
            )}
          </section>

          <section>
            <Field label={t("note")}>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
            </Field>
          </section>
        </div>

        <div className="h-fit rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="mb-4 text-base font-semibold text-foreground">{t("orderSummary")}</h2>
          <ul className="flex flex-col gap-2 border-b border-border pb-4 text-sm">
            {lines.map((line) => (
              <li key={line.product.id} className="flex justify-between text-muted-foreground">
                <span>
                  {line.quantity} × {locale === "en" && line.product.nameEn ? line.product.nameEn : line.product.name}
                </span>
                <span>{formatPrice(line.product.price * line.quantity, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 py-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total</span>
              <span>{formatPrice(subtotal(), locale)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Livraison</span>
              <span>{formatPrice(SHIPPING_FEE, locale)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-border pt-4 text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatPrice(total, locale)}</span>
          </div>
          <Button className="mt-6 w-full" size="lg" loading={step === "processing"} onClick={handlePay}>
            {t("payNow")}
          </Button>
        </div>
      </div>
    </Container>
  );
}
