import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: required("CLIENT_ORIGIN", "http://localhost:3000"),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  cookieName: process.env.COOKIE_NAME ?? "boutique_session",
  contactEmail: process.env.CONTACT_EMAIL ?? "lorelngoumi@gmail.com",
  orangeMoney: {
    clientId: process.env.ORANGE_MONEY_CLIENT_ID ?? "",
    clientSecret: process.env.ORANGE_MONEY_CLIENT_SECRET ?? "",
    merchantKey: process.env.ORANGE_MONEY_MERCHANT_KEY ?? "",
    apiBase: process.env.ORANGE_MONEY_API_BASE ?? "https://api.orange.com",
  },
  momo: {
    subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY ?? "",
    apiUser: process.env.MOMO_API_USER ?? "",
    apiKey: process.env.MOMO_API_KEY ?? "",
    targetEnvironment: process.env.MOMO_TARGET_ENVIRONMENT ?? "sandbox",
    apiBase: process.env.MOMO_API_BASE ?? "https://sandbox.momodeveloper.mtn.com",
  },
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    password: process.env.SMTP_PASSWORD ?? "",
    from: process.env.MAIL_FROM ?? "WISECOM Global Trading and Supplies <no-reply@wisecom.cm>",
  },
};
