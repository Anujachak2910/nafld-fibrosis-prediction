import React from 'react';
import { Activity, BarChart3, Database, FileText, Info } from 'lucide-react';

export type TabId = 'overview' | 'estimator' | 'performance' | 'method' | 'about';

interface NavigationProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'estimator',
      label: 'Risk Estimator',
      icon: <Activity className="w-4 h-4" />,
      badge: '33 Inputs',
    },
    {
      id: 'performance',
      label: 'Model Performance',
      icon: <BarChart3 className="w-4 h-4" />,
      badge: 'ROC & Subgroups',
    },
    {
      id: 'method',
      label: 'Data & Method',
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: 'about',
      label: 'Limitations & About',
      icon: <Info className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="border-b border-border bg-surface sticky top-0 z-30 shadow-sm" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex overflow-x-auto no-scrollbar gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? 'border-accent text-accent font-semibold bg-accent-light/30'
                    : 'border-transparent text-ink-muted hover:text-ink hover:border-border-strong hover:bg-subtle/50'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={isActive ? 'text-accent' : 'text-ink-dim'}>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider ${
                      isActive ? 'bg-accent text-white' : 'bg-subtle text-ink-dim border border-border'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
