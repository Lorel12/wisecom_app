"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cart";

/**
 * Page de retour après le paiement Orange Money Web Payment (return_url).
 * Orange redirige ici une fois la transaction terminée côté client ; on vérifie
 * le statut réel auprès de notre API plutôt que de faire confiance aux paramètres d'URL.
 */
export default function CheckoutReturnPage() {
  return (
    <React.Suspense>
      <CheckoutReturnContent />
    </React.Suspense>
  );
}

function CheckoutReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clear = useCartStore((s) => s.clear);
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = React.useState<"checking" | "success" | "failed">("checking");

  React.useEffect(() => {
    if (!orderId) return;
    let attempt = 0;
    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      try {
        const { payment } = await api.get<{ payment: { status: string } }>(`/payments/${orderId}/status`);
        if (payment.status === "SUCCESS") {
          clear();
          setStatus("success");
          return;
        }
        if (payment.status === "FAILED") {
          setStatus("failed");
          return;
        }
      } catch {
        // on continue les tentatives
      }
      attempt += 1;
      if (attempt > 15) {
        setStatus("failed");
        return;
      }
      setTimeout(poll, 2000);
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId, clear]);

  if (status === "checking") {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Vérification du paiement en cours…</p>
      </Container>
    );
  }

  if (status === "success") {
    return (
      <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle2 className="size-16 text-success" />
        <h1 className="text-2xl font-semibold text-foreground">Paiement confirmé</h1>
        <p className="max-w-md text-sm text-muted-foreground">Merci pour votre achat ! Votre commande est en cours de traitement.</p>
        <Button onClick={() => router.push("/compte/commandes")} className="mt-4">
          Voir mes commandes
        </Button>
      </Container>
    );
  }

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <XCircle className="size-16 text-destructive" />
      <h1 className="text-2xl font-semibold text-foreground">Paiement non confirmé</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Le paiement n&apos;a pas pu être confirmé. Vous pouvez réessayer depuis votre panier.
      </p>
      <Button onClick={() => router.push("/checkout")} className="mt-4">
        Réessayer
      </Button>
    </Container>
  );
}
