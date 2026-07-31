import { getTranslations } from "next-intl/server";
import { Building2, Compass, Target } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-background dark:from-primary-950/40">
        <Container className="flex flex-col items-center gap-5 py-16 text-center lg:py-24">
          <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
            {t("heroBadge")}
          </span>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{t("intro")}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader className="items-center text-center">
              <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="size-6" />
              </span>
              <CardTitle>{t("missionTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm leading-relaxed text-muted-foreground">{t("missionText")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="items-center text-center">
              <span className="mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Compass className="size-6" />
              </span>
              <CardTitle>{t("visionTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm leading-relaxed text-muted-foreground">{t("visionText")}</p>
            </CardContent>
          </Card>
        </Container>
      </section>

      <section className="bg-secondary/40 py-16">
        <Container className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader className="items-center text-center">
              <span className="mb-2 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Building2 className="size-7" />
              </span>
              <CardTitle>{t("ceoTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <p className="text-base italic leading-relaxed text-muted-foreground">&ldquo;{t("ceoQuote")}&rdquo;</p>
              <div>
                <p className="font-semibold text-foreground">{t("ceoName")}</p>
                <p className="text-sm text-muted-foreground">{t("ceoRole")}</p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>
    </>
  );
}
