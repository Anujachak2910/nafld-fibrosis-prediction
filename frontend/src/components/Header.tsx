import React from 'react';
import { ExternalLink, ShieldAlert, GitBranch } from 'lucide-react';
import { REPO_METADATA } from '../lib/repo-data';

interface HeaderProps {
  apiOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ apiOnline }) => {
  return (
    <header className="border-b border-border bg-surface">
      {/* Top micro-bar: Editorial disclaimer */}
      <div className="bg-subtle border-b border-border px-4 py-1.5 text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-accent" />
            <span className="font-medium text-ink">Academic Research Prototype</span>
            <span className="text-ink-dim hidden sm:inline">•</span>
            <span>Not approved as a medical device or diagnostic instrument.</span>
          </div>
          <div className="flex items-center gap-3 text-ink-dim">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-risk-low' : 'bg-risk-mid'}`} />
              <span className="text-ink-muted">{apiOnline ? 'FastAPI Online' : 'Bundled Engine'}</span>
            </span>
            <span>Cohort N = 605</span>
          </div>
        </div>
      </div>

      {/* Main Journal Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="badge badge-accent">Non-Invasive Hepatology</span>
              <span className="text-xs font-mono text-ink-dim">Model: Tuned RF (n=300, leaf=5)</span>
              <span className="text-xs font-mono text-ink-dim">Threshold: 0.4158</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink tracking-tight">
              NAFLD Liver Fibrosis Risk Estimation
            </h1>
            <p className="text-sm text-ink-muted mt-1 max-w-3xl">
              Exploring non-invasive estimation of significant liver fibrosis (stage F ≥ 2) from 33 routine clinical & lab parameters in biopsy-proven NAFLD.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <a
              href={REPO_METADATA.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs font-medium rounded text-ink bg-surface hover:bg-subtle hover:border-border-strong transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 text-accent" />
              <span>Repository</span>
              <ExternalLink className="w-3 h-3 text-ink-dim" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
