import { env } from "../env.js";
import type { InitiatePaymentInput, InitiatePaymentResult, PaymentProviderClient } from "./types.js";

/**
 * Client MTN Mobile Money (Collection API) — Cameroun.
 * Documentation officielle : https://momodeveloper.mtn.com
 *
 * Flux réel à implémenter une fois les identifiants obtenus :
 * 1. POST /collection/token/ (Basic auth api_user:api_key, header Ocp-Apim-Subscription-Key) -> access_token
 * 2. POST /collection/v1_0/requesttopay
 *    headers: Authorization, X-Reference-Id (UUID), X-Target-Environment, Ocp-Apim-Subscription-Key
 *    body: { amount, currency: "EUR"|"XAF" selon env, externalId, payer: { partyIdType: "MSISDN", partyId }, payerMessage, payeeNote }
 *    -> 202 Accepted, X-Reference-Id sert de transactionRef
 * 3. GET /collection/v1_0/requesttopay/{X-Reference-Id} -> { status: PENDING|SUCCESSFUL|FAILED }
 * C'est un paiement "push USSD" : le client reçoit une demande de confirmation sur son téléphone,
 * il n'y a donc pas d'URL de redirection (contrairement à Orange Money Web Payment).
 *
 * Tant que MOMO_SUBSCRIPTION_KEY n'est pas configuré, ce client fonctionne en mode simulation.
 */
class MomoClient implements PaymentProviderClient {
  private get isConfigured() {
    return Boolean(env.momo.subscriptionKey && env.momo.apiUser && env.momo.apiKey);
  }

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!this.isConfigured) {
      return this.simulateInitiate(input);
    }
    // TODO(prod): remplacer par le véritable appel requesttopay ci-dessus.
    return this.simulateInitiate(input);
  }

  async verify(transactionRef: string) {
    if (!this.isConfigured) {
      return { status: "SUCCESS" as const, raw: { simulated: true, transactionRef } };
    }
    // TODO(prod): appeler GET /collection/v1_0/requesttopay/{referenceId}.
    return { status: "SUCCESS" as const, raw: { simulated: true, transactionRef } };
  }

  private async simulateInitiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const transactionRef = crypto.randomUUID();
    return {
      transactionRef,
      redirectUrl: null,
      raw: { simulated: true, amount: input.amount, phoneNumber: input.phoneNumber },
    };
  }
}

export const momoClient = new MomoClient();
