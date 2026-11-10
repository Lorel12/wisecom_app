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

/**
 * Tant que la configuration SMTP complète n'est pas renseignée, l'email est simulé
 * dans les logs du serveur — pratique pour développer sans boîte mail réelle.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const client = getTransporter();

  if (!client) {
    console.log(`\n[email:simulation] Réinitialisation de mot de passe pour ${to}`);
    console.log(`[email:simulation] Lien : ${resetUrl}\n`);
    return;
  }

  await client.sendMail({
    from: env.smtp.from,
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
  const client = getTransporter();
  const { name, email, message } = input;

  if (!client) {
    return false;
  }

  await client.sendMail({
    from: env.smtp.from,
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
  return true;
}
