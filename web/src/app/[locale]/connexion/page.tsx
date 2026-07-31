"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { User } from "@/lib/types";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  return (
    <React.Suspense>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const { user } = await api.post<{ user: User }>("/auth/login", values);
      setUser(user);
      router.push(searchParams.get("next") ?? "/compte");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erreur de connexion.");
    }
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("loginTitle")}</CardTitle>
          <CardDescription>{t("loginSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label={t("email")} htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" {...register("email")} error={!!errors.email} />
            </Field>
            <Field label={t("password")} htmlFor="password" error={errors.password?.message}>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} error={!!errors.password} />
            </Field>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button type="submit" size="lg" loading={isSubmitting} className="mt-2 cursor-pointer">
              {t("submitLogin")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link href="/inscription" className="font-medium text-primary hover:underline">
              {t("registerTitle")}
            </Link>
          </p>

          <p className="mt-3 text-center text-sm">
            <Link href="/mot-de-passe-oublie" className="font-medium text-destructive hover:underline">
              {t("forgotPassword")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
