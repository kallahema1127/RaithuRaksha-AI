import React, { useState } from 'react';
import {
  initialMarketContext,
  initialProduceItems,
  initialBuyers,
  initialSurplusMatches,
  initialNotifications,
} from './data/mockData';
import { ProduceItem, BuyerRecipient, SurplusMatch, MarketContext, NotificationItem } from './types';
import { Navbar } from './components/Navbar';
import { FarmerInventory } from './components/FarmerInventory';
import { DemandForecastView } from './components/DemandForecastView';
import { SurplusMatcherView } from './components/SurplusMatcherView';
import { BuyerPortalView } from './components/BuyerPortalView';
import { WasteToValueView } from './components/WasteToValueView';
import { ImpactDashboardView } from './components/ImpactDashboardView';
import { RegisterProduceModal } from './components/RegisterProduceModal';
import { MarketConditionsBar } from './components/MarketConditionsBar';
import { NotificationsModal } from './components/NotificationsModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('inventory');
  const [produceItems, setProduceItems] = useState<ProduceItem[]>(initialProduceItems);
  const [buyers, setBuyers] = useState<BuyerRecipient[]>(initialBuyers);
  const [matches, setMatches] = useState<SurplusMatch[]>(initialSurplusMatches);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [marketContext, setMarketContext] = useState<MarketContext>(initialMarketContext);

  const [selectedProduceForMatching, setSelectedProduceForMatching] = useState<ProduceItem | null>(null);

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isMarketConfigOpen, setIsMarketConfigOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRecalculatingDemand, setIsRecalculatingDemand] = useState(false);

  // Add newly registered produce
  const handleAddProduce = (newProduce: ProduceItem) => {
    setProduceItems((prev) => [newProduce, ...prev]);

    // Create system notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      channel: 'app',
      recipientRole: 'farmer',
      recipientName: newProduce.farmerName,
      phoneOrTarget: newProduce.farmerPhone,
      title: 'Produce Lot Registered',
      message: `Registered ${newProduce.quantityListedKg} kg of ${newProduce.name}. AI estimated demand is ${newProduce.projectedDemandKg} kg, leaving ${newProduce.projectedSurplusKg} kg projected surplus.`,
      relatedProduceId: newProduce.id,
      actionTaken: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Update existing produce (e.g. price change, retail sale increment)
  const handleUpdateProduce = (updated: ProduceItem) => {
    setProduceItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Select produce and navigate to matching engine
  const handleSelectForMatching = (item: ProduceItem) => {
    setSelectedProduceForMatching(item);
    setCurrentTab('matcher');
  };

  // Dispatch new surplus matches
  const handleDispatchMatches = (newMatches: SurplusMatch[]) => {
    setMatches((prev) => {
      // deduplicate
      const existingIds = new Set(prev.map((m) => m.id));
      const fresh = newMatches.filter((m) => !existingIds.has(m.id));
      return [...fresh, ...prev];
    });
  };

  // Send real-time notification
  const handleSendNotification = (
    channel: 'sms' | 'whatsapp' | 'app',
    recipientName: string,
    title: string,
    message: string,
    phone: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
      channel,
      recipientRole: 'buyer',
      recipientName,
      phoneOrTarget: phone,
      title,
      message,
      actionTaken: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Buyer accepts, negotiates, or rejects a match
  const handleUpdateMatchStatus = (
    matchId: string,
    status: SurplusMatch['status'],
    requestedQuantity?: number,
    buyerNotes?: string
  ) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return {
            ...m,
            status,
            requestedQuantityKg: requestedQuantity !== undefined ? requestedQuantity : m.matchedQuantityKg,
            buyerResponseNotes: buyerNotes || m.buyerResponseNotes,
            completedAt: status === 'accepted' ? new Date().toISOString() : m.completedAt,
          };
        }
        return m;
      })
    );

    const matchObj = matches.find((m) => m.id === matchId);
    if (matchObj && status === 'accepted') {
      // Notify farmer
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        timestamp: 'Just now',
        channel: 'whatsapp',
        recipientRole: 'farmer',
        recipientName: 'Marcus Sterling (Farmer)',
        phoneOrTarget: '+1 (555) 392-8812',
        title: 'Surplus Acceptance Confirmed!',
        message: `${matchObj.buyerName} confirmed acceptance of ${requestedQuantity || matchObj.matchedQuantityKg} kg of ${matchObj.produceName}. Pickup arranged: ${matchObj.arrangedPickupTime || 'Today 16:30'}.`,
        relatedProduceId: matchObj.produceId,
        actionTaken: true,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Dispatch to waste-to-value circularity pathway
  const handleDispatchToWastePathway = (produceId: string, pathwayId: string) => {
    const produce = produceItems.find((p) => p.id === produceId);
    if (produce) {
      // mark as redirected
      handleUpdateProduce({
        ...produce,
        projectedSurplusKg: 0,
        notes: `Liquidated via bio-circularity pathway (${pathwayId}). Diverted from landfill.`,
      });

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        timestamp: 'Just now',
        channel: 'app',
        recipientRole: 'farmer',
        recipientName: produce.farmerName,
        phoneOrTarget: produce.farmerPhone,
        title: 'Bio-Recovery Transfer Initiated',
        message: `${produce.projectedSurplusKg} kg of ${produce.name} dispatched for organic conversion. 100% landfill diversion verified.`,
        relatedProduceId: produce.id,
        actionTaken: true,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Recalculate AI demand and surplus across all inventory lots when market variables change
  const handleRecalculateDemand = async () => {
    setIsRecalculatingDemand(true);
    try {
      const footfallFactor = marketContext.footfallIndexPercent / 100;
      const isWeekend = ['Saturday', 'Sunday'].includes(marketContext.dayOfWeek);
      const dayMultiplier = isWeekend ? 1.25 : 0.75;
      const weatherPenalty = marketContext.weather.includes('Rain')
        ? 0.55
        : marketContext.weather.includes('Hot')
        ? 0.78
        : 1.05;

      const updated = produceItems.map((prod) => {
        const baseAbsorb = prod.category === 'leafy_green' ? 0.65 : 0.75;
        const demandRate = Math.min(
          0.95,
          Math.max(0.2, baseAbsorb * footfallFactor * dayMultiplier * weatherPenalty)
        );
        const newDemand = Math.round(prod.quantityListedKg * demandRate);
        const newSurplus = Math.max(0, prod.quantityListedKg - newDemand);
        const newShelfLife = marketContext.tempCelsius > 30 ? Math.max(6, prod.estimatedShelfLifeHours - 4) : prod.estimatedShelfLifeHours;
        const newStatus = newShelfLife <= 10 ? 'high_spoilage_risk' : (newShelfLife <= 18 ? 'redistribute_now' : 'fresh');

        return {
          ...prod,
          projectedDemandKg: newDemand,
          projectedSurplusKg: newSurplus,
          estimatedShelfLifeHours: newShelfLife,
          freshnessStatus: newStatus as any,
          storageTempCelsius: marketContext.tempCelsius,
        };
      });

      setProduceItems(updated);

      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        timestamp: 'Just now',
        channel: 'app',
        recipientRole: 'system',
        recipientName: 'Market AI Engine',
        phoneOrTarget: 'Automated Broadcast',
        title: 'Market Forecast Updated',
        message: `Demand recalibrated for ${marketContext.dayOfWeek} (${marketContext.weather}, ${marketContext.footfallIndexPercent}% footfall). Total projected market surplus: ${updated.reduce((s, p) => s + p.projectedSurplusKg, 0)} kg.`,
        actionTaken: true,
      };
      setNotifications((prev) => [notif, ...prev]);
    } finally {
      setIsRecalculatingDemand(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.actionTaken).length;

  return (
    <div className="min-h-screen bg-[#0c0e12] text-neutral-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadCount}
        marketContext={marketContext}
        onOpenMarketConfig={() => setIsMarketConfigOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'inventory' && (
          <FarmerInventory
            produceItems={produceItems}
            onSelectForMatching={handleSelectForMatching}
            onUpdateProduce={handleUpdateProduce}
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          />
        )}

        {currentTab === 'forecast' && (
          <DemandForecastView
            produceItems={produceItems}
            marketContext={marketContext}
            onOpenMarketConfig={() => setIsMarketConfigOpen(true)}
            onSelectForMatching={handleSelectForMatching}
          />
        )}

        {currentTab === 'matcher' && (
          <SurplusMatcherView
            produceItems={produceItems}
            selectedProduce={selectedProduceForMatching}
            onSelectProduce={setSelectedProduceForMatching}
            buyers={buyers}
            matches={matches}
            onDispatchMatches={handleDispatchMatches}
            onSendNotification={handleSendNotification}
          />
        )}

        {currentTab === 'buyers' && (
          <BuyerPortalView
            buyers={buyers}
            matches={matches}
            produceItems={produceItems}
            onUpdateMatchStatus={handleUpdateMatchStatus}
          />
        )}

        {currentTab === 'waste' && (
          <WasteToValueView
            produceItems={produceItems}
            onDispatchToWastePathway={handleDispatchToWastePathway}
          />
        )}

        {currentTab === 'impact' && (
          <ImpactDashboardView
            produceItems={produceItems}
            matches={matches}
            buyers={buyers}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-[#090b0e] py-6 px-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400">AgriSurplus AI</span>
            <span>·</span>
            <span>Farmer Market Produce Loss Mitigation & Circular Redistribution System</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-neutral-400">
            <span>Market: {marketContext.marketName.split('(')[0].trim()}</span>
            <span>·</span>
            <span className="text-emerald-400">0% Landfill Goal</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RegisterProduceModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onAddProduce={handleAddProduce}
        marketContext={marketContext}
      />

      <MarketConditionsBar
        isOpen={isMarketConfigOpen}
        onClose={() => setIsMarketConfigOpen(false)}
        marketContext={marketContext}
        onUpdateMarketContext={setMarketContext}
        onTriggerRecalculate={handleRecalculateDemand}
        isRecalculating={isRecalculatingDemand}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, actionTaken: true })));
        }}
        onSelectTab={setCurrentTab}
      />
    </div>
  );
}
