import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Navigation, type TabId } from './components/Navigation';
import { Overview } from './pages/Overview';
import { RiskEstimator } from './pages/RiskEstimator';
import { ModelPerformance } from './pages/ModelPerformance';
import { DataMethod } from './pages/DataMethod';
import { LimitationsAbout } from './pages/LimitationsAbout';
import { checkBackendHealth } from './lib/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabId>('overview');
  const [apiOnline, setApiOnline] = useState<boolean>(false);

  useEffect(() => {
    checkBackendHealth().then((res) => setApiOnline(res.online));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      <Header apiOnline={apiOnline} />
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {currentTab === 'overview' && (
          <Overview
            onNavigateToEstimator={() => setCurrentTab('estimator')}
            onNavigateToPerformance={() => setCurrentTab('performance')}
          />
        )}

        {currentTab === 'estimator' && <RiskEstimator />}

        {currentTab === 'performance' && <ModelPerformance />}

        {currentTab === 'method' && <DataMethod />}

        {currentTab === 'about' && <LimitationsAbout />}
      </main>

      <Footer />
    </div>
  );
};

export default App;
