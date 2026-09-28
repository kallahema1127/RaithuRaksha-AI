import React, { useState } from 'react';
import { ProduceItem, WastePathway } from '../types';
import { wastePathways } from '../data/mockData';
import { Recycle, Sprout, Flame, Beef, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface WasteToValueViewProps {
  produceItems: ProduceItem[];
  onDispatchToWastePathway: (produceId: string, pathwayId: string) => void;
}

export const WasteToValueView: React.FC<WasteToValueViewProps> = ({
  produceItems,
  onDispatchToWastePathway,
}) => {
  const [selectedProduceId, setSelectedProduceId] = useState<string>(
    produceItems.find((p) => p.freshnessStatus === 'high_spoilage_risk')?.id || produceItems[0].id
  );
  const [dispatchedMessage, setDispatchedMessage] = useState<string | null>(null);

  const selectedProduce = produceItems.find((p) => p.id === selectedProduceId) || produceItems[0];

  const handleDispatch = (pathway: WastePathway) => {
    onDispatchToWastePathway(selectedProduce.id, pathway.id);
    const co2Saved = (selectedProduce.projectedSurplusKg * pathway.co2eOffsetKgPerKg).toFixed(1);
    const recoveryValue = (selectedProduce.projectedSurplusKg * pathway.economicValueReturnPerKg).toFixed(2);
    setDispatchedMessage(
      `Dispatched ${selectedProduce.projectedSurplusKg} kg of ${selectedProduce.name} to ${pathway.facilityName}. Diverted 100% from landfill, preventing ${co2Saved} kg of CO2e and earning $${recoveryValue} in bio-recovery credits!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Waste-to-Value & Biological Circularity</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Zero-landfill pathways for overripe, cosmetically blemished, or expired vegetables through livestock fodder, aerobic composting, and renewable biogas.
          </p>
        </div>
      </div>

      {/* Target Produce Selector for Salvage */}
      <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Select Produce Lot for Bio-Recovery Routing:
          </label>
          <span className="text-xs text-amber-400 font-mono">
            {selectedProduce.estimatedShelfLifeHours}h shelf life left
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {produceItems.map((prod) => {
            const isSelected = prod.id === selectedProduce.id;
            const isHighRisk = prod.freshnessStatus === 'high_spoilage_risk' || prod.estimatedShelfLifeHours <= 12;

            return (
              <button
                key={prod.id}
                onClick={() => {
                  setSelectedProduceId(prod.id);
                  setDispatchedMessage(null);
                }}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-neutral-800 border-emerald-500 shadow-sm'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span className="truncate">{prod.name}</span>
                  {isHighRisk && (
                    <span className="text-[10px] text-rose-400 font-mono px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-900/50">
                      High Risk
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono mt-1">
                  {prod.projectedSurplusKg} kg surplus · {prod.estimatedShelfLifeHours}h remaining
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Banner */}
      {dispatchedMessage && (
        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-emerald-400">Circularity Routing Confirmed</strong>
            <span>{dispatchedMessage}</span>
          </div>
        </div>
      )}

      {/* 3 Circular Recovery Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {wastePathways.map((pathway) => {
          const estimatedCo2 = (selectedProduce.projectedSurplusKg * pathway.co2eOffsetKgPerKg).toFixed(1);
          const estimatedValue = (selectedProduce.projectedSurplusKg * pathway.economicValueReturnPerKg).toFixed(2);

          const getIcon = () => {
            if (pathway.type === 'animal_feed') return <Beef className="w-5 h-5 text-amber-400" />;
            if (pathway.type === 'composting') return <Sprout className="w-5 h-5 text-emerald-400" />;
            return <Flame className="w-5 h-5 text-sky-400" />;
          };

          return (
            <div
              key={pathway.id}
              className="bg-[#12151b] border border-neutral-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    {getIcon()}
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {pathway.distanceKm} km away
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{pathway.title}</h3>
                  <span className="text-xs text-emerald-400 font-mono block mt-0.5">
                    {pathway.facilityName}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {pathway.description}
                </p>

                {/* Metrics Breakdown */}
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Recovery Value:</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      ${estimatedValue} (${pathway.economicValueReturnPerKg}/kg)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">CO2e Emissions Avoided:</span>
                    <span className="font-mono font-semibold text-sky-400">
                      {estimatedCo2} kg CO2e
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Processing Turnaround:</span>
                    <span className="font-mono text-neutral-300">
                      {pathway.turnaroundHours} hours
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400">Daily Facility Intake:</span>
                    <span className="font-mono text-neutral-300">
                      {pathway.maxCapacityKg} kg/day
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400">
                  <strong className="text-neutral-300">Accepted mass: </strong>
                  {pathway.acceptedItems.join(', ')}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleDispatch(pathway)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs transition-colors"
                >
                  <span>Route {selectedProduce.projectedSurplusKg} kg to {pathway.facilityName.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
