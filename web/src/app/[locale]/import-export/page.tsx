import { getTranslations } from "next-intl/server";
import { Globe2, Plane, Ship, Truck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function ImportExportPage() {
  const t = await getTranslations("importExport");

  const items = [
    { icon: Globe2, title: t("sourcingTitle"), text: t("sourcingText") },
    { icon: Plane, title: t("airFreightTitle"), text: t("airFreightText") },
    { icon: Ship, title: t("seaFreightTitle"), text: t("seaFreightText") },
    { icon: Truck, title: t("deliveryTitle"), text: t("deliveryText") },
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

      <section className="pb-16">
        <Container>
          <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
            {t("closing")}
          </p>
        </Container>
      </section>
    </>
  );
}
