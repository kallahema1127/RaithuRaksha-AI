import React, { useState } from 'react';
import { ProduceItem, FreshnessStatus } from '../types';
import { AlertTriangle, Clock, Sparkles, TrendingDown, ArrowUpRight, DollarSign, Eye, Check, RefreshCw } from 'lucide-react';

interface FarmerInventoryProps {
  produceItems: ProduceItem[];
  onSelectForMatching: (item: ProduceItem) => void;
  onUpdateProduce: (updated: ProduceItem) => void;
  onOpenRegisterModal: () => void;
}

export const FarmerInventory: React.FC<FarmerInventoryProps> = ({
  produceItems,
  onSelectForMatching,
  onUpdateProduce,
  onOpenRegisterModal,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<string>('');

  const totalListed = produceItems.reduce((acc, item) => acc + item.quantityListedKg, 0);
  const totalSold = produceItems.reduce((acc, item) => acc + item.quantitySoldKg, 0);
  const totalSurplus = produceItems.reduce((acc, item) => acc + item.projectedSurplusKg, 0);
  const highRiskCount = produceItems.filter(
    (i) => i.freshnessStatus === 'high_spoilage_risk' || i.estimatedShelfLifeHours <= 12
  ).length;

  const filteredItems = produceItems.filter((item) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'surplus_only') return item.projectedSurplusKg > 0;
    if (filterCategory === 'high_risk') return item.freshnessStatus === 'high_spoilage_risk' || item.estimatedShelfLifeHours <= 14;
    return item.category === filterCategory;
  });

  const getStatusBadge = (status: FreshnessStatus, hours: number) => {
    if (status === 'high_spoilage_risk' || hours <= 10) {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          High Spoilage Risk ({hours}h left)
        </span>
      );
    }
    if (status === 'redistribute_now' || hours <= 20) {
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Redistribute Now ({hours}h left)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Fresh ({hours}h left)
      </span>
    );
  };

  const handleSavePrice = (item: ProduceItem) => {
    const val = parseFloat(newPriceValue);
    if (!isNaN(val) && val > 0) {
      const discount = Math.max(0, Math.round(((item.expectedPricePerKg - val) / item.expectedPricePerKg) * 100));
      onUpdateProduce({
        ...item,
        dynamicSuggestedPricePerKg: val,
        discountPercent: discount,
      });
    }
    setEditingPriceId(null);
  };

  const handleIncrementSale = (item: ProduceItem, delta: number) => {
    const newSold = Math.min(item.quantityListedKg, Math.max(0, item.quantitySoldKg + delta));
    const newSurplus = Math.max(0, item.quantityListedKg - Math.max(item.projectedDemandKg, newSold));
    onUpdateProduce({
      ...item,
      quantitySoldKg: newSold,
      projectedSurplusKg: newSurplus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Farmer Market Stall Inventory</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time stall stock, AI demand-prediction velocity, and early warning spoilage monitors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRegisterModal}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
          >
            + Register Produce Lot
          </button>
        </div>
      </div>

      {/* Structured Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400">Total Brought to Market</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {totalListed} <span className="text-xs font-normal text-neutral-500">kg</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            <span>6 distinct vegetable & leafy lots</span>
          </div>
        </div>

        <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400">Sold at Retail Stall</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {totalSold} <span className="text-xs font-normal text-neutral-500">kg</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            <span className="font-mono">{Math.round((totalSold / totalListed) * 100)}%</span> retail absorption
          </div>
        </div>

        <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400">Projected Unsold Surplus</span>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {totalSurplus} <span className="text-xs font-normal text-neutral-500">kg</span>
          </div>
          <div className="text-[11px] text-amber-400/90 mt-1">
            Available for AI Buyer Matching
          </div>
        </div>

        <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4">
          <span className="text-xs text-neutral-400">Critical Spoilage Alert</span>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
            {highRiskCount} <span className="text-xs font-normal text-neutral-500">lots</span>
          </div>
          <div className="text-[11px] text-rose-400 mt-1">
            Requires offloading within 12h
          </div>
        </div>
      </div>

      {/* Filter Tabs (Functional Segmented Control) */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs">
          {[
            { id: 'all', label: 'All Lots' },
            { id: 'surplus_only', label: 'Surplus Only' },
            { id: 'high_risk', label: 'Urgent Spoilage Risk' },
            { id: 'leafy_green', label: 'Leafy Greens' },
            { id: 'vegetable', label: 'Vegetables' },
            { id: 'herb', label: 'Herbs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterCategory === tab.id
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-neutral-500 font-mono">
          Showing {filteredItems.length} of {produceItems.length} items
        </span>
      </div>

      {/* Produce Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const remainingInStall = item.quantityListedKg - item.quantitySoldKg;
          const isHighRisk = item.freshnessStatus === 'high_spoilage_risk' || item.estimatedShelfLifeHours <= 12;

          return (
            <div
              key={item.id}
              className={`bg-[#12151b] border rounded-xl overflow-hidden flex flex-col transition-all hover:border-neutral-700 ${
                isHighRisk ? 'border-rose-900/50 shadow-sm shadow-rose-950/30' : 'border-neutral-800'
              }`}
            >
              {/* Card Image & Overlay */}
              <div className="relative h-44 w-full bg-neutral-900 overflow-hidden">
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12151b] via-[#12151b]/40 to-transparent" />
                
                {/* Status Indicator Bar at Top */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-xs border border-white/10">
                    {getStatusBadge(item.freshnessStatus, item.estimatedShelfLifeHours)}
                  </div>
                  <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-neutral-300 border border-white/10">
                    {item.qualityGrade}
                  </span>
                </div>

                {/* Bottom title inside gradient */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-base font-bold text-white leading-snug">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                    <span>{item.variety}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">Harvested {item.harvestDate} {item.harvestTime}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                {/* Demand & Surplus Analysis Breakdown */}
                <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Total Brought:</span>
                    <span className="font-mono font-semibold text-white">{item.quantityListedKg} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Sold at Stall:</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-emerald-400 font-semibold">{item.quantitySoldKg} kg</span>
                      <button
                        onClick={() => handleIncrementSale(item, 1)}
                        title="Add 1 kg retail sale"
                        className="px-1.5 py-0.5 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
                      >
                        +1kg
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">AI Expected Stall Sales:</span>
                    <span className="font-mono text-neutral-300">{item.projectedDemandKg} kg ({item.demandConfidencePercent}% conf)</span>
                  </div>
                  <div className="pt-1.5 border-t border-neutral-800 flex justify-between items-center">
                    <span className="font-medium text-amber-400">Projected Unsold Surplus:</span>
                    <span className="font-mono font-bold text-amber-400 text-sm">{item.projectedSurplusKg} kg</span>
                  </div>
                </div>

                {/* Pricing & Control */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Expected Stall Price:</span>
                    <span className="font-mono text-white">${item.expectedPricePerKg.toFixed(2)}/kg</span>
                  </div>
                  <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/40 rounded p-2">
                    <div>
                      <span className="text-[11px] text-emerald-400 font-medium block">
                        AI Suggested Surplus Price:
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {item.discountPercent}% off to clear before spoilage
                      </span>
                    </div>
                    {editingPriceId === item.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-400 text-xs">$</span>
                        <input
                          type="number"
                          step="0.10"
                          value={newPriceValue}
                          onChange={(e) => setNewPriceValue(e.target.value)}
                          className="w-16 bg-neutral-900 border border-emerald-500 rounded px-1.5 py-0.5 text-xs font-mono text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePrice(item)}
                          className="p-1 bg-emerald-500 text-neutral-950 rounded hover:bg-emerald-400"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          ${item.dynamicSuggestedPricePerKg.toFixed(2)}/kg
                        </span>
                        <button
                          onClick={() => {
                            setEditingPriceId(item.id);
                            setNewPriceValue(item.dynamicSuggestedPricePerKg.toString());
                          }}
                          className="text-[10px] text-neutral-400 hover:text-white underline"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Farmer Note / Freshness Advice */}
                {item.notes && (
                  <p className="text-[11px] text-neutral-400 line-clamp-2 italic">
                    "{item.notes}"
                  </p>
                )}

                {/* Action CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => onSelectForMatching(item)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold text-xs transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Match Surplus Produce ({item.projectedSurplusKg} kg)</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
