import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  ci?: string;
  badge?: string;
  badgeVariant?: 'neutral' | 'accent' | 'low' | 'mid' | 'high';
  subtext?: string;
  footnote?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  ci,
  badge,
  badgeVariant = 'neutral',
  subtext,
  footnote,
}) => {
  const badgeClasses = {
    neutral: 'badge-neutral',
    accent: 'badge-accent',
    low: 'badge-low',
    mid: 'badge-mid',
    high: 'badge-high',
  }[badgeVariant];

  return (
    <div className="scientific-card flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</span>
          {badge && <span className={`badge ${badgeClasses}`}>{badge}</span>}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-mono font-semibold text-ink tnum tracking-tight">
            {value}
          </span>
          {ci && (
            <span className="text-xs font-mono text-ink-dim tnum">
              ({ci})
            </span>
          )}
        </div>
        {subtext && <p className="text-xs text-ink-muted mt-1 leading-snug">{subtext}</p>}
      </div>
      {footnote && (
        <div className="mt-3 pt-2 border-t border-border/60 text-[11px] text-ink-dim">
          {footnote}
        </div>
      )}
    </div>
  );
};
