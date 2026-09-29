import React, { useState } from 'react';
import { X, Upload, Sparkles, AlertCircle, Camera, CheckCircle2 } from 'lucide-react';
import { ProduceItem, ProduceCategory, QualityGrade, MarketContext } from '../types';
import { fetchVisionAnalysis } from '../services/aiService';

interface RegisterProduceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduce: (produce: ProduceItem) => void;
  marketContext: MarketContext;
}

export const RegisterProduceModal: React.FC<RegisterProduceModalProps> = ({
  isOpen,
  onClose,
  onAddProduce,
  marketContext,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProduceCategory>('leafy_green');
  const [variety, setVariety] = useState('');
  const [quantityListedKg, setQuantityListedKg] = useState<number>(30);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade A (Premium)');
  const [harvestDate, setHarvestDate] = useState('2026-09-28');
  const [harvestTime, setHarvestTime] = useState('06:00');
  const [expectedPricePerKg, setExpectedPricePerKg] = useState<number>(3.50);
  const [location, setLocation] = useState('Hillcrest Farmers Market - Stall 14');
  const [storageTempCelsius, setStorageTempCelsius] = useState<number>(18);
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('/src/assets/images/spinach_leafy_greens_1790581853160.jpg');

  // AI Vision & Freshness analysis states
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    qualityGrade?: string;
    freshnessScorePercent?: number;
    estimatedShelfLifeHours?: number;
    freshnessStatus?: string;
    visualObservations?: string;
    recommendedRedistributionTier?: string;
    cosmeticDefectsDetected?: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        triggerAiVisionAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAiVisionAnalysis = async (imageBase64: string) => {
    setIsAnalyzingPhoto(true);
    try {
      const data = await fetchVisionAnalysis(
        imageBase64,
        name || 'Fresh Farm Produce',
        category
      );
      setAiAnalysis(data);
      if (data.qualityGrade && ['Grade A (Premium)', 'Grade B (Standard)', 'Processing/Blemished'].includes(data.qualityGrade)) {
        setQualityGrade(data.qualityGrade as QualityGrade);
      }
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Calculate baseline demand & surplus
    const footfallFactor = marketContext.footfallIndexPercent / 100;
    const isWeekend = ['Saturday', 'Sunday'].includes(marketContext.dayOfWeek);
    const demandMultiplier = isWeekend ? 1.2 : 0.75;
    const weatherPenalty = marketContext.weather.includes('Rain') ? 0.6 : 1.0;
    const baseDemand = Math.round(quantityListedKg * 0.7 * footfallFactor * demandMultiplier * weatherPenalty);
    const projectedDemandKg = Math.min(quantityListedKg, Math.max(5, baseDemand));
    const projectedSurplusKg = Math.max(0, quantityListedKg - projectedDemandKg);

    const shelfLifeHours = aiAnalysis?.estimatedShelfLifeHours || (category === 'leafy_green' ? 16 : 48);
    const freshnessStatus = shelfLifeHours <= 10 ? 'high_spoilage_risk' : (shelfLifeHours <= 20 ? 'redistribute_now' : 'fresh');

    const discountPercent = projectedSurplusKg > 0 ? (shelfLifeHours < 14 ? 35 : 20) : 0;
    const dynamicPrice = +(expectedPricePerKg * (1 - discountPercent / 100)).toFixed(2);

    const newProduce: ProduceItem = {
      id: `prod-${Date.now()}`,
      name,
      category,
      variety: variety || 'Heirloom Local Selection',
      quantityListedKg,
      quantitySoldKg: 0,
      qualityGrade,
      harvestDate,
      harvestTime,
      expectedPricePerKg,
      location,
      farmName: 'Meadowbrook Organic Farm',
      farmerName: 'Marcus Sterling',
      farmerPhone: '+1 (555) 392-8812',
      photoUrl: photoPreview,
      storageTempCelsius,
      estimatedShelfLifeHours: shelfLifeHours,
      freshnessStatus,
      projectedDemandKg,
      projectedSurplusKg,
      demandConfidencePercent: 92,
      dynamicSuggestedPricePerKg: dynamicPrice,
      discountPercent,
      notes: notes || aiAnalysis?.visualObservations || 'Registered for local farmer market sale and surplus optimization.',
      createdAt: new Date().toISOString(),
    };

    onAddProduce(newProduce);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="bg-[#12151b] border border-neutral-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h2 id="register-modal-title" className="text-base font-semibold text-white">Register Harvest Lot</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Enter produce details. AI predicts expected market demand, shelf-life, and pre-screens surplus buyers.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close produce registration dialog"
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          {/* Row 1: Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Produce Name / Vegetable Type *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Baby Spinach, Red Russian Kale, Roma Tomatoes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProduceCategory)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="leafy_green">Leafy Green (Spinach, Kale, Lettuce)</option>
                <option value="vegetable">Vegetable (Tomatoes, Peppers, Cucumbers)</option>
                <option value="herb">Herb (Coriander, Mint, Basil)</option>
                <option value="root_produce">Root Crop (Carrots, Radish, Beets)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Variety & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Cultivar / Variety
              </label>
              <input
                type="text"
                placeholder="e.g. Bloomsdale, Buttercrunch, Cherokee"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Quality Grade
              </label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="Grade A (Premium)">Grade A (Premium / Clean / Flawless)</option>
                <option value="Grade B (Standard)">Grade B (Standard / Slight Variation)</option>
                <option value="Processing/Blemished">Processing / Blemished (Culinary / Sauce)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Quantity & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Total Quantity Brought (kg) *
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={quantityListedKg}
                onChange={(e) => setQuantityListedKg(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Expected Base Price ($/kg) *
              </label>
              <input
                type="number"
                min="0.2"
                step="0.10"
                required
                value={expectedPricePerKg}
                onChange={(e) => setExpectedPricePerKg(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Ambient Stall Temp (°C)
              </label>
              <input
                type="number"
                min="5"
                max="40"
                value={storageTempCelsius}
                onChange={(e) => setStorageTempCelsius(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Row 4: Harvest Date, Time & Stall Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Harvest Date
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Harvest Time
              </label>
              <input
                type="time"
                value={harvestTime}
                onChange={(e) => setHarvestTime(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Market Location / Stall
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Photo Upload & AI Vision Verification */}
          <div className="border border-neutral-800 bg-neutral-900/50 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-300 font-medium flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                Produce Photo & AI Freshness Scan
              </span>
              <button
                type="button"
                onClick={() => triggerAiVisionAnalysis(photoPreview)}
                disabled={isAnalyzingPhoto}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isAnalyzingPhoto ? 'Analyzing...' : 'Run Vision Check'}</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={photoPreview}
                alt="Produce sample"
                className="w-20 h-20 rounded-lg object-cover border border-neutral-800 shrink-0"
              />
              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded cursor-pointer transition-colors text-[11px]">
                  <Upload className="w-3 h-3" />
                  <span>Upload Local Produce Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-neutral-500 leading-tight">
                  AI analyzes moisture level, leaf cell turgor, browning, and calculates remaining shelf life in hours before spoilage.
                </p>
              </div>
            </div>

            {aiAnalysis && (
              <div className="bg-emerald-950/20 border border-emerald-900/40 rounded p-2.5 text-[11px] text-neutral-300 space-y-1">
                <div className="flex items-center justify-between font-mono text-emerald-400">
                  <span>AI Freshness: {aiAnalysis.freshnessScorePercent}%</span>
                  <span>Est. Shelf Life: {aiAnalysis.estimatedShelfLifeHours}h</span>
                </div>
                <p className="text-neutral-400">{aiAnalysis.visualObservations}</p>
                <p className="text-emerald-300">
                  Recommended Routing: {aiAnalysis.recommendedRedistributionTier}
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              Register & Run Demand AI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
