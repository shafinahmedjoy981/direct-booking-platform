import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatDate,
  formatCurrency,
  formatNumber,
  calculateNights,
  generateWhatsAppUrl,
  cleanBangladeshiPhone,
} from '../../utils/formatters';
import {
  getBookingGuestName,
  getUnitDisplayName,
  getGuestDisplayName,
  formatNights,
} from '../../utils/i18n';
import { calculateBookingPrice, checkUnitConflict } from '../../utils/pricing';
import {
  X,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Phone,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { BookingSource, PaymentMethod } from '../../types';

export const AddBookingModal: React.FC = () => {
  const {
    language,
    numeralFormat,
    property,
    roomTypes,
    priceRules,
    extraAddons,
    bookings,
    guests,
    addBooking,
    isAddBookingOpen,
    setIsAddBookingOpen,
    addBookingPreset,
    setSelectedBooking,
    showToast,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(addBookingPreset?.checkIn || todayStr);
  const [checkOut, setCheckOut] = useState<string>(addBookingPreset?.checkOut || tomorrowStr);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>(
    addBookingPreset?.roomTypeId || roomTypes[0]?.id || ''
  );
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    addBookingPreset?.unitId || ''
  );

  // Step 2: Guest details
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [source, setSource] = useState<BookingSource>('whatsapp');
  const [notes, setNotes] = useState<string>('');
  const [detectedReturningGuest, setDetectedReturningGuest] = useState<typeof guests[0] | null>(null);

  // Step 3: Advance settings & addons
  const [selectedAddonIds, setSelectedAddonIds] = useState<{ [id: string]: number }>({});
  const [advancePercent, setAdvancePercent] = useState<number>(50);
  const [markAdvancePaidNow, setMarkAdvancePaidNow] = useState<boolean>(false);
  const [advancePayMethod, setAdvancePayMethod] = useState<PaymentMethod>('bkash');
  const [advanceTxnId, setAdvanceTxnId] = useState<string>('');

  // Sync presets
  useEffect(() => {
    if (addBookingPreset) {
      if (addBookingPreset.checkIn) setCheckIn(addBookingPreset.checkIn);
      if (addBookingPreset.checkOut) setCheckOut(addBookingPreset.checkOut);
      if (addBookingPreset.roomTypeId) setSelectedRoomTypeId(addBookingPreset.roomTypeId);
      if (addBookingPreset.unitId) setSelectedUnitId(addBookingPreset.unitId);
    }
  }, [addBookingPreset]);

  // Selected room type & available units
  const currentRoomType = roomTypes.find((r) => r.id === selectedRoomTypeId) || roomTypes[0];

  // Auto assign unit if none selected
  useEffect(() => {
    if (currentRoomType && (!selectedUnitId || !currentRoomType.units.some(u => u.id === selectedUnitId))) {
      // Find first unit without conflict
      const nonConflictingUnit = currentRoomType.units.find(
        (u) => !checkUnitConflict(u.id, checkIn, checkOut, bookings)
      );
      if (nonConflictingUnit) {
        setSelectedUnitId(nonConflictingUnit.id);
      } else if (currentRoomType.units[0]) {
        setSelectedUnitId(currentRoomType.units[0].id);
      }
    }
  }, [currentRoomType, checkIn, checkOut, bookings]);

  // Phone auto detection of returning guests
  useEffect(() => {
    const cleaned = cleanBangladeshiPhone(guestPhone);
    if (cleaned.length >= 10) {
      const match = guests.find((g) => cleanBangladeshiPhone(g.phone) === cleaned);
      if (match) {
        setDetectedReturningGuest(match);
        if (!guestName) {
          setGuestName(match.name);
        }
      } else {
        setDetectedReturningGuest(null);
      }
    } else {
      setDetectedReturningGuest(null);
    }
  }, [guestPhone, guests]);

  if (!isAddBookingOpen) return null;

  // Conflict detection for selected unit
  const activeConflict = selectedUnitId
    ? checkUnitConflict(selectedUnitId, checkIn, checkOut, bookings)
    : null;

  // Pricing calculation
  const addonsSelectedList = Object.entries(selectedAddonIds)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const addon = extraAddons.find((a) => a.id === id)!;
      return { addon, quantity: qty };
    });

  const priceBreakdown = calculateBookingPrice({
    roomType: currentRoomType,
    checkIn,
    checkOut,
    rules: priceRules,
    addons: addonsSelectedList,
    adults,
    advancePercentage: advancePercent,
  });

  const handleNextStep = () => {
    if (step === 1) {
      if (activeConflict) {
        showToast(
          language === 'bn'
            ? 'এই ইউনিটে অন্য বুকিং রয়েছে! অন্য ইউনিট নির্বাচন করুন।'
            : 'Double booking conflict detected on this unit! Please select another.',
          { type: 'error' }
        );
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!guestName.trim() || !guestPhone.trim()) {
        showToast(
          language === 'bn'
            ? 'অনুগ্রহ করে গেস্টের নাম ও মোবাইল নম্বর লিখুন'
            : 'Please enter guest name and phone number',
          { type: 'warning' }
        );
        return;
      }
      setStep(3);
    }
  };

  const handleCreateBooking = () => {
    // Final double booking verification check at data save
    const finalConflict = checkUnitConflict(selectedUnitId, checkIn, checkOut, bookings);
    if (finalConflict) {
      showToast(
        language === 'bn'
          ? `ডাবল বুকিং প্রতিরোধ: ইউনিট ${selectedUnitId} ইতিমধ্যে বুক করা আছে!`
          : `Double booking blocked: Unit ${selectedUnitId} is already booked!`,
        { type: 'error' }
      );
      setStep(1);
      return;
    }

    const created = addBooking({
      guestName,
      guestPhone,
      guestEmail: guestEmail || undefined,
      roomTypeId: currentRoomType.id,
      unitId: selectedUnitId,
      checkIn,
      checkOut,
      adults,
      children,
      status: markAdvancePaidNow ? 'confirmed' : 'awaiting_advance',
      source,
      nightlyBaseRate: priceBreakdown.nightlyBaseRate,
      nights: priceBreakdown.nights,
      roomSubtotal: priceBreakdown.roomSubtotal,
      seasonalAdjustment: priceBreakdown.seasonalAdjustment,
      appliedRuleNames: priceBreakdown.appliedRules,
      addons: priceBreakdown.addonsItems,
      addonsTotal: priceBreakdown.addonsTotal,
      discount: priceBreakdown.discount,
      serviceCharge: priceBreakdown.serviceCharge,
      totalAmount: priceBreakdown.totalAmount,
      advanceRequired: priceBreakdown.advanceRequired,
      advancePaid: markAdvancePaidNow ? priceBreakdown.advanceRequired : 0,
      advanceStatus: markAdvancePaidNow ? 'paid' : 'unpaid',
      advanceMethod: markAdvancePaidNow ? advancePayMethod : undefined,
      advanceTxnId: markAdvancePaidNow ? advanceTxnId : undefined,
      balanceDue: markAdvancePaidNow ? priceBreakdown.balanceDue : priceBreakdown.totalAmount,
      confirmationSent: false,
      paymentLinkGenerated: true,
      paymentLinkUrl: `https://meghpunjisajek.com/pay/${Math.floor(1000 + Math.random() * 9000)}`,
      notes,
    });

    setIsAddBookingOpen(false);
    setSelectedBooking(created);

    // Optional quick WhatsApp confirmation prompt
    if (confirm(language === 'bn' ? 'বুকিং সম্পন্ন! আপনি কি এখনই গেস্টকে হোয়াটসঅ্যাপ কনফার্মেশন পাঠাবেন?' : 'Booking created! Send WhatsApp confirmation now?')) {
      const text = language === 'bn'
        ? `আসসালামু আলাইকুম ${guestName} ভাই/আপু, ${property.nameBn}-এ আপনার বুকিং (#${created.bookingCode}) তৈরি হয়েছে। তারিখ: ${formatDate(checkIn, 'bn', numeralFormat, false)} - ${formatDate(checkOut, 'bn', numeralFormat, true)}। রুম: ${currentRoomType.nameBn} (${selectedUnitId})। মোট ভাড়া: ${formatCurrency(created.totalAmount, 'bn', numeralFormat)}। অগ্রিম প্রদেয়: ${formatCurrency(created.advanceRequired, 'bn', numeralFormat)}।`
        : `Hello ${guestName}, your booking #${created.bookingCode} at ${property.nameEn} is ready! Dates: ${formatDate(checkIn, 'en', numeralFormat, false)} - ${formatDate(checkOut, 'en', numeralFormat, true)}. Total: ${formatCurrency(created.totalAmount, 'en', numeralFormat)}.`;
      
      window.open(generateWhatsAppUrl(guestPhone, text), '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#A9C0E0]/60 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-[#0E2F76] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#A9C0E0] text-[#0E2F76] flex items-center justify-center font-extrabold text-xs">
              +
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {language === 'bn' ? 'দ্রুত নতুন বুকিং এন্ট্রি (৩০ সেকেন্ড)' : 'Quick Add Booking (Fast Flow)'}
              </h3>
              <p className="text-[11px] text-[#A9C0E0]">
                {language === 'bn' ? `ধাপ ${step} / ৩` : `Step ${step} of 3`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddBookingOpen(false)}
            className="p-1 rounded-lg text-[#A9C0E0] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="band-sky px-4 py-2 flex items-center justify-between text-xs font-semibold text-[#0E2F76] border-b border-[#A9C0E0]/40">
          <span className={step >= 1 ? 'font-bold underline' : 'opacity-60'}>
            {language === 'bn' ? '১. তারিখ ও রুম' : '1. Dates & Rooms'}
          </span>
          <span>→</span>
          <span className={step >= 2 ? 'font-bold underline' : 'opacity-60'}>
            {language === 'bn' ? '২. মেহমানের তথ্য' : '2. Guest Info'}
          </span>
          <span>→</span>
          <span className={step >= 3 ? 'font-bold underline' : 'opacity-60'}>
            {language === 'bn' ? '৩. হিসাব ও অগ্রিম' : '3. Pricing & Advance'}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* STEP 1: Dates, Room, and Unit */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0E2F76] mb-1">
                    {language === 'bn' ? 'চেক-ইন তারিখ' : 'Check-in Date'}
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl text-xs sm:text-sm font-semibold text-[#0E2F76] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0E2F76] mb-1">
                    {language === 'bn' ? 'চেক-আউট তারিখ' : 'Check-out Date'}
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl text-xs sm:text-sm font-semibold text-[#0E2F76] outline-none"
                  />
                </div>
              </div>

              {/* Guest Counts */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    {language === 'bn' ? 'প্রাপ্তবয়স্ক (Adults)' : 'Adults'}
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-lg outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                      <option key={n} value={n}>
                        {formatNumber(n, numeralFormat)} {language === 'bn' ? 'জন' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    {language === 'bn' ? 'শিশু (Children)' : 'Children'}
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-lg outline-none"
                  >
                    {[0, 1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {formatNumber(n, numeralFormat)} {language === 'bn' ? 'জন' : 'Kids'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Room Type Selector */}
              <div>
                <label className="block text-xs font-bold text-[#0E2F76] mb-1.5">
                  {language === 'bn' ? 'রুম ক্যাটাগরি নির্বাচন করুন' : 'Select Room Category'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roomTypes.map((rt) => {
                    const isSelected = rt.id === currentRoomType.id;
                    return (
                      <button
                        type="button"
                        key={rt.id}
                        onClick={() => setSelectedRoomTypeId(rt.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#0E2F76] bg-[#0E2F76] text-white shadow-xs'
                            : 'border-[#A9C0E0]/50 bg-white hover:bg-[#F4FEFF] text-[#0A0A0A]'
                        }`}
                      >
                        <div className="font-bold text-xs">
                          {language === 'bn' ? rt.nameBn : rt.nameEn}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-[#A9C0E0]' : 'text-[#0E2F76] font-bold'}`}>
                          {formatCurrency(rt.basePrice, language, numeralFormat)}/{language === 'bn' ? 'রাত' : 'night'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Unit Selection with Live Conflict Indicator */}
              <div>
                <label className="block text-xs font-bold text-[#0E2F76] mb-1.5">
                  {language === 'bn' ? 'নির্দিষ্ট ইউনিট বরাদ্দ করুন:' : 'Assign Specific Unit:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentRoomType.units.map((u) => {
                    const hasConflict = checkUnitConflict(u.id, checkIn, checkOut, bookings);
                    const isSelected = u.id === selectedUnitId;

                    return (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => setSelectedUnitId(u.id)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer relative ${
                          isSelected
                            ? hasConflict
                              ? 'border-rose-500 bg-rose-50 text-rose-800'
                              : 'border-[#0E2F76] bg-[#0E2F76] text-white'
                            : hasConflict
                            ? 'border-rose-200 bg-rose-50/50 text-rose-400 opacity-60'
                            : 'border-[#A9C0E0]/50 bg-white hover:bg-[#F4FEFF] text-[#0E2F76]'
                        }`}
                      >
                        <div>{u.name}</div>
                        {hasConflict && (
                          <span className="text-[10px] text-rose-600 font-semibold block">
                            {language === 'bn' ? 'বুক করা' : 'Booked'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Double Booking Conflict Warning Banner */}
                {activeConflict && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <strong>{language === 'bn' ? 'ডাবল বুকিং সতর্কবার্তা!' : 'Double Booking Warning!'}</strong>{' '}
                      {language === 'bn'
                        ? `এই ইউনিটটিতে ইতিমধ্যে ${getBookingGuestName(activeConflict, 'bn')} (${activeConflict.bookingCode}) এর বুকিং আছে। দয়া করে অন্য ইউনিট নির্বাচন করুন।`
                        : `This unit is already booked by ${getBookingGuestName(activeConflict, 'en')} (${activeConflict.bookingCode}). Please pick another unit.`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Guest Details & Source */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0E2F76] mb-1">
                  {language === 'bn' ? 'গেস্টের মোবাইল নম্বর *' : 'Guest Phone Number *'}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="01819..."
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full p-2.5 pl-9 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl text-xs sm:text-sm font-semibold outline-none"
                  />
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Returning Guest Auto-detect Banner */}
              {detectedReturningGuest && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <strong className="block font-bold">
                        {language === 'bn' ? 'চমৎকার! ইনি আমাদের নিয়মিত মেহমান:' : 'Returning Loyal Guest Detected!'}
                      </strong>
                      <span>
                        {getGuestDisplayName(detectedReturningGuest, language)} • {detectedReturningGuest.totalStays} {language === 'bn' ? 'বার থেকেছেন' : 'stays'} • {language === 'bn' ? (detectedReturningGuest.preferencesNotesBn || detectedReturningGuest.preferencesNotes) : (detectedReturningGuest.preferencesNotesEn || detectedReturningGuest.preferencesNotes)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0E2F76] mb-1">
                  {language === 'bn' ? 'গেস্টের পুরো নাম *' : 'Guest Full Name *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full p-2.5 pl-9 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl text-xs sm:text-sm font-semibold outline-none"
                  />
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Booking Source */}
              <div>
                <label className="block text-xs font-bold text-[#0E2F76] mb-1.5">
                  {language === 'bn' ? 'বুকিং কোন মাধ্যমে এসেছে?' : 'Booking Source'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs">
                  {[
                    { id: 'whatsapp', label: language === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp' },
                    { id: 'facebook', label: language === 'bn' ? 'ফেসবুক' : 'Facebook' },
                    { id: 'phone', label: language === 'bn' ? 'ফোন কল' : 'Phone Call' },
                    { id: 'walk_in', label: language === 'bn' ? 'ওয়াক-ইন' : 'Walk-in' },
                    { id: 'website', label: language === 'bn' ? 'ওয়েবসাইট' : 'Website' },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSource(s.id as BookingSource)}
                      className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        source === s.id
                          ? 'border-[#0E2F76] bg-[#0E2F76] text-white shadow-xs'
                          : 'border-[#A9C0E0]/50 bg-white text-[#0E2F76]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block text-xs font-bold text-[#0E2F76] mb-1">
                  {language === 'bn' ? 'বিশেষ চাহিদা বা নোট' : 'Special Preferences / Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'bn' ? 'যেমন: ব্যালকনিতে অতিরিক্ত চেয়ার প্রয়োজন' : 'Notes...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl text-xs outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Review, Add-ons & Advance Payment */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="card-coastal p-3.5 bg-[#F4FEFF] rounded-xl border border-[#A9C0E0]/60 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-[#0E2F76] text-sm pb-1 border-b border-[#A9C0E0]/30">
                  <span>{language === 'bn' ? currentRoomType.nameBn : currentRoomType.nameEn} ({getUnitDisplayName(selectedUnitId, roomTypes, language)})</span>
                  <span>{formatDate(checkIn, language, numeralFormat, false)} → {formatDate(checkOut, language, numeralFormat, true)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{language === 'bn' ? 'গেস্ট:' : 'Guest:'} <strong>{guestName}</strong> ({guestPhone})</span>
                  <span>{formatNights(priceBreakdown.nights, language, numeralFormat)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{language === 'bn' ? 'রুম ভাড়া:' : 'Room Rent:'}</span>
                  <span>{formatCurrency(priceBreakdown.roomSubtotal, language, numeralFormat)}</span>
                </div>
                {priceBreakdown.seasonalAdjustment > 0 && (
                  <div className="flex justify-between text-[#0E2F76]">
                    <span>{language === 'bn' ? 'সিজনাল / উইকেন্ড রেট:' : 'Seasonal / Weekend Rate:'}</span>
                    <span>+{formatCurrency(priceBreakdown.seasonalAdjustment, language, numeralFormat)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-[#0E2F76] text-sm pt-1 border-t border-[#A9C0E0]/40">
                  <span>{language === 'bn' ? 'সর্বমোট প্রদেয়:' : 'Total Due:'}</span>
                  <span>{formatCurrency(priceBreakdown.totalAmount, language, numeralFormat)}</span>
                </div>
              </div>

              {/* Addons Selection */}
              <div>
                <label className="block text-xs font-bold text-[#0E2F76] mb-1.5">
                  {language === 'bn' ? 'ঐচ্ছিক অ্যাড-অন সার্ভিস:' : 'Optional Addons:'}
                </label>
                <div className="space-y-1.5">
                  {extraAddons.map((addon) => {
                    const qty = selectedAddonIds[addon.id] || 0;
                    return (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-2.5 bg-white border border-[#A9C0E0]/40 rounded-xl text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-[#0E2F76] truncate">{language === 'bn' ? addon.nameBn : addon.nameEn}</p>
                          <p className="text-[11px] text-neutral-500">
                            {formatCurrency(addon.price, language, numeralFormat)} {addon.isPerPerson ? (language === 'bn' ? '/জন' : '/person') : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedAddonIds(prev => ({ ...prev, [addon.id]: Math.max(0, qty - 1) }))}
                            className="w-6 h-6 rounded-md bg-[#A9C0E0]/30 text-[#0E2F76] font-bold flex items-center justify-center cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-bold w-4 text-center">{formatNumber(qty, language, numeralFormat)}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedAddonIds(prev => ({ ...prev, [addon.id]: qty + 1 }))}
                            className="w-6 h-6 rounded-md bg-[#0E2F76] text-white font-bold flex items-center justify-center cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advance Payment Options */}
              <div className="card-coastal p-3.5 bg-white rounded-xl border border-[#A9C0E0]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0E2F76]">
                    {language === 'bn' ? 'প্রয়োজনীয় অগ্রিম (৫০% ডিফল্ট):' : 'Advance Amount (50%):'}
                  </span>
                  <span className="text-sm font-extrabold text-[#0E2F76]">
                    {formatCurrency(priceBreakdown.advanceRequired, language, numeralFormat)}
                  </span>
                </div>

                {/* Toggle: Did guest already pay advance? */}
                <label className="flex items-center gap-2 p-2 bg-[#F4FEFF] rounded-lg cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={markAdvancePaidNow}
                    onChange={(e) => setMarkAdvancePaidNow(e.target.checked)}
                    className="w-4 h-4 text-[#0E2F76] rounded"
                  />
                  <span className="font-bold text-[#0E2F76]">
                    {language === 'bn'
                      ? 'গেস্ট ইতিমধ্যে অগ্রিম পাঠিয়েছেন (সরাসরি কনফার্ম করুন)'
                      : 'Advance already paid (Confirm immediately)'}
                  </span>
                </label>

                {markAdvancePaidNow && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <label className="block text-neutral-600 mb-0.5">{language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Method'}</label>
                      <select
                        value={advancePayMethod}
                        onChange={(e) => setAdvancePayMethod(e.target.value as PaymentMethod)}
                        className="w-full p-2 bg-white rounded-lg border border-[#A9C0E0]/50 outline-none"
                      >
                        <option value="bkash">{language === 'bn' ? 'বিকাশ (bKash)' : 'bKash'}</option>
                        <option value="nagad">{language === 'bn' ? 'নগদ (Nagad)' : 'Nagad'}</option>
                        <option value="bank">{language === 'bn' ? 'ব্যাংক' : 'Bank'}</option>
                        <option value="cash">{language === 'bn' ? 'ক্যাশ' : 'Cash'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-600 mb-0.5">{language === 'bn' ? 'ট্রানজেকশন আইডি' : 'TxnID'}</label>
                      <input
                        type="text"
                        placeholder={language === 'bn' ? 'যেমন: BKH8899' : 'e.g. BKH8899'}
                        value={advanceTxnId}
                        onChange={(e) => setAdvanceTxnId(e.target.value)}
                        className="w-full p-2 bg-white rounded-lg border border-[#A9C0E0]/50 outline-none text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Nav Controls */}
        <div className="p-4 border-t border-[#A9C0E0]/40 bg-[#F4FEFF] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="px-3.5 py-2 rounded-xl border border-[#A9C0E0]/60 text-xs font-semibold text-[#0E2F76] hover:bg-white cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'পেছনে যান' : 'Back'}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 rounded-xl bg-[#0E2F76] text-white text-xs font-bold hover:bg-[#0E2F76]/90 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleCreateBooking}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{language === 'bn' ? 'বুকিং চূড়ান্ত করুন ও কনফার্মেশন পাঠান' : 'Create & Send Confirmation'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
