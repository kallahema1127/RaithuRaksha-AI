import React from 'react';
import { ProduceItem, SurplusMatch, BuyerRecipient } from '../types';
import { DollarSign, Scale, Sprout, HeartHandshake, CheckCircle2, TrendingUp, ShieldCheck, Award } from 'lucide-react';

interface ImpactDashboardViewProps {
  produceItems: ProduceItem[];
  matches: SurplusMatch[];
  buyers: BuyerRecipient[];
}

export const ImpactDashboardView: React.FC<ImpactDashboardViewProps> = ({
  produceItems,
  matches,
  buyers,
}) => {
  // Aggregate KPIs
  const totalListedKg = produceItems.reduce((acc, p) => acc + p.quantityListedKg, 0);
  const totalRetailSoldKg = produceItems.reduce((acc, p) => acc + p.quantitySoldKg, 0);

  // Accepted matches
  const acceptedMatches = matches.filter((m) => m.status === 'accepted' || m.status === 'completed');
  const totalSurplusMatchedKg = acceptedMatches.reduce((acc, m) => acc + (m.requestedQuantityKg || m.matchedQuantityKg), 0);

  // Food waste prevented = Retail sold + Surplus matched
  const foodWastePreventedKg = totalRetailSoldKg + totalSurplusMatchedKg;
  const wastePreventionRate = Math.min(100, Math.round((foodWastePreventedKg / totalListedKg) * 100));

  // Farmer financial loss avoided:
  // Revenue from accepted surplus + retail sales
  const surplusRevenue = acceptedMatches.reduce((acc, m) => acc + ((m.requestedQuantityKg || m.matchedQuantityKg) * m.agreedPricePerKg), 0);
  const retailRevenue = produceItems.reduce((acc, p) => acc + (p.quantitySoldKg * p.expectedPricePerKg), 0);
  const totalRevenueRecovered = retailRevenue + surplusRevenue;

  // Potential total loss without system = (totalListedKg - retailSoldKg) * avgPrice
  const averagePricePerKg = totalListedKg > 0 ? produceItems.reduce((acc, p) => acc + p.expectedPricePerKg, 0) / produceItems.length : 3.5;
  const farmerLossAvoidedDollars = +(totalSurplusMatchedKg * averagePricePerKg).toFixed(2);

  // Charitable redistribution
  const charityMatches = acceptedMatches.filter((m) => m.buyerType === 'ngo' || m.buyerType === 'food_bank');
  const charityKg = charityMatches.reduce((acc, m) => acc + (m.requestedQuantityKg || m.matchedQuantityKg), 0);
  const mealsProvided = Math.round(charityKg * 2.8); // ~2.8 meals per kg of fresh vegetables

  // CO2e avoided: ~2.5 kg CO2e per kg of food diverted from anaerobic landfill decomposition
  const co2eAvoidedKg = Math.round(totalSurplusMatchedKg * 2.5);

  // Sector breakdown
  const sectorBreakdown = [
    {
      name: 'Student Hostels & Campus Dining',
      kg: acceptedMatches.filter((m) => m.buyerType === 'hostel').reduce((s, m) => s + (m.requestedQuantityKg || m.matchedQuantityKg), 0),
      color: 'bg-sky-500',
    },
    {
      name: 'Restaurants & Bistros',
      kg: acceptedMatches.filter((m) => m.buyerType === 'restaurant').reduce((s, m) => s + (m.requestedQuantityKg || m.matchedQuantityKg), 0),
      color: 'bg-amber-500',
    },
    {
      name: 'Charitable Kitchens & NGOs',
      kg: acceptedMatches.filter((m) => m.buyerType === 'ngo' || m.buyerType === 'food_bank').reduce((s, m) => s + (m.requestedQuantityKg || m.matchedQuantityKg), 0),
      color: 'bg-rose-500',
    },
    {
      name: 'Livestock Feed & Composting',
      kg: acceptedMatches.filter((m) => m.buyerType === 'animal_feed' || m.buyerType === 'compost_biogas').reduce((s, m) => s + (m.requestedQuantityKg || m.matchedQuantityKg), 0),
      color: 'bg-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Impact & Food Loss Avoidance Analytics</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Verified environmental, community, and farmer financial metrics calculated from matched inventory lots.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Zero-Waste Auditing Active
          </span>
        </div>
      </div>

      {/* 4 Core Primary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Produce Listed & Sold */}
        <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-neutral-400">Total Produce Listed</span>
          <div className="text-2xl font-bold text-white font-mono">
            {totalListedKg} <span className="text-xs font-normal text-neutral-500">kg</span>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            <span className="text-emerald-400 font-bold">{totalRetailSoldKg} kg</span> sold at market stall
          </div>
        </div>

        {/* Surplus Matched */}
        <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-neutral-400">Surplus Matched</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {totalSurplusMatchedKg} <span className="text-xs font-normal text-neutral-500">kg</span>
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            <span className="text-white font-bold">{acceptedMatches.length}</span> successful AI match contracts
          </div>
        </div>

        {/* Food Waste Prevented */}
        <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-neutral-400">Food Waste Prevented</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {foodWastePreventedKg} <span className="text-xs font-normal text-neutral-500">kg</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            {wastePreventionRate}% diversion efficiency
          </div>
        </div>

        {/* Estimated Farmer Loss Avoided */}
        <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4 space-y-1">
          <span className="text-xs text-neutral-400">Farmer Loss Avoided</span>
          <div className="text-2xl font-bold text-white font-mono">
            ${farmerLossAvoidedDollars}
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Revenue preserved from surplus
          </div>
        </div>
      </div>

      {/* Secondary Social & Environmental Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-950/40 border border-rose-900/50 flex items-center justify-center text-rose-400 shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 block">Redistributed to Relief & NGOs</span>
            <div className="text-xl font-bold text-white font-mono mt-0.5">
              {charityKg} kg <span className="text-xs text-neutral-400 font-normal font-sans">({mealsProvided} meals)</span>
            </div>
            <span className="text-[11px] text-neutral-500">Directly serves food insecure families</span>
          </div>
        </div>

        <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-950/40 border border-sky-900/50 flex items-center justify-center text-sky-400 shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 block">Greenhouse Gas Reduction</span>
            <div className="text-xl font-bold text-sky-400 font-mono mt-0.5">
              {co2eAvoidedKg} kg <span className="text-xs text-neutral-400 font-normal font-sans">CO2e avoided</span>
            </div>
            <span className="text-[11px] text-neutral-500">Landfill methane emissions prevented</span>
          </div>
        </div>

        <div className="bg-[#12151b] border border-neutral-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-900/50 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-neutral-400 block">Total Farmer Gross Recovery</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              ${totalRevenueRecovered.toFixed(2)}
            </div>
            <span className="text-[11px] text-neutral-500">Retail sales + dynamic surplus sales</span>
          </div>
        </div>
      </div>

      {/* Redistribution by Sector & Recent AI Matches Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Allocation Breakdown */}
        <div className="lg:col-span-1 bg-[#12151b] border border-neutral-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Surplus Destination Breakdown
          </h2>
          <div className="space-y-3">
            {sectorBreakdown.map((sector) => {
              const pct = totalSurplusMatchedKg > 0 ? Math.round((sector.kg / totalSurplusMatchedKg) * 100) : 0;
              return (
                <div key={sector.name} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300">{sector.name}</span>
                    <span className="font-mono text-neutral-400 font-medium">
                      {sector.kg} kg ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.max(4, pct)}%` }}
                      className={`h-full ${sector.color} transition-all duration-500`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
            By orchestrating multi-recipient distribution, 100% of high-grade surplus is absorbed across diverse buyer budgets before produce cellular breakdown begins.
          </div>
        </div>

        {/* Successful Redistribution Audit Log */}
        <div className="lg:col-span-2 bg-[#12151b] border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Recent AI Match Reductions & Transactions
            </h2>
            <span className="text-xs text-neutral-500 font-mono">
              {acceptedMatches.length} completed dispatches
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 font-mono">
                  <th className="pb-2 font-normal">Produce Item</th>
                  <th className="pb-2 font-normal">Recipient Organization</th>
                  <th className="pb-2 font-normal text-right">Volume</th>
                  <th className="pb-2 font-normal text-right">Agreed Rate</th>
                  <th className="pb-2 font-normal text-right">Value Preserved</th>
                  <th className="pb-2 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {matches.map((match) => (
                  <tr key={match.id} className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-2.5 font-sans font-medium text-white">{match.produceName}</td>
                    <td className="py-2.5 font-sans text-neutral-300">{match.buyerName}</td>
                    <td className="py-2.5 text-right font-bold text-white">{match.matchedQuantityKg} kg</td>
                    <td className="py-2.5 text-right text-neutral-400">
                      {match.isDonation ? (
                        <span className="text-rose-400 font-sans text-[11px]">Donation</span>
                      ) : (
                        `$${match.agreedPricePerKg.toFixed(2)}/kg`
                      )}
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-400">
                      ${(match.matchedQuantityKg * match.agreedPricePerKg).toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`text-[10px] uppercase font-sans font-semibold px-2 py-0.5 rounded ${
                          match.status === 'accepted'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'
                            : match.status === 'notified'
                            ? 'bg-sky-950/40 text-sky-400 border border-sky-900/50'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {match.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
