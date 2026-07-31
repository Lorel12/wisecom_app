"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "passwordsMustMatch",
  });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return (
    <React.Suspense>
      <ResetPasswordForm />
    </React.Suspense>
  );
}

function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [success, setSuccess] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (!token) return;
    setServerError(null);
    try {
      await api.post("/auth/reset-password", { token, password: values.password });
      setSuccess(true);
      setTimeout(() => router.push("/connexion"), 2000);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : t("resetInvalidToken"));
    }
  }

  if (!token) {
    return (
      <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <XCircle className="size-12 text-destructive" />
        <p className="text-sm text-muted-foreground">{t("resetInvalidToken")}</p>
        <Link href="/mot-de-passe-oublie" className="text-sm font-medium text-primary hover:underline">
          {t("forgotPasswordTitle")}
        </Link>
      </Container>
    );
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("resetPasswordTitle")}</CardTitle>
          <CardDescription>{t("resetPasswordSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 className="size-12 text-success" />
              <p className="text-sm text-muted-foreground">{t("resetSuccess")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Field label={t("newPassword")} htmlFor="password" error={errors.password?.message}>
                <Input id="password" type="password" autoComplete="new-password" {...register("password")} error={!!errors.password} />
              </Field>
              <Field label={t("confirmPassword")} htmlFor="confirmPassword" error={errors.confirmPassword && t("passwordsMustMatch")}>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  error={!!errors.confirmPassword}
                />
              </Field>

              {serverError && <p className="text-sm text-destructive">{serverError}</p>}

              <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
                {t("submitReset")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
