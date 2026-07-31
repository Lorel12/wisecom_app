"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { api, ApiError } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/admin/ImageUploader";

const schema = z.object({
  name: z.string().min(2),
  nameEn: z.string().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Utilisez uniquement des minuscules, chiffres et tirets."),
  description: z.string().min(5),
  descriptionEn: z.string().optional(),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional().or(z.literal(NaN)),
  quantity: z.number().int().min(0),
  condition: z.enum(["NEUF", "OCCASION"]),
  brand: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  categoryId: z.string().min(1),
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

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [images, setImages] = React.useState<string[]>(product?.images ?? []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          nameEn: product.nameEn ?? "",
          slug: product.slug,
          description: product.description,
          descriptionEn: product.descriptionEn ?? "",
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? undefined,
          quantity: product.quantity,
          condition: product.condition,
          brand: product.brand ?? "",
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          categoryId: product.categoryId,
        }
      : {
          condition: "NEUF",
          isActive: true,
          isFeatured: false,
          categoryId: categories[0]?.id ?? "",
        },
  });

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      nameEn: values.nameEn || undefined,
      descriptionEn: values.descriptionEn || undefined,
      brand: values.brand || undefined,
      compareAtPrice: values.compareAtPrice && !Number.isNaN(values.compareAtPrice) ? values.compareAtPrice : undefined,
      images,
    };

    try {
      if (product) {
        await api.patch(`/products/${product.id}`, payload);
        toast.success("Produit mis à jour.");
      } else {
        await api.post("/products", payload);
        toast.success("Produit créé.");
      }
      router.push("/admin/produits");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.");
    }
  }

  const name = watch("name");
  React.useEffect(() => {
    if (!product && name) setValue("slug", slugify(name));
  }, [name, product, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("productName")} htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} error={!!errors.name} />
        </Field>
        <Field label="Nom (anglais)" htmlFor="nameEn">
          <Input id="nameEn" {...register("nameEn")} />
        </Field>
      </div>

      <Field label="Slug (URL)" htmlFor="slug" error={errors.slug?.message} hint="Utilisé dans l'adresse de la fiche produit">
        <Input id="slug" {...register("slug")} error={!!errors.slug} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("description")} htmlFor="description" error={errors.description?.message}>
          <Textarea id="description" rows={4} {...register("description")} error={!!errors.description} />
        </Field>
        <Field label="Description (anglais)" htmlFor="descriptionEn">
          <Textarea id="descriptionEn" rows={4} {...register("descriptionEn")} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label={t("price")} htmlFor="price" error={errors.price?.message}>
          <Input id="price" type="number" {...register("price", { valueAsNumber: true })} error={!!errors.price} />
        </Field>
        <Field label={t("compareAtPrice")} htmlFor="compareAtPrice">
          <Input id="compareAtPrice" type="number" {...register("compareAtPrice", { valueAsNumber: true })} />
        </Field>
        <Field label={t("quantity")} htmlFor="quantity" error={errors.quantity?.message}>
          <Input id="quantity" type="number" {...register("quantity", { valueAsNumber: true })} error={!!errors.quantity} />
        </Field>
        <Field label={t("brand")} htmlFor="brand">
          <Input id="brand" {...register("brand")} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("category")} htmlFor="categoryId" error={errors.categoryId?.message}>
          <Select id="categoryId" {...register("categoryId")} error={!!errors.categoryId}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("condition")} htmlFor="condition">
          <Select id="condition" {...register("condition")}>
            <option value="NEUF">Neuf</option>
            <option value="OCCASION">Occasion</option>
          </Select>
        </Field>
      </div>

      <Field label={t("images")} htmlFor="images">
        <ImageUploader images={images} onChange={setImages} />
      </Field>

      <div className="flex gap-6">
        <Switch checked={watch("isActive")} onCheckedChange={(v) => setValue("isActive", v)} label={t("active")} />
        <Switch checked={watch("isFeatured")} onCheckedChange={(v) => setValue("isFeatured", v)} label={t("featured")} />
      </div>

      <Button type="submit" size="lg" loading={isSubmitting} className="w-fit">
        Enregistrer
      </Button>
    </form>
  );
}
