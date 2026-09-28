import React, { useState } from 'react';
import { ProduceItem, BuyerRecipient, SurplusMatch } from '../types';
import { Sparkles, MapPin, Clock, Building2, Utensils, HeartHandshake, CheckCircle2, Send, AlertTriangle, ChevronRight, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface SurplusMatcherViewProps {
  produceItems: ProduceItem[];
  selectedProduce: ProduceItem | null;
  onSelectProduce: (produce: ProduceItem) => void;
  buyers: BuyerRecipient[];
  matches: SurplusMatch[];
  onDispatchMatches: (newMatches: SurplusMatch[]) => void;
  onSendNotification: (channel: 'sms' | 'whatsapp' | 'app', recipientName: string, title: string, message: string, phone: string) => void;
}

export const SurplusMatcherView: React.FC<SurplusMatcherViewProps> = ({
  produceItems,
  selectedProduce,
  onSelectProduce,
  buyers,
  matches,
  onDispatchMatches,
  onSendNotification,
}) => {
  const [activeProduce, setActiveProduce] = useState<ProduceItem>(
    selectedProduce || produceItems.find((p) => p.projectedSurplusKg > 0) || produceItems[0]
  );
  const [isRunningAI, setIsRunningAI] = useState(false);
  const [customAllocations, setCustomAllocations] = useState<{ [buyerId: string]: number }>({});
  const [allocationSummary, setAllocationSummary] = useState<string>('');
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  // Filter buyers suitable for current produce
  const currentSurplusKg = activeProduce.projectedSurplusKg || 15;

  // Calculate matching scores and candidate recommendations
  const getEvaluatedMatches = () => {
    return buyers.map((buyer) => {
      // 1. Proximity score
      let proximityScore = Math.max(10, 100 - buyer.distanceKm * 9);

      // 2. Preference match
      const likesProduce = buyer.preferredProduce.some((p) =>
        activeProduce.name.toLowerCase().includes(p.toLowerCase()) ||
        activeProduce.category.toLowerCase().includes(p.toLowerCase())
      );
      const compatibilityScore = likesProduce ? 100 : 40;

      // 3. Urgency & Spoilage alignment
      let urgencyFit = 85;
      if (activeProduce.estimatedShelfLifeHours <= 14) {
        if (['restaurant', 'hostel', 'canteen'].includes(buyer.type)) {
          urgencyFit = 98; // Immediate consumption tonight
        } else if (buyer.type === 'animal_feed') {
          urgencyFit = 90;
        }
      }

      // 4. Financial & donation fit
      const isDonation = buyer.donationPreference === 'donation_only' || buyer.type === 'ngo' || buyer.type === 'food_bank';
      let financialScore = 80;
      if (!isDonation && buyer.maxAffordablePricePerKg >= activeProduce.dynamicSuggestedPricePerKg) {
        financialScore = 95;
      }

      // Weighted AI Composite Score
      const finalScore = Math.round(
        proximityScore * 0.25 +
        compatibilityScore * 0.35 +
        urgencyFit * 0.25 +
        financialScore * 0.15
      );

      // Default suggested allocation
      let defaultAlloc = 0;
      if (buyer.type === 'hostel') defaultAlloc = Math.min(8, currentSurplusKg);
      else if (buyer.type === 'restaurant') defaultAlloc = Math.min(5, currentSurplusKg);
      else if (buyer.type === 'ngo') defaultAlloc = Math.min(10, currentSurplusKg);
      else defaultAlloc = Math.min(6, currentSurplusKg);

      const alloc = customAllocations[buyer.id] !== undefined ? customAllocations[buyer.id] : defaultAlloc;

      // Reasoning generator
      let reason = '';
      if (buyer.type === 'hostel') {
        reason = `High-volume student mess kitchen (${buyer.distanceKm} km away) requires bulk greens for dinner today. Absorbs ${alloc} kg at discounted price of $${activeProduce.dynamicSuggestedPricePerKg.toFixed(2)}/kg.`;
      } else if (buyer.type === 'restaurant') {
        reason = `Top-tier culinary kitchen (${buyer.distanceKm} km away). Chef Elena features evening farm-fresh specials; guarantees maximum value recovery ($${activeProduce.dynamicSuggestedPricePerKg.toFixed(2)}/kg).`;
      } else if (buyer.type === 'ngo' || buyer.type === 'food_bank') {
        reason = `Emergency community kitchen (${buyer.distanceKm} km away). Serves hot nutritious meals to 200+ individuals; provides tax-deductible receipt at full valuation.`;
      } else if (buyer.type === 'animal_feed') {
        reason = `Livestock dairy & goat cooperative (${buyer.distanceKm} km away). Zero-waste biological fodder recovery converts excess leafy greens into protein feed.`;
      } else {
        reason = `Proximity of ${buyer.distanceKm} km with regular daily intake capacity of ${buyer.dailyDemandCapacityKg} kg. High compatibility with ${activeProduce.name}.`;
      }

      return {
        buyer,
        matchScorePercent: finalScore,
        allocatedKg: alloc,
        isDonation,
        reasoning: reason,
        suggestedPrice: isDonation ? 0 : Math.min(activeProduce.dynamicSuggestedPricePerKg, buyer.maxAffordablePricePerKg),
      };
    }).sort((a, b) => b.matchScorePercent - a.matchScorePercent);
  };

  const candidateMatches = getEvaluatedMatches();

  const handleRunAiMatcher = async () => {
    setIsRunningAI(true);
    setDispatchedSuccess(false);

    try {
      const res = await fetch('/api/match-evaluator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produce: activeProduce,
          buyers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.overallStrategySummary) {
          setAllocationSummary(data.overallStrategySummary);
        }
        if (data.matches && Array.isArray(data.matches)) {
          const newAllocMap: { [id: string]: number } = {};
          data.matches.forEach((m: any) => {
            if (m.buyerId && m.allocatedQuantityKg) {
              newAllocMap[m.buyerId] = m.allocatedQuantityKg;
            }
          });
          setCustomAllocations(newAllocMap);
        }
      }
    } catch (e) {
      console.error('Match evaluator error:', e);
    } finally {
      setIsRunningAI(false);
    }
  };

  const handleDispatchSelected = (candidatesToDispatch: typeof candidateMatches) => {
    const createdMatches: SurplusMatch[] = candidatesToDispatch
      .filter((c) => (customAllocations[c.buyer.id] ?? c.allocatedKg) > 0)
      .map((c) => {
        const alloc = customAllocations[c.buyer.id] ?? c.allocatedKg;
        return {
          id: `match-${activeProduce.id}-${c.buyer.id}-${Date.now()}`,
          produceId: activeProduce.id,
          produceName: activeProduce.name,
          buyerId: c.buyer.id,
          buyerName: c.buyer.name,
          buyerType: c.buyer.type,
          distanceKm: c.buyer.distanceKm,
          matchedQuantityKg: alloc,
          requestedQuantityKg: alloc,
          agreedPricePerKg: c.suggestedPrice,
          isDonation: c.isDonation,
          matchScorePercent: c.matchScorePercent,
          matchReasoning: c.reasoning,
          status: 'notified',
          urgencyLabel: `${activeProduce.estimatedShelfLifeHours}h shelf life`,
          arrangedPickupTime: `Today between 15:30 - 17:30`,
          createdAt: new Date().toISOString(),
        };
      });

    if (createdMatches.length > 0) {
      onDispatchMatches(createdMatches);
      setDispatchedSuccess(true);

      // Simulate sending notifications to each buyer
      createdMatches.forEach((m) => {
        const targetBuyer = buyers.find((b) => b.id === m.buyerId);
        if (targetBuyer) {
          const channel = targetBuyer.type === 'restaurant' || targetBuyer.type === 'hostel' ? 'whatsapp' : 'sms';
          const msg = `AgriSurplus Alert: ${m.matchedQuantityKg} kg of ${activeProduce.name} matched for you from ${activeProduce.farmName} at ${activeProduce.location}. ${m.isDonation ? 'Available for free community pickup!' : `Offered at $${m.agreedPricePerKg.toFixed(2)}/kg.`}`;
          onSendNotification(channel, targetBuyer.contactPerson, 'Surplus Produce Matched', msg, targetBuyer.phone);
        }
      });
    }
  };

  // Top 3 optimal combination solver
  const recommendedTopPicks = candidateMatches.slice(0, 3);
  const totalAllocatedTopPicks = recommendedTopPicks.reduce(
    (sum, c) => sum + (customAllocations[c.buyer.id] ?? c.allocatedKg),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">AI Surplus Matcher & Smart Redistribution</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Automated matching engine pairing perishable surplus lots with local hostels, restaurants, food banks, and organic recovery units.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAiMatcher}
            disabled={isRunningAI}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isRunningAI ? 'animate-spin' : ''}`} />
            <span>{isRunningAI ? 'Optimizing Matrix...' : 'Run AI Multi-Split Solver'}</span>
          </button>
        </div>
      </div>

      {/* Produce Selector Bar */}
      <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4">
        <label className="text-xs font-medium text-neutral-400 block mb-2">
          Select Surplus Lot to Match:
        </label>
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {produceItems.map((prod) => {
            const isSelected = activeProduce.id === prod.id;
            return (
              <button
                key={prod.id}
                onClick={() => {
                  setActiveProduce(prod);
                  onSelectProduce(prod);
                  setDispatchedSuccess(false);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-lg border text-left whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-neutral-800 border-emerald-500 text-white shadow-sm'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <img
                  src={prod.photoUrl}
                  alt={prod.name}
                  className="w-10 h-10 rounded object-cover border border-neutral-800"
                />
                <div>
                  <div className="text-xs font-semibold">{prod.name}</div>
                  <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2">
                    <span className="text-amber-400 font-bold">{prod.projectedSurplusKg} kg surplus</span>
                    <span>·</span>
                    <span>{prod.estimatedShelfLifeHours}h shelf life</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Surplus Scenario Callout (Example from Brief) */}
      <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400">Target Surplus: {activeProduce.name}</span>
              <span className="text-xs text-neutral-400 font-mono">({activeProduce.quantityListedKg} kg listed · {activeProduce.projectedDemandKg} kg expected sales · <strong className="text-amber-400">{activeProduce.projectedSurplusKg} kg surplus</strong>)</span>
            </div>
            <p className="text-xs text-neutral-300 mt-1">
              AI Recommendation: Split allocation across nearby high-turnaround buyers to liquidate 100% of excess before evening temperature rise.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right text-xs">
              <span className="text-neutral-400 block text-[11px]">Proposed Combined Recovery:</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">
                ${(
                  recommendedTopPicks.reduce(
                    (acc, c) => acc + (customAllocations[c.buyer.id] ?? c.allocatedKg) * c.suggestedPrice,
                    0
                  )
                ).toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => handleDispatchSelected(recommendedTopPicks)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold text-xs transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Combined Matches</span>
            </button>
          </div>
        </div>

        {dispatchedSuccess && (
          <div className="mt-3 pt-3 border-t border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Redistribution alerts successfully dispatched via SMS & WhatsApp to 3 matched organizations!</span>
          </div>
        )}
      </div>

      {/* Recommended Multi-Split Allocation Solver Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Ranked Match Candidates & Allocation Solver</span>
            <span className="text-xs text-neutral-400 font-normal font-mono">
              (Allocating {totalAllocatedTopPicks} / {currentSurplusKg} kg)
            </span>
          </h2>
          <span className="text-xs text-neutral-400">
            Prioritizing closest distance & shortest shelf life
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {candidateMatches.map(({ buyer, matchScorePercent, allocatedKg, isDonation, reasoning, suggestedPrice }) => {
            const currentAlloc = customAllocations[buyer.id] !== undefined ? customAllocations[buyer.id] : allocatedKg;
            const isAllocated = currentAlloc > 0;

            const getTypeIcon = () => {
              if (buyer.type === 'restaurant') return <Utensils className="w-4 h-4 text-amber-400" />;
              if (buyer.type === 'hostel' || buyer.type === 'canteen') return <Building2 className="w-4 h-4 text-sky-400" />;
              if (buyer.type === 'ngo' || buyer.type === 'food_bank') return <HeartHandshake className="w-4 h-4 text-rose-400" />;
              return <Sparkles className="w-4 h-4 text-emerald-400" />;
            };

            return (
              <div
                key={buyer.id}
                className={`bg-[#12151b] border rounded-xl p-5 transition-all ${
                  isAllocated
                    ? 'border-neutral-700 bg-neutral-900/40 shadow-sm'
                    : 'border-neutral-800/80 opacity-80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Buyer Details & Score */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                      {getTypeIcon()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white">{buyer.name}</h3>
                        <span className="text-[11px] text-neutral-400 font-mono">({buyer.categoryLabel})</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          <span className="font-mono">{buyer.distanceKm} km away</span>
                        </span>
                        <span>·</span>
                        <span>Contact: {buyer.contactPerson}</span>
                        <span>·</span>
                        <span className="font-mono">Daily Cap: {buyer.dailyDemandCapacityKg} kg</span>
                      </div>

                      {/* AI Reasoning Text */}
                      <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                        <span className="text-emerald-400 font-medium">AI Rationale: </span>
                        {reasoning}
                      </p>
                    </div>
                  </div>

                  {/* Right: AI Score & Interactive Allocation Controls */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-800 shrink-0">
                    {/* Match Score */}
                    <div className="text-center px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-lg">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Match Score</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">
                        {matchScorePercent}%
                      </span>
                    </div>

                    {/* Quantity Allocation Slider / Stepper */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 space-y-1 min-w-[170px]">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-400">Allocated:</span>
                        <span className="font-mono font-bold text-white text-sm">
                          {currentAlloc} kg
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setCustomAllocations((prev) => ({
                              ...prev,
                              [buyer.id]: Math.max(0, currentAlloc - 1),
                            }))
                          }
                          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="0"
                          max={Math.min(currentSurplusKg, buyer.dailyDemandCapacityKg)}
                          value={currentAlloc}
                          onChange={(e) =>
                            setCustomAllocations((prev) => ({
                              ...prev,
                              [buyer.id]: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-emerald-500 h-1 cursor-pointer bg-neutral-800"
                        />
                        <button
                          onClick={() =>
                            setCustomAllocations((prev) => ({
                              ...prev,
                              [buyer.id]: Math.min(currentSurplusKg, currentAlloc + 1),
                            }))
                          }
                          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-[10px] text-neutral-400 text-right font-mono">
                        {isDonation ? (
                          <span className="text-rose-400">Donation ($0/kg)</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">${(suggestedPrice * currentAlloc).toFixed(2)} recovery</span>
                        )}
                      </div>
                    </div>

                    {/* Single Dispatch Action */}
                    <button
                      onClick={() => handleDispatchSelected([{ buyer, matchScorePercent, allocatedKg: currentAlloc, isDonation, reasoning, suggestedPrice }])}
                      disabled={currentAlloc <= 0}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white disabled:opacity-30 transition-colors whitespace-nowrap"
                    >
                      Notify Buyer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
