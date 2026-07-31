import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Les images uploadées sont servies par l'API (ex. "/uploads/xxx.jpg") et non par le site Next.js. */
export function resolveImageUrl(url: string) {
  return url.startsWith("/") ? `${API_BASE}${url}` : url;
}

export function formatPrice(amount: number, locale: string = "fr") {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CM" : "en-US", {
    maximumFractionDigits: 0,
  }).format(amount) + " FCFA";
}

export function formatDate(date: string | Date, locale: string = "fr") {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
