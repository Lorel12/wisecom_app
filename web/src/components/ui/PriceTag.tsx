import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

export function PriceTag({
  price,
  compareAtPrice,
  locale = "fr",
  size = "md",
  className,
}: {
  price: number;
  compareAtPrice?: number | null;
  locale?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };
  const hasDiscount = compareAtPrice && compareAtPrice > price;

  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold text-foreground", sizes[size])}>{formatPrice(price, locale)}</span>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through">{formatPrice(compareAtPrice, locale)}</span>
      )}
    </div>
  );
}
