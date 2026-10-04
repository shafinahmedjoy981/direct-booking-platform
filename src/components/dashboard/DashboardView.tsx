import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  generateWhatsAppUrl,
} from '../../utils/formatters';
import {
  getBookingGuestName,
  getUnitDisplayName,
  formatNights,
  formatGuestsCount,
} from '../../utils/i18n';
import {
  LogIn,
  LogOut,
  Clock,
  BedDouble,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  DollarSign,
  Plus,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const DashboardView: React.FC = () => {
  const {
    language,
    numeralFormat,
    property,
    bookings,
    roomTypes,
    setSelectedBooking,
    openAddBooking,
    setActiveScreen,
    showToast,
    markAdvancePaid,
    checkInGuest,
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [calcOtaBookings, setCalcOtaBookings] = useState(25);
  const [calcAvgRate, setCalcAvgRate] = useState(4200);
  const [calcOtaCommission, setCalcOtaCommission] = useState(18); // 18% OTA commission
  const [calcDirectShift, setCalcDirectShift] = useState(60); // 60% shifted to direct

  // Calculations for today
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const totalUnitsCount = roomTypes.reduce((acc, rt) => acc + rt.units.length, 0);

  // Today check-ins
  const todayCheckIns = bookings.filter(
    (b) => b.checkIn === todayStr && b.status !== 'cancelled'
  );

  // Today check-outs
  const todayCheckOuts = bookings.filter(
    (b) => b.checkOut === todayStr && b.status !== 'cancelled'
  );

  // Currently occupied or checking-in units tonight
  const occupiedUnitsTonight = bookings.filter((b) => {
    if (b.status === 'cancelled') return false;
    return b.checkIn <= todayStr && b.checkOut > todayStr;
  });

  const availableRoomsTonight = Math.max(0, totalUnitsCount - occupiedUnitsTonight.length);
  const occupancyPercent = totalUnitsCount > 0 
    ? Math.round((occupiedUnitsTonight.length / totalUnitsCount) * 100) 
    : 0;

  // Awaiting advance
  const awaitingAdvanceBookings = bookings.filter((b) => b.status === 'awaiting_advance');
  const totalAwaitingAmount = awaitingAdvanceBookings.reduce(
    (sum, b) => sum + (b.advanceRequired - (b.advancePaid || 0)),
    0
  );

  // Direct Bookings this month
  const directBookings = bookings.filter(
    (b) => (b.source === 'website' || b.source === 'whatsapp') && b.status !== 'cancelled'
  );
  const directRevenue = directBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  // "Needs your attention" list
  const attentionItems = [
    ...awaitingAdvanceBookings.map((b) => ({
      type: 'unpaid_advance' as const,
      booking: b,
      priority: 'high',
      titleBn: `অগ্রিম পেমেন্ট বাকি: ${b.guestNameBn || b.guestName}`,
      titleEn: `Unpaid Advance: ${b.guestNameEn || b.guestName}`,
      subtitleBn: `${formatDate(b.checkIn, 'bn', numeralFormat, false)} তারিখে চেক-ইন | বাকি: ${formatCurrency(b.advanceRequired, 'bn', numeralFormat)}`,
      subtitleEn: `Check-in on ${formatDate(b.checkIn, 'en', numeralFormat, false)} | Due: ${formatCurrency(b.advanceRequired, 'en', numeralFormat)}`,
    })),
    ...todayCheckIns
      .filter((b) => !b.confirmationSent)
      .map((b) => ({
        type: 'unconfirmed_arrival' as const,
        booking: b,
        priority: 'medium',
        titleBn: `কনফার্মেশন পাঠানো হয়নি: ${b.guestNameBn || b.guestName}`,
        titleEn: `Confirmation pending: ${b.guestNameEn || b.guestName}`,
        subtitleBn: `আজ চেক-ইন করবেন | রুম বরাদ্দ: ${getUnitDisplayName(b.unitId, roomTypes, 'bn')}`,
        subtitleEn: `Arriving today | Assigned unit: ${getUnitDisplayName(b.unitId, roomTypes, 'en')}`,
      })),
  ];

  // Mini calculator math
  const monthlyOtaVolume = calcOtaBookings * calcAvgRate;
  const shiftedVolume = monthlyOtaVolume * (calcDirectShift / 100);
  const monthlySavings = Math.round(shiftedVolume * (calcOtaCommission / 100));
  const yearlySavings = monthlySavings * 12;
  const freeNightsGained = Math.round(yearlySavings / calcAvgRate);

  const directBookingLink = `https://${property.publicSlug}.directbooking.bd`;

  const copyDirectLink = () => {
    navigator.clipboard.writeText(directBookingLink);
    setCopiedLink(true);
    showToast(
      language === 'bn' ? 'সরাসরি বুকিং লিংক কপি হয়েছে!' : 'Direct booking link copied!',
      { type: 'success' }
    );
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const sendWhatsAppReminder = (booking: typeof bookings[0]) => {
    const text = language === 'bn'
      ? `আসসালামু আলাইকুম ${booking.guestNameBn || booking.guestName} ভাই/আপু, ${property.nameBn}-এ আপনার বুকিং (${formatDate(booking.checkIn, 'bn', numeralFormat, false)}) পাকা করতে ৫০% অগ্রিম ${formatCurrency(booking.advanceRequired, 'bn', numeralFormat)} বিকাশ করার অনুরোধ রইল। সরাসরি পেমেন্ট লিংক: https://meghpunjisajek.com/pay/${booking.bookingCode.toLowerCase()}`
      : `Hello ${booking.guestNameEn || booking.guestName}, please send the advance payment of ${formatCurrency(booking.advanceRequired, 'en', numeralFormat)} to confirm your stay at ${property.nameEn}. Payment link: https://meghpunjisajek.com/pay/${booking.bookingCode.toLowerCase()}`;
    
    window.open(generateWhatsAppUrl(booking.guestPhone, text), '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Greeting & Date Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0E2F76] tracking-tight">
              {language === 'bn' ? 'আজকের ড্যাশবোর্ড' : "Today's Dashboard"}
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#A9C0E0]/25 text-[#0E2F76] border border-[#A9C0E0]/40">
              {formatDate(todayStr, language, numeralFormat)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600">
            {language === 'bn'
              ? 'আজকের সকল চেক-ইন, চেক-আউট ও অগ্রিম কালেকশনের জীবন্ত চিত্র'
              : "Live summary of today's check-ins, departures, and pending advance collections."}
          </p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openAddBooking()}
            className="flex items-center gap-2 bg-[#0E2F76] hover:bg-[#0E2F76]/90 text-white font-bold text-xs sm:text-sm py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন বুকিং যোগ করুন' : 'Add Booking'}</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Stats Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Tile 1: Today's Check-ins (THE HERO TILE - Solid Navy with White Text) */}
        <div
          style={{ backgroundColor: '#0E2F76', borderRadius: '16px' }}
          className="p-4 rounded-2xl shadow-[0_1px_2px_rgba(14,47,118,0.06),0_6px_20px_rgba(14,47,118,0.05)] sm:col-span-2 lg:col-span-1 xl:col-span-2 flex flex-col justify-between border-0 text-white select-none"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[14px] font-semibold text-white leading-tight block">
                {language === 'bn' ? 'আজকের চেক-ইন' : "Today's Check-ins"}
              </span>
              <div className="flex items-baseline mt-2">
                <span className="text-[44px] sm:text-[48px] font-bold text-white leading-none">
                  {formatNumber(todayCheckIns ? todayCheckIns.length : 0, numeralFormat)}
                </span>
                <span className="text-[16px] font-normal text-white ml-2">
                  {language === 'bn' ? 'রুম' : 'rooms'}
                </span>
              </div>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.14)' }}
            >
              <LogIn className="w-5 h-5 text-white" strokeWidth={1.75} />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
            <span className="text-[13px] text-[#A9C0E0] font-normal">
              {language === 'bn' ? 'চেক-ইন দুপুর ১২:০০ থেকে' : 'Check-in from 12:00 PM'}
            </span>
            <button
              onClick={() => setActiveScreen('bookings')}
              className="text-[13px] text-white font-semibold underline hover:text-[#A9C0E0] cursor-pointer"
            >
              {language === 'bn' ? 'তালিকা দেখুন' : 'View list'}
            </button>
          </div>
        </div>

        {/* Tile 2: Today's Check-outs */}
        <div className="card-coastal p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-500">
                {language === 'bn' ? 'আজকের প্রস্থান' : "Today's Check-outs"}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0E2F76] mt-1">
                {formatNumber(todayCheckOuts.length, numeralFormat)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#A9C0E0]/20 flex items-center justify-center text-[#0E2F76]">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            {language === 'bn' ? 'সকাল ১০:৩০ এর মধ্যে প্রদেয়' : 'Checkout by 10:30 AM'}
          </p>
        </div>

        {/* Tile 3: Awaiting Advance */}
        <div className="card-coastal p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-500">
                {language === 'bn' ? 'অগ্রিম অপেক্ষমাণ' : 'Awaiting Advance'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
                {formatNumber(awaitingAdvanceBookings.length, numeralFormat)}
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[11px] font-semibold text-neutral-700 mt-2 truncate">
            {formatCurrency(totalAwaitingAmount, language, numeralFormat)}
          </div>
        </div>

        {/* Tile 4: Available Tonight */}
        <div className="card-coastal p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-500">
                {language === 'bn' ? 'আজ রাতে খালি' : 'Available Tonight'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0E2F76] mt-1">
                {formatNumber(availableRoomsTonight, numeralFormat)}
                <span className="text-xs text-neutral-400 font-normal ml-1">
                  /{formatNumber(totalUnitsCount, numeralFormat)}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#A9C0E0]/20 flex items-center justify-center text-[#0E2F76]">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[11px] text-neutral-500 mt-2">
            {language === 'bn' ? 'ওয়াক-ইন গেস্টের সুযোগ' : 'For walk-in bookings'}
          </p>
        </div>

        {/* Tile 5: Occupancy % */}
        <div className="card-coastal p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-500">
                {language === 'bn' ? 'আজকের অকুপেন্সি' : 'Occupancy Rate'}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0E2F76] mt-1">
                {formatNumber(occupancyPercent, numeralFormat)}%
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="w-full bg-[#A9C0E0]/20 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#0E2F76] h-full rounded-full transition-all duration-300"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Section: Two Columns (Attention Items + Commission Savings Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Needs Attention List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#0E2F76] flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span>{language === 'bn' ? 'জরুরি নজর দিন' : 'Needs Your Attention'}</span>
              </h3>
              <p className="text-xs text-neutral-500">
                {language === 'bn'
                  ? 'বকেয়া অগ্রিম ও আসন্ন অতিথিদের এক ক্লিকে কনফার্মেশন পাঠান'
                  : 'Pending advances and unconfirmed arrivals requiring one-tap action.'}
              </p>
            </div>
            <span className="text-xs font-bold text-[#0E2F76] px-2 py-0.5 rounded-full bg-[#A9C0E0]/30">
              {formatNumber(attentionItems.length, numeralFormat)} {language === 'bn' ? 'টি কাজ' : 'items'}
            </span>
          </div>

          {attentionItems.length === 0 ? (
            <div className="card-coastal p-8 text-center bg-white rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-[#0E2F76] text-sm">
                {language === 'bn' ? 'সবকিছু ঠিকঠাক আছে!' : 'All caught up!'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {language === 'bn'
                  ? 'কোনো বকেয়া তাগিদ বা পেন্ডিং কনফার্মেশন নেই।'
                  : 'No pending advance chases or unconfirmed arrivals today.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {attentionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="card-coastal p-4 rounded-xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#0E2F76]/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0E2F76] truncate">
                        {language === 'bn' ? item.titleBn : item.titleEn}
                      </span>
                      <StatusBadge status={item.booking.status} lang={language} size="sm" />
                    </div>
                    <p className="text-xs text-neutral-600 truncate">
                      {language === 'bn' ? item.subtitleBn : item.subtitleEn}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {item.booking.guestPhone} • {item.booking.bookingCode}
                    </p>
                  </div>

                  {/* One-tap Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <button
                      onClick={() => sendWhatsAppReminder(item.booking)}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors"
                      title={language === 'bn' ? 'হোয়াটসঅ্যাপে তাগিদ পাঠান' : 'Send WhatsApp Reminder'}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedBooking(item.booking)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[#A9C0E0]/60 text-[#0E2F76] hover:bg-[#A9C0E0]/20 cursor-pointer"
                    >
                      {language === 'bn' ? 'বিস্তারিত' : 'Details'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Today Check-in Fast List */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-[#0E2F76]">
                {language === 'bn' ? 'আজকের আগত মেহমান তালিকা' : "Today's Arrivals List"}
              </h4>
              <button
                onClick={() => setActiveScreen('bookings')}
                className="text-xs text-[#0E2F76] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'bn' ? 'সকল বুকিং' : 'All Bookings'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="card-coastal divide-y divide-[#A9C0E0]/30 overflow-hidden">
              {todayCheckIns.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-500">
                  {language === 'bn' ? 'আজ কোনো চেক-ইন নেই।' : 'No check-ins scheduled for today.'}
                </div>
              ) : (
                todayCheckIns.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F4FEFF] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0E2F76]">
                          {getBookingGuestName(booking, language)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-[#A9C0E0]/30 font-medium text-[#0E2F76]">
                          {getUnitDisplayName(booking.unitId, roomTypes, language)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {formatNights(booking.nights, language, numeralFormat)} • {formatGuestsCount(booking.adults, language, numeralFormat)} • {language === 'bn' ? 'ব্যালেন্স:' : 'Balance:'} {formatCurrency(booking.balanceDue, language, numeralFormat)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {booking.status !== 'checked_in' ? (
                        <button
                          onClick={() => checkInGuest(booking.id)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#0E2F76] text-white hover:bg-[#0E2F76]/90 cursor-pointer"
                        >
                          {language === 'bn' ? 'চেক-ইন' : 'Check-in'}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                          {language === 'bn' ? 'চেক-ইন সম্পন্ন' : 'Checked In'}
                        </span>
                      )}

                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-1 text-neutral-400 hover:text-[#0E2F76]"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Mini Commission Savings Calculator Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-coastal p-5 bg-white border border-[#A9C0E0]/50 rounded-2xl relative overflow-hidden">
            {/* Soft Sky Tint band */}
            <div className="band-sky -mx-5 -mt-5 p-4 border-b border-[#A9C0E0]/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E2F76]">
                  {language === 'bn' ? 'ওটিএ কমিশন রোধক' : 'Commission Savings Hook'}
                </span>
                <h3 className="font-extrabold text-[#0E2F76] text-base">
                  {language === 'bn' ? 'OTA কমিশন বাঁচাও, প্রফিট বাড়াও' : 'Save OTA Commission, Boost Profit'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-neutral-600 mt-4 mb-4">
              {language === 'bn'
                ? 'Booking.com বা Agoda প্রতি বুকিংয়ে ১৫-২০% কেটে নেয়। আপনার ডিরেক্ট বুকিং লিংক শেয়ার করে কত টাকা বাঁচাতে পারবেন হিসাব করুন:'
                : 'OTAs take 15-20% commission on every stay. See how much direct bookings save you:'}
            </p>

            {/* Interactive sliders / inputs */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-neutral-700 mb-1">
                  <span>{language === 'bn' ? 'মাসে ওটিএ বুকিং সংখ্যা' : 'Monthly OTA bookings'}:</span>
                  <span className="text-[#0E2F76] font-bold">
                    {formatNumber(calcOtaBookings, numeralFormat)} {language === 'bn' ? 'টি' : 'bookings'}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={calcOtaBookings}
                  onChange={(e) => setCalcOtaBookings(Number(e.target.value))}
                  className="w-full accent-[#0E2F76] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-neutral-700 mb-1">
                  <span>{language === 'bn' ? 'গড় বুকিং মূল্য' : 'Average booking value'}:</span>
                  <span className="text-[#0E2F76] font-bold">
                    {formatCurrency(calcAvgRate, language, numeralFormat)}
                  </span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="500"
                  value={calcAvgRate}
                  onChange={(e) => setCalcAvgRate(Number(e.target.value))}
                  className="w-full accent-[#0E2F76] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-neutral-700 mb-1">
                  <span>{language === 'bn' ? 'সরাসরি বুকিংয়ে রূপান্তর' : 'Shift to direct bookings'}:</span>
                  <span className="text-emerald-700 font-bold">
                    {formatNumber(calcDirectShift, numeralFormat)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={calcDirectShift}
                  onChange={(e) => setCalcDirectShift(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Savings Output Highlight Box */}
            <div className="mt-5 p-4 rounded-xl bg-[#F4FEFF] border border-[#A9C0E0]/50 text-center space-y-1">
              <span className="text-xs text-neutral-600 font-medium">
                {language === 'bn' ? 'আপনার প্রতি মাসে সম্ভাব্য সাশ্রয়' : 'Your estimated monthly savings'}:
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0E2F76]">
                {formatCurrency(monthlySavings, language, numeralFormat)}
              </div>
              <p className="text-xs text-emerald-700 font-semibold">
                {language === 'bn'
                  ? `বছরে সাশ্রয়: ${formatCurrency(yearlySavings, language, numeralFormat)} (প্রায় ${formatNumber(freeNightsGained, numeralFormat)} রাতের ভাড়ার সমান!)`
                  : `Yearly: ${formatCurrency(yearlySavings, language, numeralFormat)} (~${formatNumber(freeNightsGained, numeralFormat)} nights gained!)`}
              </p>
            </div>

            {/* Direct Booking Link Share Card */}
            <div className="mt-4 pt-4 border-t border-[#A9C0E0]/30 space-y-2">
              <span className="text-xs font-bold text-[#0E2F76] block">
                {language === 'bn' ? 'আপনার নিজস্ব বুকিং লিংক শেয়ার করুন:' : 'Share your direct link:'}
              </span>
              <div className="flex items-center gap-1.5 p-2 bg-[#F4FEFF] border border-[#A9C0E0]/40 rounded-xl text-xs font-mono text-[#0E2F76]">
                <span className="flex-1 truncate">{directBookingLink}</span>
                <button
                  onClick={copyDirectLink}
                  className="px-2.5 py-1 bg-[#0E2F76] text-white rounded-lg font-sans font-bold flex items-center gap-1 hover:bg-[#0E2F76]/90 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setActiveScreen('calculator')}
                  className="flex-1 text-center py-2 text-xs font-semibold text-[#0E2F76] hover:underline"
                >
                  {language === 'bn' ? 'সম্পূর্ণ ক্যালকুলেটর দেখুন →' : 'Full Calculator →'}
                </button>
                <button
                  onClick={() => setActiveScreen('public_booking')}
                  className="flex-1 text-center py-2 px-3 rounded-xl bg-[#A9C0E0]/30 text-[#0E2F76] text-xs font-bold hover:bg-[#A9C0E0]/50"
                >
                  {language === 'bn' ? 'গেস্ট পেজ প্রিভিউ' : 'Guest Page'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
