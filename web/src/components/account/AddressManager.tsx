"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Address } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";

const schema = z.object({
  label: z.string().min(1),
  fullName: z.string().min(2),
  phone: z.string().min(8),
  district: z.string().min(2),
  landmark: z.string().optional(),
  isDefault: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function AddressManager() {
  const t = useTranslations("checkout");
  const [addresses, setAddresses] = React.useState<Address[] | null>(null);
  const [editing, setEditing] = React.useState<Address | null | undefined>(undefined);

  const load = React.useCallback(() => {
    api.get<{ addresses: Address[] }>("/addresses").then((res) => setAddresses(res.addresses)).catch(() => setAddresses([]));
  }, []);

  React.useEffect(() => load(), [load]);

  async function handleDelete(id: string) {
    try {
      await api.delete(`/addresses/${id}`);
      toast.success("Adresse supprimée.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de la suppression.");
    }
  }

  if (addresses === null) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setEditing(null)} className="w-fit">
        <Plus className="size-4" /> {t("addAddress")}
      </Button>

      {addresses.length === 0 ? (
        <EmptyState icon={<MapPin className="size-8" />} title="Aucune adresse enregistrée" />
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((address) => (
            <li key={address.id} className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-soft">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{address.label}</span>
                  {address.isDefault && <Badge variant="primary">Par défaut</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {address.fullName} · {address.phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.district}, {address.city}
                  {address.landmark && ` — ${address.landmark}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => setEditing(address)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <Pencil className="size-4" />
                </button>
                <button onClick={() => handleDelete(address.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddressFormModal
        open={editing !== undefined}
        address={editing ?? null}
        onClose={() => setEditing(undefined)}
        onSaved={() => {
          setEditing(undefined);
          load();
        }}
      />
    </div>
  );
}

function AddressFormModal({
  open,
  address,
  onClose,
  onSaved,
}: {
  open: boolean;
  address: Address | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("checkout");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  React.useEffect(() => {
    if (open) {
      reset({
        label: address?.label ?? "Domicile",
        fullName: address?.fullName ?? "",
        phone: address?.phone ?? "",
        district: address?.district ?? "",
        landmark: address?.landmark ?? "",
        isDefault: address?.isDefault ?? false,
      });
    }
  }, [open, address, reset]);

  async function onSubmit(values: FormValues) {
    try {
      if (address) {
        await api.patch(`/addresses/${address.id}`, values);
      } else {
        await api.post("/addresses", values);
      }
      toast.success("Adresse enregistrée.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={address ? "Modifier l'adresse" : t("addAddress")}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label="Libellé" htmlFor="label">
          <Input id="label" {...register("label")} />
        </Field>
        <Field label={t("fullName")} htmlFor="fullName" error={errors.fullName?.message}>
          <Input id="fullName" {...register("fullName")} error={!!errors.fullName} />
        </Field>
        <Field label={t("phone")} htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" type="tel" {...register("phone")} error={!!errors.phone} />
        </Field>
        <Field label={t("district")} htmlFor="district" error={errors.district?.message}>
          <Input id="district" {...register("district")} error={!!errors.district} />
        </Field>
        <Field label={t("landmark")} htmlFor="landmark">
          <Input id="landmark" {...register("landmark")} />
        </Field>
        <Switch checked={watch("isDefault")} onCheckedChange={(v) => setValue("isDefault", v)} label="Adresse par défaut" />
        <Button type="submit" loading={isSubmitting} className="mt-2">
          Enregistrer
        </Button>
      </form>
    </Modal>
  );
}
