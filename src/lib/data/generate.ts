import {
  ageGroupOf,
  riskLevelOf,
  type Encounter,
  type Patient,
  type RiskFactor,
} from "./types";

/** Deterministic PRNG so server-rendered and client-rendered data match. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIAGNOSES: { name: string; category: string; base: number }[] = [
  { name: "Congestive Heart Failure", category: "Cardiovascular", base: 0.3 },
  { name: "Acute Myocardial Infarction", category: "Cardiovascular", base: 0.24 },
  { name: "Atrial Fibrillation", category: "Cardiovascular", base: 0.18 },
  { name: "COPD Exacerbation", category: "Respiratory", base: 0.28 },
  { name: "Pneumonia", category: "Respiratory", base: 0.2 },
  { name: "Type 2 Diabetes Complication", category: "Endocrine", base: 0.22 },
  { name: "Chronic Kidney Disease", category: "Renal", base: 0.26 },
  { name: "Sepsis", category: "Infectious Disease", base: 0.25 },
  { name: "Stroke / TIA", category: "Neurological", base: 0.21 },
  { name: "Hip / Knee Replacement", category: "Orthopedic", base: 0.09 },
  { name: "GI Bleed", category: "Gastrointestinal", base: 0.17 },
  { name: "Cellulitis", category: "Infectious Disease", base: 0.12 },
];

const CHRONIC = [
  "Hypertension",
  "Diabetes Mellitus",
  "Heart Failure",
  "COPD",
  "Chronic Kidney Disease",
  "Obesity",
  "Depression",
  "Atrial Fibrillation",
  "Anemia",
  "Osteoarthritis",
];

const MEDS = [
  "Furosemide",
  "Metoprolol",
  "Lisinopril",
  "Metformin",
  "Insulin glargine",
  "Atorvastatin",
  "Apixaban",
  "Albuterol",
  "Prednisone",
  "Sertraline",
  "Pantoprazole",
  "Aspirin",
  "Spironolactone",
  "Gabapentin",
  "Levothyroxine",
];

const DISPOSITIONS = ["Home", "Home with Home Health", "Skilled Nursing Facility", "Rehab Facility"];
const INSURANCE = ["Medicare", "Medicaid", "Commercial", "Self-pay"];

function pick<T>(rnd: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rnd() * arr.length)]!;
}

function clamp(v: number, lo = 0, hi = 1) {
  return Math.min(hi, Math.max(lo, v));
}

function sigmoid(x: number) {
  return 1 / (1 + Math.exp(-x));
}

function isoDaysAgo(days: number) {
  const base = Date.UTC(2026, 8, 1);
  return new Date(base - days * 86400000).toISOString().slice(0, 10);
}

export function generatePatients(count = 1200, seed = 20260910): Patient[] {
  const rnd = mulberry32(seed);
  const patients: Patient[] = [];

  for (let i = 0; i < count; i++) {
    const dx = pick(rnd, DIAGNOSES);
    const age = Math.round(28 + Math.pow(rnd(), 0.7) * 64);
    const gender = rnd() < 0.51 ? "Female" : rnd() < 0.98 ? "Male" : "Other";
    const priorAdmissions = Math.min(9, Math.floor(Math.pow(rnd(), 2.2) * 8));
    const emergencyVisits = Math.min(8, Math.floor(Math.pow(rnd(), 2) * 7));
    const medicationCount = Math.max(0, Math.round(3 + rnd() * 14 + (age - 55) * 0.05));
    const lengthOfStay = Math.max(1, Math.round(1 + Math.pow(rnd(), 1.6) * 13));
    const livesAlone = rnd() < 0.32;
    const disposition = pick(rnd, DISPOSITIONS);
    const insurance = age >= 65 ? (rnd() < 0.85 ? "Medicare" : "Commercial") : pick(rnd, INSURANCE);

    const chronicCount = Math.min(6, Math.floor(Math.pow(rnd(), 1.4) * 5) + (age > 70 ? 1 : 0));
    const chronicConditions: string[] = [];
    while (chronicConditions.length < chronicCount) {
      const c = pick(rnd, CHRONIC);
      if (!chronicConditions.includes(c)) chronicConditions.push(c);
    }

    const medications: string[] = [];
    const medNames = Math.min(MEDS.length, Math.max(1, Math.round(medicationCount * 0.6)));
    while (medications.length < medNames) {
      const m = pick(rnd, MEDS);
      if (!medications.includes(m)) medications.push(m);
    }

    // Weighted logit — the demo "model" that produces risk scores.
    const terms: { label: string; value: number }[] = [
      { label: `Prior inpatient admissions (${priorAdmissions})`, value: priorAdmissions * 0.34 },
      { label: `Emergency visits in 6 months (${emergencyVisits})`, value: emergencyVisits * 0.22 },
      { label: `Chronic conditions (${chronicCount})`, value: chronicCount * 0.19 },
      { label: `Polypharmacy (${medicationCount} medications)`, value: (medicationCount - 8) * 0.05 },
      { label: `Length of stay (${lengthOfStay} days)`, value: (lengthOfStay - 5) * 0.06 },
      { label: `Age ${age}`, value: (age - 62) * 0.014 },
      { label: `Primary diagnosis: ${dx.name}`, value: (dx.base - 0.2) * 3.2 },
      { label: livesAlone ? "Lives alone" : "Lives with caregiver", value: livesAlone ? 0.35 : -0.28 },
      {
        label: `Discharge to ${disposition}`,
        value: disposition === "Home" ? -0.22 : disposition === "Skilled Nursing Facility" ? 0.24 : 0.05,
      },
      { label: insurance === "Medicaid" ? "Medicaid coverage" : `${insurance} coverage`, value: insurance === "Medicaid" ? 0.2 : -0.05 },
    ];

    const logit = terms.reduce((s, t) => s + t.value, 0) - 1.85 + (rnd() - 0.5) * 0.9;
    const riskScore = Number(clamp(sigmoid(logit), 0.02, 0.97).toFixed(3));
    const readmitted = rnd() < clamp(riskScore * 0.92 + 0.02);

    const factors: RiskFactor[] = terms
      .map((t) => ({ label: t.label, contribution: Number(t.value.toFixed(3)) }))
      .filter((f) => Math.abs(f.contribution) > 0.01)
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    const encounterCount = Math.min(5, 1 + priorAdmissions + (emergencyVisits > 2 ? 1 : 0));
    const encounters: Encounter[] = [];
    let dayCursor = 12 + Math.floor(rnd() * 20);
    for (let e = 0; e < encounterCount; e++) {
      const type: Encounter["type"] =
        e === 0 ? "Inpatient" : pick(rnd, ["Emergency", "Outpatient", "Observation", "Inpatient"] as const);
      encounters.push({
        date: isoDaysAgo(dayCursor),
        type,
        reason: e === 0 ? dx.name : pick(rnd, [dx.name, "Shortness of breath", "Chest pain", "Medication review", "Fall", "Fever"]),
        lengthOfStay: type === "Inpatient" ? Math.max(1, Math.round(lengthOfStay * (0.6 + rnd() * 0.8))) : type === "Observation" ? 1 : 0,
      });
      dayCursor += 25 + Math.floor(rnd() * 160);
    }

    patients.push({
      id: `PT-${String(100000 + i).slice(1)}`,
      age,
      gender,
      diagnosis: dx.name,
      diagnosisCategory: dx.category,
      chronicConditions,
      priorAdmissions,
      emergencyVisits,
      medicationCount,
      lengthOfStay,
      riskScore,
      riskLevel: riskLevelOf(riskScore),
      readmitted,
      insurance,
      livesAlone,
      dischargeDisposition: disposition,
      encounters,
      medications,
      factors,
    });
  }

  return patients;
}

export { ageGroupOf };
