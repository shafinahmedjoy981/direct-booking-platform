export type Language = 'bn' | 'en';
export type NumeralFormat = 'bn' | 'en';

export type UserRole = 'owner' | 'manager' | 'front_desk';

export type BookingStatus = 
  | 'confirmed' 
  | 'awaiting_advance' 
  | 'checked_in' 
  | 'checked_out' 
  | 'cancelled';

export type BookingSource = 
  | 'facebook' 
  | 'whatsapp' 
  | 'phone' 
  | 'walk_in' 
  | 'website';

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';

export interface Unit {
  id: string;
  roomTypeId: string;
  roomNumber: string;
  name: string;
  nameBn: string;
  nameEn: string;
  status: 'available' | 'maintenance';
}

export interface RoomType {
  id: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn: string;
  basePrice: number;
  capacity: {
    adults: number;
    children: number;
  };
  bedTypeBn: string;
  bedTypeEn: string;
  amenitiesBn: string[];
  amenitiesEn: string[];
  image: string;
  units: Unit[];
}

export interface SeasonalPriceRule {
  id: string;
  roomTypeId: string; // 'all' or specific roomTypeId
  nameBn: string;
  nameEn: string;
  type: 'weekend' | 'winter_peak' | 'eid_peak' | 'monsoon_offpeak' | 'custom';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  daysOfWeek?: number[]; // [5, 6] for Fri, Sat
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number; // e.g. +20 for +20%, -15 for -15%, or +500
  minStayNights?: number;
  isActive: boolean;
}

export interface ExtraAddon {
  id: string;
  nameBn: string;
  nameEn: string;
  price: number;
  isPerPerson: boolean;
  isPerNight: boolean;
  iconName: string;
  descriptionBn: string;
  descriptionEn: string;
}

export interface BookingAddonItem {
  addonId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. "MP-2041"
  guestId?: string;
  guestName: string;
  guestNameBn?: string;
  guestNameEn?: string;
  guestPhone: string;
  guestEmail?: string;
  roomTypeId: string;
  unitId: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD
  adults: number;
  children: number;
  status: BookingStatus;
  source: BookingSource;
  
  // Pricing breakdown
  nightlyBaseRate: number;
  nights: number;
  roomSubtotal: number;
  seasonalAdjustment: number;
  appliedRuleNames: string[];
  appliedRuleNamesBn?: string[];
  appliedRuleNamesEn?: string[];
  addons: BookingAddonItem[];
  addonsTotal: number;
  discount: number;
  serviceCharge: number;
  totalAmount: number;
  
  // Payments
  advanceRequired: number;
  advancePaid: number;
  advanceStatus: 'unpaid' | 'paid' | 'partial';
  advanceMethod?: PaymentMethod;
  advanceTxnId?: string;
  balanceDue: number;
  
  // WhatsApp & Communication
  confirmationSent: boolean;
  paymentLinkGenerated: boolean;
  paymentLinkUrl?: string;
  advanceDueTimestamp?: string;
  
  notes?: string;
  notesBn?: string;
  notesEn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  name: string;
  nameBn: string;
  nameEn: string;
  phone: string;
  email?: string;
  city?: string;
  cityBn?: string;
  cityEn?: string;
  totalStays: number;
  totalSpent: number;
  lastStayDate: string;
  tags: string[]; // e.g. ['VIP', 'Family', 'Regular', 'Sajek Lover']
  tagsBn?: string[];
  tagsEn?: string[];
  preferencesNotes: string;
  preferencesNotesBn?: string;
  preferencesNotesEn?: string;
  isReturning: boolean;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  bookingCode: string;
  guestName: string;
  guestNameBn?: string;
  guestNameEn?: string;
  guestPhone: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string;
  type: 'advance' | 'balance' | 'full';
  status: 'verified';
  recordedBy: string;
  recordedByBn?: string;
  recordedByEn?: string;
  recordedAt: string;
  notes?: string;
  notesBn?: string;
  notesEn?: string;
}

export interface MessageTemplate {
  id: string;
  key: 'confirmation' | 'advance_request' | 'payment_received' | 'pre_arrival' | 'checkout_thanks';
  titleBn: string;
  titleEn: string;
  bodyBn: string;
  bodyEn: string;
}

export interface StaffUser {
  id: string;
  nameBn: string;
  nameEn: string;
  phone: string;
  role: UserRole;
  avatarLetter: string;
  avatarLetterBn?: string;
  avatarLetterEn?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorBn?: string;
  actorEn?: string;
  role: UserRole;
  actionBn: string;
  actionEn: string;
  details: string;
  detailsBn?: string;
  detailsEn?: string;
}

export interface PropertySettings {
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  locationBn: string;
  locationEn: string;
  phone: string;
  whatsappPhone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  defaultAdvancePercent: number; // default 50%
  serviceChargePercent: number; // 0% or 5%
  cancellationPolicyBn: string;
  cancellationPolicyEn: string;
  bKashMerchantNumber: string;
  nagadMerchantNumber: string;
  bankDetailsBn: string;
  bankDetailsEn: string;
  publicSlug: string;
}
