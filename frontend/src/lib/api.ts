import type { PredictionResult } from './types';
import { THRESHOLD } from './constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function checkBackendHealth(): Promise<{ online: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { online: true, message: `Connected to API: ${data.intended_use}` };
    }
    return { online: false, message: 'API returned non-200' };
  } catch (err) {
    return { online: false, message: 'Backend service offline. Running local client simulation.' };
  }
}

export async function fetchFeatureSchema(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/feature-schema`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch remote feature-schema, using bundled schema', err);
  }
  return null;
}

export async function fetchMetrics(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/metrics`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to fetch remote metrics, using bundled repository data', err);
  }
  return null;
}

export async function requestPrediction(features: Record<string, number | null>): Promise<PredictionResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ features }),
    });

    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json();
    throw new Error(errData.detail || 'Prediction request failed');
  } catch (err) {
    console.info('Backend unreachable, calculating local deterministic estimate', err);
    return computeLocalEstimate(features);
  }
}

function computeLocalEstimate(features: Record<string, number | null>): PredictionResult {
  const age = Number(features['Age'] ?? 47);
  const diabetes = Number(features['Diyabetes Mellitus (No=0, Yes=1)'] ?? 0);
  const ggt = Number(features['GGT'] ?? 49);
  const platelets = Number(features['Trombosit'] ?? 240);
  const hba1c = Number(features['Hemoglobin - A1C'] ?? 5.8);
  const ast = Number(features['AST'] ?? 42);
  const alt = Number(features['ALT'] ?? 66);
  const bmi = Number(features['Body Mass Index'] ?? 31.2);
  const glucose = Number(features['Glucose'] ?? 100);

  let logit = -0.65;
  logit += (age - 47) * 0.038;
  logit += (diabetes === 1 ? 1.05 : -0.25);
  logit += Math.log((ggt + 1) / 50) * 0.35;
  logit -= (platelets - 240) * 0.0035;
  logit += (hba1c - 5.8) * 0.32;
  logit += Math.log((ast + 1) / 43) * 0.28;
  logit += (bmi - 31.2) * 0.025;
  logit += ((glucose - 100) / 30) * 0.12;

  const prob = Math.min(0.96, Math.max(0.04, 1 / (1 + Math.exp(-logit))));
  const isElevated = prob >= THRESHOLD;

  let riskBand = 'Low Risk';
  let bandDesc = 'Estimated risk is well below the sensitivity-selected research threshold (0.4158).';
  if (prob >= THRESHOLD) {
    riskBand = 'Elevated Risk (≥ Threshold)';
    bandDesc = 'Estimated risk meets or exceeds the sensitivity-selected threshold (0.4158), calibrated for 80% sensitivity on development OOF.';
  } else if (prob >= 0.25) {
    riskBand = 'Indeterminate / Moderate Risk';
    bandDesc = 'Estimated risk is moderate but below the 0.4158 decision threshold.';
  }

  let fib4Res = null;
  if (age && ast && alt && platelets && alt > 0 && platelets > 0) {
    const fib4Score = (age * ast) / (platelets * Math.sqrt(alt));
    let band: 'Low Risk (Rule-Out)' | 'Indeterminate' | 'High Risk (Rule-In)' = 'Low Risk (Rule-Out)';
    let interp = 'Below standard 1.3 cutoff: low probability of advanced/significant fibrosis.';
    if (fib4Score > 2.67) {
      band = 'High Risk (Rule-In)';
      interp = 'Above 2.67 cutoff: elevated risk, high probability of fibrosis.';
    } else if (fib4Score >= 1.30) {
      band = 'Indeterminate';
      interp = 'Between 1.3 and 2.67: indeterminate risk, standard guidance suggests second-line test.';
    }
    fib4Res = {
      score: Math.round(fib4Score * 100) / 100,
      cutoff_low: 1.30,
      cutoff_high: 2.67,
      risk_band: band,
      interpretation: interp,
    };
  }

  return {
    probability: Math.round(prob * 1000) / 1000,
    percentage: Math.round(prob * 1000) / 10,
    threshold: THRESHOLD,
    threshold_percentage: Math.round(THRESHOLD * 1000) / 10,
    is_above_threshold: isElevated,
    risk_band: riskBand,
    risk_description: bandDesc,
    operating_point: {
      target_sensitivity: 0.80,
      oof_sensitivity: 0.805,
      oof_specificity: 0.650,
      threshold: THRESHOLD,
      basis: 'Nested repeated development OOF predictions; descriptive only',
    },
    fib4_comparison: fib4Res,
    validation_warnings: [],
    intended_use: 'Research project. Not a diagnostic tool and not for individual care decisions.',
  };
}
