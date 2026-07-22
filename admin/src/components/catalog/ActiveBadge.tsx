import { cn } from "@/lib/cn";

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        active
          ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
          : "bg-brand-pink-lighter text-brand-muted ring-brand-border",
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
