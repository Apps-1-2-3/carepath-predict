# CarePath Insights

Build a polished, responsive web application called “CarePath AI: Readmission Intelligence.”

Purpose:

A healthcare analytics dashboard for analyzing patient data, predicting 30-day hospital readmission risk, explaining key risk factors, and prioritizing patients for limited follow-up interventions.

Design:

Use a professional healthcare analytics style: clean white background, navy and teal accents, rounded cards, subtle shadows, accessible contrast, and a modern dashboard layout. Use React, TypeScript, Tailwind CSS, shadcn/ui, Recharts, and Lucide icons.

Pages and features:

1. Dashboard

- KPI cards: Total Patients, High-Risk Patients, Predicted Readmissions, Average Risk Score, Available Follow-Up Capacity.

- Readmission-risk distribution chart.

- Trend chart for readmission risk by age group.

- Bar chart for top risk factors.

- Donut chart showing patient segments: Low, Medium, High Risk.

- Table of high-risk patients with patient ID, age, diagnosis, prior admissions, risk score, and recommended intervention.

2. Patient Explorer

- Search and filter patients by age group, diagnosis, risk level, number of prior admissions, and medication count.

- Show a detailed patient profile with demographics, recent encounters, diagnoses, medications, risk score, and contributing factors.

- Include a SHAP-style explanation panel showing positive and negative factors influencing the risk score.

3. Model Performance

- Display cards for ROC-AUC, Precision, Recall, F1 Score, and Accuracy.

- Show confusion matrix, ROC curve, feature-importance chart, and comparison table for Logistic Regression, Random Forest, and XGBoost.

- Clearly label model metrics as generated demo data until connected to a real Python backend.

4. Cohort Insights

- Enable cohort comparisons between readmitted and non-readmitted patients.

- Show charts for readmission rate by age group, diagnosis category, medication count, prior emergency visits, and length of stay.

- Include a “Statistical Findings” section with example hypothesis-test results, p-values, and plain-English interpretations. Clearly label these as demo results until real analysis is connected.

5. Intervention Planner

- Let users set a maximum number of follow-up calls, care-manager slots, and home visits.

- Recommend which high-risk patients should receive each intervention.

- Show estimated risk reduction, intervention cost, total capacity used, and prioritized patient list.

- Include an explanation that recommendations are based on configurable assumptions.

Data:

- Generate realistic synthetic healthcare data for at least 1,000 patients directly in the app.

- Fields should include patient ID, age, gender, diagnosis, chronic conditions, prior admissions, emergency visits, medication count, length of stay, risk score, and readmission outcome.

- Include CSV upload functionality so the synthetic dataset can later be replaced with exported Synthea data.

- Add a “Download Sample Data” button.

Technical requirements:

- Use reusable components and clean folder structure.

- Include loading, empty, and error states.

- Make all tables sortable and searchable.

- Add tooltips explaining clinical and model-related metrics.

- Create a README section in the app describing the project, dataset, methodology, limitations, and future backend integration.

- Do not claim that model predictions, SHAP values, or statistical results are real until a Python ML backend is connected; label all generated values as “Demo Data” where appropriate.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cbb671b3-7f29-484a-b165-feb143882e5b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
