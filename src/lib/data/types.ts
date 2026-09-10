export type RiskLevel = "Low" | "Medium" | "High";

export interface Encounter {
  date: string;
  type: "Inpatient" | "Emergency" | "Outpatient" | "Observation";
  reason: string;
  lengthOfStay: number;
}

export interface RiskFactor {
  label: string;
  /** Signed contribution to the risk score (SHAP-style, demo data). */
  contribution: number;
}

export interface Patient {
  id: string;
  age: number;
  gender: "Female" | "Male" | "Other";
  diagnosis: string;
  diagnosisCategory: string;
  chronicConditions: string[];
  priorAdmissions: number;
  emergencyVisits: number;
  medicationCount: number;
  lengthOfStay: number;
  riskScore: number;
  riskLevel: RiskLevel;
  readmitted: boolean;
  insurance: string;
  livesAlone: boolean;
  dischargeDisposition: string;
  encounters: Encounter[];
  medications: string[];
  factors: RiskFactor[];
}

export const AGE_GROUPS = ["18-39", "40-54", "55-64", "65-74", "75-84", "85+"] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export function ageGroupOf(age: number): AgeGroup {
  if (age < 40) return "18-39";
  if (age < 55) return "40-54";
  if (age < 65) return "55-64";
  if (age < 75) return "65-74";
  if (age < 85) return "75-84";
  return "85+";
}

export function riskLevelOf(score: number): RiskLevel {
  if (score >= 0.6) return "High";
  if (score >= 0.35) return "Medium";
  return "Low";
}
