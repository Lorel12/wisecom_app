import { randomUUID } from "node:crypto";
import { env } from "../env.js";
import type { InitiatePaymentInput, InitiatePaymentResult, PaymentProviderClient } from "./types.js";

/**
 * Client MTN Mobile Money (Collection API) — Cameroun.
 * Documentation officielle : https://momodeveloper.mtn.com
 *
 * Flux :
 * 1. POST /collection/token/ (Basic auth api_user:api_key + Ocp-Apim-Subscription-Key) -> access_token
 * 2. POST /collection/v1_0/requesttopay (X-Reference-Id: UUID, X-Target-Environment, Ocp-Apim-Subscription-Key)
 *    -> 202 Accepted. Le X-Reference-Id envoyé sert de transactionRef pour la suite.
 * 3. GET /collection/v1_0/requesttopay/{X-Reference-Id} -> { status: PENDING|SUCCESSFUL|FAILED }
 *
 * C'est un paiement "push USSD" : le client reçoit une demande de confirmation sur son téléphone,
 * il n'y a donc pas d'URL de redirection (contrairement à Orange Money Web Payment).
 *
 * Tant que MOMO_SUBSCRIPTION_KEY n'est pas configuré, ce client fonctionne en mode simulation.
 */

type TokenCache = { accessToken: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

class MomoClient implements PaymentProviderClient {
  private get isConfigured() {
    return Boolean(env.momo.subscriptionKey && env.momo.apiUser && env.momo.apiKey);
  }

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!this.isConfigured) {
      return this.simulateInitiate(input);
    }

    const accessToken = await this.getAccessToken();
    const referenceId = randomUUID();
    const msisdn = input.phoneNumber.replace(/\D/g, "");

    const res = await fetch(`${env.momo.apiBase}/collection/v1_0/requesttopay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": env.momo.targetEnvironment,
        "Ocp-Apim-Subscription-Key": env.momo.subscriptionKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(input.amount),
        currency: "XAF",
        externalId: input.orderId,
        payer: { partyIdType: "MSISDN", partyId: msisdn },
        payerMessage: `Commande ${input.orderId}`,
        payeeNote: "WISECOM",
      }),
    });

    if (!res.ok && res.status !== 202) {
      throw new Error(`MTN MoMo: échec de la demande de paiement (${res.status})`);
    }

    return { transactionRef: referenceId, redirectUrl: null, raw: { referenceId } };
  }

  async verify(transactionRef: string) {
    if (!this.isConfigured) {
      return { status: "SUCCESS" as const, raw: { simulated: true, transactionRef } };
    }

    const accessToken = await this.getAccessToken();
    const res = await fetch(`${env.momo.apiBase}/collection/v1_0/requesttopay/${transactionRef}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Target-Environment": env.momo.targetEnvironment,
        "Ocp-Apim-Subscription-Key": env.momo.subscriptionKey,
      },
    });

    if (!res.ok) {
      return { status: "PENDING" as const, raw: { error: `MTN MoMo: statut indisponible (${res.status})` } };
    }

    const data = (await res.json()) as { status: string };
    const status = data.status === "SUCCESSFUL" ? "SUCCESS" : data.status === "FAILED" ? "FAILED" : "PENDING";
    return { status: status as "PENDING" | "SUCCESS" | "FAILED", raw: data };
  }

  private async getAccessToken(): Promise<string> {
    if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.accessToken;

    const basicAuth = Buffer.from(`${env.momo.apiUser}:${env.momo.apiKey}`).toString("base64");
    const res = await fetch(`${env.momo.apiBase}/collection/token/`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Ocp-Apim-Subscription-Key": env.momo.subscriptionKey,
      },
    });

    if (!res.ok) throw new Error(`MTN MoMo: authentification échouée (${res.status})`);

    const data = (await res.json()) as { access_token: string; expires_in: number };
    tokenCache = { accessToken: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
    return data.access_token;
  }

  private async simulateInitiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const transactionRef = randomUUID();
    return {
      transactionRef,
      redirectUrl: null,
      raw: { simulated: true, amount: input.amount, phoneNumber: input.phoneNumber },
    };
  }
}

export const momoClient = new MomoClient();
