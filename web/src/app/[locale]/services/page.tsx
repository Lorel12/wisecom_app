import { getTranslations } from "next-intl/server";
import { ArrowRight, MapPinned, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function ServicesPage() {
  const t = await getTranslations("services");

  const items = [
    { icon: Wrench, title: t("salesTitle"), text: t("salesText") },
    { icon: ShieldCheck, title: t("repairTitle"), text: t("repairText") },
    { icon: Sparkles, title: t("maintenanceTitle"), text: t("maintenanceText") },
    { icon: MapPinned, title: t("remoteTitle"), text: t("remoteText") },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-background dark:from-primary-950/40">
        <Container className="flex flex-col items-center gap-5 py-16 text-center lg:py-24">
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">{t("subtitle")}</p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("intro")}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {items.map(({ icon: Icon, title, text }) => (
            <Card key={title}>
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </span>
                <CardTitle className="text-left">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </Container>
      </section>

      <section className="py-4">
        <Container className="flex flex-col items-center gap-4 rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
          <p className="max-w-lg text-sm text-primary-foreground/90">{t("warrantyNote")}</p>
          <Link href="/garantie-retours" className={cn(buttonVariants({ variant: "accent", size: "lg" }))}>
            {t("warrantyCta")} <ArrowRight className="size-4" />
          </Link>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
            {t("visionText")}
          </p>
        </Container>
      </section>
    </>
  );
}
