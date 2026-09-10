import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { InfoTip } from "@/components/shared/InfoTip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tooltip?: ReactNode;
  icon: LucideIcon;
  tone?: "navy" | "teal" | "low" | "medium" | "high";
  loading?: boolean;
}

const tones: Record<NonNullable<StatCardProps["tone"]>, string> = {
  navy: "bg-primary/10 text-primary",
  teal: "bg-teal/12 text-teal",
  low: "bg-risk-low/12 text-risk-low",
  medium: "bg-risk-medium/15 text-risk-medium",
  high: "bg-risk-high/12 text-risk-high",
};

export function StatCard({ label, value, hint, tooltip, icon: Icon, tone = "navy", loading }: StatCardProps) {
  return (
    <div className="card-surface p-4 transition-shadow hover:shadow-lift sm:p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            {tooltip ? <InfoTip label={label}>{tooltip}</InfoTip> : null}
          </div>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-24" />
          ) : (
            <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums sm:text-3xl">{value}</p>
          )}
          {hint ? <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
