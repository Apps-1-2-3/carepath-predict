import { createFileRoute } from "@tanstack/react-router";
import { Activity, BedDouble, PhoneCall, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DemoBadge } from "@/components/shared/DemoBadge";
import { LoadingPanel, ErrorPanel } from "@/components/shared/States";
import { PageHeader, SectionCard } from "@/components/shared/SectionCard";
import { RiskBadge, RiskMeter } from "@/components/shared/RiskBadge";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { useDataset } from "@/lib/data/dataset-context";
import {
  byAgeGroup,
  computeKpis,
  riskDistribution,
  segments,
  topRiskFactors,
} from "@/lib/data/analytics";
import type { Patient } from "@/lib/data/types";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const { patients, loading, error } = useDataset();
  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel message={error} />;
  const kpis = computeKpis(patients, 60);
  const highRisk = patients
    .filter((p) => p.riskLevel === "High")
    .sort((a, b) => b.riskScore - a.riskScore);
  const columns: Column<Patient>[] = [
    {
      key: "id",
      header: "Patient ID",
      sortValue: (p) => p.id,
      cell: (p) => <span className="font-medium">{p.id}</span>,
    },
    { key: "age", header: "Age", align: "right", sortValue: (p) => p.age, cell: (p) => p.age },
    {
      key: "diagnosis",
      header: "Diagnosis",
      sortValue: (p) => p.diagnosis,
      cell: (p) => p.diagnosis,
    },
    {
      key: "prior",
      header: "Prior admits",
      align: "right",
      sortValue: (p) => p.priorAdmissions,
      cell: (p) => p.priorAdmissions,
    },
    {
      key: "risk",
      header: "Risk",
      sortValue: (p) => p.riskScore,
      cell: (p) => (
        <div className="flex items-center gap-2">
          <RiskBadge level={p.riskLevel} />
          <RiskMeter score={p.riskScore} />
        </div>
      ),
    },
    {
      key: "action",
      header: "Recommended intervention",
      cell: (p) => (p.riskScore > 0.8 ? "Care manager + home visit" : "Follow-up call"),
    },
  ];
  return (
    <div className="space-y-5">
      <PageHeader
        title="Readmission intelligence"
        description="Prioritize safe, timely follow-up using a transparent synthetic cohort."
        action={<DemoBadge label="Demo Data" />}
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total patients"
          value={kpis.total.toLocaleString()}
          hint="Active cohort"
          icon={Users}
        />
        <StatCard
          label="High-risk patients"
          value={kpis.highRisk.toLocaleString()}
          hint="Risk score ≥ 60%"
          icon={Activity}
          tone="high"
        />
        <StatCard
          label="Predicted readmissions"
          value={kpis.predictedReadmissions}
          hint="Expected in 30 days"
          icon={BedDouble}
          tone="medium"
        />
        <StatCard
          label="Average risk score"
          value={`${Math.round(kpis.avgRisk * 100)}%`}
          hint="Model probability"
          icon={Activity}
          tone="teal"
        />
        <StatCard
          label="Follow-up capacity"
          value={kpis.capacity}
          hint="Available care slots"
          icon={PhoneCall}
          tone="low"
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <SectionCard
          title="Readmission-risk distribution"
          description="Patients by predicted 30-day risk"
        >
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={riskDistribution(patients)}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="patients" fill="var(--color-teal)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Patient segments" description="Risk-level mix across the active cohort">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={segments(patients)}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {[
                    "var(--color-risk-low)",
                    "var(--color-risk-medium)",
                    "var(--color-risk-high)",
                  ].map((fill) => (
                    <Cell key={fill} fill={fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard
          title="Risk by age group"
          description="Average predicted risk; generated demo values"
        >
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={byAgeGroup(patients)}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="group" />
                <YAxis unit="%" />
                <Tooltip />
                <Bar
                  dataKey="avgRisk"
                  name="Average risk"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard
          title="Top risk factors"
          description="Average absolute contribution, not clinical causality"
        >
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart layout="vertical" data={topRiskFactors(patients, 6)} margin={{ left: 35 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="factor" width={115} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="impact" fill="var(--color-risk-high)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
      <SectionCard
        title="High-risk patients"
        description="Sort or search this prioritization queue. Recommendations are configurable demo assumptions."
      >
        <DataTable
          rows={highRisk}
          columns={columns}
          rowKey={(p) => p.id}
          searchable={(p) => `${p.id} ${p.diagnosis}`}
          initialSort={{ key: "risk", dir: "desc" }}
          pageSize={8}
        />
      </SectionCard>
    </div>
  );
}
