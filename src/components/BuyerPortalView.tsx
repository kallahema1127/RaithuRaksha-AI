import React, { useState } from 'react';
import { BuyerRecipient, SurplusMatch, ProduceItem } from '../types';
import { Building2, Utensils, HeartHandshake, CheckCircle2, XCircle, Clock, MapPin, Truck, AlertCircle, MessageSquare } from 'lucide-react';

interface BuyerPortalViewProps {
  buyers: BuyerRecipient[];
  matches: SurplusMatch[];
  produceItems: ProduceItem[];
  onUpdateMatchStatus: (matchId: string, status: SurplusMatch['status'], requestedQuantity?: number, buyerNotes?: string) => void;
}

export const BuyerPortalView: React.FC<BuyerPortalViewProps> = ({
  buyers,
  matches,
  produceItems,
  onUpdateMatchStatus,
}) => {
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(buyers[0].id);
  const [quantityInput, setQuantityInput] = useState<{ [matchId: string]: number }>({});
  const [notesInput, setNotesInput] = useState<{ [matchId: string]: string }>({});

  const activeBuyer = buyers.find((b) => b.id === selectedBuyerId) || buyers[0];
  const buyerMatches = matches.filter((m) => m.buyerId === activeBuyer.id);

  const handleAccept = (match: SurplusMatch) => {
    onUpdateMatchStatus(
      match.id,
      'accepted',
      quantityInput[match.id] || match.matchedQuantityKg,
      notesInput[match.id] || 'Confirmed by kitchen manager for scheduled pickup.'
    );
  };

  const handleRequestQuantity = (match: SurplusMatch) => {
    const qty = quantityInput[match.id];
    if (qty && qty > 0) {
      onUpdateMatchStatus(
        match.id,
        'negotiating',
        qty,
        notesInput[match.id] || `Requested modified quantity of ${qty} kg based on evening prep plan.`
      );
    }
  };

  const handleReject = (match: SurplusMatch) => {
    onUpdateMatchStatus(
      match.id,
      'rejected',
      0,
      notesInput[match.id] || 'Kitchen capacity full for today; cannot accept.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Buyer Identity Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Buyer & Recipient Portal</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Simulate the buyer portal experience for restaurants, student hostels, canteens, and food banks.
          </p>
        </div>

        {/* Identity Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-400 whitespace-nowrap">View as Buyer:</label>
          <select
            value={selectedBuyerId}
            onChange={(e) => setSelectedBuyerId(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
          >
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.categoryLabel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Buyer Profile Card */}
      <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-emerald-400 shrink-0">
              {activeBuyer.type === 'restaurant' ? (
                <Utensils className="w-6 h-6 text-amber-400" />
              ) : activeBuyer.type === 'ngo' || activeBuyer.type === 'food_bank' ? (
                <HeartHandshake className="w-6 h-6 text-rose-400" />
              ) : (
                <Building2 className="w-6 h-6 text-sky-400" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{activeBuyer.name}</h2>
                <span className="text-xs text-neutral-400 font-mono">({activeBuyer.categoryLabel})</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>{activeBuyer.address} ({activeBuyer.distanceKm} km from market)</span>
                </span>
                <span>·</span>
                <span>Contact: {activeBuyer.contactPerson} ({activeBuyer.phone})</span>
              </div>
              <div className="text-[11px] text-neutral-400 pt-0.5">
                Preferred items: <span className="text-neutral-200">{activeBuyer.preferredProduce.join(', ')}</span> · Daily intake cap: <span className="text-white font-mono">{activeBuyer.dailyDemandCapacityKg} kg</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center min-w-[120px]">
              <span className="text-[10px] text-neutral-400 block uppercase">Matched Offers</span>
              <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">
                {buyerMatches.length}
              </span>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-center min-w-[120px]">
              <span className="text-[10px] text-neutral-400 block uppercase">Accepted Volume</span>
              <span className="text-xl font-bold text-white font-mono mt-0.5 block">
                {buyerMatches
                  .filter((m) => m.status === 'accepted' || m.status === 'completed')
                  .reduce((sum, m) => sum + (m.requestedQuantityKg || m.matchedQuantityKg), 0)}{' '}
                <span className="text-xs font-normal text-neutral-400">kg</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Offers / Redistribution Proposals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Available Surplus Matches for {activeBuyer.name}
          </h2>
          <span className="text-xs text-neutral-400 font-mono">
            {buyerMatches.length} active notifications
          </span>
        </div>

        {buyerMatches.length === 0 ? (
          <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-8 text-center space-y-2">
            <p className="text-sm text-neutral-400">No active surplus redistribution proposals dispatched to this organization yet.</p>
            <p className="text-xs text-neutral-500">
              Go to the <strong>Surplus Matcher</strong> tab to run the multi-split solver and dispatch alerts to {activeBuyer.name}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {buyerMatches.map((match) => {
              const matchedProduce = produceItems.find((p) => p.id === match.produceId);
              const currentInputQty = quantityInput[match.id] ?? match.requestedQuantityKg ?? match.matchedQuantityKg;

              return (
                <div
                  key={match.id}
                  className="bg-[#12151b] border border-neutral-800 rounded-xl p-5 space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                    <div className="flex items-start gap-4">
                      {matchedProduce?.photoUrl && (
                        <img
                          src={matchedProduce.photoUrl}
                          alt={match.produceName}
                          className="w-16 h-16 rounded-lg object-cover border border-neutral-800 shrink-0"
                        />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{match.produceName}</h3>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            {match.matchScorePercent}% AI Fit
                          </span>
                        </div>
                        <div className="text-xs text-neutral-400">
                          Offered Quantity: <strong className="text-white font-mono">{match.matchedQuantityKg} kg</strong> · Offered Price: <strong className="text-emerald-400 font-mono">{match.isDonation ? 'Donation ($0/kg)' : `$${match.agreedPricePerKg.toFixed(2)}/kg`}</strong>
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-2 pt-0.5">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{match.urgencyLabel}</span>
                          <span>·</span>
                          <span>Pickup: {match.arrangedPickupTime || 'Today before 17:30'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Status</span>
                        <span
                          className={`text-xs font-semibold uppercase font-mono ${
                            match.status === 'accepted'
                              ? 'text-emerald-400'
                              : match.status === 'rejected'
                              ? 'text-rose-400'
                              : match.status === 'negotiating'
                              ? 'text-amber-400'
                              : 'text-sky-400'
                          }`}
                        >
                          {match.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Explanation / Reasoning */}
                  <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 text-xs text-neutral-300">
                    <span className="text-emerald-400 font-semibold block mb-0.5">Why Recommended:</span>
                    <p>{match.matchReasoning}</p>
                  </div>

                  {/* Action / Negotiation Controls */}
                  {match.status === 'notified' || match.status === 'recommended' || match.status === 'negotiating' ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-neutral-400">Modify Quantity (kg):</label>
                        <input
                          type="number"
                          min="1"
                          max={matchedProduce?.quantityListedKg || 50}
                          value={currentInputQty}
                          onChange={(e) =>
                            setQuantityInput({
                              ...quantityInput,
                              [match.id]: Number(e.target.value),
                            })
                          }
                          className="w-20 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                        {currentInputQty !== match.matchedQuantityKg && (
                          <button
                            onClick={() => handleRequestQuantity(match)}
                            className="px-3 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors"
                          >
                            Propose {currentInputQty} kg
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(match)}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-400 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 rounded-lg transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                        <button
                          onClick={() => handleAccept(match)}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept & Confirm Pickup</span>
                        </button>
                      </div>
                    </div>
                  ) : match.status === 'accepted' ? (
                    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-3 flex items-center justify-between text-xs text-emerald-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Accepted {match.requestedQuantityKg || match.matchedQuantityKg} kg. Logistics arranged: {match.arrangedPickupTime}.</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-semibold">Ready at Stall 14</span>
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-500 italic">
                      Offer was declined by buyer. Produce returned to surplus pool.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
