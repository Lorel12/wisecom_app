"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function NewsletterForm() {
  const t = useTranslations("home");
  const [email, setEmail] = React.useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        toast.success(t("newsletterMsg"));
        setEmail("");
      }}
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="vous@exemple.com"
        className="h-11 w-full rounded-lg border border-white/20 bg-white/10 px-3.5 text-sm text-white placeholder:text-primary-foreground/60 outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      />
      <button
        type="submit"
        className="h-11 shrink-0 rounded-lg bg-white px-5 text-sm font-medium text-primary transition-opacity hover:opacity-90 cursor-pointer"
      >
        {t("newsletterCta")}
      </button>
    </form>
  );
}
