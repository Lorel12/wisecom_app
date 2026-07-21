import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
        aria-label="Page précédente"
      >
        <ChevronLeft className="size-4" />
      </button>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1.5 text-muted-foreground">…</span>}
          <button
            onClick={() => onPageChange(p)}
            className={cn(
              "flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
              p === page ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
            )}
          >
            {p}
          </button>
        </span>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
        aria-label="Page suivante"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
