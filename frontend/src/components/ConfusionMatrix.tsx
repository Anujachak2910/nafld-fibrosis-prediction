import React from 'react';

interface ConfusionMatrixProps {
  title: string;
  matrix: [[number, number], [number, number]]; // [[TN, FP], [FN, TP]]
  sensitivity?: number;
  specificity?: number;
  ppv?: number;
  npv?: number;
  threshold?: number;
  note?: string;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({
  title,
  matrix,
  sensitivity,
  specificity,
  ppv,
  npv,
  threshold,
  note,
}) => {
  const tn = matrix[0][0];
  const fp = matrix[0][1];
  const fn = matrix[1][0];
  const tp = matrix[1][1];
  const total = tn + fp + fn + tp;
  const actualNeg = tn + fp;
  const actualPos = fn + tp;
  const predNeg = tn + fn;
  const predPos = fp + tp;

  return (
    <div className="scientific-card bg-surface">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <h4 className="font-serif font-semibold text-sm text-ink">{title}</h4>
        {threshold !== undefined && (
          <span className="text-xs font-mono text-ink-dim">Cutoff: {threshold.toFixed(4)}</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-center border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left font-normal text-ink-dim"></th>
              <th className="p-2 font-medium text-ink bg-subtle/50 border border-border">
                Pred Negative (0)
              </th>
              <th className="p-2 font-medium text-ink bg-subtle/50 border border-border">
                Pred Positive (1)
              </th>
              <th className="p-2 font-normal text-ink-dim border border-border">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="p-2 text-left font-medium text-ink bg-subtle/50 border border-border">
                Actual Negative (F0–1)
              </th>
              <td className="p-3 font-mono font-medium text-ink bg-surface border border-border tnum">
                {tn}{' '}
                <span className="block text-[10px] font-sans text-ink-dim">
                  TN ({((tn / total) * 100).toFixed(1)}%)
                </span>
              </td>
              <td className="p-3 font-mono font-medium text-risk-high bg-risk-high-bg/30 border border-border tnum">
                {fp}{' '}
                <span className="block text-[10px] font-sans text-ink-dim">
                  FP ({((fp / total) * 100).toFixed(1)}%)
                </span>
              </td>
              <td className="p-2 font-mono text-ink-dim bg-subtle/30 border border-border tnum">
                {actualNeg}
              </td>
            </tr>
            <tr>
              <th className="p-2 text-left font-medium text-ink bg-subtle/50 border border-border">
                Actual Positive (F ≥ 2)
              </th>
              <td className="p-3 font-mono font-medium text-risk-mid bg-risk-mid-bg/30 border border-border tnum">
                {fn}{' '}
                <span className="block text-[10px] font-sans text-ink-dim">
                  FN ({((fn / total) * 100).toFixed(1)}%)
                </span>
              </td>
              <td className="p-3 font-mono font-medium text-risk-low bg-risk-low-bg/40 border border-border tnum">
                {tp}{' '}
                <span className="block text-[10px] font-sans text-ink-dim">
                  TP ({((tp / total) * 100).toFixed(1)}%)
                </span>
              </td>
              <td className="p-2 font-mono text-ink-dim bg-subtle/30 border border-border tnum">
                {actualPos}
              </td>
            </tr>
            <tr className="bg-subtle/30 font-mono text-ink-dim text-[11px]">
              <th className="p-2 text-left font-normal border border-border">Total</th>
              <td className="p-2 border border-border tnum">{predNeg}</td>
              <td className="p-2 border border-border tnum">{predPos}</td>
              <td className="p-2 font-semibold text-ink border border-border tnum">{total}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {(sensitivity !== undefined || specificity !== undefined || ppv !== undefined || npv !== undefined) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-border text-xs">
          {sensitivity !== undefined && (
            <div className="p-2 bg-subtle rounded">
              <span className="text-ink-dim block text-[10px]">Sensitivity (Recall)</span>
              <span className="font-mono font-semibold text-ink tnum">
                {(sensitivity * 100).toFixed(1)}%
              </span>
            </div>
          )}
          {specificity !== undefined && (
            <div className="p-2 bg-subtle rounded">
              <span className="text-ink-dim block text-[10px]">Specificity</span>
              <span className="font-mono font-semibold text-ink tnum">
                {(specificity * 100).toFixed(1)}%
              </span>
            </div>
          )}
          {ppv !== undefined && (
            <div className="p-2 bg-subtle rounded">
              <span className="text-ink-dim block text-[10px]">PPV (Precision)</span>
              <span className="font-mono font-semibold text-ink tnum">
                {(ppv * 100).toFixed(1)}%
              </span>
            </div>
          )}
          {npv !== undefined && (
            <div className="p-2 bg-subtle rounded">
              <span className="text-ink-dim block text-[10px]">NPV</span>
              <span className="font-mono font-semibold text-ink tnum">
                {(npv * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}

      {note && (
        <p className="text-[11px] text-ink-dim mt-2.5 leading-snug">
          {note}
        </p>
      )}
    </div>
  );
};
