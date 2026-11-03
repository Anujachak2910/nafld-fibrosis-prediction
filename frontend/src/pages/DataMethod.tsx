import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  GitFork,
  Filter,
  CheckCircle,
  XCircle,
  Activity,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export const DataMethod: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-accent">Methodology & Preprocessing</span>
          <span className="text-xs text-ink-dim font-mono">EDA Protocol: 01_eda.ipynb & Modeling Handbook</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink tracking-tight">
          Data Governance, EDA Discoveries & Pipeline Architecture
        </h2>
        <p className="text-sm text-ink-muted mt-1 max-w-3xl leading-relaxed">
          How raw clinical workbook records were audited, cleaned, and protected against data leakage. Every transformation is fitted exclusively within training cross-validation folds.
        </p>
      </div>

      {/* 3 Pillars of EDA Findings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Finding 1: Leakage Control */}
        <div className="scientific-card bg-surface space-y-3">
          <div className="flex items-center gap-2 text-accent pb-2 border-b border-border">
            <ShieldCheck className="w-4 h-4" />
            <h3 className="font-serif font-semibold text-base text-ink">1. Leakage Control</h3>
          </div>
          <div className="text-xs text-ink-muted leading-relaxed space-y-2">
            <p>
              Starting from 62 raw workbook columns, strict exclusion criteria were enforced before model development:
            </p>
            <ul className="space-y-1 font-mono text-[11px] text-ink bg-subtle p-2.5 rounded border border-border">
              <li className="flex items-center gap-1.5 text-risk-high">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>11 Biopsy & Histology staging fields</span>
              </li>
              <li className="flex items-center gap-1.5 text-risk-high">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Patient No. (Unique identifier)</span>
              </li>
              <li className="flex items-center gap-1.5 text-risk-high">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Height & Weight (Redundant with BMI)</span>
              </li>
              <li className="flex items-center gap-1.5 text-risk-high">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>FIB-4 Index (Excluded comparator)</span>
              </li>
              <li className="flex items-center gap-1.5 text-risk-high">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>15 Informatively missing lab tests</span>
              </li>
              <li className="flex items-center gap-1.5 text-risk-low font-semibold pt-1 border-t border-border/60">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>33 Approved inputs preserved</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Finding 2: Label Audit & Discrepancy */}
        <div className="scientific-card bg-surface space-y-3">
          <div className="flex items-center gap-2 text-risk-mid pb-2 border-b border-border">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-serif font-semibold text-base text-ink">2. Label Verification</h3>
          </div>
          <div className="text-xs text-ink-muted leading-relaxed space-y-2">
            <p>
              Automated label integrity checks audited the pre-computed flags against raw histologic scores:
            </p>
            <div className="p-2.5 bg-subtle rounded border border-border text-[11px] space-y-2">
              <div className="text-risk-low flex items-center gap-1 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Significant Fibrosis (F ≥ 2): 100% Match</span>
              </div>
              <p className="text-ink-dim">
                The provided binary flag agreed perfectly with raw fibrosis stage (219 positives / 605).
              </p>
              <div className="text-risk-high flex items-center gap-1 font-semibold pt-1 border-t border-border/60">
                <XCircle className="w-3.5 h-3.5" />
                <span>At-Risk NASH Flag: 44% Mismatch!</span>
              </div>
              <p className="text-ink-dim leading-snug">
                The pre-computed NAS≥4 & Fibrosis≥2 column contradicted its own formula in <strong>269 of 605 patients</strong>. In 246 rows it flagged 1 for patients with F0. It was permanently excluded.
              </p>
            </div>
          </div>
        </div>

        {/* Finding 3: Informative Missingness */}
        <div className="scientific-card bg-surface space-y-3">
          <div className="flex items-center gap-2 text-accent pb-2 border-b border-border">
            <Filter className="w-4 h-4" />
            <h3 className="font-serif font-semibold text-base text-ink">3. Missingness Referral Bias</h3>
          </div>
          <div className="text-xs text-ink-muted leading-relaxed space-y-2">
            <p>
              Missingness was <strong>non-random</strong>. 15 specialized lab tests were ordered primarily when physicians suspected severe disease:
            </p>
            <div className="p-2.5 bg-subtle rounded border border-border text-[11px] font-mono space-y-1">
              <div className="flex justify-between">
                <span>TSH tested vs not:</span>
                <span className="font-semibold text-ink">48.1% vs 25.0% F≥2</span>
              </div>
              <div className="flex justify-between">
                <span>INR tested vs not:</span>
                <span className="font-semibold text-ink">47.0% vs 25.2% F≥2</span>
              </div>
              <div className="flex justify-between">
                <span>BUN/Creatinine:</span>
                <span className="font-semibold text-ink">46.9% vs 25.3% F≥2</span>
              </div>
              <div className="flex justify-between">
                <span>Vitamin D:</span>
                <span className="font-semibold text-ink">59.6% vs 25.2% F≥2</span>
              </div>
            </div>
            <p className="text-ink-dim text-[11px]">
              <strong>Rule:</strong> The 15 tests were dropped at the 45% missingness cutoff, and <em>no missingness indicator flags</em> were added, avoiding learning hospital referral habits.
            </p>
          </div>
        </div>
      </div>

      {/* Machine Learning Pipeline Diagram */}
      <div className="scientific-card bg-surface space-y-6">
        <div className="border-b border-border pb-3">
          <h3 className="font-serif font-semibold text-lg text-ink">
            Machine Learning Pipeline Architecture
          </h3>
          <p className="text-xs text-ink-dim mt-0.5">
            Strict encapsulation: all imputation and scaling parameters are estimated within cross-validation folds.
          </p>
        </div>

        {/* Pipeline flowchart */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 bg-subtle rounded border border-border space-y-2">
            <div className="flex items-center justify-between text-ink-dim">
              <span className="font-mono text-[10px]">STEP 01</span>
              <FileSpreadsheet className="w-4 h-4 text-accent" />
            </div>
            <h4 className="font-serif font-semibold text-sm text-ink">Input Data Contract</h4>
            <p className="text-ink-muted leading-relaxed">
              33 approved predictors. BMI recomputed as <code className="font-mono">Weight / (Height/100)²</code> to correct 3 discordant raw workbook values.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 bg-subtle rounded border border-border space-y-2">
            <div className="flex items-center justify-between text-ink-dim">
              <span className="font-mono text-[10px]">STEP 02</span>
              <GitFork className="w-4 h-4 text-accent" />
            </div>
            <h4 className="font-serif font-semibold text-sm text-ink">Stratified Splitting</h4>
            <p className="text-ink-muted leading-relaxed">
              80/20 train/test partition (484 dev / 121 holdout). Stratified on composite key <code className="font-mono">y + &apos;_&apos; + in_panel</code> to preserve both fibrosis and referral mix.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 bg-subtle rounded border border-border space-y-2">
            <div className="flex items-center justify-between text-ink-dim">
              <span className="font-mono text-[10px]">STEP 03</span>
              <Layers className="w-4 h-4 text-accent" />
            </div>
            <h4 className="font-serif font-semibold text-sm text-ink">ColumnTransformer</h4>
            <div className="space-y-1 font-mono text-[10px] text-ink-dim">
              <div>• 27 Numeric: Median Imputer → StandardScaler</div>
              <div>• 5 Binary: Mode Imputer</div>
              <div>• 1 Smoking: Mode Imputer → OneHotEncoder</div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 bg-accent-light/30 rounded border border-accent/20 space-y-2">
            <div className="flex items-center justify-between text-accent">
              <span className="font-mono text-[10px]">STEP 04</span>
              <Activity className="w-4 h-4 text-accent" />
            </div>
            <h4 className="font-serif font-semibold text-sm text-ink">Estimator Fitting</h4>
            <p className="text-ink-muted leading-relaxed">
              Random Forest with 300 estimators, leaf size 5, balanced class weighting. Decision threshold locked at 0.4158 for 80% sensitivity.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Catalog Table */}
      <div className="scientific-card bg-surface space-y-4">
        <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-semibold text-lg text-ink">
              The 33 Approved Model Predictors
            </h3>
            <p className="text-xs text-ink-dim mt-0.5">
              Derived from routine clinical workflow and standard laboratory panels.
            </p>
          </div>
          <span className="text-xs font-mono text-ink-dim">27 Numeric • 5 Binary • 1 Coded</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-subtle rounded border border-border space-y-1.5">
            <h4 className="font-semibold text-ink font-serif">Demographics (3)</h4>
            <ul className="text-ink-muted space-y-0.5 list-disc list-inside">
              <li>Age (years)</li>
              <li>Sex (Female=1, Male=2)</li>
              <li>Smoking Status (1–3)</li>
            </ul>
          </div>

          <div className="p-3 bg-subtle rounded border border-border space-y-1.5">
            <h4 className="font-semibold text-ink font-serif">Body Measures (5)</h4>
            <ul className="text-ink-muted space-y-0.5 list-disc list-inside">
              <li>Body Mass Index (kg/m²)</li>
              <li>Waist Circumference (cm)</li>
              <li>Hip Circumference (cm)</li>
              <li>Systolic BP (mmHg)</li>
              <li>Diastolic BP (mmHg)</li>
            </ul>
          </div>

          <div className="p-3 bg-subtle rounded border border-border space-y-1.5">
            <h4 className="font-semibold text-ink font-serif">Comorbidities (4)</h4>
            <ul className="text-ink-muted space-y-0.5 list-disc list-inside">
              <li>Diabetes Mellitus (0/1)</li>
              <li>Hypertension (0/1)</li>
              <li>Hyperlipidemia (0/1)</li>
              <li>Metabolic Syndrome (0/1)</li>
            </ul>
          </div>

          <div className="p-3 bg-subtle rounded border border-border space-y-1.5">
            <h4 className="font-semibold text-ink font-serif">Liver & Blood Labs (21)</h4>
            <ul className="text-ink-muted space-y-0.5 list-disc list-inside">
              <li>AST, ALT, ALP, GGT, LDH</li>
              <li>Total & Direct Bilirubin</li>
              <li>Total Protein, Albumin</li>
              <li>Cholesterol, Triglycerides, HDL, LDL</li>
              <li>WBC, Hemoglobin, Platelets</li>
              <li>MCV, MPV, Ferritin, Glucose, HbA1c</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
