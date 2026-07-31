"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSpinner } from "@/components/ui/Spinner";

const schema = z.object({
  name: z.string().min(2),
  nameEn: z.string().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Minuscules, chiffres et tirets uniquement."),
  icon: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CategoryManager() {
  const t = useTranslations("admin");
  const [categories, setCategories] = React.useState<Category[] | null>(null);
  const [editing, setEditing] = React.useState<Category | null | undefined>(undefined);

  const load = React.useCallback(() => {
    api.get<{ categories: Category[] }>("/categories").then((res) => setCategories(res.categories)).catch(() => setCategories([]));
  }, []);

  React.useEffect(() => load(), [load]);

  async function handleDelete(id: string) {
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Catégorie supprimée.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Impossible de supprimer (des produits y sont peut-être rattachés).");
    }
  }

  if (categories === null) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setEditing(null)} className="w-fit">
        <Plus className="size-4" /> {t("addCategory")}
      </Button>

      {categories.length === 0 ? (
        <EmptyState icon={<Tags className="size-8" />} title="Aucune catégorie" />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-soft">
              <div>
                <p className="text-sm font-semibold text-foreground">{category.name}</p>
                <p className="text-xs text-muted-foreground">/{category.slug}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => setEditing(category)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
                  <Pencil className="size-4" />
                </button>
                <button onClick={() => handleDelete(category.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CategoryFormModal
        open={editing !== undefined}
        category={editing ?? null}
        onClose={() => setEditing(undefined)}
        onSaved={() => {
          setEditing(undefined);
          load();
        }}
      />
    </div>
  );
}

function CategoryFormModal({
  open,
  category,
  onClose,
  onSaved,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("admin");
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
        name: category?.name ?? "",
        nameEn: category?.nameEn ?? "",
        slug: category?.slug ?? "",
        icon: category?.icon ?? "",
      });
    }
  }, [open, category, reset]);

  const name = watch("name");
  React.useEffect(() => {
    if (!category && name) setValue("slug", slugify(name));
  }, [name, category, setValue]);

  async function onSubmit(values: FormValues) {
    try {
      if (category) {
        await api.patch(`/categories/${category.id}`, values);
      } else {
        await api.post("/categories", values);
      }
      toast.success("Catégorie enregistrée.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={category ? "Modifier la catégorie" : t("addCategory")}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field label={t("categoryName")} htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} error={!!errors.name} />
        </Field>
        <Field label={t("categoryNameEn")} htmlFor="nameEn">
          <Input id="nameEn" {...register("nameEn")} />
        </Field>
        <Field label={t("categorySlug")} htmlFor="slug" error={errors.slug?.message}>
          <Input id="slug" {...register("slug")} error={!!errors.slug} />
        </Field>
        <Button type="submit" loading={isSubmitting} className="mt-2">
          Enregistrer
        </Button>
      </form>
    </Modal>
  );
}
