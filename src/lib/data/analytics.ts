import { AGE_GROUPS, ageGroupOf, type Patient } from "./types";

export interface Kpis {
  total: number;
  highRisk: number;
  predictedReadmissions: number;
  avgRisk: number;
  capacity: number;
  observedRate: number;
}

export function computeKpis(patients: Patient[], capacity: number): Kpis {
  const total = patients.length;
  const highRisk = patients.filter((p) => p.riskLevel === "High").length;
  const predicted = patients.reduce((s, p) => s + p.riskScore, 0);
  return {
    total,
    highRisk,
    predictedReadmissions: Math.round(predicted),
    avgRisk: total ? predicted / total : 0,
    capacity,
    observedRate: total ? patients.filter((p) => p.readmitted).length / total : 0,
  };
}

export function riskDistribution(patients: Patient[]) {
  const bins = Array.from({ length: 10 }, (_, i) => ({
    bucket: `${i * 10}-${i * 10 + 10}%`,
    patients: 0,
  }));
  for (const p of patients) {
    const i = Math.min(9, Math.floor(p.riskScore * 10));
    bins[i]!.patients++;
  }
  return bins;
}

export function segments(patients: Patient[]) {
  const counts: Record<"Low" | "Medium" | "High", number> = { Low: 0, Medium: 0, High: 0 };
  for (const p of patients) counts[p.riskLevel] += 1;
  return [
    { name: "Low Risk", value: counts.Low, key: "Low" },
    { name: "Medium Risk", value: counts.Medium, key: "Medium" },
    { name: "High Risk", value: counts.High, key: "High" },
  ];
}

export function byAgeGroup(patients: Patient[]) {
  return AGE_GROUPS.map((group) => {
    const rows = patients.filter((p) => ageGroupOf(p.age) === group);
    const n = rows.length;
    return {
      group,
      patients: n,
      avgRisk: n ? Number(((rows.reduce((s, p) => s + p.riskScore, 0) / n) * 100).toFixed(1)) : 0,
      observedRate: n ? Number(((rows.filter((p) => p.readmitted).length / n) * 100).toFixed(1)) : 0,
    };
  });
}

export function topRiskFactors(patients: Patient[], limit = 8) {
  const totals = new Map<string, { sum: number; n: number }>();
  for (const p of patients) {
    for (const f of p.factors) {
      const key = f.label.replace(/\s*\(.*\)\s*$/, "").replace(/^(Primary diagnosis|Age).*/, "$1");
      const entry = totals.get(key) ?? { sum: 0, n: 0 };
      entry.sum += Math.abs(f.contribution);
      entry.n++;
      totals.set(key, entry);
    }
  }
  return [...totals.entries()]
    .map(([factor, v]) => ({ factor, impact: Number((v.sum / Math.max(1, patients.length)).toFixed(3)) }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, limit);
}

export function groupRate<K extends string>(
  patients: Patient[],
  keyOf: (p: Patient) => K,
  order?: readonly K[],
) {
  const map = new Map<K, { n: number; readmitted: number; risk: number }>();
  for (const p of patients) {
    const k = keyOf(p);
    const e = map.get(k) ?? { n: 0, readmitted: 0, risk: 0 };
    e.n++;
    if (p.readmitted) e.readmitted++;
    e.risk += p.riskScore;
    map.set(k, e);
  }
  const keys = order ? order.filter((k) => map.has(k)) : [...map.keys()].sort();
  return keys.map((k) => {
    const e = map.get(k)!;
    return {
      key: k as string,
      patients: e.n,
      readmissionRate: Number(((e.readmitted / e.n) * 100).toFixed(1)),
      avgRisk: Number(((e.risk / e.n) * 100).toFixed(1)),
    };
  });
}

export function mean(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

export function stdev(values: number[]) {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1));
}

/** Two-sample t statistic + normal-approximation p-value (demo statistics). */
export function tTest(a: number[], b: number[]) {
  const ma = mean(a);
  const mb = mean(b);
  const va = stdev(a) ** 2;
  const vb = stdev(b) ** 2;
  const se = Math.sqrt(va / Math.max(1, a.length) + vb / Math.max(1, b.length)) || 1e-9;
  const t = (ma - mb) / se;
  const z = Math.abs(t);
  // Zelen & Severo normal tail approximation.
  const p = 2 * (1 - normalCdf(z));
  return { meanA: ma, meanB: mb, t, p: Math.max(p, 1e-6) };
}

function normalCdf(z: number) {
  const b = [0.319381530, -0.356563782, 1.781477937, -1.821255978, 1.330274429];
  const t = 1 / (1 + 0.2316419 * z);
  const poly = b.reduce((acc, c, i) => acc + c * t ** (i + 1), 0);
  return 1 - 0.3989422804014327 * Math.exp(-0.5 * z * z) * poly;
}

export function rocCurve(patients: Patient[]) {
  const sorted = [...patients].sort((a, b) => b.riskScore - a.riskScore);
  const pos = sorted.filter((p) => p.readmitted).length || 1;
  const neg = sorted.length - pos || 1;
  const points = [{ fpr: 0, tpr: 0, chance: 0 }];
  let tp = 0;
  let fp = 0;
  const step = Math.max(1, Math.floor(sorted.length / 120));
  sorted.forEach((p, i) => {
    if (p.readmitted) tp++;
    else fp++;
    if (i % step === 0 || i === sorted.length - 1) {
      const fpr = Number((fp / neg).toFixed(4));
      points.push({ fpr, tpr: Number((tp / pos).toFixed(4)), chance: fpr });
    }
  });
  points.push({ fpr: 1, tpr: 1, chance: 1 });

  let auc = 0;
  for (let i = 1; i < points.length; i++) {
    auc += ((points[i]!.fpr - points[i - 1]!.fpr) * (points[i]!.tpr + points[i - 1]!.tpr)) / 2;
  }
  return { points, auc };
}

export function confusion(patients: Patient[], threshold = 0.5) {
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  for (const p of patients) {
    const predicted = p.riskScore >= threshold;
    if (predicted && p.readmitted) tp++;
    else if (predicted && !p.readmitted) fp++;
    else if (!predicted && p.readmitted) fn++;
    else tn++;
  }
  const precision = tp / Math.max(1, tp + fp);
  const recall = tp / Math.max(1, tp + fn);
  return {
    tp,
    fp,
    tn,
    fn,
    precision,
    recall,
    accuracy: (tp + tn) / Math.max(1, patients.length),
    f1: (2 * precision * recall) / Math.max(1e-9, precision + recall),
  };
}
