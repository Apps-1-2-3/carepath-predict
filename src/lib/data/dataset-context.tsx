import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { generatePatients } from "./generate";
import { parsePatientsCsv } from "./csv";
import type { Patient } from "./types";

export type DataSource = "synthetic" | "uploaded";

interface DatasetState {
  patients: Patient[];
  source: DataSource;
  sourceName: string;
  loading: boolean;
  error: string | null;
  loadCsv: (text: string, fileName: string) => void;
  resetToSynthetic: () => void;
}

const DatasetContext = createContext<DatasetState | null>(null);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [source, setSource] = useState<DataSource>("synthetic");
  const [sourceName, setSourceName] = useState("Synthetic cohort (1,200 patients)");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      try {
        const generated = generatePatients(1200);
        if (!cancelled) setPatients(generated);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not prepare the demo cohort.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, []);

  const loadCsv = useCallback((text: string, fileName: string) => {
    setLoading(true);
    setError(null);
    try {
      const { patients: parsed } = parsePatientsCsv(text);
      setPatients(parsed);
      setSource("uploaded");
      setSourceName(`${fileName} (${parsed.length.toLocaleString()} patients)`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file could not be read.");
    } finally {
      setLoading(false);
    }
  }, []);

  const resetToSynthetic = useCallback(() => {
    setLoading(true);
    setError(null);
    const generated = generatePatients(1200);
    setPatients(generated);
    setSource("synthetic");
    setSourceName("Synthetic cohort (1,200 patients)");
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ patients, source, sourceName, loading, error, loadCsv, resetToSynthetic }),
    [patients, source, sourceName, loading, error, loadCsv, resetToSynthetic],
  );

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used inside DatasetProvider");
  return ctx;
}
