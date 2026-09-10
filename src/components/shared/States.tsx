import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingPanel({ label = "Preparing cohort data…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="card-surface flex min-h-56 flex-col items-center justify-center gap-3 p-8 text-center"
    >
      <Loader2 className="size-5 animate-spin text-teal" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="w-full max-w-sm space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function EmptyState({
  title = "Nothing to show yet",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-8 text-center">
      <span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <p className="panel-heading text-sm">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="card-surface flex flex-col items-center gap-3 border-destructive/30 p-8 text-center">
      <span className="grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="panel-heading text-sm">Something went wrong</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reload demo cohort
        </Button>
      ) : null}
    </div>
  );
}
