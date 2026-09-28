import React from 'react';
import { Bell, Plus, Sparkles, Sprout, Store } from 'lucide-react';
import { MarketContext } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenRegisterModal: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  marketContext: MarketContext;
  onOpenMarketConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenRegisterModal,
  onOpenNotifications,
  unreadCount,
  marketContext,
  onOpenMarketConfig,
}) => {
  const navItems = [
    { id: 'inventory', label: 'Farmer Stall' },
    { id: 'forecast', label: 'AI Demand Forecast' },
    { id: 'matcher', label: 'Surplus Matcher' },
    { id: 'buyers', label: 'Buyer Portal' },
    { id: 'waste', label: 'Waste-to-Value' },
    { id: 'impact', label: 'Impact Analytics' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-[#0c0e12]/95 backdrop-blur-md">
      {/* Primary Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (4-6 links) - Zone 3 (1-2 actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('inventory');
            }}
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sprout className="w-4 h-4" />
            </span>
            <span>AgriSurplus AI</span>
          </a>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-300">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`transition-colors whitespace-nowrap py-1 relative ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Market Status Quick Button */}
          <button
            onClick={onOpenMarketConfig}
            title="Configure Market Weather, Day & Footfall"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[130px] font-mono">{marketContext.dayOfWeek} · {marketContext.weather.split(' ')[0]}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
            title="Surplus Alerts & Direct Buyer Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[10px] font-bold text-neutral-950 rounded-full flex items-center justify-center font-mono">
                {unreadCount}
              </span>
            )}
          </button>

          {/* New Produce Registration CTA */}
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>List Produce</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-neutral-800/80 bg-neutral-950 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
              currentTab === item.id
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
