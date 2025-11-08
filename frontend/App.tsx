import React, { useState } from 'react';
import RoutesTab from './src/adapters/ui/components/RoutesTab';
import CompareTab from './src/adapters/ui/components/CompareTab';
import BankingTab from './src/adapters/ui/components/BankingTab';
import PoolingTab from './src/adapters/ui/components/PoolingTab';
import Sidebar from './src/adapters/ui/components/Sidebar';
import { ShipIcon } from './src/adapters/ui/common/icons';

export type View = 'Routes' | 'Compare' | 'Banking' | 'Pooling';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('Routes');

  const renderViewContent = () => {
    switch (activeView) {
      case 'Routes':
        return <RoutesTab />;
      case 'Compare':
        return <CompareTab />;
      case 'Banking':
        return <BankingTab />;
      case 'Pooling':
        return <PoolingTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex text-light-text dark:text-dark-text">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col">
         <header className="bg-light-card dark:bg-dark-card/50 backdrop-blur-sm sticky top-0 z-10 border-b border-light-border dark:border-dark-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                    <ShipIcon className="h-7 w-7 text-brand-primary" />
                    <h1 className="text-xl font-bold">
                        FuelEU Maritime
                    </h1>
                    </div>
                </div>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="container mx-auto">
            {renderViewContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;