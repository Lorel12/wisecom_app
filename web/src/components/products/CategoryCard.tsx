import { useLocale } from "next-intl";
import { Heater, Headphones, Laptop, Plug, Smartphone, HardDrive, type LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/lib/types";

const ICONS: Record<string, LucideIcon> = {
  laptop: Laptop,
  smartphone: Smartphone,
  utensils: Heater,
  usb: HardDrive,
  plug: Plug,
  headphones: Headphones,
};

export function CategoryCard({ category }: { category: Category }) {
  const locale = useLocale();
  const Icon = ICONS[category.icon ?? ""] ?? Heater;
  const name = locale === "en" && category.nameEn ? category.nameEn : category.name;

  return (
    <Link
      href={`/produits?category=${category.slug}`}
      className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-6" />
      </span>
      <span className="text-sm font-medium text-foreground">{name}</span>
    </Link>
  );
}
