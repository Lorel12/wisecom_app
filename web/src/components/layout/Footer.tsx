import { useTranslations } from "next-intl";
import { Globe2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { FacebookIcon, InstagramIcon } from "@/components/icons/SocialIcons";

export function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const tw = useTranslations("warranty");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/40">
      <Container className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Globe2 className="size-4" />
            </span>
            <span className="text-sm tracking-tight">{tc("appNameShort")}</span>
          </Link>
          <div className="flex gap-2">
            <a
              href="https://www.facebook.com/share/1HJqS7qFqu/?mibextid=wwXIfr"
              aria-label="Facebook"
              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <FacebookIcon className="size-3.5" />
            </a>
            <a
              href="https://www.instagram.com/wisecomhome"
              aria-label="Instagram"
              className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <InstagramIcon className="size-3.5" />
            </a>
          </div>
        </div>

        <nav aria-label={t("help")} className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/produits" className="text-muted-foreground hover:text-primary">
            {tn("shop")}
          </Link>
          <Link href="/a-propos" className="text-muted-foreground hover:text-primary">
            {tn("about")}
          </Link>
          <Link href="/compte/commandes" className="text-muted-foreground hover:text-primary">
            {tn("orders")}
          </Link>
          <Link href="/garantie-retours" className="text-muted-foreground hover:text-primary">
            {tw("title")}
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-primary">
            {tn("contact")}
          </Link>
        </nav>
      </Container>

      <div className="border-t border-border py-3">
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
