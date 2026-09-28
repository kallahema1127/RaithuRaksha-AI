import React from 'react';
import { MarketContext } from '../types';
import { CloudRain, Sun, Calendar, Users, Thermometer, X, RefreshCw } from 'lucide-react';

interface MarketConditionsBarProps {
  isOpen: boolean;
  onClose: () => void;
  marketContext: MarketContext;
  onUpdateMarketContext: (updated: MarketContext) => void;
  onTriggerRecalculate: () => void;
  isRecalculating?: boolean;
}

export const MarketConditionsBar: React.FC<MarketConditionsBarProps> = ({
  isOpen,
  onClose,
  marketContext,
  onUpdateMarketContext,
  onTriggerRecalculate,
  isRecalculating,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#12151b] border border-neutral-800 rounded-xl max-w-xl w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-white">Market Environment & Demand Drivers</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Simulate weather, turnout, and calendar variables to test AI demand and surplus predictions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5">
          {/* Day of Week */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Day of Week
            </label>
            <select
              value={marketContext.dayOfWeek}
              onChange={(e) =>
                onUpdateMarketContext({
                  ...marketContext,
                  dayOfWeek: e.target.value as any,
                })
              }
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="Saturday">Saturday (Peak Residential)</option>
              <option value="Sunday">Sunday (Moderate Family)</option>
              <option value="Wednesday">Wednesday (Midweek Stalls)</option>
              <option value="Tuesday">Tuesday (Low Retail Turnout)</option>
              <option value="Friday">Friday (Pre-Weekend Rush)</option>
            </select>
          </div>

          {/* Weather */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Weather Condition
            </label>
            <select
              value={marketContext.weather}
              onChange={(e) =>
                onUpdateMarketContext({
                  ...marketContext,
                  weather: e.target.value as any,
                })
              }
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="Sunny & Clear">Sunny & Clear (Optimal Footfall)</option>
              <option value="Mild Overcast">Mild Overcast (Steady)</option>
              <option value="Heavy Monsoon/Rain">Heavy Monsoon/Rain (70% Walk-in Drop)</option>
              <option value="Hot & Dry Wave">Hot & Dry Wave (Accelerates Wilting)</option>
            </select>
          </div>

          {/* Footfall Index Slider */}
          <div className="sm:col-span-2 bg-neutral-900/60 border border-neutral-800 rounded-lg p-3">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-medium text-neutral-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                Footfall Index Benchmark
              </span>
              <span className="font-mono text-emerald-400 font-semibold">
                {marketContext.footfallIndexPercent}% of expected
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              step="5"
              value={marketContext.footfallIndexPercent}
              onChange={(e) =>
                onUpdateMarketContext({
                  ...marketContext,
                  footfallIndexPercent: Number(e.target.value),
                })
              }
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
              <span>40% (Rain Slump)</span>
              <span>100% (Normal Baseline)</span>
              <span>160% (Festival Surge)</span>
            </div>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              Ambient Market Temperature
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="42"
                value={marketContext.tempCelsius}
                onChange={(e) =>
                  onUpdateMarketContext({
                    ...marketContext,
                    tempCelsius: Number(e.target.value),
                  })
                }
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <span className="text-xs text-neutral-400 font-mono">°C</span>
            </div>
          </div>

          {/* Season */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Agricultural Harvest Season
            </label>
            <select
              value={marketContext.season}
              onChange={(e) =>
                onUpdateMarketContext({
                  ...marketContext,
                  season: e.target.value as any,
                })
              }
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="Winter Harvest">Winter Harvest (High Greens Yield)</option>
              <option value="Spring Peak">Spring Peak (Balanced Supply)</option>
              <option value="Summer Glut">Summer Glut (Excess Solanaceous Crops)</option>
              <option value="Monsoon">Monsoon (Transportation Constraints)</option>
            </select>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-lg p-3 text-xs mb-5">
          <span className="text-neutral-400 text-[11px] block mb-2 font-medium">Quick Scenario Presets:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                onUpdateMarketContext({
                  marketName: 'Hillcrest Farmer Market (Stalls 12-16)',
                  dayOfWeek: 'Saturday',
                  weather: 'Sunny & Clear',
                  tempCelsius: 22,
                  footfallIndexPercent: 125,
                  season: 'Winter Harvest',
                });
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] transition-colors"
            >
              Sunny Saturday Peak
            </button>
            <button
              onClick={() => {
                onUpdateMarketContext({
                  marketName: 'Hillcrest Farmer Market (Stalls 12-16)',
                  dayOfWeek: 'Tuesday',
                  weather: 'Heavy Monsoon/Rain',
                  tempCelsius: 26,
                  footfallIndexPercent: 50,
                  season: 'Monsoon',
                });
              }}
              className="px-2.5 py-1 rounded bg-rose-950/40 border border-rose-900/50 hover:bg-rose-900/50 text-rose-300 text-[11px] transition-colors"
            >
              Rainy Tuesday (Surplus Crisis)
            </button>
            <button
              onClick={() => {
                onUpdateMarketContext({
                  marketName: 'Hillcrest Farmer Market (Stalls 12-16)',
                  dayOfWeek: 'Wednesday',
                  weather: 'Hot & Dry Wave',
                  tempCelsius: 34,
                  footfallIndexPercent: 80,
                  season: 'Summer Glut',
                });
              }}
              className="px-2.5 py-1 rounded bg-amber-950/40 border border-amber-900/50 hover:bg-amber-900/50 text-amber-300 text-[11px] transition-colors"
            >
              Hot Wave (High Spoilage Risk)
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onTriggerRecalculate();
              onClose();
            }}
            disabled={isRecalculating}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>Apply & Recalculate AI Demand</span>
          </button>
        </div>
      </div>
    </div>
  );
};
