import { Download, RotateCcw, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { DemoBadge } from "@/components/shared/DemoBadge";
import { Button } from "@/components/ui/button";
import { downloadCsv, patientsToCsv } from "@/lib/data/csv";
import { generatePatients } from "@/lib/data/generate";
import { useDataset } from "@/lib/data/dataset-context";

export function DataSourceBar() {
  const { source, sourceName, loadCsv, resetToSynthetic } = useDataset();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    try {
      const text = await file.text();
      loadCsv(text, file.name);
      toast.success("Dataset loaded", { description: `${file.name} is now driving every page.` });
    } catch {
      toast.error("That file could not be read.");
    }
  }

  return (
    <div className="card-surface grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-4">
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold">
            Active dataset: <span className="font-normal text-muted-foreground">{sourceName}</span>
          </p>
          {source === "synthetic" ? <DemoBadge label="Synthetic" /> : <DemoBadge label="Uploaded CSV" />}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload exported Synthea (or EHR) data as CSV to replace the synthetic cohort everywhere in the app.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 sm:shrink-0">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
          <Upload className="size-4" aria-hidden="true" />
          Upload CSV
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            downloadCsv("carepath-sample-patients.csv", patientsToCsv(generatePatients(250, 4242)));
            toast.success("Sample data downloaded", { description: "250 synthetic patients in CSV format." });
          }}
        >
          <Download className="size-4" aria-hidden="true" />
          Download Sample Data
        </Button>
        {source === "uploaded" ? (
          <Button size="sm" variant="ghost" onClick={resetToSynthetic}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
