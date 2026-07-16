export type InitiatePaymentInput = {
  orderId: string;
  amount: number;
  phoneNumber: string;
  returnUrl?: string;
};

export type InitiatePaymentResult = {
  transactionRef: string;
  /** URL vers laquelle rediriger le client (Orange Money Web Payment) ou null si paiement push (MoMo). */
  redirectUrl: string | null;
  raw: unknown;
};

export interface PaymentProviderClient {
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  verify(transactionRef: string): Promise<{ status: "PENDING" | "SUCCESS" | "FAILED"; raw: unknown }>;
}
