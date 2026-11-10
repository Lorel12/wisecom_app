import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, PackageCheck, ShieldCheck, Smartphone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { CategoryCard } from "@/components/products/CategoryCard";
import { ProductGrid } from "@/components/products/ProductGrid";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NewsletterForm } from "@/components/NewsletterForm";

async function getCategories(): Promise<Category[]> {
  try {
    const { categories } = await api.get<{ categories: Category[] }>("/categories");
    return categories;
  } catch {
    return [];
  }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { items } = await api.get<{ items: Product[] }>("/products?featured=true&perPage=8");
    return items;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts()]);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-background dark:from-primary-950/40">
        <Container className="grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              Douala · Yaoundé
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="max-w-lg text-base text-muted-foreground sm:text-lg">{t("heroSubtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/produits" className={cn(buttonVariants({ size: "lg" }))}>
                {t("heroCta")} <ArrowRight className="size-4" />
              </Link>
              <Link href="#categories" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                {t("heroSecondaryCta")}
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md rounded-3xl bg-gradient-to-br from-primary-500 to-primary-800 shadow-elevated">
            <div className="absolute inset-6 rounded-2xl border border-white/15 bg-black/5 backdrop-blur-sm" />
            <Image
              src="/images/imageMontre.png" alt="Hero"
              fill sizes="(max-width: 768px) 100vw, 448px"
              className="rounded-2xl object-cover"
              priority
            />
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-card">
        <Container className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-3">
          <TrustItem icon={<PackageCheck className="size-6" />} title={t("trustDelivery")} desc={t("trustDeliveryDesc")} />
          <TrustItem icon={<Smartphone className="size-6" />} title={t("trustPayment")} desc={t("trustPaymentDesc")} />
          <TrustItem icon={<ShieldCheck className="size-6" />} title={t("trustQuality")} desc={t("trustQualityDesc")} />
        </Container>
      </section>

      {categories.length > 0 && (
        <section id="categories" className="py-16">
          <Container>
            <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">{t("categoriesTitle")}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {featured.length > 0 && (
        <section className="bg-secondary/40 py-16">
          <Container>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{t("featuredTitle")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("featuredSubtitle")}</p>
              </div>
              <Link href="/produits" className="hidden text-sm font-medium text-primary hover:underline sm:inline">
                {tc("seeAll")}
              </Link>
            </div>
            <ProductGrid products={featured} />
          </Container>
        </section>
      )}

      <section className="py-16">
        <Container className="flex flex-col items-center gap-4 rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
          <h2 className="text-2xl font-semibold tracking-tight">{t("newsletterTitle")}</h2>
          <p className="max-w-lg text-sm text-primary-foreground/80">{t("newsletterSubtitle")}</p>
          <NewsletterForm />
        </Container>
      </section>
    </>
  );
}

function TrustItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
