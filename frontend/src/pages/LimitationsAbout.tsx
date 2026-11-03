import React from 'react';
import {
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  GitBranch,
  Users,
  FileQuestion,
  Scale,
  Building,
} from 'lucide-react';
import { REPO_METADATA } from '../lib/repo-data';

export const LimitationsAbout: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="badge badge-accent">Transparency & Governance</span>
          <span className="text-xs text-ink-dim font-mono">Academic Research Project</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink tracking-tight">
          Limitations, Governance & Research Team
        </h2>
        <p className="text-sm text-ink-muted mt-1 max-w-3xl leading-relaxed">
          Open documentation of observational constraints, dataset provenance status, ethical boundaries, and author attributions.
        </p>
      </div>

      {/* Prominent Non-Clinical Disclaimer Card */}
      <div className="p-5 bg-risk-high-bg border border-risk-high-border rounded-md space-y-2">
        <div className="flex items-center gap-2 text-risk-high">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <h3 className="font-serif font-semibold text-base">
            Mandatory Clinical Use Restriction
          </h3>
        </div>
        <p className="text-xs text-ink-muted leading-relaxed">
          This system is an experimental academic prototype developed for university coursework. It has <strong>not been evaluated in prospective clinical trials</strong>, has not received regulatory clearance (such as FDA 510(k), De Novo, or CE Mark), and must not be used to direct patient diagnosis, treatment selection, or deferral of care.
        </p>
      </div>

      {/* Structured Limitations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="scientific-card bg-surface space-y-3">
          <div className="flex items-center gap-2 text-accent pb-2 border-b border-border">
            <Building className="w-4 h-4" />
            <h4 className="font-serif font-semibold text-base text-ink">1. Lack of External Validation</h4>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            All models were evaluated on a single retrospective cohort of 605 patients. Performance across distinct hospital centers, diverse geographic demographics, or modern point-of-care lab analyzers has not been established. Generalization cannot be inferred from development cross-validation alone.
          </p>
        </div>

        <div className="scientific-card bg-surface space-y-3">
          <div className="flex items-center gap-2 text-accent pb-2 border-b border-border">
            <Scale className="w-4 h-4" />
            <h4 className="font-serif font-semibold text-base text-ink">2. Biopsy Ground-Truth Sampling Noise</h4>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            The reference standard is percutaneous liver biopsy. A standard needle core samples approximately 1/50,000th of the adult liver parenchyma and carries documented inter-observer staging variability (discordance up to 20–30% in literature).
          </p>
        </div>

        <div className="scientific-card bg-surface space-y-3">
          <div className="flex items-center gap-2 text-risk-mid pb-2 border-b border-border">
            <FileQuestion className="w-4 h-4" />
            <h4 className="font-serif font-semibold text-base text-ink">3. Open Dataset Provenance & License</h4>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            The workbook <code className="font-mono text-ink">NAFLD.xlsx</code> was obtained from Kaggle. However, the original URL cited in preliminary materials pointed to a separate longitudinal measurements table (<code className="font-mono text-ink">nafld2.csv</code>). The original clinical institution, ethics approval, and redistribution license remain unconfirmed. Raw data redistribution is restricted.
          </p>
        </div>

        <div className="scientific-card bg-surface space-y-3">
          <div className="flex items-center gap-2 text-accent pb-2 border-b border-border">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="font-serif font-semibold text-base text-ink">4. Small Sample & Subgroup Denominators</h4>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            With 605 total patients and 219 positive cases, statistical power diminishes in subgroups. For instance, the cohort includes only 50 patients aged 60+, producing wide bootstrap confidence intervals (ROC-AUC 0.677, 95% CI 0.518 to 0.825).
          </p>
        </div>
      </div>

      {/* Research Team Attribution */}
      <div className="scientific-card bg-surface space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <h3 className="font-serif font-semibold text-lg text-ink">The Research Team</h3>
          </div>
          <span className="text-xs font-mono text-ink-dim">Alphabetical Order</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {REPO_METADATA.teamMembers.map((member, idx) => (
            <div
              key={member.id}
              className="p-3.5 bg-subtle rounded border border-border flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-medium text-ink">{member.name}</div>
                <div className="text-[11px] font-mono text-ink-dim">Student ID: {member.id}</div>
              </div>
              <span className="w-6 h-6 rounded-full bg-surface border border-border text-[11px] font-mono text-ink-dim flex items-center justify-center">
                0{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Source Code & Licensing */}
      <div className="scientific-card bg-surface space-y-3">
        <h4 className="font-serif font-semibold text-base text-ink border-b border-border pb-2.5">
          Software Repository & Citation
        </h4>
        <div className="text-xs text-ink-muted space-y-2 leading-relaxed">
          <p>
            The complete source code for preprocessing pipelines, cross-validation protocols, and model packaging is available under the open-source MIT License:
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={REPO_METADATA.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-accent text-white rounded text-xs font-medium hover:bg-accent-hover transition-colors inline-flex items-center gap-2"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>GitHub: shrfr/nafld-fibrosis-prediction</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
