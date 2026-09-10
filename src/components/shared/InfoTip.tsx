import { Info } from "lucide-react";
import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function InfoTip({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={label ?? "More information"}
        className="inline-flex shrink-0 items-center text-muted-foreground transition-colors hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        <Info className="size-3.5" aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">{children}</TooltipContent>
    </Tooltip>
  );
}
