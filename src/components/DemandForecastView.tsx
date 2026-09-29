import React, { useState } from 'react';
import { ProduceItem, MarketContext, DemandPredictionResult } from '../types';
import { TrendingUp, AlertTriangle, CloudSun, Calendar, Sparkles, RefreshCw, BarChart3, ShieldCheck } from 'lucide-react';
import { fetchDemandForecast } from '../services/aiService';

interface DemandForecastViewProps {
  produceItems: ProduceItem[];
  marketContext: MarketContext;
  onOpenMarketConfig: () => void;
  onSelectForMatching: (item: ProduceItem) => void;
}

export const DemandForecastView: React.FC<DemandForecastViewProps> = ({
  produceItems,
  marketContext,
  onOpenMarketConfig,
  onSelectForMatching,
}) => {
  const [selectedProduce, setSelectedProduce] = useState<ProduceItem>(produceItems[0]);
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<DemandPredictionResult | null>(null);

  const handleRunAiForecast = async (item: ProduceItem) => {
    setSelectedProduce(item);
    setIsForecasting(true);
    try {
      const data = await fetchDemandForecast(item, marketContext);
      setForecastResult({
        produceName: item.name,
        projectedDemandKg: data.projectedDemandKg,
        projectedSurplusKg: data.projectedSurplusKg,
        riskLevel: data.riskLevel,
        drivers: data.drivers,
        recommendedAction: data.recommendedAction,
        suggestedDiscountPercent: data.suggestedDiscountPercent || 25,
      });
    } catch (e) {
      console.error('Forecast error:', e);
    } finally {
      setIsForecasting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">AI Demand Prediction & Surplus Risk Engine</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Machine learning forecast driven by weather forecasts, day-of-week historical sales curves, ambient temperatures, and produce respiration rates.
          </p>
        </div>
        <button
          onClick={onOpenMarketConfig}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
        >
          <CloudSun className="w-3.5 h-3.5 text-emerald-400" />
          <span>Adjust Market Variables ({marketContext.dayOfWeek}, {marketContext.weather.split(' ')[0]})</span>
        </button>
      </div>

      {/* Market Factors Snapshot */}
      <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4">
        <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
          Active Demand Drivers ({marketContext.marketName})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">Calendar Factor</span>
            <span className="font-semibold text-white mt-0.5 block">{marketContext.dayOfWeek}</span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {['Saturday', 'Sunday'].includes(marketContext.dayOfWeek) ? '+25% Peak Footfall' : '-20% Weekday Average'}
            </span>
          </div>

          <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">Weather & Precipitation</span>
            <span className="font-semibold text-white mt-0.5 block">{marketContext.weather}</span>
            <span className="text-[10px] text-amber-400 font-mono">
              {marketContext.weather.includes('Rain') ? '-45% Walk-in penalty' : 'Optimal consumer attendance'}
            </span>
          </div>

          <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">Ambient Stall Temperature</span>
            <span className="font-semibold text-white mt-0.5 block font-mono">{marketContext.tempCelsius}°C</span>
            <span className="text-[10px] text-neutral-400 font-mono">
              {marketContext.tempCelsius > 28 ? 'Accelerated respiration rate' : 'Normal metabolic stability'}
            </span>
          </div>

          <div className="bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
            <span className="text-neutral-400 block text-[11px]">Footfall Index</span>
            <span className="font-semibold text-emerald-400 mt-0.5 block font-mono">
              {marketContext.footfallIndexPercent}% benchmark
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">{marketContext.season}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Forecasting Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Produce List to Test */}
        <div className="lg:col-span-1 bg-[#12151b] border border-neutral-800 rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Select Harvest Lot for AI Analysis
          </h2>
          <div className="space-y-2">
            {produceItems.map((item) => {
              const isSelected = selectedProduce.id === item.id;
              const isAtRisk = item.projectedSurplusKg > 0 || item.estimatedShelfLifeHours <= 14;

              return (
                <button
                  key={item.id}
                  onClick={() => handleRunAiForecast(item)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-neutral-800 border-emerald-500 shadow-sm'
                      : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-white block">{item.name}</span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {item.quantityListedKg} kg brought · {item.estimatedShelfLifeHours}h shelf life
                    </span>
                  </div>

                  <div className="text-right">
                    {item.projectedSurplusKg > 0 ? (
                      <span className="text-[11px] font-bold text-amber-400 font-mono block">
                        +{item.projectedSurplusKg} kg surplus
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-400 font-mono block">
                        Demand Balanced
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-500 font-mono">{item.qualityGrade}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Demand Prediction Card */}
        <div className="lg:col-span-2 bg-[#12151b] border border-neutral-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{selectedProduce.name}</h3>
                <span className="text-xs text-neutral-400 font-mono">({selectedProduce.variety})</span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Stall Inventory: <strong className="text-white font-mono">{selectedProduce.quantityListedKg} kg</strong> · Listed Price: <strong className="text-white font-mono">${selectedProduce.expectedPricePerKg.toFixed(2)}/kg</strong>
              </p>
            </div>

            <button
              onClick={() => handleRunAiForecast(selectedProduce)}
              disabled={isForecasting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isForecasting ? 'animate-spin' : ''}`} />
              <span>{isForecasting ? 'Calculating Forecast...' : 'Run Live AI Demand Check'}</span>
            </button>
          </div>

          {/* Forecast Visual Gauge / Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
              <span className="text-[11px] text-neutral-400 block">Expected Market Sales</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {forecastResult ? forecastResult.projectedDemandKg : selectedProduce.projectedDemandKg} <span className="text-xs font-normal text-neutral-500">kg</span>
              </div>
              <span className="text-[10px] text-neutral-500">Estimated retail purchase velocity</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
              <span className="text-[11px] text-neutral-400 block">Projected Unsold Surplus</span>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {forecastResult ? forecastResult.projectedSurplusKg : selectedProduce.projectedSurplusKg} <span className="text-xs font-normal text-neutral-500">kg</span>
              </div>
              <span className="text-[10px] text-amber-400/80">Requires pre-emptive buyer matching</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
              <span className="text-[11px] text-neutral-400 block">Surplus Spoilage Risk</span>
              <div className="text-lg font-bold text-rose-400 font-mono mt-1 capitalize flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{forecastResult ? forecastResult.riskLevel : (selectedProduce.projectedSurplusKg > 0 ? 'High Risk' : 'Low')}</span>
              </div>
              <span className="text-[10px] text-neutral-500">{selectedProduce.estimatedShelfLifeHours}h shelf life limit</span>
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Inventory Distribution Projection:</span>
              <span className="font-mono text-neutral-300">
                {selectedProduce.quantityListedKg} kg total
              </span>
            </div>
            {(() => {
              const expected = forecastResult ? forecastResult.projectedDemandKg : selectedProduce.projectedDemandKg;
              const surplus = forecastResult ? forecastResult.projectedSurplusKg : selectedProduce.projectedSurplusKg;
              const expectedPct = Math.round((expected / selectedProduce.quantityListedKg) * 100);
              const surplusPct = Math.round((surplus / selectedProduce.quantityListedKg) * 100);

              return (
                <div className="space-y-1">
                  <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${expectedPct}%` }}
                      className="bg-emerald-500 h-full transition-all duration-500"
                      title={`Market Retail Sales: ${expected} kg (${expectedPct}%)`}
                    />
                    <div
                      style={{ width: `${surplusPct}%` }}
                      className="bg-amber-500 h-full transition-all duration-500"
                      title={`Projected Surplus: ${surplus} kg (${surplusPct}%)`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-emerald-400">■ Expected Retail Sales: {expected} kg ({expectedPct}%)</span>
                    <span className="text-amber-400">■ Unsold Surplus: {surplus} kg ({surplusPct}%)</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* AI Decision Drivers */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              AI Demand Driver Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                <span className="text-neutral-400 block text-[11px]">Weather Impact</span>
                <p className="text-neutral-200 mt-1">
                  {forecastResult?.drivers.weatherEffect ||
                    'Sunny conditions preserve morning market walk-ins; high solar index warms produce bins quickly.'}
                </p>
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                <span className="text-neutral-400 block text-[11px]">Day-of-Week Effect</span>
                <p className="text-neutral-200 mt-1">
                  {forecastResult?.drivers.dayEffect ||
                    'Weekend shopping yields strong residential basket sizes, but volume leaves 35% surplus.'}
                </p>
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                <span className="text-neutral-400 block text-[11px]">Market Saturation</span>
                <p className="text-neutral-200 mt-1">
                  {forecastResult?.drivers.supplySaturation ||
                    '3 neighboring stalls also supply leafy greens, reducing single-stall conversion rate.'}
                </p>
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                <span className="text-neutral-400 block text-[11px]">Shelf Life & Wilting Velocity</span>
                <p className="text-neutral-200 mt-1">
                  {forecastResult?.drivers.shelfLifeUrgency ||
                    'Thin leaf cuticle requires transfer to commercial cold storage or kitchen cooking within 14 hours.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-950/20 border border-amber-900/40 rounded-lg p-3">
            <div className="text-xs">
              <span className="text-amber-400 font-semibold block">Recommended Early Action:</span>
              <span className="text-neutral-300">
                {forecastResult?.recommendedAction ||
                  `Pre-allocate ${(selectedProduce.projectedSurplusKg || 15)} kg surplus to nearby institutions to recover $${((selectedProduce.projectedSurplusKg || 15) * selectedProduce.dynamicSuggestedPricePerKg).toFixed(2)}.`}
              </span>
            </div>
            <button
              onClick={() => onSelectForMatching(selectedProduce)}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shrink-0 shadow-sm"
            >
              Open Matcher for This Lot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
