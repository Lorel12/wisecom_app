import { getTranslations } from "next-intl/server";
import { CheckCircle2, PackageSearch, ShieldCheck, XCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function WarrantyPage() {
  const t = await getTranslations("warranty");

  const durations = [t("durationLaptops"), t("durationPhones"), t("durationAccessories")];

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
        <Container className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </span>
              <CardTitle className="text-left">{t("coverageTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{t("coverageText")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-6" />
              </span>
              <CardTitle className="text-left">{t("durationsTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
                {durations.map((d) => (
                  <li key={d} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {d}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <XCircle className="size-6" />
              </span>
              <CardTitle className="text-left">{t("exclusionsTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{t("exclusionsText")}</p>
            </CardContent>
          </Card>
        </Container>
      </section>

      <section className="bg-secondary/40 py-16">
        <Container className="flex flex-col items-center gap-4 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PackageSearch className="size-6" />
          </span>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{t("returnTitle")}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("returnText")}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <p className="mx-auto max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
            {t("closing")}
          </p>
        </Container>
      </section>
    </>
  );
}
