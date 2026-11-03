import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { AlertCircle, Award } from 'lucide-react';
import {
  MODEL_COMPARISON_TABLE,
  NESTED_OOF_METRICS,
  HOLDOUT_DETAILED_METRICS,
  SUBGROUPS,
  STRETCH_EXPERIMENTS,
  ROC_CURVE_DATA,
  CALIBRATION_DATA,
} from '../lib/repo-data';
import { MetricCard } from '../components/MetricCard';
import { ConfusionMatrix } from '../components/ConfusionMatrix';

export const ModelPerformance: React.FC = () => {
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('All');

  const subgroupCategories = ['All', 'Sex / Gender', 'Diabetes Status', 'Age Cohort', 'Extended Lab Panel Referral'];

  const filteredSubgroups =
    selectedSubgroup === 'All' ? SUBGROUPS : SUBGROUPS.filter((s) => s.group === selectedSubgroup);

  return (
    <div className="space-y-10">
      {/* Page Title & Context */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-accent">Model Evaluation & Validation</span>
          <span className="text-xs text-ink-dim font-mono">Outputs: baseline-v1, phase2-v1, phase3-v1</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink tracking-tight">
          Model Performance & Statistical Evidence
        </h2>
        <p className="text-sm text-ink-muted mt-1 max-w-3xl leading-relaxed">
          Comprehensive benchmark comparing Random Forest, Logistic Regression, and the clinical FIB-4 index. All figures trace directly to serialized outputs in the repository. As noted in the study protocol, holdout metrics are exploratory because the holdout was viewed during initial baseline work.
        </p>
      </div>

      {/* Key Headline Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Tuned RF Nested OOF"
          value="0.789"
          badge="Primary Internal"
          badgeVariant="accent"
          subtext="ROC-AUC on outer validation folds"
          footnote="PR-AUC: 0.687 (baseline prevalence 0.360)"
        />
        <MetricCard
          label="FIB-4 Benchmark (Same Pts)"
          value="0.691"
          badge="Clinical Comparator"
          badgeVariant="neutral"
          subtext="ROC-AUC on identical 483 development patients"
          footnote="PR-AUC: 0.569 (clinical score benchmark)"
        />
        <MetricCard
          label="Paired AUC Gain vs FIB-4"
          value="+0.099"
          ci="+0.049 to +0.148"
          badge="95% Paired Bootstrap CI"
          badgeVariant="low"
          subtext="Excludes 0; statistically favors RF on cohort"
          footnote="2,000 paired bootstrap iterations over patients"
        />
        <MetricCard
          label="Sensitivity Operating Point"
          value="80.5%"
          badge="Threshold = 0.4158"
          badgeVariant="mid"
          subtext="Specificity: 65.0% (PPV: 56.5%, NPV: 85.5%)"
          footnote="Selected on development OOF; descriptive only"
        />
      </div>

      {/* Primary Comparison Table */}
      <div className="scientific-card bg-surface space-y-4">
        <div className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-semibold text-lg text-ink">
              1. Core Model Performance Comparison (F ≥ 2)
            </h3>
            <p className="text-xs text-ink-dim mt-0.5">
              Random Forest vs. Logistic Regression vs. FIB-4 index. Folds and holdout evaluated under strict leakage controls.
            </p>
          </div>
          <span className="badge badge-neutral text-xs font-mono self-start sm:self-auto">
            Target Positives: 219 / 605 (36.2%)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-subtle/50 text-ink-muted">
                <th className="py-2.5 px-3 font-semibold">Model / Estimator</th>
                <th className="py-2.5 px-3 font-semibold">Evaluation Design</th>
                <th className="py-2.5 px-3 font-semibold">Sample (N)</th>
                <th className="py-2.5 px-3 font-semibold text-right">ROC-AUC</th>
                <th className="py-2.5 px-3 font-semibold text-right">PR-AUC</th>
                <th className="py-2.5 px-3 font-semibold">Validation Classification</th>
                <th className="py-2.5 px-3 font-semibold">Protocol Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MODEL_COMPARISON_TABLE.map((row) => {
                const isHoldout = row.status === 'Exploratory Holdout';
                const isTuned = row.model === 'Tuned Random Forest';

                return (
                  <tr
                    key={row.model}
                    className={`hover:bg-subtle/30 transition-colors ${
                      isHoldout ? 'bg-risk-mid-bg/15' : isTuned ? 'bg-accent-light/15 font-medium' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-medium text-ink flex items-center gap-1.5">
                      {isTuned && <Award className="w-3.5 h-3.5 text-accent shrink-0" />}
                      <span>{row.model}</span>
                    </td>
                    <td className="py-3 px-3 text-ink-muted">{row.evaluation_cohort}</td>
                    <td className="py-3 px-3 font-mono text-ink-dim tnum">{row.sample_size}</td>
                    <td className="py-3 px-3 font-mono text-right font-semibold text-ink tnum">
                      {row.roc_auc}
                    </td>
                    <td className="py-3 px-3 font-mono text-right text-ink-dim tnum">{row.pr_auc}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`badge text-[10px] ${
                          isHoldout
                            ? 'badge-mid'
                            : row.status === 'Nested OOF'
                            ? 'badge-accent'
                            : 'badge-neutral'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-ink-dim max-w-xs leading-snug">{row.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-subtle rounded border border-border text-xs text-ink-dim flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-risk-mid shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Important protocol caveat:</strong> Holdout rows (N=121) are designated as <em>exploratory</em> because the test partition was inspected during baseline development. No independent final holdout generalization is claimed.
          </p>
        </div>
      </div>

      {/* Interactive Charts: ROC Curve & Calibration Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: ROC Curve */}
        <div className="scientific-card bg-surface space-y-3">
          <div className="border-b border-border pb-2.5">
            <h3 className="font-serif font-semibold text-base text-ink">
              2a. Receiver Operating Characteristic (ROC)
            </h3>
            <p className="text-xs text-ink-dim mt-0.5">
              Comparison across false positive rate (1 - Specificity) vs. true positive rate (Sensitivity).
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ROC_CURVE_DATA} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DA" />
                <XAxis
                  dataKey="fpr"
                  label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -10, fontSize: 11 }}
                  tick={{ fontSize: 11, fill: '#737D77' }}
                />
                <YAxis
                  domain={[0, 1]}
                  label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
                  tick={{ fontSize: 11, fill: '#737D77' }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${(Number(val) * 100).toFixed(1)}%`,
                    name === 'rf' ? 'Random Forest' : name === 'logreg' ? 'Logistic Regression' : name === 'fib4' ? 'FIB-4 Benchmark' : 'Chance',
                  ]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DA', fontSize: '11px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="rf" stroke="#0F5B56" strokeWidth={2.5} name="Random Forest (AUC 0.789)" dot={false} />
                <Line type="monotone" dataKey="logreg" stroke="#4A5450" strokeWidth={1.5} name="Logistic Regression (AUC 0.734)" dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="fib4" stroke="#8A5C14" strokeWidth={1.5} name="FIB-4 (AUC 0.691)" dot={false} strokeDasharray="2 2" />
                <Line type="monotone" dataKey="chance" stroke="#D0CCC0" strokeWidth={1} name="Chance (0.50)" dot={false} />
                <ReferenceLine x={0.35} stroke="#0F5B56" strokeDasharray="3 3" label={{ value: 'Threshold 0.4158', fontSize: 10, fill: '#0F5B56' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-ink-dim pt-2 border-t border-border/60">
            Selected sensitivity-oriented threshold (0.4158) achieves <strong>80.5% sensitivity</strong> at 35.0% false positive rate (65.0% specificity).
          </div>
        </div>

        {/* Chart 2: Calibration Plot */}
        <div className="scientific-card bg-surface space-y-3">
          <div className="border-b border-border pb-2.5">
            <h3 className="font-serif font-semibold text-base text-ink">
              2b. Model Probability Calibration
            </h3>
            <p className="text-xs text-ink-dim mt-0.5">
              Mean predicted probability vs. observed empirical fraction across 4 risk decile bins.
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CALIBRATION_DATA} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E2DA" />
                <XAxis
                  dataKey="bin"
                  label={{ value: 'Predicted Risk Decile Bin', position: 'insideBottom', offset: -10, fontSize: 11 }}
                  tick={{ fontSize: 11, fill: '#737D77' }}
                />
                <YAxis
                  domain={[0, 1]}
                  label={{ value: 'Observed Event Rate', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
                  tick={{ fontSize: 11, fill: '#737D77' }}
                />
                <Tooltip
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Rate']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E2DA', fontSize: '11px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="observed_prob" stroke="#0F5B56" strokeWidth={2.5} name="RF Calibration" activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="perfect" stroke="#A39E93" strokeWidth={1.5} strokeDasharray="4 4" name="Perfect Calibration" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-ink-dim pt-2 border-t border-border/60">
            Probability bins demonstrate monotonic alignment with observed fibrosis rates without post-hoc Platt scaling.
          </div>
        </div>
      </div>

      {/* Confusion Matrices: Development OOF vs Exploratory Holdout */}
      <div className="space-y-4">
        <div>
          <h3 className="font-serif font-semibold text-lg text-ink">
            3. Classification Contingency Matrices
          </h3>
          <p className="text-xs text-ink-dim mt-0.5">
            Operating metrics at the locked threshold (0.4158 for development OOF; 0.50 and 1.30 for exploratory holdout).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConfusionMatrix
            title="Development Nested OOF (Tuned RF)"
            matrix={NESTED_OOF_METRICS.threshold_selection.confusion_matrix as [[number, number], [number, number]]}
            threshold={0.4158}
            sensitivity={NESTED_OOF_METRICS.threshold_selection.oof_sensitivity}
            specificity={NESTED_OOF_METRICS.threshold_selection.oof_specificity}
            ppv={NESTED_OOF_METRICS.threshold_selection.ppv}
            npv={NESTED_OOF_METRICS.threshold_selection.npv}
            note="Computed on N=483 nested out-of-fold development patients. Demonstrates the intended ~80% sensitivity operating point."
          />

          <ConfusionMatrix
            title="Exploratory Holdout (Baseline RF, 0.5 Cutoff)"
            matrix={HOLDOUT_DETAILED_METRICS.random_forest.confusion_matrix as [[number, number], [number, number]]}
            threshold={0.5}
            sensitivity={HOLDOUT_DETAILED_METRICS.random_forest.sensitivity}
            specificity={HOLDOUT_DETAILED_METRICS.random_forest.specificity}
            ppv={HOLDOUT_DETAILED_METRICS.random_forest.ppv}
            npv={HOLDOUT_DETAILED_METRICS.random_forest.npv}
            note="Evaluated on N=121 holdout patients at the default 0.5 cutoff. Provided for exploratory reference."
          />
        </div>
      </div>

      {/* Subgroup Analysis Section */}
      <div className="scientific-card bg-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="font-serif font-semibold text-lg text-ink">
              4. Predefined Subgroup Stratification
            </h3>
            <p className="text-xs text-ink-dim mt-0.5">
              Nested OOF performance broken down by sex, diabetes status, age bands, and referral lab panel.
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            {subgroupCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedSubgroup(cat)}
                className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                  selectedSubgroup === cat
                    ? 'bg-accent text-white border-accent'
                    : 'bg-subtle text-ink-muted border-border hover:bg-surface'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-subtle/50 text-ink-muted">
                <th className="py-2.5 px-3 font-semibold">Subgroup</th>
                <th className="py-2.5 px-3 font-semibold">Level / Strata</th>
                <th className="py-2.5 px-3 font-semibold text-right">N</th>
                <th className="py-2.5 px-3 font-semibold text-right">Positives</th>
                <th className="py-2.5 px-3 font-semibold text-right">Prevalence</th>
                <th className="py-2.5 px-3 font-semibold text-right">ROC-AUC (95% CI)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Sensitivity</th>
                <th className="py-2.5 px-3 font-semibold text-right">Specificity</th>
                <th className="py-2.5 px-3 font-semibold text-right">PPV</th>
                <th className="py-2.5 px-3 font-semibold text-right">NPV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSubgroups.map((sg) => (
                <tr key={`${sg.group}-${sg.level}`} className="hover:bg-subtle/30 transition-colors">
                  <td className="py-2.5 px-3 text-ink-muted">{sg.group}</td>
                  <td className="py-2.5 px-3 font-medium text-ink">{sg.level}</td>
                  <td className="py-2.5 px-3 font-mono text-right text-ink-dim tnum">{sg.n}</td>
                  <td className="py-2.5 px-3 font-mono text-right text-ink-dim tnum">{sg.positives}</td>
                  <td className="py-2.5 px-3 font-mono text-right text-ink-dim tnum">
                    {(sg.prevalence * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right font-semibold text-ink tnum">
                    {sg.roc_auc.toFixed(3)} ({sg.roc_auc_ci[0].toFixed(3)}, {sg.roc_auc_ci[1].toFixed(3)})
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-ink-dim tnum">
                    {(sg.sensitivity * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-ink-dim tnum">
                    {(sg.specificity * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-ink-dim tnum">
                    {(sg.ppv * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right text-ink-dim tnum">
                    {(sg.npv * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-subtle rounded border border-border text-xs text-ink-dim">
          <strong>Statistical Caution:</strong> Small subgroups (e.g. patients aged 60+, N=50) yield wide confidence intervals and are inconclusive. Disparities in positive predictive value primarily reflect baseline prevalence differences between groups (e.g. 56.4% in diabetics vs 23.8% in non-diabetics).
        </div>
      </div>

      {/* Secondary Stretch Experiments */}
      <div className="scientific-card bg-surface space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="font-serif font-semibold text-lg text-ink">
            5. Optional Stretch Experiments (Development CV)
          </h3>
          <p className="text-xs text-ink-dim mt-0.5">
            Secondary targets evaluated in repeated 5-fold CV (3 repeats) on the development partition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-subtle rounded border border-border space-y-2 text-xs">
            <span className="badge badge-neutral text-[10px] font-mono">Experiment B (Binary)</span>
            <h4 className="font-serif font-semibold text-sm text-ink">
              {STRETCH_EXPERIMENTS.advanced_fibrosis_F_ge_3.target}
            </h4>
            <p className="text-ink-muted">
              Prevalence: {STRETCH_EXPERIMENTS.advanced_fibrosis_F_ge_3.prevalence}. FIB-4 comparator reached AUC {STRETCH_EXPERIMENTS.advanced_fibrosis_F_ge_3.fib4_auc} (PR-AUC {STRETCH_EXPERIMENTS.advanced_fibrosis_F_ge_3.fib4_pr_auc}).
            </p>
            <div className="pt-2 border-t border-border/70 space-y-1 font-mono text-ink">
              <div>Random Forest ROC-AUC: <strong>{STRETCH_EXPERIMENTS.advanced_fibrosis_F_ge_3.random_forest.roc_auc}</strong> (PR-AUC {STRETCH_EXPERIMENTS.advanced_fibrosis_F_ge_3.random_forest.pr_auc})</div>
              <div className="text-ink-dim">Logistic Regression ROC-AUC: {STRETCH_EXPERIMENTS.advanced_fibrosis_F_ge_3.logistic_regression.roc_auc} (PR-AUC {STRETCH_EXPERIMENTS.advanced_fibrosis_F_ge_3.logistic_regression.pr_auc})</div>
            </div>
          </div>

          <div className="p-4 bg-subtle rounded border border-border space-y-2 text-xs">
            <span className="badge badge-neutral text-[10px] font-mono">Experiment C (3-Class)</span>
            <h4 className="font-serif font-semibold text-sm text-ink">
              {STRETCH_EXPERIMENTS.fibrosis_group_F0_1_F2_F3_4.target}
            </h4>
            <p className="text-ink-muted">
              Class counts: F0–1: 309, F2: 86, F3–4: 89. Evaluated using balanced accuracy (chance = 33.3%).
            </p>
            <div className="pt-2 border-t border-border/70 space-y-1 font-mono text-ink">
              <div>Random Forest Balanced Acc: <strong>{STRETCH_EXPERIMENTS.fibrosis_group_F0_1_F2_F3_4.random_forest.balanced_accuracy}</strong> (Macro-F1 {STRETCH_EXPERIMENTS.fibrosis_group_F0_1_F2_F3_4.random_forest.f1_macro})</div>
              <div className="text-ink-dim">Logistic Regression Balanced Acc: {STRETCH_EXPERIMENTS.fibrosis_group_F0_1_F2_F3_4.logistic_regression.balanced_accuracy} (Macro-F1 {STRETCH_EXPERIMENTS.fibrosis_group_F0_1_F2_F3_4.logistic_regression.f1_macro})</div>
              <div className="text-ink-dim">RF One-vs-Rest ROC-AUC: {STRETCH_EXPERIMENTS.fibrosis_group_F0_1_F2_F3_4.random_forest.roc_auc_ovr}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
