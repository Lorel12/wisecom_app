"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
type FormValues = z.infer<typeof schema>;

export function ChangePasswordForm() {
  const t = useTranslations("account");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await api.post("/auth/me/password", values);
      toast.success("Mot de passe mis à jour.");
      reset();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors du changement de mot de passe.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Field label={t("currentPassword")} htmlFor="currentPassword" error={errors.currentPassword?.message}>
        <Input id="currentPassword" type="password" {...register("currentPassword")} error={!!errors.currentPassword} />
      </Field>
      <Field label={t("newPassword")} htmlFor="newPassword" error={errors.newPassword?.message}>
        <Input id="newPassword" type="password" {...register("newPassword")} error={!!errors.newPassword} />
      </Field>
      <Button type="submit" loading={isSubmitting} className="w-fit">
        {t("changePassword")}
      </Button>
    </form>
  );
}
