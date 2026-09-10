import type { RiskLevel } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const styles: Record<RiskLevel, string> = {
  Low: "border-risk-low/30 bg-risk-low/12 text-risk-low",
  Medium: "border-risk-medium/40 bg-risk-medium/15 text-risk-medium",
  High: "border-risk-high/30 bg-risk-high/12 text-risk-high",
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold",
        styles[level],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {level}
    </span>
  );
}

export function RiskMeter({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const tone = score >= 0.6 ? "bg-risk-high" : score >= 0.35 ? "bg-risk-medium" : "bg-risk-low";
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums text-sm font-semibold">{pct}%</span>
    </div>
  );
}
