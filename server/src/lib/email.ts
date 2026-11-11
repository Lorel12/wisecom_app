import nodemailer from "nodemailer";
import { env } from "./env.js";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.password) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.password },
    });
  }
  return transporter;
}

export function isEmailConfigured() {
  return Boolean(env.resendApiKey || getTransporter());
}

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (env.resendApiKey) {
    const { replyTo, ...email } = input;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.smtp.from,
        ...email,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Le fournisseur d'e-mail a refusé le message (${response.status}).`);
    }

    return true;
  }

  const client = getTransporter();
  if (!client) return false;
  await client.sendMail({ from: env.smtp.from, ...input });
  return true;
}

/**
 * Les e-mails passent par l'API Resend en production et peuvent utiliser SMTP en local.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return sendEmail({
    to,
    subject: "Réinitialisation de votre mot de passe — WISECOM",
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe sur WISECOM Global Trading and Supplies.</p>
      <p><a href="${resetUrl}">Cliquez ici pour choisir un nouveau mot de passe</a> (valable 1 heure).</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `,
  });
}

export async function sendContactMessage(input: { name: string; email: string; message: string }): Promise<boolean> {
  const { name, email, message } = input;

  return sendEmail({
    to: env.contactEmail,
    replyTo: email,
    subject: `Nouveau message de contact — ${name}`,
    html: `
      <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
      <p><strong>Email :</strong> ${escapeHtml(email)}</p>
      <p><strong>Message :</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
    `,
  });
}
