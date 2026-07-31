import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ContactForm } from "@/components/ContactForm";

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-background dark:from-primary-950/40">
        <Container className="flex flex-col items-center gap-5 py-16 text-center lg:py-24">
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
        </Container>
      </section>

      <section className="pb-16">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-left">{t("formTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </Container>
      </section>
    </>
  );
}
