import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PhoneCall, Home, UserRoundCog } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/shared/SectionCard";
import { LoadingPanel, ErrorPanel } from "@/components/shared/States";
import { StatCard } from "@/components/shared/StatCard";
import { Input } from "@/components/ui/input";
import { useDataset } from "@/lib/data/dataset-context";
export const Route = createFileRoute("/planner")({ component: Planner });
function Planner() {
  const { patients, loading, error } = useDataset();
  const [calls, setCalls] = useState(25);
  const [managers, setManagers] = useState(15);
  const [visits, setVisits] = useState(8);
  const plan = useMemo(() => {
    const q = [...patients]
      .filter((p) => p.riskLevel === "High")
      .sort((a, b) => b.riskScore - a.riskScore);
    let i = 0;
    return [
      {
        name: "Home visit",
        count: visits,
        cost: 250,
        reduction: 0.12,
        patients: q.slice(i, (i += visits)),
      },
      {
        name: "Care manager",
        count: managers,
        cost: 140,
        reduction: 0.09,
        patients: q.slice(i, (i += managers)),
      },
      {
        name: "Follow-up call",
        count: calls,
        cost: 35,
        reduction: 0.05,
        patients: q.slice(i, (i += calls)),
      },
    ];
  }, [patients, calls, managers, visits]);
  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel message={error} />;
  const used = plan.reduce((s, x) => s + x.patients.length, 0),
    cost = plan.reduce((s, x) => s + x.patients.length * x.cost, 0);
  return (
    <div className="space-y-5">
      <PageHeader
        title="Intervention planner"
        description="Allocate limited follow-up capacity using configurable, illustrative assumptions."
      />
      <SectionCard
        title="Available capacity"
        description="Changes are applied to the prioritized queue immediately."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Follow-up calls", calls, setCalls],
            ["Care-manager slots", managers, setManagers],
            ["Home visits", visits, setVisits],
          ].map(([label, value, setter]) => (
            <label key={String(label)} className="text-sm font-medium">
              {label}
              <Input
                className="mt-2"
                type="number"
                min="0"
                value={Number(value)}
                onChange={(e) =>
                  (setter as (n: number) => void)(Math.max(0, Number(e.target.value) || 0))
                }
              />
            </label>
          ))}
        </div>
      </SectionCard>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Capacity used"
          value={used}
          hint="Highest-risk patients first"
          icon={UserRoundCog}
          tone="teal"
        />
        <StatCard
          label="Estimated cost"
          value={`$${cost.toLocaleString()}`}
          hint="Demo cost assumptions"
          icon={PhoneCall}
          tone="medium"
        />
        <StatCard
          label="Projected risk reduction"
          value={`${((plan.reduce((s, x) => s + x.patients.length * x.reduction, 0) / Math.max(1, used)) * 100).toFixed(1)}%`}
          hint="Illustrative, not clinical evidence"
          icon={Home}
          tone="low"
        />
      </div>
      <SectionCard
        title="Prioritized intervention list"
        description="Patients are assigned only once, starting with the highest predicted risk."
      >
        <div className="space-y-4">
          {plan.map((x) => (
            <div key={x.name}>
              <div className="flex justify-between text-sm">
                <b>{x.name}</b>
                <span className="text-muted-foreground">
                  {x.patients.length}/{x.count} slots · ${x.cost} each · estimated reduction{" "}
                  {(x.reduction * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {x.patients.map((p) => p.id).join(", ") || "No capacity assigned"}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
