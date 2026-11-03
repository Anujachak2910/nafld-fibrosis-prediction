import React from 'react';
import { ExternalLink } from 'lucide-react';
import { REPO_METADATA } from '../lib/repo-data';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-border bg-surface text-ink-muted">
      {/* Calm persistent research disclaimer banner */}
      <div className="bg-subtle/80 border-b border-border py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <strong className="text-ink font-semibold uppercase tracking-wider text-[11px]">
              Research project. Not a diagnostic tool.
            </strong>
          </div>
          <p className="text-ink-muted text-xs leading-relaxed max-w-2xl">
            This predictive workflow is developed strictly for educational and methodological research. It is unvalidated on external patient populations and must not guide clinical decision-making or replace histologic/radiologic staging.
          </p>
        </div>
      </div>

      {/* Main Footer Links & Citations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h4 className="font-serif font-semibold text-ink text-sm mb-2">Project Governance & Provenance</h4>
            <p className="text-ink-muted leading-relaxed mb-3">
              Developed from Kaggle cohort &quot;Non-alcohol fatty liver disease (NAFLD)&quot; comprising 605 patients with biopsy-confirmed steatosis. The primary dataset source and license remain unverified; redistribution of raw workbook data is restricted.
            </p>
            <div className="text-ink-dim font-mono text-[11px] space-y-1">
              <div>Dataset SHA-256: {REPO_METADATA.datasetSha256.slice(0, 24)}...</div>
              <div>Model parameters: RF (300 estimators, leaf=5, class_weight=balanced)</div>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-ink text-sm mb-2">Authors & Team</h4>
            <ul className="space-y-1 text-ink-muted">
              {REPO_METADATA.teamMembers.map((member) => (
                <li key={member.id} className="flex items-center justify-between">
                  <span>{member.name}</span>
                  <span className="font-mono text-ink-dim text-[11px]">{member.id}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-ink text-sm mb-2">Documentation & Repository</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={REPO_METADATA.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-accent transition-colors text-ink"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-ink-dim" />
                </a>
              </li>
              <li>
                <span className="text-ink-muted">Software License: MIT</span>
              </li>
              <li>
                <span className="text-ink-muted">Data License: Original terms apply (unverified)</span>
              </li>
              <li className="pt-2 text-ink-dim text-[11px]">
                Built with React, TypeScript, Tailwind CSS & FastAPI.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
