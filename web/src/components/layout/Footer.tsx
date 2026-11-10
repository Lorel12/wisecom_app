import { useTranslations } from "next-intl";
import { Globe2, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon } from "@/components/icons/SocialIcons";

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const tct = useTranslations("contact");
  const tw = useTranslations("warranty");
  const year = new Date().getFullYear();
  const s = useTranslations("shop");

  return (
    <footer className="border-t border-border bg-secondary/40">
      <Container className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Globe2 className="size-[18px]" />
            </span>
            <span className="text-base tracking-tight">{tc("appNameShort")}</span>
          </Link>
          <p className="text-sm leading-relaxed text-muted-foreground">{t("about")}</p>
          <div className="flex gap-3">
            <a
              href="https://www.facebook.com/share/1HJqS7qFqu/?mibextid=wwXIfr"
              aria-label="Facebook"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <FacebookIcon className="size-4" />
            </a>
            <a
              href="https://www.instagram.com/wisecomhome"
              aria-label="Instagram"
              className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <InstagramIcon className="size-4" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">{t("company")}</h3>
          <Link href="/a-propos" className="text-sm text-muted-foreground hover:text-primary">
            {tn("about")}
          </Link>
          <Link href="/services" className="text-sm text-muted-foreground hover:text-primary">
            {tn("services")}
          </Link>
          <Link href="/import-export" className="text-sm text-muted-foreground hover:text-primary">
            {tn("importExport")}
          </Link>
          <Link href="/motos-et-vehicules" className="text-sm text-muted-foreground hover:text-primary">
            {tn("vehicles")}
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">{t("help")}</h3>
          <Link href="/produits" className="text-sm text-muted-foreground hover:text-primary">
            {tn("shop")}
          </Link>
          <Link href="/produits?condition=NEUF" className="text-sm text-muted-foreground hover:text-primary">
            {s("neuf")}
          </Link>
          <Link href="/produits?condition=OCCASION" className="text-sm text-muted-foreground hover:text-primary">
            {s("occasion")}
          </Link>
          <Link href="/garantie-retours" className="text-sm text-muted-foreground hover:text-primary">
            {tw("title")}
          </Link>
          <Link href="/compte/commandes" className="text-sm text-muted-foreground hover:text-primary">
            {tn("orders")}
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground">{t("contact")}</h3>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span>
               {tct("branchOfficeAddress")}
            </span>
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" /> 
            <a href="https://wa.me/237655471356">+237 655 471 356</a>
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <a href="https://wa.me/237675513713">+237 675 513 713</a>
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <a href="mailto:lorelngoumi@gmail.com" className="hover:text-primary">
              lorelngoumi@gmail.com
            </a>
          </p>
        </div>
      </Container>

      <div className="border-t border-border py-5">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {tc("appName")} — {t("rights")}
          </p>
          <p>{tc("location")}</p>
        </Container>
      </div>
    </footer>
  );
}
