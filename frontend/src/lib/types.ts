export type FeatureGroup =
  | 'Demographics'
  | 'Body Measures'
  | 'Comorbidities'
  | 'Blood Tests: Liver Enzymes'
  | 'Blood Tests: Bilirubin & Proteins'
  | 'Blood Tests: Lipid Panel'
  | 'Blood Tests: Hematology'
  | 'Blood Tests: Glycemic & Iron';

export interface FeatureOption {
  value: number;
  label: string;
}

export interface FeatureMeta {
  id: string;
  name: string;
  group: FeatureGroup;
  type: 'numeric' | 'categorical';
  unit: string;
  min?: number;
  max?: number;
  default: number;
  description: string;
  options?: FeatureOption[];
}

export interface FIB4Result {
  score: number;
  cutoff_low: number;
  cutoff_high: number;
  risk_band: 'Low Risk (Rule-Out)' | 'Indeterminate' | 'High Risk (Rule-In)';
  interpretation: string;
}

export interface PredictionResult {
  probability: number;
  percentage: number;
  threshold: number;
  threshold_percentage: number;
  is_above_threshold: boolean;
  risk_band: string;
  risk_description: string;
  operating_point: {
    target_sensitivity: number;
    oof_sensitivity: number;
    oof_specificity: number;
    threshold: number;
    basis: string;
  };
  fib4_comparison: FIB4Result | null;
  validation_warnings: string[];
  intended_use: string;
}

export interface PermutationImportanceItem {
  feature: string;
  mean_importance: number;
  fold_sd: number;
}

export interface SubgroupMetricItem {
  group: string;
  level: string;
  n: number;
  positives: number;
  prevalence: number;
  roc_auc: number;
  roc_auc_ci: [number, number];
  threshold: number;
  sensitivity: number;
  specificity: number;
  ppv: number;
  npv: number;
  balanced_accuracy: number;
  confusion_matrix: [[number, number], [number, number]];
}

export interface ModelComparisonRow {
  model: string;
  role: string;
  roc_auc: string;
  pr_auc: string;
  evaluation_cohort: string;
  sample_size: string;
  status: 'Development CV' | 'Nested OOF' | 'Exploratory Holdout';
  notes: string;
}
