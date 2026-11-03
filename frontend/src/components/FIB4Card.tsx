import React from 'react';
import { Bookmark, Calculator } from 'lucide-react';
import type { FIB4Result } from '../lib/types';

interface FIB4CardProps {
  fib4: FIB4Result | null;
  rfAboveThreshold?: boolean;
}

export const FIB4Card: React.FC<FIB4CardProps> = ({ fib4 }) => {
  if (!fib4) {
    return (
      <div className="scientific-card bg-surface opacity-80">
        <div className="flex items-center gap-2 mb-2 text-ink-dim">
          <Calculator className="w-4 h-4 text-accent" />
          <h4 className="font-serif font-semibold text-sm text-ink">FIB-4 Clinical Benchmark</h4>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          Incomplete data for FIB-4 index. Requires Age, AST, ALT, and Platelet count (Trombosit) to be fully specified.
        </p>
      </div>
    );
  }

  const isLow = fib4.score < 1.30;
  const isHigh = fib4.score > 2.67;

  const bandClass = isLow ? 'badge-low' : isHigh ? 'badge-high' : 'badge-mid';

  return (
    <div className="scientific-card bg-surface">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-accent" />
          <h4 className="font-serif font-semibold text-sm text-ink">Clinical Benchmark: FIB-4 Index</h4>
        </div>
        <span className={`badge ${bandClass} text-[11px]`}>{fib4.risk_band}</span>
      </div>

      <div className="py-4 flex items-baseline justify-between">
        <div>
          <div className="text-3xl font-mono font-bold text-ink tnum">
            {fib4.score.toFixed(2)}
          </div>
          <div className="text-[11px] font-mono text-ink-dim mt-0.5">
            Formula: (Age × AST) / (Platelets × √ALT)
          </div>
        </div>
        <div className="text-right text-xs text-ink-dim space-y-0.5">
          <div>Rule-out cutoff: &lt; 1.30</div>
          <div>Rule-in cutoff: &gt; 2.67</div>
        </div>
      </div>

      {/* Side-by-side Discordance / Concordance Callout */}
      <div className="p-3 bg-subtle rounded border border-border text-xs text-ink-muted space-y-2">
        <p className="leading-snug">
          {fib4.interpretation}
        </p>
        <div className="pt-2 border-t border-border/70 flex items-start gap-1.5 text-[11px] text-ink-dim">
          <Bookmark className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
          <span>
            <strong>Benchmark context:</strong> In this 605-patient cohort, FIB-4 reached an AUC of 0.703 (95% CI 0.660 to 0.744) for significant fibrosis, missing half of positive cases (sensitivity 0.50) at the 1.3 cutoff. Random Forest demonstrated +0.099 higher AUC (95% CI +0.049 to +0.148) in nested development evaluation.
          </span>
        </div>
      </div>
    </div>
  );
};
