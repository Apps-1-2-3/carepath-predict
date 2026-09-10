import { Link } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { DataSourceBar } from "@/components/layout/DataSourceBar";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patients", label: "Patient Explorer", icon: Users },
  { to: "/model", label: "Model Performance", icon: Gauge },
  { to: "/cohorts", label: "Cohort Insights", icon: Activity },
  { to: "/planner", label: "Intervention Planner", icon: ClipboardList },
  { to: "/about", label: "Project README", icon: BookOpen },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{
            className: "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
          }}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
        <Activity className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold text-sidebar-foreground">CarePath AI</p>
        <p className="truncate text-[0.7rem] text-sidebar-foreground/60">Readmission Intelligence</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 bg-sidebar p-4 lg:flex">
        <Brand />
        <NavLinks />
        <p className="mt-auto rounded-lg bg-sidebar-accent/60 p-3 text-[0.7rem] leading-relaxed text-sidebar-foreground/70">
          All predictions, explanations and statistics in this build are generated demo values. Connect a Python ML
          service to produce real results.
        </p>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-sidebar px-4 py-3 lg:hidden">
          <Brand />
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </header>
        {open ? (
          <div className="sticky top-[3.75rem] z-20 border-b border-sidebar-border bg-sidebar px-4 pb-4 lg:hidden">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        ) : null}

        <main className="min-w-0 flex-1 space-y-5 p-4 sm:p-6">
          <DataSourceBar />
          {children}
          <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
            CarePath AI — educational demonstration. Not a medical device. Do not use for clinical decision-making.
          </footer>
        </main>
      </div>
    </div>
  );
}
