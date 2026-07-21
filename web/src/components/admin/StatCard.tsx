import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-soft">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
