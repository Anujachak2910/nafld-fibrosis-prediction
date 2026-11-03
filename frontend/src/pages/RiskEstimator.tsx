import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart2,
  AlertCircle,
} from 'lucide-react';
import { FEATURE_METADATA, GROUPS } from '../lib/constants';
import { PERMUTATION_IMPORTANCE } from '../lib/repo-data';
import type { PredictionResult } from '../lib/types';
import { requestPrediction } from '../lib/api';
import { RiskGauge } from '../components/RiskGauge';
import { FIB4Card } from '../components/FIB4Card';

// Sample patient clinical profiles derived directly from dataset distributions
const SAMPLE_PROFILES: { name: string; description: string; values: Record<string, number> }[] = [
  {
    name: 'Profile 1: Elevated Risk Patient',
    description: 'Age 58, Type 2 Diabetes, elevated transaminases & GGT, low-normal platelets.',
    values: {
      Age: 58,
      'Gender (Female=1, Male=2)': 2,
      'Smoking Status (Never Smoked=1, Left Smoking=2, Smoking=3)': 2,
      'Body Mass Index': 34.5,
      'Waist Circumference': 116,
      'Hip Circumference': 110,
      'Systolic Blood Pressure': 138,
      'Diastolic Blood Pressure': 88,
      'Diyabetes Mellitus (No=0, Yes=1)': 1,
      'Hypertension (No=0, Yes=1)': 1,
      'Hyperlipidemia (No=0, Yes=1)': 1,
      'Metabolic syndrome (No=0, Yes=1)': 1,
      AST: 64,
      ALT: 82,
      ALP: 110,
      GGT: 125,
      LDH: 265,
      'Total Bilirubin': 1.1,
      'Direct Bilirubin': 0.35,
      'Total Protein': 7.6,
      Albumin: 4.2,
      'Total Cholesterol': 225,
      Triglycerides: 280,
      HDL: 38,
      LDL: 145,
      Leukocyte: 8100,
      Hemoglobin: 14.8,
      Trombosit: 175,
      'Mean Corpuscular Volume': 88,
      'Mean Platelet Volume': 9.8,
      Ferritin: 245,
      Glucose: 142,
      'Hemoglobin - A1C': 7.4,
    },
  },
  {
    name: 'Profile 2: Lower Risk Patient',
    description: 'Age 38, non-diabetic, normal transaminases, normal platelet count.',
    values: {
      Age: 38,
      'Gender (Female=1, Male=2)': 1,
      'Smoking Status (Never Smoked=1, Left Smoking=2, Smoking=3)': 1,
      'Body Mass Index': 26.8,
      'Waist Circumference': 92,
      'Hip Circumference': 98,
      'Systolic Blood Pressure': 115,
      'Diastolic Blood Pressure': 75,
      'Diyabetes Mellitus (No=0, Yes=1)': 0,
      'Hypertension (No=0, Yes=1)': 0,
      'Hyperlipidemia (No=0, Yes=1)': 0,
      'Metabolic syndrome (No=0, Yes=1)': 0,
      AST: 28,
      ALT: 32,
      ALP: 75,
      GGT: 26,
      LDH: 195,
      'Total Bilirubin': 0.6,
      'Direct Bilirubin': 0.15,
      'Total Protein': 7.9,
      Albumin: 4.8,
      'Total Cholesterol': 185,
      Triglycerides: 120,
      HDL: 52,
      LDL: 110,
      Leukocyte: 6400,
      Hemoglobin: 13.9,
      Trombosit: 295,
      'Mean Corpuscular Volume': 85,
      'Mean Platelet Volume': 8.2,
      Ferritin: 68,
      Glucose: 92,
      'Hemoglobin - A1C': 5.2,
    },
  },
];

export const RiskEstimator: React.FC = () => {
  const defaultValues = FEATURE_METADATA.reduce<Record<string, number>>((acc, item) => {
    acc[item.id] = item.default;
    return acc;
  }, {});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Record<string, number>>({
    defaultValues,
    mode: 'onBlur',
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showImportance, setShowImportance] = useState<boolean>(false);

  useEffect(() => {
    runInference(defaultValues);
  }, []);

  const runInference = async (data: Record<string, number>) => {
    setLoading(true);
    try {
      const res = await requestPrediction(data);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction failed', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: Record<string, number>) => {
    runInference(data);
  };

  const handleResetToMedians = () => {
    reset(defaultValues);
    runInference(defaultValues);
  };

  const handleLoadProfile = (profileIndex: number) => {
    const profile = SAMPLE_PROFILES[profileIndex];
    if (profile) {
      reset(profile.values);
      runInference(profile.values);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-accent">Clinical Estimation</span>
          <span className="text-xs text-ink-dim font-mono">Trained on 484 patients • 33 Predictors</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink tracking-tight">
          Fibrosis Risk Estimator (Stage F ≥ 2)
        </h2>
        <p className="text-sm text-ink-muted mt-1 max-w-3xl leading-relaxed">
          Input patient parameters across the 33 approved clinical, anthropometric, and laboratory predictors. The Random Forest model evaluates risk against the sensitivity-selected <strong>0.4158 decision threshold</strong>, alongside a side-by-side FIB-4 clinical score.
        </p>
      </div>

      {/* Preset Profiles & Action Toolbar */}
      <div className="bg-surface border border-border rounded-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-ink-muted mr-1">Load Preset Patient:</span>
          {SAMPLE_PROFILES.map((prof, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadProfile(idx)}
              className="text-xs px-2.5 py-1.5 rounded border border-border bg-subtle hover:bg-surface hover:border-accent text-ink transition-colors flex items-center gap-1.5"
              title={prof.description}
            >
              <Sparkles className="w-3 h-3 text-accent" />
              <span>{prof.name}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleResetToMedians}
          className="text-xs px-3 py-1.5 rounded border border-border bg-surface hover:bg-subtle text-ink-muted hover:text-ink transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset to Cohort Medians</span>
        </button>
      </div>

      {/* Main Two-Column Layout: Form (Left) vs Output Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Grouped 33-input form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {GROUPS.map((group, groupIdx) => {
              const groupFeatures = FEATURE_METADATA.filter((f) => f.group === group.key);

              return (
                <section
                  key={group.key}
                  className="bg-surface border border-border rounded-md p-5 shadow-subtle space-y-4"
                  aria-labelledby={`heading-${groupIdx}`}
                >
                  <div className="border-b border-border pb-3">
                    <h3 id={`heading-${groupIdx}`} className="font-serif font-semibold text-base text-ink">
                      {group.title}
                    </h3>
                    <p className="text-xs text-ink-dim mt-0.5">{group.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groupFeatures.map((field) => {
                      const fieldError = errors[field.id];

                      return (
                        <div key={field.id} className="space-y-1.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <label htmlFor={field.id} className="text-xs font-medium text-ink">
                              {field.name}
                            </label>
                            <span className="text-[11px] font-mono text-ink-dim">
                              {field.unit}
                            </span>
                          </div>

                          {field.type === 'categorical' && field.options ? (
                            <select
                              id={field.id}
                              {...register(field.id, { valueAsNumber: true })}
                              className="w-full text-xs bg-surface border border-border rounded px-2.5 py-2 text-ink focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            >
                              {field.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="relative">
                              <input
                                id={field.id}
                                type="number"
                                step="any"
                                {...register(field.id, {
                                  valueAsNumber: true,
                                  min: field.min,
                                  max: field.max,
                                })}
                                className={`w-full text-xs font-mono bg-surface border rounded px-2.5 py-2 text-ink focus:border-accent focus:ring-1 focus:ring-accent transition-colors tnum ${
                                  fieldError ? 'border-risk-high focus:ring-risk-high' : 'border-border'
                                }`}
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-ink-dim">
                            <span className="truncate max-w-[180px]" title={field.description}>
                              {field.description}
                            </span>
                            {field.min !== undefined && field.max !== undefined && (
                              <span className="font-mono shrink-0 ml-1">
                                [{field.min}–{field.max}]
                              </span>
                            )}
                          </div>

                          {fieldError && (
                            <p className="text-[11px] text-risk-high flex items-center gap-1 mt-0.5">
                              <AlertCircle className="w-3 h-3" />
                              <span>Must be between {field.min} and {field.max}</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}

            {/* Submit / Recompute Button */}
            <div className="sticky bottom-4 z-20 bg-surface/95 backdrop-blur-sm border border-border p-3 rounded-md shadow-md flex items-center justify-between gap-4">
              <span className="text-xs text-ink-dim hidden sm:inline">
                Inputs validated against training ranges.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold tracking-wide uppercase rounded transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Estimating Risk...' : 'Compute Fibrosis Risk'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Prediction Output, FIB-4 Side-by-Side & Feature Importance (5 cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-16">
          {prediction ? (
            <>
              {/* Risk Gauge Panel */}
              <RiskGauge prediction={prediction} />

              {/* FIB-4 Side-by-Side Comparative Panel */}
              <FIB4Card
                fib4={prediction.fib4_comparison}
                rfAboveThreshold={prediction.is_above_threshold}
              />

              {/* Real Permutation Importance Breakdown */}
              <div className="scientific-card bg-surface">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-accent" />
                    <h4 className="font-serif font-semibold text-sm text-ink">
                      Feature Contribution (Permutation Importance)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImportance(!showImportance)}
                    className="text-xs text-accent hover:underline flex items-center gap-0.5"
                  >
                    <span>{showImportance ? 'Collapse' : 'Show Top 10'}</span>
                    {showImportance ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-xs text-ink-muted mt-2 leading-relaxed">
                  Evaluated on outer validation folds in development CV. Demonstrates how much the model&apos;s ROC-AUC drops when each feature is randomly permuted.
                </p>

                <div className="mt-3 space-y-2">
                  {PERMUTATION_IMPORTANCE.slice(0, showImportance ? 15 : 6).map((item, idx) => {
                    const maxImp = 0.0413; // Age
                    const pct = Math.max(0, (item.mean_importance / maxImp) * 100);

                    return (
                      <div key={item.feature} className="text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-ink truncate max-w-[200px]">
                            {idx + 1}. {item.feature}
                          </span>
                          <span className="font-mono text-ink-dim tnum text-[11px]">
                            {item.mean_importance > 0 ? `+${item.mean_importance.toFixed(4)}` : item.mean_importance.toFixed(4)} ± {item.fold_sd.toFixed(4)}
                          </span>
                        </div>
                        <div className="w-full bg-subtle h-1.5 rounded-full overflow-hidden border border-border/50">
                          <div
                            className="bg-accent h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 pt-2 border-t border-border/70 text-[11px] text-ink-dim leading-snug">
                  Age and Diabetes status rank highest, followed by GGT, Platelets, and HbA1c. These associations are descriptive, not causal.
                </div>
              </div>

              {/* Research Disclaimer Card */}
              <div className="p-3 bg-subtle border border-border rounded text-[11px] text-ink-dim leading-relaxed">
                <strong>Model Note:</strong> This Random Forest model was tuned on 484 retrospective patients. Operating sensitivity at 0.4158 is 80.5% with 65.0% specificity. It is not an FDA-cleared or CE-marked diagnostic tool.
              </div>
            </>
          ) : (
            <div className="scientific-card text-center py-12 text-ink-dim text-xs">
              Loading research inference engine...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
