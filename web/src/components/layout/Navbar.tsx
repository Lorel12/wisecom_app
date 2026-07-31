"use client";

import * as React from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown, Globe2, Menu, Search, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CartButton } from "./CartButton";
import { UserMenu } from "./UserMenu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";

export function Navbar() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/produits", label: t("shop") },
  ];

  const companyLinks = [
    { href: "/a-propos", label: t("about") },
    { href: "/services", label: t("services") },
    { href: "/import-export", label: t("importExport") },
    { href: "/motos-et-vehicules", label: t("vehicles") },
  ];

  const allMobileLinks = [...links, ...companyLinks, { href: "/contact", label: t("contact") }];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          className="flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-secondary lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5 cursor-pointer" />}
        </button>

        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Globe2 className="size-[18px]" />
          </span>
          <span className="hidden text-base tracking-tight sm:inline">{tc("appNameShort")}</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname === link.href && "bg-secondary text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger>
              <span
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  companyLinks.some((l) => l.href === pathname) && "bg-secondary text-foreground",
                )}
              >
                {t("company")}
                <ChevronDown className="size-3.5" />
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {companyLinks.map((link) => (
                <DropdownMenuItem key={link.href} onClick={() => router.push(link.href)}>
                  {link.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/contact"
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              pathname === "/contact" && "bg-secondary text-foreground",
            )}
          >
            {t("contact")}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <div className="relative hidden items-center md:flex">
            {searchOpen ? (
              <form
                action="/produits"
                className="flex items-center"
                onSubmit={() => setSearchOpen(false)}
              >
                <input
                  autoFocus
                  name="search"
                  placeholder={tc("search")}
                  onBlur={() => setSearchOpen(false)}
                  className="h-10 w-64 rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label={tc("search")}
                className="flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-secondary"
              >
                <Search className="size-[18px]" />
              </button>
            )}
          </div>
          <LanguageSwitcher />
          <ThemeToggle />
          <CartButton />
          <div className="ml-1">
            <UserMenu />
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 lg:hidden">
          {allMobileLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
