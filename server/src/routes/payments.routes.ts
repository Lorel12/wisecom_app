import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { orangeMoneyClient } from "../lib/payments/orangeMoney.js";
import { momoClient } from "../lib/payments/momo.js";
import type { PaymentProviderClient } from "../lib/payments/types.js";

export const paymentsRouter = Router();

function clientFor(provider: "ORANGE_MONEY" | "MTN_MOMO"): PaymentProviderClient {
  return provider === "ORANGE_MONEY" ? orangeMoneyClient : momoClient;
}

const initiateSchema = z.object({
  orderId: z.string(),
  provider: z.enum(["ORANGE_MONEY", "MTN_MOMO"]),
  phoneNumber: z.string().min(8),
});

paymentsRouter.post("/initiate", authenticate, async (req, res) => {
  const parsed = initiateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Données invalides." });
  const { orderId, provider, phoneNumber } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ error: "Commande introuvable." });
  if (order.userId !== req.user!.sub) return res.status(403).json({ error: "Accès refusé." });
  if (order.status !== "PENDING") return res.status(409).json({ error: "Cette commande a déjà été traitée." });

  const client = clientFor(provider);
  const result = await client.initiate({ orderId, amount: order.total, phoneNumber });

  const payment = await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      provider,
      phoneNumber,
      amount: order.total,
      transactionRef: result.transactionRef,
      providerRaw: result.raw as never,
    },
    update: {
      provider,
      phoneNumber,
      transactionRef: result.transactionRef,
      providerRaw: result.raw as never,
      status: "PENDING",
    },
  });

  res.status(201).json({ payment, redirectUrl: result.redirectUrl });
});

paymentsRouter.get("/:orderId/status", authenticate, async (req, res) => {
  const payment = await prisma.payment.findUnique({ where: { orderId: req.params.orderId } });
  if (!payment) return res.status(404).json({ error: "Paiement introuvable." });

  if (payment.status === "PENDING" && payment.transactionRef) {
    const client = clientFor(payment.provider as "ORANGE_MONEY" | "MTN_MOMO");
    const result = await client.verify(payment.transactionRef);
    if (result.status !== "PENDING") {
      await prisma.$transaction([
        prisma.payment.update({ where: { id: payment.id }, data: { status: result.status } }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: result.status === "SUCCESS" ? "PAID" : "FAILED" },
        }),
      ]);
      payment.status = result.status;
    }
  }

  res.json({ payment });
});

/**
 * Webhook appelé par Orange Money / MTN MoMo pour notifier le résultat final du paiement.
 * À sécuriser en production (vérification de signature / IP allowlist selon la doc du fournisseur).
 */
paymentsRouter.post("/webhook/:provider", async (req, res) => {
  const provider = req.params.provider === "orange-money" ? "ORANGE_MONEY" : "MTN_MOMO";
  const transactionRef = (req.body?.transactionRef ?? req.query.ref) as string | undefined;
  if (!transactionRef) return res.status(400).json({ error: "Référence de transaction manquante." });

  const payment = await prisma.payment.findUnique({ where: { transactionRef } });
  if (!payment) return res.status(404).json({ error: "Paiement introuvable." });

  // En mode simulation (pas d'identifiants marchand configurés), le body du webhook
  // peut porter un indicateur explicite "success" pour piloter le scénario testé.
  const simulatedOverride = typeof req.body?.success === "boolean" ? (req.body.success as boolean) : undefined;
  const result =
    simulatedOverride !== undefined
      ? { status: (simulatedOverride ? "SUCCESS" : "FAILED") as "SUCCESS" | "FAILED", raw: req.body }
      : await clientFor(provider).verify(transactionRef);

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: result.status, providerRaw: req.body } }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: result.status === "SUCCESS" ? "PAID" : result.status === "FAILED" ? "FAILED" : "PENDING" },
    }),
  ]);

  res.status(200).json({ received: true });
});
