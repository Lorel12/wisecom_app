import { getTranslations } from "next-intl/server";
import { ArrowRight, Bike } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function VehiclesPage() {
  const t = await getTranslations("vehicles");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-background dark:from-primary-950/40">
      <Container className="flex flex-col items-center gap-6 py-16 text-center lg:py-24">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bike className="size-7" />
        </span>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {t("title")}
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">{t("subtitle")}</p>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("intro")}</p>
        <Link href="/contact" className={cn(buttonVariants({ size: "lg" }))}>
          {t("cta")} <ArrowRight className="size-4" />
        </Link>
      </Container>
    </section>
  );
}
