import { getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
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
          <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
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
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-left">{t("title")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex gap-3">
                <MapPin className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold">{t("headOfficeLabel")}</h2>
                  <p className="text-sm text-muted-foreground">{t("headOfficeAddress")}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold">{t("branchOfficeLabel")}</h2>
                  <p className="text-sm text-muted-foreground">{t("branchOfficeAddress")}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold">{t("phoneLabel")}</h2>
                  <div className="flex flex-col text-sm text-muted-foreground">
                    <a href="tel:+237655471356" className="hover:text-primary">+237 655 471 356</a>
                    <a href="tel:+237675513713" className="hover:text-primary">+237 675 513 713</a>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold">{t("emailLabel")}</h2>
                  <a
                    href="mailto:lorelngoumi@gmail.com"
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    lorelngoumi@gmail.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>
    </>
  );
}
