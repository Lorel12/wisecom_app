import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { PriceTag } from "@/components/ui/PriceTag";
import { RatingStars } from "@/components/ui/RatingStars";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductActions } from "@/components/products/ProductActions";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductReviews } from "@/components/products/ProductReviews";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const { product } = await api.get<{ product: Product }>(`/products/${slug}`);
    return product;
  } catch {
    return null;
  }
}

async function getRelated(categorySlug: string, excludeId: string): Promise<Product[]> {
  try {
    const { items } = await api.get<{ items: Product[] }>(`/products?category=${categorySlug}&perPage=4`);
    return items.filter((p) => p.id !== excludeId);
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, t, locale] = await Promise.all([getProduct(slug), getTranslations("product"), getLocale()]);

  if (!product) notFound();

  const related = product.category ? await getRelated(product.category.slug, product.id) : [];
  const name = locale === "en" && product.nameEn ? product.nameEn : product.name;
  const description = locale === "en" && product.descriptionEn ? product.descriptionEn : product.description;
  const reviews = product.reviews ?? [];
  const avgRating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <Container className="py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={name} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={product.condition === "NEUF" ? "primary" : "neutral"}>
              {product.condition === "NEUF" ? t("conditionNew") : t("conditionUsed")}
            </Badge>
            {product.brand && <Badge variant="outline">{product.brand}</Badge>}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{name}</h1>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <RatingStars rating={avgRating} />
              <span className="text-sm text-muted-foreground">({reviews.length})</span>
            </div>
          )}

          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} locale={locale} size="lg" />

          <p className="text-sm text-muted-foreground">
            {product.quantity > 0
              ? product.quantity <= 5
                ? t("lowStock", { count: product.quantity })
                : t("inStock", { count: product.quantity })
              : t("outOfStock")}
          </p>

          <ProductActions product={product} />

          <div className="border-t border-border pt-5">
            <h2 className="mb-2 text-sm font-semibold text-foreground">{t("description")}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} reviews={reviews} locale={locale} />

      {related.length > 0 && (
        <div className="mt-16 border-t border-border pt-10">
          <h2 className="mb-6 text-xl font-semibold tracking-tight text-foreground">{t("relatedProducts")}</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </Container>
  );
}
