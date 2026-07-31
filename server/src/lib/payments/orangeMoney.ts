import { env } from "../env.js";
import type { InitiatePaymentInput, InitiatePaymentResult, PaymentProviderClient } from "./types.js";

/**
 * Client Orange Money Web Payment (Cameroun).
 * Documentation officielle : https://developer.orange.com/apis/om-webpay/overview
 *
 * Flux :
 * 1. POST /oauth/v3/token (Basic auth client_id:client_secret) -> access_token
 * 2. POST /orange-money-webpay/cm/v1/webpayment -> { payment_url, pay_token, notif_token }
 * 3. Rediriger le client vers payment_url.
 * 4. Vérifier via /orange-money-webpay/cm/v1/transactionstatus (pay_token + order_id + amount).
 *
 * Tant que ORANGE_MONEY_CLIENT_ID n'est pas configuré, ce client fonctionne en mode simulation
 * pour permettre de développer et tester le flux de checkout de bout en bout.
 */

type TokenCache = { accessToken: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

// pay_token retourné à l'étape 2, nécessaire pour vérifier le statut à l'étape 4.
const payTokenByRef = new Map<string, { payToken: string; orderId: string; amount: number }>();

class OrangeMoneyClient implements PaymentProviderClient {
  private get isConfigured() {
    return Boolean(env.orangeMoney.clientId && env.orangeMoney.clientSecret && env.orangeMoney.merchantKey);
  }

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!this.isConfigured) {
      return this.simulateInitiate(input);
    }

    const accessToken = await this.getAccessToken();
    const returnUrl = input.returnUrl ?? env.clientOrigin;

    const res = await fetch(`${env.orangeMoney.apiBase}/orange-money-webpay/cm/v1/webpayment`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_key: env.orangeMoney.merchantKey,
        currency: "XAF",
        order_id: input.orderId,
        amount: input.amount,
        return_url: `${returnUrl}/checkout/retour?orderId=${input.orderId}`,
        cancel_url: `${returnUrl}/checkout?payment=cancelled`,
        notif_url: `${env.clientOrigin.replace(/\/$/, "")}/api/payments/webhook/orange-money`,
        lang: "fr",
        reference: input.orderId,
      }),
    });

    if (!res.ok) {
      throw new Error(`Orange Money: échec de création du paiement (${res.status})`);
    }

    const data = (await res.json()) as { payment_url: string; pay_token: string; notif_token: string };
    payTokenByRef.set(input.orderId, { payToken: data.pay_token, orderId: input.orderId, amount: input.amount });

    return { transactionRef: input.orderId, redirectUrl: data.payment_url, raw: data };
  }

  async verify(transactionRef: string) {
    if (!this.isConfigured) {
      return { status: "SUCCESS" as const, raw: { simulated: true, transactionRef } };
    }

    const cached = payTokenByRef.get(transactionRef);
    if (!cached) {
      return { status: "PENDING" as const, raw: { error: "pay_token inconnu pour cette référence" } };
    }

    const accessToken = await this.getAccessToken();
    const res = await fetch(`${env.orangeMoney.apiBase}/orange-money-webpay/cm/v1/transactionstatus`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: cached.orderId, amount: cached.amount, pay_token: cached.payToken }),
    });

    if (!res.ok) {
      return { status: "PENDING" as const, raw: { error: `Orange Money: statut indisponible (${res.status})` } };
    }

    const data = (await res.json()) as { status: string };
    const status = data.status === "SUCCESS" ? "SUCCESS" : data.status === "FAILED" ? "FAILED" : "PENDING";
    return { status: status as "PENDING" | "SUCCESS" | "FAILED", raw: data };
  }

  private async getAccessToken(): Promise<string> {
    if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.accessToken;

    const basicAuth = Buffer.from(`${env.orangeMoney.clientId}:${env.orangeMoney.clientSecret}`).toString("base64");
    const res = await fetch(`${env.orangeMoney.apiBase}/oauth/v3/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) throw new Error(`Orange Money: authentification échouée (${res.status})`);

    const data = (await res.json()) as { access_token: string; expires_in: number };
    tokenCache = { accessToken: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
    return data.access_token;
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
