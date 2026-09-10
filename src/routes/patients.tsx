import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter } from "lucide-react";

import { DataTable, type Column } from "@/components/shared/DataTable";
import { PageHeader, SectionCard } from "@/components/shared/SectionCard";
import { RiskBadge, RiskMeter } from "@/components/shared/RiskBadge";
import { LoadingPanel, ErrorPanel } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataset } from "@/lib/data/dataset-context";
import type { Patient, RiskLevel } from "@/lib/data/types";

export const Route = createFileRoute("/patients")({ component: Patients });

function Patients() {
  const { patients, loading, error } = useDataset();
  const [level, setLevel] = useState<"All" | RiskLevel>("All");
  const [diagnosis, setDiagnosis] = useState("All");
  const [selected, setSelected] = useState<Patient | null>(null);
  const diagnoses = useMemo(
    () => [...new Set(patients.map((p) => p.diagnosis))].sort(),
    [patients],
  );
  const rows = patients.filter(
    (p) =>
      (level === "All" || p.riskLevel === level) &&
      (diagnosis === "All" || p.diagnosis === diagnosis),
  );
  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel message={error} />;
  const columns: Column<Patient>[] = [
    { key: "id", header: "Patient ID", sortValue: (p) => p.id, cell: (p) => <b>{p.id}</b> },
    { key: "age", header: "Age", align: "right", sortValue: (p) => p.age, cell: (p) => p.age },
    {
      key: "diagnosis",
      header: "Diagnosis",
      sortValue: (p) => p.diagnosis,
      cell: (p) => p.diagnosis,
    },
    {
      key: "admissions",
      header: "Prior admits",
      align: "right",
      sortValue: (p) => p.priorAdmissions,
      cell: (p) => p.priorAdmissions,
    },
    {
      key: "medications",
      header: "Medications",
      align: "right",
      sortValue: (p) => p.medicationCount,
      cell: (p) => p.medicationCount,
    },
    {
      key: "risk",
      header: "Risk",
      sortValue: (p) => p.riskScore,
      cell: (p) => (
        <div className="flex gap-2">
          <RiskBadge level={p.riskLevel} />
          <RiskMeter score={p.riskScore} />
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-5">
      <PageHeader
        title="Patient explorer"
        description="Search the active cohort and inspect transparent, SHAP-style demo factors."
      />
      <SectionCard
        title="Filter patients"
        description="Filters update the table and selected patient profile."
      >
        <div className="flex flex-wrap gap-2">
          <Filter className="mt-2 size-4 text-muted-foreground" />
          <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Risk level" />
            </SelectTrigger>
            <SelectContent>
              {["All", "Low", "Medium", "High"].map((v) => (
                <SelectItem key={v} value={v}>
                  {v} risk
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={diagnosis} onValueChange={setDiagnosis}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Diagnosis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All diagnoses</SelectItem>
              {diagnoses.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            onClick={() => {
              setLevel("All");
              setDiagnosis("All");
            }}
          >
            Clear filters
          </Button>
        </div>
      </SectionCard>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
        <SectionCard
          title="Patients"
          description={`${rows.length.toLocaleString()} matching patients`}
        >
          <DataTable
            rows={rows}
            columns={columns}
            rowKey={(p) => p.id}
            searchable={(p) => `${p.id} ${p.diagnosis} ${p.diagnosisCategory}`}
            onRowClick={setSelected}
            initialSort={{ key: "risk", dir: "desc" }}
          />
        </SectionCard>
        <Profile patient={selected} />
      </div>
    </div>
  );
}

function Profile({ patient }: { patient: Patient | null }) {
  if (!patient)
    return (
      <SectionCard title="Patient profile" description="Select a row to inspect the profile.">
        <p className="py-16 text-center text-sm text-muted-foreground">No patient selected.</p>
      </SectionCard>
    );
  return (
    <SectionCard
      title={patient.id}
      description={`${patient.age}-year-old ${patient.gender} · ${patient.diagnosis}`}
    >
      <div className="space-y-5 text-sm">
        <div className="flex justify-between">
          <RiskBadge level={patient.riskLevel} />
          <RiskMeter score={patient.riskScore} />
        </div>
        <div>
          <p className="font-semibold">Care context</p>
          <p className="mt-1 text-muted-foreground">
            {patient.priorAdmissions} prior admissions · {patient.emergencyVisits} ED visits ·{" "}
            {patient.medicationCount} medications · {patient.lengthOfStay}-day stay
          </p>
        </div>
        <div>
          <p className="font-semibold">
            Contributing factors{" "}
            <span className="text-xs font-normal text-muted-foreground">(Demo explanation)</span>
          </p>
          <div className="mt-2 space-y-2">
            {patient.factors.slice(0, 6).map((f) => (
              <div key={f.label} className="flex justify-between gap-3">
                <span>{f.label}</span>
                <span className={f.contribution > 0 ? "text-risk-high" : "text-risk-low"}>
                  {f.contribution > 0 ? "+" : ""}
                  {f.contribution.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
