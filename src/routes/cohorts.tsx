import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemoBadge } from "@/components/shared/DemoBadge";
import { LoadingPanel, ErrorPanel } from "@/components/shared/States";
import { PageHeader, SectionCard } from "@/components/shared/SectionCard";
import { byAgeGroup, groupRate, tTest } from "@/lib/data/analytics";
import { useDataset } from "@/lib/data/dataset-context";
import { ageGroupOf } from "@/lib/data/types";
export const Route = createFileRoute("/cohorts")({ component: Cohorts });
function Cohorts() {
  const { patients, loading, error } = useDataset();
  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel message={error} />;
  const admitted = patients.filter((p) => p.readmitted).map((p) => p.lengthOfStay);
  const not = patients.filter((p) => !p.readmitted).map((p) => p.lengthOfStay);
  const finding = tTest(admitted, not);
  const charts = [
    [
      "Readmission rate by age group",
      byAgeGroup(patients).map((x) => ({ key: x.group, rate: x.observedRate })),
    ],
    [
      "Readmission rate by diagnosis",
      groupRate(patients, (p) => p.diagnosisCategory).map((x) => ({
        key: x.key,
        rate: x.readmissionRate,
      })),
    ],
    [
      "Readmission rate by prior admissions",
      groupRate(patients, (p) => String(Math.min(4, p.priorAdmissions))).map((x) => ({
        key: x.key === "4" ? "4+" : x.key,
        rate: x.readmissionRate,
      })),
    ],
  ] as const;
  return (
    <div className="space-y-5">
      <PageHeader
        title="Cohort insights"
        description="Compare outcome patterns in the active cohort. All analyses are illustrative demo results."
        action={<DemoBadge label="Demo Data" />}
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {charts.map(([title, data]) => (
          <SectionCard key={title} title={title} description="Observed 30-day readmission rate">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={data}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="key" tick={{ fontSize: 11 }} />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Bar dataKey="rate" fill="var(--color-teal)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        ))}
        <SectionCard
          title="Statistical findings"
          description="Normal-approximation t-test; not suitable for clinical inference."
        >
          <div className="space-y-4 text-sm">
            <div className="rounded-lg bg-secondary p-4">
              <p className="font-semibold">Length of stay differs between outcome groups</p>
              <p className="mt-1 text-muted-foreground">
                Readmitted: {finding.meanA.toFixed(1)} days · Not readmitted:{" "}
                {finding.meanB.toFixed(1)} days · p &lt; {finding.p.toFixed(4)}
              </p>
            </div>
            <p className="text-muted-foreground">
              Interpretation: the synthetic cohort shows an association, not a causal effect. Real
              analyses need cohort definitions, missing-data checks, pre-specified tests, and
              clinical review.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
