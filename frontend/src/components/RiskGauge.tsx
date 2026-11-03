import React from 'react';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import type { PredictionResult } from '../lib/types';

interface RiskGaugeProps {
  prediction: PredictionResult;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ prediction }) => {
  const { percentage, threshold_percentage, is_above_threshold, risk_band, risk_description, operating_point } =
    prediction;

  // Determine styling based on risk band
  let statusColor = 'text-risk-low';
  let badgeClass = 'badge-low';
  let barColor = 'bg-risk-low';
  let icon = <CheckCircle className="w-5 h-5 text-risk-low" />;

  if (is_above_threshold) {
    statusColor = 'text-risk-high';
    badgeClass = 'badge-high';
    barColor = 'bg-risk-high';
    icon = <AlertTriangle className="w-5 h-5 text-risk-high" />;
  } else if (prediction.probability >= 0.25) {
    statusColor = 'text-risk-mid';
    badgeClass = 'badge-mid';
    barColor = 'bg-risk-mid';
    icon = <HelpCircle className="w-5 h-5 text-risk-mid" />;
  }

  return (
    <div className="scientific-card bg-surface">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-ink-muted">Estimated Risk Output</span>
          <h3 className="font-serif text-lg font-semibold text-ink">Significant Fibrosis (F ≥ 2)</h3>
        </div>
        <span className={`badge ${badgeClass} text-xs font-semibold py-1 px-2.5`}>{risk_band}</span>
      </div>

      {/* Main numerical risk display */}
      <div className="py-5 flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className={`text-4xl sm:text-5xl font-mono font-bold tracking-tight tnum ${statusColor}`}>
            {percentage}%
          </span>
          <span className="text-xs font-mono text-ink-dim">
            p = {prediction.probability.toFixed(3)}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-ink-dim">Model Decision Threshold</div>
          <div className="text-sm font-mono font-semibold text-ink tnum">
            {threshold_percentage}% ({operating_point.threshold.toFixed(4)})
          </div>
        </div>
      </div>

      {/* Horizontal probability scale with marker */}
      <div className="relative pt-2 pb-6">
        {/* Background track */}
        <div className="w-full h-3 bg-subtle rounded-full overflow-hidden border border-border flex">
          <div className="h-full bg-risk-low/20 w-[25%]" title="Low risk zone (<25%)" />
          <div className="h-full bg-risk-mid/20 w-[16.6%]" title="Indeterminate zone (25% to 41.6%)" />
          <div className="h-full bg-risk-high/20 w-[58.4%]" title="Elevated risk zone (≥41.6%)" />
        </div>

        {/* Current score fill overlay */}
        <div
          className={`absolute top-2 left-0 h-3 rounded-full opacity-80 transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
        />

        {/* Threshold marker */}
        <div
          className="absolute top-0 bottom-4 w-0.5 bg-ink flex flex-col items-center pointer-events-none"
          style={{ left: `${threshold_percentage}%` }}
        >
          <div className="w-2 h-2 rotate-45 bg-ink -mt-1" />
          <span className="absolute top-5 text-[10px] font-mono text-ink-dim whitespace-nowrap bg-surface/90 px-1 border border-border/80 rounded">
            Cutoff {threshold_percentage}%
          </span>
        </div>
      </div>

      {/* Narrative Risk Description */}
      <div className="p-3 bg-subtle rounded border border-border text-xs leading-relaxed text-ink-muted">
        <div className="flex items-start gap-2">
          {icon}
          <div>
            <p className="font-medium text-ink mb-0.5">{risk_description}</p>
            <p className="text-ink-dim text-[11px]">
              Operating criterion: Sensitivity-oriented cutoff calibrated for{' '}
              <strong>{(operating_point.target_sensitivity * 100).toFixed(0)}% sensitivity</strong> (observed 80.5% sensitivity, 65.0% specificity on development out-of-fold data).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
