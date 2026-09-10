import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/shared/SectionCard";
export const Route = createFileRoute("/about")({ component: About });
function About() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="About CarePath AI"
        description="Project notes, methodology, limitations and integration roadmap."
      />
      <SectionCard title="Project">
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            CarePath AI is an educational dashboard for exploring 30-day hospital-readmission
            prioritization. It generates a deterministic synthetic cohort of 1,200 patients or
            accepts compatible CSV uploads.
          </p>
          <p>
            <b className="text-foreground">Methodology.</b> Demo risk scores are produced from
            transparent weighted factors such as prior admissions, emergency visits, comorbidity
            burden, medications, length of stay and age. Charts, SHAP-style contributions, model
            metrics and hypothesis tests are generated demonstration outputs.
          </p>
          <p>
            <b className="text-foreground">Limitations.</b> This is not a medical device and must
            not guide clinical decisions. Synthetic results are not externally validated,
            calibrated, fairness-tested, or representative of a care population.
          </p>
          <p>
            <b className="text-foreground">Backend roadmap.</b> Replace the in-browser scoring layer
            with a versioned Python service; validate feature definitions and outcomes; add
            authentication, audit trails, monitoring, calibration and clinician governance before
            any production use.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
