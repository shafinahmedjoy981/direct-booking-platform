import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  calculateNights,
  generateWhatsAppUrl,
} from '../../utils/formatters';
import { calculateBookingPrice, checkUnitConflict } from '../../utils/pricing';
import {
  ShieldCheck,
  Calendar,
  Users,
  CheckCircle2,
  Phone,
  MessageSquare,
  ArrowRight,
  Lock,
  ChevronRight,
  Globe,
  Share2,
} from 'lucide-react';
import { RoomType } from '../../types';

export const PublicBookingPage: React.FC = () => {
  const {
    language,
    toggleLanguage,
    numeralFormat,
    property,
    roomTypes,
    priceRules,
    extraAddons,
    bookings,
    addBooking,
    setActiveScreen,
    setIsPublicQrModalOpen,
    showToast,
  } = useApp();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState<string>(todayStr);
  const [checkOut, setCheckOut] = useState<string>(tomorrowStr);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(roomTypes[0]?.id || '');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [selectedAddonIds, setSelectedAddonIds] = useState<{ [id: string]: number }>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedBookingCode, setSubmittedBookingCode] = useState('');

  const selectedRoomType = roomTypes.find((r) => r.id === selectedRoomId) || roomTypes[0];

  // Check available units of this room type
  const availableUnits = selectedRoomType.units.filter(
    (u) => !checkUnitConflict(u.id, checkIn, checkOut, bookings)
  );

  const isRoomSoldOut = availableUnits.length === 0;

  // Pricing
  const addonsSelectedList = Object.entries(selectedAddonIds)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const addon = extraAddons.find((a) => a.id === id)!;
      return { addon, quantity: qty };
    });

  const priceBreakdown = calculateBookingPrice({
    roomType: selectedRoomType,
    checkIn,
    checkOut,
    rules: priceRules,
    addons: addonsSelectedList,
    adults,
    advancePercentage: property.defaultAdvancePercent,
  });

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      showToast(
        language === 'bn' ? 'অনুগ্রহ করে আপনার নাম ও ফোন নম্বর দিন' : 'Please provide your name and phone',
        { type: 'warning' }
      );
      return;
    }

    if (isRoomSoldOut) {
      showToast(
        language === 'bn' ? 'দুঃখিত, এই তারিখে এই রুমটি বুক হয়ে গেছে। অন্য তারিখ বা রুম দেখুন।' : 'Room sold out for selected dates.',
        { type: 'error' }
      );
      return;
    }

    // Assign first free unit
    const assignedUnit = availableUnits[0];

    const newBooking = addBooking({
      guestName,
      guestPhone,
      roomTypeId: selectedRoomType.id,
      unitId: assignedUnit.id,
      checkIn,
      checkOut,
      adults,
      children,
      status: 'awaiting_advance',
      source: 'website',
      nightlyBaseRate: priceBreakdown.nightlyBaseRate,
      nights: priceBreakdown.nights,
      roomSubtotal: priceBreakdown.roomSubtotal,
      seasonalAdjustment: priceBreakdown.seasonalAdjustment,
      appliedRuleNames: priceBreakdown.appliedRules,
      addons: priceBreakdown.addonsItems,
      addonsTotal: priceBreakdown.addonsTotal,
      discount: 0,
      serviceCharge: 0,
      totalAmount: priceBreakdown.totalAmount,
      advanceRequired: priceBreakdown.advanceRequired,
      advancePaid: 0,
      advanceStatus: 'unpaid',
      balanceDue: priceBreakdown.totalAmount,
      confirmationSent: false,
      paymentLinkGenerated: true,
      paymentLinkUrl: `https://meghpunjisajek.com/pay/${Math.floor(1000 + Math.random() * 9000)}`,
      notes: specialRequests
        ? (language === 'bn' ? `পাবলিক গেস্ট ওয়েবসাইট রিকোয়েস্ট: ${specialRequests}` : `Public Website Request: ${specialRequests}`)
        : (language === 'bn' ? 'সরাসরি গেস্ট ওয়েবসাইট বুকিং' : 'Direct Guest Website Booking'),
      notesBn: specialRequests ? `পাবলিক গেস্ট ওয়েবসাইট রিকোয়েস্ট: ${specialRequests}` : 'সরাসরি গেস্ট ওয়েবসাইট বুকিং',
      notesEn: specialRequests ? `Public Website Request: ${specialRequests}` : 'Direct Guest Website Booking',
    });

    setSubmittedBookingCode(newBooking.bookingCode);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F4FEFF] text-[#0A0A0A] pb-16 font-sans">
      {/* Top Banner to switch back to Owner Desk */}
      <div className="bg-[#0E2F76] text-white px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {language === 'bn'
              ? 'এটি আপনার অতিথিদের জন্য তৈরি সরাসরি বুকিং পেজ (০% ওটিএ কমিশন)'
              : 'Public Guest Direct Booking Page (0% OTA commission)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPublicQrModalOpen(true)}
            className="text-xs text-[#A9C0E0] hover:text-white underline cursor-pointer"
          >
            {language === 'bn' ? 'কিউআর ও লিংক শেয়ার' : 'Share QR'}
          </button>
          <button
            onClick={() => setActiveScreen('today')}
            className="px-2.5 py-1 bg-white/20 hover:bg-white text-white hover:text-[#0E2F76] rounded-lg font-bold text-xs cursor-pointer transition-colors"
          >
            {language === 'bn' ? 'ডেস্কে ফিরে যান' : 'Back to Desk'}
          </button>
        </div>
      </div>

      {/* Guest Page Header */}
      <header className="bg-white border-b border-[#A9C0E0]/40 sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="font-extrabold text-base sm:text-xl text-[#0E2F76]">
            {language === 'bn' ? property.nameBn : property.nameEn}
          </h1>
          <p className="text-xs text-neutral-500">
            {language === 'bn' ? property.locationBn : property.locationEn}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#A9C0E0]/50 text-xs font-bold text-[#0E2F76] hover:bg-[#F4FEFF]"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'English' : 'Bangla'}</span>
          </button>

          <a
            href={`https://wa.me/88${property.whatsappPhone}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'bn' ? 'হোয়াটসঅ্যাপে কথা বলুন' : 'WhatsApp'}</span>
          </a>
        </div>
      </header>

      {/* Hero Property Cover */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-[#0E2F76]">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
          alt="Sajek Valley"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-12 text-white">
          <div className="max-w-3xl space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold uppercase tracking-wider">
              {language === 'bn' ? 'সরাসরি অফিসিয়াল বুকিং • সেরা রেট গ্যারান্টি' : 'Direct Booking • Best Rate Guarantee'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {language === 'bn' ? property.taglineBn : property.taglineEn}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-200">
              {language === 'bn'
                ? 'মেঘের দেশে সাজেক ভ্যালির রুইলুই পাড়ায় কাঠের ব্যালকনি আর গরম গিজারের প্রশান্তি।'
                : 'Wake up above the clouds in Ruilui Para, Sajek Valley with comfort wooden cottages.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Room Selection & Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Date & Guest Selector Box */}
          <div className="card-coastal p-5 bg-white rounded-2xl border border-[#A9C0E0]/60 shadow-md space-y-4">
            <h3 className="font-bold text-sm text-[#0E2F76] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0E2F76]" />
              <span>{language === 'bn' ? 'ভ্রমণের তারিখ ও মেহমান সংখ্যা দিন' : 'Select Dates & Guests'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">{language === 'bn' ? 'চেক-ইন' : 'Check-in'}</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl font-bold text-[#0E2F76] outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">{language === 'bn' ? 'চেক-আউট' : 'Check-out'}</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl font-bold text-[#0E2F76] outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">{language === 'bn' ? 'প্রাপ্তবয়স্ক' : 'Adults'}</label>
                <select
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl font-bold text-[#0E2F76] outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {formatNumber(n, numeralFormat)} {language === 'bn' ? 'জন' : (n === 1 ? 'Adult' : 'Adults')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">{language === 'bn' ? 'শিশু' : 'Children'}</label>
                <select
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl font-bold text-[#0E2F76] outline-none"
                >
                  {[0, 1, 2, 3].map((n) => (
                    <option key={n} value={n}>
                      {formatNumber(n, numeralFormat)} {language === 'bn' ? 'জন' : (n === 1 ? 'Child' : 'Children')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Room Selection Cards */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-[#0E2F76]">
              {language === 'bn' ? 'রুম ক্যাটাগরি পছন্দ করুন' : 'Choose Your Room'}
            </h3>

            <div className="space-y-3.5">
              {roomTypes.map((rt) => {
                const isSelected = rt.id === selectedRoomType.id;
                const freeCount = rt.units.filter(
                  (u) => !checkUnitConflict(u.id, checkIn, checkOut, bookings)
                ).length;

                return (
                  <div
                    key={rt.id}
                    onClick={() => setSelectedRoomId(rt.id)}
                    className={`card-coastal p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row gap-4 ${
                      isSelected
                        ? 'border-2 border-[#0E2F76] bg-white shadow-md'
                        : 'border-[#A9C0E0]/50 bg-white hover:border-[#0E2F76]/40'
                    }`}
                  >
                    <div className="w-full sm:w-40 h-32 rounded-xl overflow-hidden shrink-0 bg-neutral-100">
                      <img
                        src={rt.image}
                        alt={language === 'bn' ? rt.nameBn : (rt.nameEn || rt.nameBn)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-base text-[#0E2F76]">
                            {language === 'bn' ? rt.nameBn : (rt.nameEn || rt.nameBn)}
                          </h4>
                          <div className="text-right">
                            <span className="font-extrabold text-base text-[#0E2F76]">
                              {formatCurrency(rt.basePrice, language, numeralFormat)}
                            </span>
                            <span className="text-[11px] text-neutral-400 block">
                              {language === 'bn' ? '/ রাত' : '/ night'}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                          {language === 'bn' ? rt.descriptionBn : (rt.descriptionEn || rt.descriptionBn)}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs border-t border-[#A9C0E0]/30 mt-2">
                        <span className="text-neutral-500">
                          {language === 'bn' ? rt.bedTypeBn : (rt.bedTypeEn || rt.bedTypeBn)}
                        </span>
                        {freeCount > 0 ? (
                          <span className="text-emerald-700 font-bold">
                            ✓ {language === 'bn' ? `${formatNumber(freeCount, numeralFormat)} টি ইউনিট খালি আছে` : `${formatNumber(freeCount, numeralFormat)} units available`}
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold">
                            {language === 'bn' ? 'এই তারিখে বুকড' : 'Booked for this date'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout & Booking Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleGuestSubmit} className="card-coastal p-5 bg-white rounded-2xl border border-[#A9C0E0]/60 shadow-md space-y-4 sticky top-20">
            <h3 className="font-extrabold text-base text-[#0E2F76] border-b border-[#A9C0E0]/30 pb-2">
              {language === 'bn' ? 'বুকিং ও পেমেন্ট রিকোয়েস্ট' : 'Confirm Your Stay'}
            </h3>

            {/* Stay Summary */}
            <div className="p-3 bg-[#F4FEFF] rounded-xl border border-[#A9C0E0]/40 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-[#0E2F76]">
                <span>{language === 'bn' ? selectedRoomType.nameBn : (selectedRoomType.nameEn || selectedRoomType.nameBn)}</span>
                <span>{formatDate(checkIn, language, numeralFormat, false)} - {formatDate(checkOut, language, numeralFormat, true)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>{language === 'bn' ? 'সময়কাল:' : 'Duration:'}</span>
                <span>
                  {formatNumber(priceBreakdown.nights, numeralFormat)} {language === 'bn' ? 'রাত' : (priceBreakdown.nights === 1 ? 'night' : 'nights')} ({formatNumber(adults, numeralFormat)} {language === 'bn' ? 'জন অতিথি' : (adults === 1 ? 'guest' : 'guests')})
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>{language === 'bn' ? 'রুম ভাড়া:' : 'Room Rent:'}</span>
                <span>{formatCurrency(priceBreakdown.roomSubtotal, language, numeralFormat)}</span>
              </div>
              {priceBreakdown.seasonalAdjustment !== 0 && (
                <div className="flex justify-between text-[#0E2F76]">
                  <span>{language === 'bn' ? 'উইকেন্ড / সিজন সমন্বয়:' : 'Weekend / Seasonal Adjustment:'}</span>
                  <span>+{formatCurrency(priceBreakdown.seasonalAdjustment, language, numeralFormat)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm text-[#0E2F76] pt-1 border-t border-[#A9C0E0]/30">
                <span>{language === 'bn' ? 'সর্বমোট:' : 'Total Amount:'}</span>
                <span>{formatCurrency(priceBreakdown.totalAmount, language, numeralFormat)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold pt-1">
                <span>{language === 'bn' ? '৫০% অগ্রিম প্রদেয়:' : '50% Advance Due:'}</span>
                <span>{formatCurrency(priceBreakdown.advanceRequired, language, numeralFormat)}</span>
              </div>
            </div>

            {/* Guest Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-bold mb-1">
                  {language === 'bn' ? 'আপনার পুরো নাম *' : 'Your Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-bold mb-1">
                  {language === 'bn' ? 'হোয়াটসঅ্যাপ / মোবাইল নম্বর *' : 'WhatsApp Phone Number *'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017..."
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">
                  {language === 'bn' ? 'বিশেষ কোনো চাহিদা আছে কি?' : 'Special Requests'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: সন্ধ্যার ডিনারে ব্যাম্বু চিকেন চাই' : 'e.g. Traditional bamboo chicken dinner'}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Payment & Trust element */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{language === 'bn' ? '১০০% নিরাপদ সরাসরি বুকিং' : 'Safe Direct Booking'}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-900">
                {language === 'bn'
                  ? 'রিকোয়েস্ট পাঠানোর পর আমাদের সরাসরি বিকাশ মার্চেন্টে ৫০% অগ্রিম দিয়ে তাৎক্ষণিক কনফার্মেশন পাবেন।'
                  : 'Pay advance securely via verified bKash/Nagad merchant upon submission.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isRoomSoldOut}
              className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                isRoomSoldOut
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-[#0E2F76] hover:bg-[#0E2F76]/90 text-white active:scale-[0.99]'
              }`}
            >
              <span>{language === 'bn' ? 'বুকিং রিকোয়েস্ট পাঠান ও বিকাশ করুন' : 'Request to Book & Pay Advance'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Booking Received Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-[#0E2F76] shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="font-extrabold text-xl text-[#0E2F76]">
              {language === 'bn' ? 'বুকিং রিকোয়েস্ট গৃহীত হয়েছে!' : 'Booking Request Received!'}
            </h3>

            <p className="text-xs text-neutral-600">
              {language === 'bn'
                ? `ধন্যবাদ ${guestName} ভাই/আপু! আপনার বুকিং কোড: #${submittedBookingCode}। রুমটি সাময়িকভাবে ব্লক করা হয়েছে।`
                : `Thank you ${guestName}! Your booking #${submittedBookingCode} is held.`}
            </p>

            <div className="p-4 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl text-xs space-y-2 text-left">
              <div className="flex justify-between font-bold text-[#0E2F76]">
                <span>{language === 'bn' ? 'অগ্রিম পরিশোধের পরিমাণ:' : 'Advance Payable:'}</span>
                <span>{formatCurrency(priceBreakdown.advanceRequired, language, numeralFormat)}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>{language === 'bn' ? 'বিকাশ মার্চেন্ট:' : 'bKash Merchant:'}</span>
                <span className="font-mono font-bold text-[#0E2F76]">{property.bKashMerchantNumber}</span>
              </div>
              <div className="text-[11px] text-neutral-500">
                {language === 'bn' ? (
                  <>বিকাশ অ্যাপে গিয়ে 'Make Payment' অপশন বেছে নিন এবং রেফারেন্সে <strong>{submittedBookingCode}</strong> লিখুন।</>
                ) : (
                  <>Go to bKash app, select 'Make Payment' and enter <strong>{submittedBookingCode}</strong> as reference.</>
                )}
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  const text = language === 'bn'
                    ? `আসসালামু আলাইকুম, আমি ${property.nameBn}-এ #${submittedBookingCode} বুকিং কোডের জন্য ৫০% অগ্রিম পাঠিয়েছি। অনুগ্রহ করে কনফার্ম করবেন।`
                    : `Hello, I sent 50% advance for booking #${submittedBookingCode} at ${property.nameEn}. Please confirm.`;
                  window.open(generateWhatsAppUrl(property.phone, text), '_blank');
                  setIsSuccessModalOpen(false);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে স্লিপ পাঠিয়ে কনফার্ম করুন' : 'Confirm on WhatsApp'}</span>
              </button>

              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-200"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
