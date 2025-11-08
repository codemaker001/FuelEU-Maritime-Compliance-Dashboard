import React from 'react';
import { View } from '../../../../App';
import { RouteIcon, CompareIcon, BankIcon, UsersIcon } from '../common/icons';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems: { name: View; icon: React.ReactNode }[] = [
    { name: 'Routes', icon: <RouteIcon /> },
    { name: 'Compare', icon: <CompareIcon /> },
    { name: 'Banking', icon: <BankIcon /> },
    { name: 'Pooling', icon: <UsersIcon /> },
  ];

  return (
    <aside className="w-64 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border flex-shrink-0 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-light-border dark:border-dark-border">
        <h2 className="text-2xl font-bold text-brand-primary">FuelEU</h2>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveView(item.name)}
            className={`
              w-full flex items-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 ease-in-out
              ${activeView === item.name
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-bg'
              }
            `}
          >
            {item.icon}
            <span className="ml-3">{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-light-border dark:border-dark-border text-xs text-center text-light-text-secondary dark:text-dark-text-secondary">
        <p>&copy; {new Date().getFullYear()} Maritime Solutions</p>
      </div>
    </aside>
  );
};

export default Sidebar;