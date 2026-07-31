"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [sent, setSent] = React.useState(false);
  const [devResetUrl, setDevResetUrl] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await api.post<{ message: string; resetUrl?: string }>("/auth/forgot-password", {
        ...values,
        locale,
      });
      setDevResetUrl(res.resetUrl ?? null);
      setSent(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erreur, veuillez réessayer.");
    }
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{sent ? t("resetLinkSentTitle") : t("forgotPasswordTitle")}</CardTitle>
          <CardDescription>{sent ? t("resetLinkSentDesc") : t("forgotPasswordSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 className="size-12 text-success" />

              {devResetUrl && (
                <div className="w-full rounded-lg border border-dashed border-accent bg-accent/10 p-3 text-left text-xs">
                  <p className="mb-1 font-medium text-foreground">
                    Mode développement — aucun email réel n&apos;a été envoyé (SMTP non configuré). Lien de test :
                  </p>
                  <a href={devResetUrl} className="break-all text-primary hover:underline">
                    {devResetUrl}
                  </a>
                </div>
              )}

              <Link href="/connexion" className="text-sm font-medium text-primary hover:underline cursor-pointer">
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Field label={t("email")} htmlFor="email" error={errors.email?.message}>
                  <Input id="email" type="email" autoComplete="email" {...register("email")} error={!!errors.email} />
                </Field>

                {serverError && <p className="text-sm text-destructive">{serverError}</p>}

                <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
                  {t("sendResetLink")}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link href="/connexion" className="font-medium text-primary hover:underline">
                  {t("backToLogin")}
                </Link>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
