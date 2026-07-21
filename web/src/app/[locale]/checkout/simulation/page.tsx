"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cart";

/**
 * Page de simulation du paiement Orange Money Web Payment.
 * En production, cette étape est remplacée par la véritable page de paiement
 * hébergée par Orange, qui redirige ensuite vers l'URL de retour configurée.
 */
export default function PaymentSimulationPage() {
  return (
    <React.Suspense>
      <PaymentSimulationContent />
    </React.Suspense>
  );
}

function PaymentSimulationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clear = useCartStore((s) => s.clear);
  const [loading, setLoading] = React.useState(false);

  const ref = searchParams.get("ref");
  const provider = searchParams.get("provider") ?? "orange-money";

  async function resolve(success: boolean) {
    if (!ref) return;
    setLoading(true);
    try {
      await api.post(`/payments/webhook/${provider}`, { transactionRef: ref, success });
      if (success) clear();
      router.push(success ? "/compte/commandes" : "/checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Simulation Orange Money</CardTitle>
          <CardDescription>
            Environnement de démonstration — aucun véritable paiement n&apos;est effectué. Référence :{" "}
            <span className="font-mono text-xs">{ref}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button size="lg" loading={loading} onClick={() => resolve(true)}>
            <CheckCircle2 className="size-4" /> Simuler un paiement réussi
          </Button>
          <Button size="lg" variant="outline" loading={loading} onClick={() => resolve(false)}>
            <XCircle className="size-4" /> Simuler un échec
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
