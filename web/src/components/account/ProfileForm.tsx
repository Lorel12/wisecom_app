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
import { useAuthStore } from "@/store/auth";
import type { User } from "@/lib/types";

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(8).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export function ProfileForm({ user }: { user: User }) {
  const t = useTranslations("auth");
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const { user: updated } = await api.patch<{ user: User }>("/auth/me", {
        ...values,
        phone: values.phone || undefined,
      });
      setUser(updated);
      toast.success("Profil mis à jour.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la mise à jour.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("firstName")} htmlFor="firstName" error={errors.firstName?.message}>
          <Input id="firstName" {...register("firstName")} error={!!errors.firstName} />
        </Field>
        <Field label={t("lastName")} htmlFor="lastName" error={errors.lastName?.message}>
          <Input id="lastName" {...register("lastName")} error={!!errors.lastName} />
        </Field>
      </div>
      <Field label="Email">
        <Input value={user.email} disabled />
      </Field>
      <Field label={t("phone")} htmlFor="phone" error={errors.phone?.message}>
        <Input id="phone" type="tel" {...register("phone")} error={!!errors.phone} />
      </Field>
      <Button type="submit" loading={isSubmitting} disabled={!isDirty} className="w-fit">
        Enregistrer
      </Button>
    </form>
  );
}
