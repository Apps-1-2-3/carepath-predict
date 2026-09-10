import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, CheckCircle2, Crosshair, Target } from "lucide-react";
import { DemoBadge } from "@/components/shared/DemoBadge";
import { PageHeader, SectionCard } from "@/components/shared/SectionCard";
import { StatCard } from "@/components/shared/StatCard";
import { LoadingPanel, ErrorPanel } from "@/components/shared/States";
import { confusion, rocCurve, topRiskFactors } from "@/lib/data/analytics";
import { useDataset } from "@/lib/data/dataset-context";
export const Route = createFileRoute("/model")({ component: Model });
function Model() {
  const { patients, loading, error } = useDataset();
  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel message={error} />;
  const c = confusion(patients);
  const roc = rocCurve(patients);
  const metrics = [
    ["ROC-AUC", roc.auc, Activity],
    ["Precision", c.precision, Target],
    ["Recall", c.recall, Crosshair],
    ["F1 score", c.f1, CheckCircle2],
  ] as const;
  return (
    <div className="space-y-5">
      <PageHeader
        title="Model performance"
        description="Evaluation calculated against synthetic demo outcomes; it is not a validated clinical model."
        action={<DemoBadge label="Demo Data" />}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, icon]) => (
          <StatCard
            key={label}
            label={label}
            value={`${(value * 100).toFixed(1)}%`}
            hint="Synthetic evaluation"
            icon={icon}
            tone="teal"
          />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard title="ROC curve" description="Synthetic-cohort discrimination">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={roc.points}>
                <CartesianGrid />
                <XAxis dataKey="fpr" />
                <YAxis dataKey="tpr" />
                <Tooltip />
                <Line dataKey="tpr" stroke="var(--color-teal)" dot={false} strokeWidth={2} />
                <Line
                  dataKey="chance"
                  stroke="var(--color-muted-foreground)"
                  dot={false}
                  strokeDasharray="4 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Confusion matrix" description="Threshold: 50% predicted risk">
          <div className="grid grid-cols-2 gap-3 text-center">
            {[
              ["True positive", c.tp, "bg-risk-high/10"],
              ["False positive", c.fp, "bg-risk-medium/15"],
              ["False negative", c.fn, "bg-risk-medium/15"],
              ["True negative", c.tn, "bg-risk-low/10"],
            ].map(([l, v, t]) => (
              <div key={String(l)} className={`rounded-xl p-6 ${t}`}>
                <p className="text-3xl font-semibold">{v}</p>
                <p className="mt-1 text-xs text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Feature importance" description="Mean absolute demo contribution">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart layout="vertical" data={topRiskFactors(patients, 8)} margin={{ left: 35 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="factor" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="impact" fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard
          title="Model comparison"
          description="Illustrative comparison; connect a backend for real experiments."
        >
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th>Model</th>
                <th>ROC-AUC</th>
                <th>Recall</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Logistic Regression", "76.8%", "68.4%"],
                ["Random Forest", "81.1%", "74.2%"],
                ["XGBoost", "83.5%", "76.8%"],
              ].map((r) => (
                <tr key={r[0]} className="border-t">
                  <td className="py-4 font-medium">{r[0]}</td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td>
                    <DemoBadge label="Illustrative" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      </div>
    </div>
  );
}
