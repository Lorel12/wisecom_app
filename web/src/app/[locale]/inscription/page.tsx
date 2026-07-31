"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { User } from "@/lib/types";

const schema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(8).optional().or(z.literal("")),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas.",
  });
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
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
      const { user } = await api.post<{ user: User }>("/auth/register", {
        ...values,
        phone: values.phone || undefined,
      });
      setUser(user);
      router.push("/compte");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : "Erreur lors de la création du compte.");
    }
  }

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{t("registerTitle")}</CardTitle>
          <CardDescription>{t("registerSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("firstName")} htmlFor="firstName" error={errors.firstName?.message}>
                <Input id="firstName" autoComplete="given-name" {...register("firstName")} error={!!errors.firstName} />
              </Field>
              <Field label={t("lastName")} htmlFor="lastName" error={errors.lastName?.message}>
                <Input id="lastName" autoComplete="family-name" {...register("lastName")} error={!!errors.lastName} />
              </Field>
            </div>
            <Field label={t("email")} htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" {...register("email")} error={!!errors.email} />
            </Field>
            <Field label={t("phone")} htmlFor="phone" hint="+237 6XX XXX XXX" error={errors.phone?.message}>
              <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} error={!!errors.phone} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("password")} htmlFor="password" error={errors.password?.message}>
                <Input id="password" type="password" autoComplete="new-password" {...register("password")} error={!!errors.password} />
              </Field>
              <Field label={t("confirmPassword")} htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
                <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} error={!!errors.confirmPassword} />
              </Field>
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
              {t("submitRegister")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link href="/connexion" className=" font-medium text-primary hover:underline">
              {t("loginTitle")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}
