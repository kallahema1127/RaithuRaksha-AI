export type ProduceCategory = 'leafy_green' | 'vegetable' | 'herb' | 'root_produce';

export type QualityGrade = 'Grade A (Premium)' | 'Grade B (Standard)' | 'Processing/Blemished';

export type FreshnessStatus = 'fresh' | 'redistribute_now' | 'high_spoilage_risk';

export interface ProduceItem {
  id: string;
  name: string;
  category: ProduceCategory;
  variety: string;
  quantityListedKg: number;
  quantitySoldKg: number;
  qualityGrade: QualityGrade;
  harvestDate: string; // YYYY-MM-DD
  harvestTime: string; // HH:mm
  expectedPricePerKg: number;
  location: string;
  farmName: string;
  farmerName: string;
  farmerPhone: string;
  photoUrl: string;
  storageTempCelsius: number;
  estimatedShelfLifeHours: number;
  freshnessStatus: FreshnessStatus;
  projectedDemandKg: number;
  projectedSurplusKg: number;
  demandConfidencePercent: number;
  dynamicSuggestedPricePerKg: number;
  discountPercent: number;
  notes?: string;
  createdAt: string;
}

export type RecipientType = 
  | 'restaurant'
  | 'hotel'
  | 'hostel'
  | 'canteen'
  | 'supermarket'
  | 'food_bank'
  | 'ngo'
  | 'community_kitchen'
  | 'animal_feed'
  | 'compost_biogas';

export interface BuyerRecipient {
  id: string;
  name: string;
  type: RecipientType;
  categoryLabel: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  distanceKm: number;
  preferredProduce: string[];
  dailyDemandCapacityKg: number;
  maxAffordablePricePerKg: number;
  donationPreference: 'commercial_only' | 'mixed_subsidy' | 'donation_only' | 'salvage_salvage';
  urgencyLevel: 'high' | 'medium' | 'low';
  deliveryPreference: 'pickup_by_buyer' | 'farmer_dropoff' | 'shared_courier';
  verified: boolean;
  avatarSeed: string;
}

export type MatchStatus = 
  | 'recommended' 
  | 'notified' 
  | 'accepted' 
  | 'rejected' 
  | 'negotiating' 
  | 'completed';

export interface SurplusMatch {
  id: string;
  produceId: string;
  produceName: string;
  buyerId: string;
  buyerName: string;
  buyerType: RecipientType;
  distanceKm: number;
  matchedQuantityKg: number;
  requestedQuantityKg?: number;
  agreedPricePerKg: number;
  isDonation: boolean;
  matchScorePercent: number;
  matchReasoning: string;
  status: MatchStatus;
  urgencyLabel: string;
  arrangedPickupTime?: string;
  buyerResponseNotes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MarketContext {
  marketName: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  weather: 'Sunny & Clear' | 'Mild Overcast' | 'Heavy Monsoon/Rain' | 'Hot & Dry Wave';
  tempCelsius: number;
  footfallIndexPercent: number; // 100 = average, 130 = peak, 60 = low
  season: 'Spring Peak' | 'Summer Glut' | 'Monsoon' | 'Winter Harvest';
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  channel: 'sms' | 'whatsapp' | 'app';
  recipientRole: 'farmer' | 'buyer' | 'system';
  recipientName: string;
  phoneOrTarget: string;
  title: string;
  message: string;
  relatedProduceId?: string;
  actionTaken?: boolean;
}

export interface WastePathway {
  id: string;
  type: 'animal_feed' | 'composting' | 'biogas';
  title: string;
  facilityName: string;
  partnerType: string;
  distanceKm: number;
  acceptedItems: string[];
  maxCapacityKg: number;
  economicValueReturnPerKg: number; // e.g. animal feed fee or compost credits
  co2eOffsetKgPerKg: number;
  turnaroundHours: number;
  description: string;
}

export interface DemandPredictionResult {
  produceName: string;
  projectedDemandKg: number;
  projectedSurplusKg: number;
  riskLevel: 'high' | 'moderate' | 'low';
  drivers: {
    weatherEffect: string;
    dayEffect: string;
    supplySaturation: string;
    shelfLifeUrgency: string;
  };
  recommendedAction: string;
  suggestedDiscountPercent: number;
}
