"use client";

import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = { fr: "Français", en: "English" };

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex size-10 items-center justify-center gap-1 rounded-lg text-foreground transition-colors hover:bg-secondary">
          <Globe className="size-[18px]" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {routing.locales.map((l) => (
          <DropdownMenuItem key={l} onClick={() => router.replace(pathname, { locale: l })}>
            <span className={cn("flex-1", l === locale && "font-semibold text-primary")}>{LABELS[l]}</span>
            {l === locale && <span className="text-xs text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
