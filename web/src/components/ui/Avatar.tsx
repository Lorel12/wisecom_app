import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn("size-9 rounded-full object-cover", className)} />;
  }

  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary",
        className,
      )}
    >
      {initials || "?"}
    </div>
  );
}
