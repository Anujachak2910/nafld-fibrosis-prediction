import React from 'react';
import { ArrowRight, CheckCircle2, Database } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';

interface OverviewProps {
  onNavigateToEstimator: () => void;
  onNavigateToPerformance: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  onNavigateToEstimator,
  onNavigateToPerformance,
}) => {
  return (
    <div className="space-y-12">
      {/* Editorial Hero Banner */}
      <div className="border-b border-border pb-8">
        <div className="max-w-4xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="badge badge-accent">Research Summary</span>
            <span className="text-xs text-ink-dim font-mono">Cohort N = 605 • 33 Predictors</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ink tracking-tight leading-tight">
            Non-Invasive Risk Estimation of Significant Liver Fibrosis in NAFLD
          </h2>
          <p className="text-base text-ink-muted leading-relaxed font-serif">
            Can routine clinical measurements and blood tests identify patients with non-alcoholic fatty liver disease (NAFLD) who are at high risk of significant liver fibrosis (stage F ≥ 2), without requiring an invasive liver biopsy?
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onNavigateToEstimator}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <span>Explore Risk Estimator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onNavigateToPerformance}
              className="px-5 py-2.5 bg-surface hover:bg-subtle border border-border text-ink text-xs font-semibold uppercase tracking-wider rounded transition-colors inline-flex items-center gap-2"
            >
              <span>View Statistical Performance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Question & Rationale Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Why Fibrosis instead of Fatty Liver Detection? */}
        <div className="scientific-card bg-surface space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <h3 className="font-serif font-semibold text-lg text-ink">
              Why Fibrosis Instead of Fatty Liver Detection?
            </h3>
          </div>
          <div className="text-xs text-ink-muted leading-relaxed space-y-2.5">
            <p>
              The initial project premise was to classify healthy individuals versus patients with fatty liver disease. However, data exploration immediately revealed that <strong>the dataset contains zero healthy controls</strong>.
            </p>
            <div className="p-3 bg-subtle rounded border border-border space-y-1.5 font-mono text-[11px] text-ink">
              <div className="font-semibold text-xs text-ink font-sans">Steatosis (Fat Accumulation) Distribution:</div>
              <div className="flex justify-between">
                <span>Grade 0 (Healthy Control):</span>
                <span className="font-semibold text-risk-high">0 patients (0.0%)</span>
              </div>
              <div className="flex justify-between">
                <span>Grade 1 (Mild Steatosis):</span>
                <span>151 patients (25.0%)</span>
              </div>
              <div className="flex justify-between">
                <span>Grade 2 (Moderate Steatosis):</span>
                <span>246 patients (40.7%)</span>
              </div>
              <div className="flex justify-between">
                <span>Grade 3 (Severe Steatosis):</span>
                <span>208 patients (34.4%)</span>
              </div>
            </div>
            <p>
              Because every single patient already has biopsy-proven fatty liver, a healthy-versus-disease detector is fundamentally untrainable. Instead, what varies crucially across this cohort is <strong>fibrosis stage (scar tissue formation)</strong>, which is the single strongest clinical determinant of long-term liver-related morbidity and mortality.
            </p>
          </div>
        </div>

        {/* Dataset & Target Definition */}
        <div className="scientific-card bg-surface space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2.5">
            <Database className="w-4 h-4 text-accent" />
            <h3 className="font-serif font-semibold text-lg text-ink">
              Cohort & Target Specification
            </h3>
          </div>
          <div className="text-xs text-ink-muted leading-relaxed space-y-2.5">
            <p>
              The study investigates <strong>605 patients</strong> with biopsy-confirmed NAFLD. All patient identifiers, post-biopsy histologic staging, and derived target flags were strictly excluded from model inputs to prevent data leakage.
            </p>
            <div className="p-3 bg-subtle rounded border border-border space-y-1.5 font-mono text-[11px] text-ink">
              <div className="font-semibold text-xs text-ink font-sans">Fibrosis Histology Staging Breakdown:</div>
              <div className="flex justify-between">
                <span>F0 (No fibrosis):</span>
                <span>196 patients (32.4%)</span>
              </div>
              <div className="flex justify-between">
                <span>F1 (Portal / perisinusoidal):</span>
                <span>190 patients (31.4%)</span>
              </div>
              <div className="flex justify-between font-semibold text-accent">
                <span>F2 (Periportal / bridging):</span>
                <span>111 patients (18.3%)</span>
              </div>
              <div className="flex justify-between font-semibold text-risk-high">
                <span>F3 (Bridging fibrosis):</span>
                <span>84 patients (13.9%)</span>
              </div>
              <div className="flex justify-between font-semibold text-risk-high">
                <span>F4 (Cirrhosis):</span>
                <span>24 patients (4.0%)</span>
              </div>
            </div>
            <p>
              <strong>Primary Research Target (F ≥ 2):</strong> 219 positives (36.2%) vs. 386 negatives (63.8%). Represents significant scar tissue warranting specialized hepatology monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Headline Numbers from the Study */}
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h3 className="font-serif font-semibold text-xl text-ink">
            Key Research Findings from Repository Outputs
          </h3>
          <p className="text-xs text-ink-dim mt-0.5">
            Empirical comparisons across cross-validation folds and out-of-fold patient predictions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Random Forest Discrimination"
            value="0.789"
            badge="ROC-AUC"
            badgeVariant="accent"
            subtext="Tuned RF on nested development OOF"
            footnote="Baseline CV: 0.790 ± 0.055 across 15 folds"
          />
          <MetricCard
            label="Clinical FIB-4 Benchmark"
            value="0.691"
            badge="Benchmark"
            badgeVariant="neutral"
            subtext="FIB-4 on identical 483 development patients"
            footnote="Full cohort AUC: 0.703 (95% CI 0.660 to 0.744)"
          />
          <MetricCard
            label="Paired Bootstrap Difference"
            value="+0.099"
            ci="+0.049 to +0.148"
            badge="p < 0.01"
            badgeVariant="low"
            subtext="95% CI excludes 0 (favors RF over FIB-4)"
            footnote="2,000 paired bootstrap iterations over patients"
          />
          <MetricCard
            label="Sensitivity at Threshold"
            value="80.5%"
            badge="Operating Point"
            badgeVariant="mid"
            subtext="At locked 0.4158 decision threshold"
            footnote="Specificity: 65.0%, PPV: 56.5%, NPV: 85.5%"
          />
        </div>
      </div>

      {/* Research Methodology In Brief */}
      <div className="scientific-card bg-surface space-y-4">
        <h3 className="font-serif font-semibold text-lg text-ink border-b border-border pb-2.5">
          Summary of Methodological Safeguards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-ink-muted">
          <div className="space-y-1.5">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>Leakage-Free Feature Set</span>
            </div>
            <p className="leading-relaxed">
              Started with 62 workbook columns. Dropped 11 biopsy-derived variables, patient IDs, height & weight (collinear with BMI), and FIB-4. Exactly 33 approved clinical and blood predictors remain.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>Informative Missingness Control</span>
            </div>
            <p className="leading-relaxed">
              15 extended laboratory tests (INR, BUN, Creatinine, TSH, etc.) were ordered selectively for sicker patients (fibrosis rate 48% tested vs 25% untested). Dropped to prevent learning hospital referral habits.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-semibold text-ink flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>Dual Label Verification</span>
            </div>
            <p className="leading-relaxed">
              Identified that the dataset&apos;s pre-computed &quot;at-risk NASH&quot; flag disagreed with its own clinical definition in 44% of patients (269/605). Verified that Significant Fibrosis (F ≥ 2) agreed 100% with histologic stage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
