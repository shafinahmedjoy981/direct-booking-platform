import { RoomType, SeasonalPriceRule, ExtraAddon, BookingAddonItem, Booking, Unit } from '../types';
import { parseDateSafe, calculateNights } from './formatters';

export interface PriceBreakdown {
  nights: number;
  nightlyBaseRate: number;
  roomSubtotal: number;
  seasonalAdjustment: number;
  appliedRules: string[];
  addonsItems: BookingAddonItem[];
  addonsTotal: number;
  discount: number;
  serviceCharge: number;
  totalAmount: number;
  advanceRequired: number;
  balanceDue: number;
}

/**
 * Calculates pricing for a room type across a date range taking seasonal and weekend rules into account
 */
export function calculateBookingPrice(params: {
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  rules: SeasonalPriceRule[];
  addons?: { addon: ExtraAddon; quantity: number }[];
  adults?: number;
  advancePercentage?: number;
  serviceChargePercentage?: number;
  discount?: number;
}): PriceBreakdown {
  const {
    roomType,
    checkIn,
    checkOut,
    rules,
    addons = [],
    adults = 2,
    advancePercentage = 50,
    serviceChargePercentage = 0,
    discount = 0,
  } = params;

  const nights = calculateNights(checkIn, checkOut);
  const baseRate = roomType.basePrice;
  const roomSubtotal = baseRate * nights;

  let seasonalAdjustment = 0;
  const appliedRulesSet = new Set<string>();

  // Iterate night by night to check day-of-week and date range rules
  const startDate = parseDateSafe(checkIn);

  for (let i = 0; i < nights; i++) {
    const currentNight = new Date(startDate);
    currentNight.setDate(startDate.getDate() + i);
    const dayOfWeek = currentNight.getDay(); // 0: Sun, 5: Fri, 6: Sat
    const currentNightStr = currentNight.toISOString().split('T')[0];

    // Check applicable active rules for this room type or 'all'
    const applicableRules = rules.filter(
      (r) => r.isActive && (r.roomTypeId === 'all' || r.roomTypeId === roomType.id)
    );

    for (const rule of applicableRules) {
      let matches = false;

      // Check date range if specified
      if (rule.startDate && rule.endDate) {
        if (currentNightStr >= rule.startDate && currentNightStr <= rule.endDate) {
          matches = true;
        }
      }

      // Check day of week (e.g. weekend = Friday & Saturday)
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        if (rule.daysOfWeek.includes(dayOfWeek)) {
          matches = true;
        }
      }

      // Check min stay requirement
      if (rule.minStayNights && nights < rule.minStayNights) {
        matches = false;
      }

      if (matches) {
        let nightAdjustment = 0;
        if (rule.adjustmentType === 'percentage') {
          nightAdjustment = (baseRate * rule.adjustmentValue) / 100;
        } else {
          nightAdjustment = rule.adjustmentValue;
        }
        seasonalAdjustment += nightAdjustment;
        appliedRulesSet.add(rule.nameBn);
      }
    }
  }

  // Calculate Addons
  const addonsItems: BookingAddonItem[] = [];
  let addonsTotal = 0;

  for (const item of addons) {
    if (item.quantity > 0) {
      let itemPrice = item.addon.price;
      if (item.addon.isPerPerson) {
        itemPrice *= adults;
      }
      if (item.addon.isPerNight) {
        itemPrice *= nights;
      }
      const itemTotal = itemPrice * item.quantity;
      addonsTotal += itemTotal;
      addonsItems.push({
        addonId: item.addon.id,
        quantity: item.quantity,
        unitPrice: item.addon.price,
        total: itemTotal,
      });
    }
  }

  const preTaxTotal = Math.max(0, roomSubtotal + seasonalAdjustment + addonsTotal - discount);
  const serviceCharge = Math.round((preTaxTotal * serviceChargePercentage) / 100);
  const totalAmount = preTaxTotal + serviceCharge;
  const advanceRequired = Math.round((totalAmount * advancePercentage) / 100);
  const balanceDue = totalAmount - advanceRequired;

  return {
    nights,
    nightlyBaseRate: baseRate,
    roomSubtotal,
    seasonalAdjustment,
    appliedRules: Array.from(appliedRulesSet),
    addonsItems,
    addonsTotal,
    discount,
    serviceCharge,
    totalAmount,
    advanceRequired,
    balanceDue,
  };
}

/**
 * Checks if a specific unit has any overlapping bookings
 */
export function checkUnitConflict(
  unitId: string,
  checkIn: string,
  checkOut: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): Booking | null {
  const newStart = parseDateSafe(checkIn).getTime();
  const newEnd = parseDateSafe(checkOut).getTime();

  for (const b of existingBookings) {
    if (b.unitId !== unitId) continue;
    if (b.status === 'cancelled') continue;
    if (excludeBookingId && b.id === excludeBookingId) continue;

    const existStart = parseDateSafe(b.checkIn).getTime();
    const existEnd = parseDateSafe(b.checkOut).getTime();

    // Overlap condition:
    // New checkIn is before existing checkOut AND new checkOut is after existing checkIn
    if (newStart < existEnd && newEnd > existStart) {
      return b;
    }
  }

  return null;
}

/**
 * Checks all available units of a room type for given dates
 */
export function getAvailableUnitsForRoomType(
  roomType: RoomType,
  checkIn: string,
  checkOut: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): { availableUnits: Unit[]; conflictingBookings: { unit: Unit; booking: Booking }[] } {
  const availableUnits: Unit[] = [];
  const conflictingBookings: { unit: Unit; booking: Booking }[] = [];

  for (const unit of roomType.units) {
    if (unit.status === 'maintenance') continue;

    const conflict = checkUnitConflict(unit.id, checkIn, checkOut, existingBookings, excludeBookingId);
    if (!conflict) {
      availableUnits.push(unit);
    } else {
      conflictingBookings.push({ unit, booking: conflict });
    }
  }

  return { availableUnits, conflictingBookings };
}
