import { FlaskConical } from "lucide-react";

import { cn } from "@/lib/utils";

export function DemoBadge({ className, label = "Demo Data" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-accent-foreground/20 bg-accent px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-accent-foreground",
        className,
      )}
    >
      <FlaskConical className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}

export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-accent-foreground/20 bg-accent px-3 py-2 text-xs leading-relaxed text-accent-foreground">
      <FlaskConical className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
