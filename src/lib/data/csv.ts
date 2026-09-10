import { riskLevelOf, type Patient } from "./types";

export const CSV_COLUMNS = [
  "patient_id",
  "age",
  "gender",
  "diagnosis",
  "diagnosis_category",
  "chronic_conditions",
  "prior_admissions",
  "emergency_visits",
  "medication_count",
  "length_of_stay",
  "risk_score",
  "readmitted_30d",
] as const;

export function patientsToCsv(patients: Patient[]): string {
  const rows = patients.map((p) =>
    [
      p.id,
      p.age,
      p.gender,
      `"${p.diagnosis}"`,
      `"${p.diagnosisCategory}"`,
      `"${p.chronicConditions.join("; ")}"`,
      p.priorAdmissions,
      p.emergencyVisits,
      p.medicationCount,
      p.lengthOfStay,
      p.riskScore,
      p.readmitted ? 1 : 0,
    ].join(","),
  );
  return [CSV_COLUMNS.join(","), ...rows].join("\n");
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

export interface ParseResult {
  patients: Patient[];
  skipped: number;
}

/** Tolerant CSV parser: maps common Synthea-style header aliases. */
export function parsePatientsCsv(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) throw new Error("The file needs a header row and at least one patient row.");

  const header = splitCsvLine(lines[0]!).map((h) => h.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
  const idx = (...names: string[]) => {
    for (const n of names) {
      const i = header.indexOf(n);
      if (i !== -1) return i;
    }
    return -1;
  };

  const cId = idx("patient_id", "id", "patient", "subject_id");
  const cAge = idx("age", "patient_age");
  const cGender = idx("gender", "sex");
  const cDx = idx("diagnosis", "primary_diagnosis", "condition", "description");
  const cDxCat = idx("diagnosis_category", "category", "service_line");
  const cChronic = idx("chronic_conditions", "comorbidities", "conditions");
  const cPrior = idx("prior_admissions", "previous_admissions", "n_admissions");
  const cEr = idx("emergency_visits", "ed_visits", "er_visits");
  const cMeds = idx("medication_count", "n_medications", "num_medications");
  const cLos = idx("length_of_stay", "los", "days_in_hospital");
  const cRisk = idx("risk_score", "readmission_risk", "probability");
  const cOutcome = idx("readmitted_30d", "readmitted", "readmission", "outcome", "label");

  if (cAge === -1 || cDx === -1) {
    throw new Error("Could not find age and diagnosis columns. Compare your file with the sample download.");
  }

  const patients: Patient[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]!);
    const age = Number(cells[cAge]);
    const diagnosis = cells[cDx] ?? "";
    if (!Number.isFinite(age) || !diagnosis) {
      skipped++;
      continue;
    }
    const priorAdmissions = Math.max(0, Number(cells[cPrior]) || 0);
    const emergencyVisits = Math.max(0, Number(cells[cEr]) || 0);
    const medicationCount = Math.max(0, Number(cells[cMeds]) || 0);
    const lengthOfStay = Math.max(0, Number(cells[cLos]) || 1);
    const chronicConditions = (cells[cChronic] ?? "")
      .split(/[;|]/)
      .map((s) => s.trim())
      .filter(Boolean);

    let riskScore = Number(cells[cRisk]);
    if (!Number.isFinite(riskScore)) {
      const logit =
        -1.9 +
        priorAdmissions * 0.34 +
        emergencyVisits * 0.22 +
        chronicConditions.length * 0.19 +
        (medicationCount - 8) * 0.05 +
        (lengthOfStay - 5) * 0.06 +
        (age - 62) * 0.014;
      riskScore = 1 / (1 + Math.exp(-logit));
    }
    if (riskScore > 1) riskScore = riskScore / 100;
    riskScore = Number(Math.min(0.97, Math.max(0.02, riskScore)).toFixed(3));

    const outcomeRaw = (cells[cOutcome] ?? "").toLowerCase();
    const readmitted = ["1", "true", "yes", "y", "readmitted"].includes(outcomeRaw);

    const factors = [
      { label: `Prior inpatient admissions (${priorAdmissions})`, contribution: Number((priorAdmissions * 0.34).toFixed(3)) },
      { label: `Emergency visits (${emergencyVisits})`, contribution: Number((emergencyVisits * 0.22).toFixed(3)) },
      { label: `Chronic conditions (${chronicConditions.length})`, contribution: Number((chronicConditions.length * 0.19).toFixed(3)) },
      { label: `Polypharmacy (${medicationCount} medications)`, contribution: Number(((medicationCount - 8) * 0.05).toFixed(3)) },
      { label: `Length of stay (${lengthOfStay} days)`, contribution: Number(((lengthOfStay - 5) * 0.06).toFixed(3)) },
      { label: `Age ${age}`, contribution: Number(((age - 62) * 0.014).toFixed(3)) },
    ]
      .filter((f) => Math.abs(f.contribution) > 0.01)
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    patients.push({
      id: cells[cId] || `ROW-${i}`,
      age: Math.round(age),
      gender: /^f/i.test(cells[cGender] ?? "") ? "Female" : /^m/i.test(cells[cGender] ?? "") ? "Male" : "Other",
      diagnosis,
      diagnosisCategory: cells[cDxCat] || "Uncategorized",
      chronicConditions,
      priorAdmissions,
      emergencyVisits,
      medicationCount,
      lengthOfStay,
      riskScore,
      riskLevel: riskLevelOf(riskScore),
      readmitted,
      insurance: "Unknown",
      livesAlone: false,
      dischargeDisposition: "Unknown",
      encounters: [],
      medications: [],
      factors,
    });
  }

  if (patients.length === 0) throw new Error("No usable patient rows were found in that file.");
  return { patients, skipped };
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
