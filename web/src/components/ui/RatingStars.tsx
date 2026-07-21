import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  size = "sm",
  className,
}: {
  rating: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const dimension = size === "sm" ? "size-3.5" : "size-5";
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            dimension,
            i < Math.round(rating) ? "fill-accent text-accent" : "fill-transparent text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}
