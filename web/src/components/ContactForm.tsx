"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});
type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [mailtoLink, setMailtoLink] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setStatus("idle");
    setErrorMessage(null);
    setMailtoLink(null);
    try {
      await api.post("/contact", values);
      setStatus("success");
      reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof ApiError && err.status === 503
          ? t("formSmtpUnavailable")
          : t("formError"),
      );
      const subject = encodeURIComponent("Message de contact — WISECOM");
      const body = encodeURIComponent(`Nom : ${values.name}\nE-mail : ${values.email}\n\n${values.message}`);
      setMailtoLink(`mailto:lorelngoumi@gmail.com?subject=${subject}&body=${body}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field label={t("formName")} htmlFor="name" error={errors.name?.message}>
        <Input id="name" autoComplete="name" {...register("name")} error={!!errors.name} />
      </Field>
      <Field label={t("formEmail")} htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...register("email")} error={!!errors.email} required/>
      </Field>
      <Field label={t("formMessage")} htmlFor="message" error={errors.message?.message}>
        <Textarea id="message" rows={5} {...register("message")} error={!!errors.message} required/>
      </Field>

      {status === "success" && <p role="status" className="text-sm text-primary">{t("formSuccess")}</p>}
      {status === "error" && (
        <div role="alert" className="text-sm text-destructive">
          <p>{errorMessage}</p>
          {mailtoLink && (
            <p className="mt-1">
              {t("formEmailFallback")}{" "}
              <a className="font-medium underline underline-offset-2" href={mailtoLink}>
                lorelngoumi@gmail.com
              </a>
            </p>
          )}
        </div>
      )}

      <Button type="submit" size="lg" loading={isSubmitting} className="mt-2 cursor-pointer">
        <Send className="size-4" /> {isSubmitting ? t("formSending") : t("formSubmit")}
      </Button>
    </form>
  );
}
