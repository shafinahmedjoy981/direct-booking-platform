import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatNumber,
  generateWhatsAppUrl,
} from '../../utils/formatters';
import {
  Calculator,
  Copy,
  Check,
  Share2,
  TrendingDown,
  ExternalLink,
  ShieldAlert,
  Percent,
} from 'lucide-react';

export const CommissionCalculatorView: React.FC = () => {
  const {
    language,
    numeralFormat,
    property,
    showToast,
    setActiveScreen,
    setIsPublicQrModalOpen,
  } = useApp();

  const [monthlyOtaBookings, setMonthlyOtaBookings] = useState<number>(30);
  const [avgBookingValue, setAvgBookingValue] = useState<number>(4500);
  const [otaCommissionRate, setOtaCommissionRate] = useState<number>(18); // 18% standard
  const [shiftPercentage, setShiftPercentage] = useState<number>(60); // 60% shifted to direct
  const [copied, setCopied] = useState(false);

  // Calculations
  const currentTotalMonthlyVolume = monthlyOtaBookings * avgBookingValue;
  const currentMonthlyOtaLoss = currentTotalMonthlyVolume * (otaCommissionRate / 100);
  const currentYearlyOtaLoss = currentMonthlyOtaLoss * 12;

  // With Direct Booking Desk
  const shiftedBookingsCount = Math.round(monthlyOtaBookings * (shiftPercentage / 100));
  const directVolume = shiftedBookingsCount * avgBookingValue;
  const monthlySavings = Math.round(directVolume * (otaCommissionRate / 100));
  const yearlySavings = monthlySavings * 12;
  const freeNightsGained = Math.round(yearlySavings / avgBookingValue);

  const directBookingUrl = `https://${property.publicSlug}.directbooking.bd`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directBookingUrl);
    setCopied(true);
    showToast(
      language === 'bn' ? 'সরাসরি বুকিং লিংক কপি হয়েছে!' : 'Direct booking link copied!',
      { type: 'success' }
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = language === 'bn'
      ? `আসসালামু আলাইকুম! কোনো মধ্যস্থতাকারী ওটিএ কমিশন ছাড়াই সেরা রেটে সরাসরি ${property.nameBn}-এ বুকিং করতে ভিজিট করুন: ${directBookingUrl}`
      : `Hello! Book directly with best rates at ${property.nameEn}: ${directBookingUrl}`;
    window.open(generateWhatsAppUrl(property.phone, text), '_blank');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Hero Headline (Clean Coastal Hero) */}
      <div className="card-coastal p-6 bg-[#0E2F76] text-white rounded-2xl shadow-md space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2 text-[#A9C0E0] text-xs font-bold uppercase tracking-wider">
          <span>{language === 'bn' ? 'কমিশন সাশ্রয় ক্যালকুলেটর' : 'Commission Savings Calculator'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {language === 'bn'
            ? 'OTA কমিশন বাঁচাও, সরাসরি বুকিং বাড়াও'
            : 'Cut OTA Commissions, Grow Direct Profit'}
        </h2>

        <p className="text-xs sm:text-sm text-[#A9C0E0] max-w-2xl leading-relaxed">
          {language === 'bn'
            ? 'Booking.com, Agoda বা অন্য ওটিএ-তে আপনার কষ্টার্জিত আয়ের ১৫-২০% চলে যায়। নিজস্ব বুকিং পেজ এবং ফেসবুক/হোয়াটসঅ্যাপ লিঙ্ক ব্যবহারের মাধ্যমে কত টাকা পকেটে রাখা সম্ভব তা নিচে হিসাব করে দেখুন।'
            : 'Online travel agencies take a hefty 15-20% cut. Calculate your savings by shifting guests to direct booking.'}
        </p>
      </div>

      {/* Main Grid: Inputs on Left, Visual Results on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Inputs (6 cols) */}
        <div className="md:col-span-6 card-coastal p-5 bg-white rounded-2xl border border-[#A9C0E0]/50 space-y-5">
          <h3 className="font-bold text-sm text-[#0E2F76] border-b border-[#A9C0E0]/30 pb-2">
            {language === 'bn' ? '১. আপনার বর্তমান বুকিং তথ্য দিন' : '1. Enter Current Numbers'}
          </h3>

          {/* Slider 1: Monthly OTA Bookings */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">
                {language === 'bn' ? 'প্রতি মাসে ওটিএ থেকে আসা বুকিং:' : 'Monthly OTA Bookings:'}
              </span>
              <span className="font-extrabold text-sm text-[#0E2F76]">
                {formatNumber(monthlyOtaBookings, numeralFormat)} {language === 'bn' ? 'টি' : 'stays'}
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={monthlyOtaBookings}
              onChange={(e) => setMonthlyOtaBookings(Number(e.target.value))}
              className="w-full accent-[#0E2F76] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>{formatNumber(5, language, numeralFormat)} {language === 'bn' ? 'টি' : ''}</span>
              <span>{formatNumber(75, language, numeralFormat)} {language === 'bn' ? 'টি' : ''}</span>
              <span>{formatNumber(150, language, numeralFormat)} {language === 'bn' ? 'টি' : ''}</span>
            </div>
          </div>

          {/* Slider 2: Average Booking Value */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">
                {language === 'bn' ? 'প্রতি বুকিংয়ের গড় ভাড়া:' : 'Average Booking Value:'}
              </span>
              <span className="font-extrabold text-sm text-[#0E2F76]">
                {formatCurrency(avgBookingValue, language, numeralFormat)}
              </span>
            </div>
            <input
              type="range"
              min="1500"
              max="25000"
              step="500"
              value={avgBookingValue}
              onChange={(e) => setAvgBookingValue(Number(e.target.value))}
              className="w-full accent-[#0E2F76] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>{formatCurrency(1500, language, numeralFormat)}</span>
              <span>{formatCurrency(12000, language, numeralFormat)}</span>
              <span>{formatCurrency(25000, language, numeralFormat)}</span>
            </div>
          </div>

          {/* Slider 3: OTA Commission Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">
                {language === 'bn' ? 'ওটিএ কমিশন হার (%):' : 'OTA Commission Cut (%):'}
              </span>
              <span className="font-extrabold text-sm text-rose-700">
                {formatNumber(otaCommissionRate, language, numeralFormat)}%
              </span>
            </div>
            <input
              type="range"
              min="12"
              max="25"
              step="1"
              value={otaCommissionRate}
              onChange={(e) => setOtaCommissionRate(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <p className="text-[10px] text-neutral-400">
              {language === 'bn' ? 'সাধারণত Booking.com/Agoda ১৫% থেকে ২০% কমিশন কাটে' : 'Typical OTA rates range from 15% to 20%'}
            </p>
          </div>

          {/* Slider 4: Direct Shift Target */}
          <div className="space-y-1.5 pt-2 border-t border-[#A9C0E0]/30">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700">
                {language === 'bn' ? 'সরাসরি বুকিংয়ে রূপান্তরের লক্ষ্যমাত্রা:' : 'Shift Target to Direct:'}
              </span>
              <span className="font-extrabold text-sm text-emerald-700">
                {formatNumber(shiftPercentage, numeralFormat)}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={shiftPercentage}
              onChange={(e) => setShiftPercentage(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <p className="text-[10px] text-neutral-500">
              {language === 'bn' ? 'ফেসবুক ও হোয়াটসঅ্যাপে লিংক দিলে সহজেই ৬০-৭০% শিফট করা যায়' : 'Easily achievable via WhatsApp & Facebook link sharing'}
            </p>
          </div>
        </div>

        {/* Right Output: Calculations & Impact (6 cols) */}
        <div className="md:col-span-6 space-y-4">
          {/* Highlight Savings Card */}
          <div className="card-coastal p-6 bg-white border-2 border-[#0E2F76] rounded-2xl space-y-4 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {language === 'bn' ? 'আপনার পকেটে অতিরিক্ত মুনাফা' : 'Extra Profit in Your Pocket'}
            </span>

            <div className="text-3xl sm:text-4xl font-extrabold text-[#0E2F76]">
              {formatCurrency(monthlySavings, language, numeralFormat)}
              <span className="text-xs font-normal text-neutral-500 block mt-1">
                {language === 'bn' ? 'প্রতি মাসে অতিরিক্ত সাশ্রয়' : 'saved per month'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F4FEFF] border border-[#A9C0E0]/50 space-y-1">
              <span className="text-xs text-neutral-600 block">
                {language === 'bn' ? 'বছরে মোট নিট সাশ্রয়:' : 'Total Annual Net Savings:'}
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                {formatCurrency(yearlySavings, language, numeralFormat)}
              </div>
              <p className="text-xs text-neutral-600">
                {language === 'bn'
                  ? `এটি আপনার রিসোর্টের প্রায় ${formatNumber(freeNightsGained, language, numeralFormat)} রাতের ভাড়ার সমান অর্থ!`
                  : `Equivalent to ~${formatNumber(freeNightsGained, language, numeralFormat)} full guest nights gained!`}
              </p>
            </div>

            {/* Visual Comparison Bar */}
            <div className="space-y-1.5 text-xs text-left pt-2">
              <div className="flex justify-between text-neutral-600">
                <span>{language === 'bn' ? 'ওটিএ-র সাথে (কমিশন খরচ)' : 'With OTAs (Loss)'}</span>
                <span className="text-rose-600 font-bold">-{formatCurrency(currentMonthlyOtaLoss, language, numeralFormat)}</span>
              </div>
              <div className="h-3 w-full bg-rose-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-full" />
              </div>

              <div className="flex justify-between text-neutral-600 pt-2">
                <span>{language === 'bn' ? 'সরাসরি ডেস্কে (সাশ্রয়)' : 'Direct Booking Desk (Saved)'}</span>
                <span className="text-emerald-700 font-bold">+{formatCurrency(monthlySavings, language, numeralFormat)}</span>
              </div>
              <div className="h-3 w-full bg-emerald-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${shiftPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div className="card-coastal p-5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-2xl space-y-3">
            <h4 className="font-bold text-sm text-[#0E2F76]">
              {language === 'bn' ? 'আজ থেকেই ওটিএ কমিশন বাঁচানো শুরু করুন' : 'Start Saving Commissions Today'}
            </h4>
            <p className="text-xs text-neutral-600">
              {language === 'bn'
                ? 'আপনার মেহমানদের ফেসবুকে বা মেসেজে সরাসরি এই লিংকটি দিন। তারা কোনো মধ্যস্থতাকারী ছাড়াই বিকাশ/নগদে বুকিং দেবেন।'
                : 'Share your direct link with guests. Zero commissions, instant bKash advances.'}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#0E2F76] text-white rounded-xl text-xs font-bold hover:bg-[#0E2F76]/90 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (language === 'bn' ? 'লিংক কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'সরাসরি বুকিং লিংক কপি করুন' : 'Copy Direct Link')}</span>
              </button>

              <button
                onClick={() => setIsPublicQrModalOpen(true)}
                className="p-2.5 bg-white border border-[#A9C0E0]/60 text-[#0E2F76] rounded-xl hover:bg-[#A9C0E0]/20 cursor-pointer"
                title="QR Code"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
