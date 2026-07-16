import { env } from "../env.js";
import type { InitiatePaymentInput, InitiatePaymentResult, PaymentProviderClient } from "./types.js";

/**
 * Client Orange Money Web Payment (Cameroun).
 * Documentation officielle : https://developer.orange.com/apis/om-webpay/overview
 *
 * Flux réel à implémenter une fois les identifiants marchands obtenus :
 * 1. POST /oauth/v3/token (Basic auth client_id:client_secret) -> access_token
 * 2. POST https://api.orange.com/orange-money-webpay/{cm}/v1/webpayment
 *    body: { merchant_key, currency: "XAF", order_id, amount, return_url, cancel_url, notif_url, lang: "fr" }
 *    -> { payment_url, pay_token, notif_token }
 * 3. Rediriger le client vers payment_url.
 * 4. Orange notifie notif_url (webhook) avec le statut final -> vérifier via /v1/transactionstatus.
 *
 * Tant que ORANGE_MONEY_CLIENT_ID n'est pas configuré, ce client fonctionne en mode simulation
 * pour permettre de développer et tester le flux de checkout de bout en bout.
 */
class OrangeMoneyClient implements PaymentProviderClient {
  private get isConfigured() {
    return Boolean(env.orangeMoney.clientId && env.orangeMoney.clientSecret && env.orangeMoney.merchantKey);
  }

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!this.isConfigured) {
      return this.simulateInitiate(input);
    }

    // TODO(prod): remplacer par le véritable appel à l'API Orange Money ci-dessus.
    return this.simulateInitiate(input);
  }

  async verify(transactionRef: string) {
    if (!this.isConfigured) {
      return { status: "SUCCESS" as const, raw: { simulated: true, transactionRef } };
    }
    // TODO(prod): appeler /v1/transactionstatus avec pay_token.
    return { status: "SUCCESS" as const, raw: { simulated: true, transactionRef } };
  }

  private async simulateInitiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const transactionRef = `OM-SIM-${input.orderId}-${Date.now()}`;
    return {
      transactionRef,
      redirectUrl: `${input.returnUrl ?? env.clientOrigin}/checkout/simulation?provider=orange-money&ref=${transactionRef}`,
      raw: { simulated: true, amount: input.amount, phoneNumber: input.phoneNumber },
    };
  }
}

export const orangeMoneyClient = new OrangeMoneyClient();
