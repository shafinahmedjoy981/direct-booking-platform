import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatDate,
  formatCurrency,
  formatNumber,
  generateWhatsAppUrl,
} from '../../utils/formatters';
import {
  getBookingGuestName,
  getSourceName,
  formatNights,
} from '../../utils/i18n';
import {
  X,
  Phone,
  MessageSquare,
  Share2,
  CheckCircle2,
  Calendar,
  CreditCard,
  Ban,
  Clock,
  LogIn,
  LogOut,
  Copy,
  Check,
  User,
  AlertCircle,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { PaymentMethod } from '../../types';

export const BookingDetailDrawer: React.FC = () => {
  const {
    language,
    numeralFormat,
    property,
    roomTypes,
    selectedBooking,
    setSelectedBooking,
    cancelBooking,
    markAdvancePaid,
    checkInGuest,
    checkOutGuest,
    messageTemplates,
    showToast,
  } = useApp();

  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('bkash');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payTxnId, setPayTxnId] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!selectedBooking) return null;

  const roomType = roomTypes.find((r) => r.id === selectedBooking.roomTypeId);
  const unit = roomType?.units.find((u) => u.id === selectedBooking.unitId);

  const paymentLink = selectedBooking.paymentLinkUrl || `https://meghpunjisajek.com/pay/${selectedBooking.bookingCode.toLowerCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopiedLink(true);
    showToast(
      language === 'bn' ? 'পেমেন্ট লিংক কপি হয়েছে!' : 'Payment link copied!',
      { type: 'success' }
    );
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendWhatsAppConfirmation = () => {
    const tmpl = messageTemplates.find((t) => t.key === 'confirmation');
    const templateText = language === 'bn' ? tmpl?.bodyBn : tmpl?.bodyEn;

    let text = templateText || '';
    text = text
      .replace('{guest_name}', selectedBooking.guestName)
      .replace('{property_name}', language === 'bn' ? property.nameBn : property.nameEn)
      .replace('{booking_code}', selectedBooking.bookingCode)
      .replace('{room_name}', roomType ? (language === 'bn' ? roomType.nameBn : roomType.nameEn) : '')
      .replace('{unit_number}', unit?.name || selectedBooking.unitId)
      .replace('{dates}', `${formatDate(selectedBooking.checkIn, language, numeralFormat, false)} - ${formatDate(selectedBooking.checkOut, language, numeralFormat, true)}`)
      .replace('{nights}', formatNumber(selectedBooking.nights, numeralFormat))
      .replace('{adults}', formatNumber(selectedBooking.adults, numeralFormat))
      .replace('{total_amount}', formatCurrency(selectedBooking.totalAmount, language, numeralFormat))
      .replace('{advance_paid}', formatCurrency(selectedBooking.advancePaid || 0, language, numeralFormat))
      .replace('{advance_method}', selectedBooking.advanceMethod || 'bKash')
      .replace('{balance_due}', formatCurrency(selectedBooking.balanceDue, language, numeralFormat))
      .replace('{location}', language === 'bn' ? property.locationBn : property.locationEn)
      .replace('{phone}', property.phone);

    window.open(generateWhatsAppUrl(selectedBooking.guestPhone, text), '_blank');
  };

  const handleSendPaymentReminder = () => {
    const tmpl = messageTemplates.find((t) => t.key === 'advance_request');
    const templateText = language === 'bn' ? tmpl?.bodyBn : tmpl?.bodyEn;

    let text = templateText || '';
    text = text
      .replace('{guest_name}', selectedBooking.guestName)
      .replace('{property_name}', language === 'bn' ? property.nameBn : property.nameEn)
      .replace('{booking_code}', selectedBooking.bookingCode)
      .replace('{room_name}', roomType ? (language === 'bn' ? roomType.nameBn : roomType.nameEn) : '')
      .replace('{dates}', `${formatDate(selectedBooking.checkIn, language, numeralFormat, false)}`)
      .replace('{advance_required}', formatCurrency(selectedBooking.advanceRequired, language, numeralFormat))
      .replace('{payment_link}', paymentLink)
      .replace('{bkash_number}', property.bKashMerchantNumber);

    window.open(generateWhatsAppUrl(selectedBooking.guestPhone, text), '_blank');
  };

  const handleConfirmAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTxnId.trim()) {
      showToast(language === 'bn' ? 'অনুগ্রহ করে ট্রানজেকশন আইডি লিখুন' : 'Please enter TxnID', { type: 'warning' });
      return;
    }

    markAdvancePaid({
      bookingId: selectedBooking.id,
      amount: payAmount || (selectedBooking.advanceRequired - selectedBooking.advancePaid),
      method: payMethod,
      transactionId: payTxnId,
    });

    setIsMarkPaidOpen(false);
    setPayTxnId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#0E2F76] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-wide">
                  {selectedBooking.bookingCode}
                </h3>
                <StatusBadge status={selectedBooking.status} lang={language} size="sm" />
              </div>
              <p className="text-xs text-[#A9C0E0]">
                {language === 'bn' ? 'সরাসরি বুকিং বিবরণী' : 'Direct Booking Details'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedBooking(null)}
            className="p-1.5 rounded-lg text-[#A9C0E0] hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Guest Card */}
          <div className="card-coastal p-4 bg-white rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#A9C0E0]/30 text-[#0E2F76] flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0E2F76]">{getBookingGuestName(selectedBooking, language)}</h4>
                  <p className="text-xs text-neutral-500 font-mono">{selectedBooking.guestPhone}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${selectedBooking.guestPhone}`}
                  className="p-2 rounded-lg border border-[#A9C0E0]/60 text-[#0E2F76] hover:bg-[#F4FEFF]"
                  title="Call Guest"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  onClick={handleSendWhatsAppConfirmation}
                  className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-neutral-600 pt-2 border-t border-[#A9C0E0]/30 flex items-center justify-between">
              <span>{language === 'bn' ? 'বুকিং উৎস:' : 'Source:'} <strong className="text-[#0E2F76]">{getSourceName(selectedBooking.source, language)}</strong></span>
              <span>{language === 'bn' ? `${formatNumber(selectedBooking.adults, 'bn', numeralFormat)} জন প্রাপ্তবয়স্ক` : `${formatNumber(selectedBooking.adults, 'en', numeralFormat)} Adult${selectedBooking.adults === 1 ? '' : 's'}`}</span>
            </div>
          </div>

          {/* Stay Dates & Room Details */}
          <div className="card-coastal p-4 bg-white rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                {language === 'bn' ? 'রুম ও সময়সূচি' : 'Room & Schedule'}
              </span>
              <span className="text-xs font-bold text-[#0E2F76] bg-[#A9C0E0]/20 px-2.5 py-0.5 rounded-full">
                {formatNights(selectedBooking.nights, language, numeralFormat)}
              </span>
            </div>

            <div className="p-3 bg-[#F4FEFF] rounded-xl border border-[#A9C0E0]/40 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-[#0E2F76]">
                  {roomType ? (language === 'bn' ? roomType.nameBn : roomType.nameEn) : 'Room'}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {language === 'bn' ? 'বরাদ্দকৃত ইউনিট:' : 'Unit:'} <strong className="text-[#0E2F76]">{language === 'bn' ? (unit?.nameBn || unit?.name || selectedBooking.unitId) : (unit?.nameEn || unit?.name || selectedBooking.unitId)}</strong>
                </p>
              </div>
              <Calendar className="w-6 h-6 text-[#A9C0E0]" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                  {language === 'bn' ? 'চেক-ইন তারিখ' : 'Check-in'}
                </span>
                <span className="font-bold text-neutral-800">
                  {formatDate(selectedBooking.checkIn, language, numeralFormat, true)}
                </span>
                <span className="text-neutral-500 block text-[10px]">{language === 'bn' ? 'দুপুর ১২:০০' : '12:00 PM'}</span>
              </div>

              <div className="p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 block text-[10px] uppercase font-bold">
                  {language === 'bn' ? 'চেক-আউট তারিখ' : 'Check-out'}
                </span>
                <span className="font-bold text-neutral-800">
                  {formatDate(selectedBooking.checkOut, language, numeralFormat, true)}
                </span>
                <span className="text-neutral-500 block text-[10px]">{language === 'bn' ? 'সকাল ১০:৩০' : '10:30 AM'}</span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="card-coastal p-4 bg-white rounded-xl space-y-2.5">
            <h4 className="font-bold text-xs text-neutral-500 uppercase tracking-wider">
              {language === 'bn' ? 'মূল্য ও হিসাবের বিবরণ' : 'Price Breakdown'}
            </h4>

            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>
                  {formatCurrency(selectedBooking.nightlyBaseRate, language, numeralFormat)} × {selectedBooking.nights} {language === 'bn' ? 'রাত' : 'nights'}
                </span>
                <span>{formatCurrency(selectedBooking.roomSubtotal, language, numeralFormat)}</span>
              </div>

              {selectedBooking.seasonalAdjustment !== 0 && (
                <div className="flex justify-between text-[#0E2F76]">
                  <span>{language === 'bn' ? 'সিজনাল / উইকেন্ড সমন্বয়:' : 'Seasonal adjustment:'}</span>
                  <span>+{formatCurrency(selectedBooking.seasonalAdjustment, language, numeralFormat)}</span>
                </div>
              )}

              {selectedBooking.addonsTotal > 0 && (
                <div className="flex justify-between text-neutral-700">
                  <span>{language === 'bn' ? 'অ্যাড-অন সার্ভিস (ডিনার/গাড়ি):' : 'Addons:'}</span>
                  <span>+{formatCurrency(selectedBooking.addonsTotal, language, numeralFormat)}</span>
                </div>
              )}

              {selectedBooking.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{language === 'bn' ? 'বিশেষ ছাড় / রিওয়ার্ড:' : 'Discount:'}</span>
                  <span>-{formatCurrency(selectedBooking.discount, language, numeralFormat)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-[#A9C0E0]/30 flex justify-between font-bold text-sm text-[#0E2F76]">
                <span>{language === 'bn' ? 'সর্বমোট ভাড়া' : 'Total Amount'}</span>
                <span>{formatCurrency(selectedBooking.totalAmount, language, numeralFormat)}</span>
              </div>
            </div>

            {/* Advance Status & Balance */}
            <div className="p-3 bg-[#F4FEFF] rounded-xl border border-[#A9C0E0]/50 space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 font-medium">
                  {language === 'bn' ? 'প্রয়োজনীয় অগ্রিম (৫০%):' : 'Advance Required (50%):'}
                </span>
                <span className="font-bold text-[#0E2F76]">
                  {formatCurrency(selectedBooking.advanceRequired, language, numeralFormat)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-600 font-medium">
                  {language === 'bn' ? 'জমা দেওয়া অগ্রিম:' : 'Advance Paid:'}
                </span>
                <span className="font-extrabold text-emerald-700">
                  {formatCurrency(selectedBooking.advancePaid || 0, language, numeralFormat)}
                  {selectedBooking.advanceMethod && ` (${selectedBooking.advanceMethod})`}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#A9C0E0]/30">
                <span className="text-neutral-700 font-bold">
                  {language === 'bn' ? 'পৌঁছানোর পর প্রদেয় ব্যালেন্স:' : 'Balance Due on Arrival:'}
                </span>
                <span className="font-extrabold text-[#0E2F76] text-sm">
                  {formatCurrency(selectedBooking.balanceDue, language, numeralFormat)}
                </span>
              </div>
            </div>
          </div>

          {/* Advance Payment Link Card */}
          <div className="card-coastal p-4 bg-white rounded-xl space-y-2">
            <span className="text-xs font-bold text-[#0E2F76] block">
              {language === 'bn' ? 'অনলাইন অগ্রিম পেমেন্ট লিংক (বিকাশ / নগদ):' : 'Advance Payment Link:'}
            </span>
            <div className="flex items-center gap-1.5 p-2 bg-[#F4FEFF] border border-[#A9C0E0]/40 rounded-xl text-xs font-mono text-[#0E2F76]">
              <span className="flex-1 truncate">{paymentLink}</span>
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-[#0E2F76] text-white rounded-lg font-sans font-bold flex items-center gap-1 hover:bg-[#0E2F76]/90 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (language === 'bn' ? 'কপি' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
              </button>
            </div>

            <button
              onClick={handleSendPaymentReminder}
              className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে পেমেন্ট লিংক পাঠান' : 'Send Payment Link via WhatsApp'}</span>
            </button>
          </div>

          {/* Form to Record Manual Payment */}
          {isMarkPaidOpen && (
            <form onSubmit={handleConfirmAdvanceSubmit} className="card-coastal p-4 bg-[#F4FEFF] rounded-xl border-2 border-[#0E2F76] space-y-3">
              <h4 className="font-bold text-xs text-[#0E2F76]">
                {language === 'bn' ? 'অগ্রিম পেমেন্ট গ্রহণ রেকর্ড করুন' : 'Record Advance Payment'}
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-neutral-600 mb-1 font-semibold">{language === 'bn' ? 'মাধ্যম' : 'Method'}</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 bg-white rounded-lg border border-[#A9C0E0]/50 outline-none"
                  >
                    <option value="bkash">{language === 'bn' ? 'বিকাশ' : 'bKash'}</option>
                    <option value="nagad">{language === 'bn' ? 'নগদ' : 'Nagad'}</option>
                    <option value="rocket">{language === 'bn' ? 'রকেট' : 'Rocket'}</option>
                    <option value="bank">{language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
                    <option value="cash">{language === 'bn' ? 'ক্যাশ' : 'Cash'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 mb-1 font-semibold">{language === 'bn' ? 'টাকার পরিমাণ' : 'Amount'}</label>
                  <input
                    type="number"
                    value={payAmount || (selectedBooking.advanceRequired - selectedBooking.advancePaid)}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full p-2 bg-white rounded-lg border border-[#A9C0E0]/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 mb-1 text-xs font-semibold">
                  {language === 'bn' ? 'ট্রানজেকশন আইডি (TxnID)' : 'Transaction ID (TxnID)'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: BKH998822' : 'e.g. BKH998822'}
                  value={payTxnId}
                  onChange={(e) => setPayTxnId(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-[#A9C0E0]/50 outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#0E2F76] text-white rounded-lg text-xs font-bold hover:bg-[#0E2F76]/90 cursor-pointer"
                >
                  {language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMarkPaidOpen(false)}
                  className="py-2 px-3 bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold hover:bg-neutral-300"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </form>
          )}

          {/* Notes */}
          {selectedBooking.notes && (
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600">
              <span className="font-bold text-neutral-700 block mb-0.5">{language === 'bn' ? 'নোট / মন্তব্য:' : 'Notes:'}</span>
              {selectedBooking.notes}
            </div>
          )}
        </div>

        {/* Action Drawer Footer */}
        <div className="p-4 border-t border-[#A9C0E0]/40 bg-[#F4FEFF] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {selectedBooking.advanceStatus !== 'paid' && !isMarkPaidOpen && (
              <button
                onClick={() => setIsMarkPaidOpen(true)}
                className="py-2.5 px-3 bg-[#0E2F76] hover:bg-[#0E2F76]/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CreditCard className="w-4 h-4" />
                <span>{language === 'bn' ? 'অগ্রিম পরিশোধ রেকর্ড' : 'Mark Paid'}</span>
              </button>
            )}

            {selectedBooking.status === 'confirmed' && (
              <button
                onClick={() => checkInGuest(selectedBooking.id)}
                className="py-2.5 px-3 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'bn' ? 'চেক-ইন মার্ক করুন' : 'Check In'}</span>
              </button>
            )}

            {selectedBooking.status === 'checked_in' && (
              <button
                onClick={() => checkOutGuest(selectedBooking.id)}
                className="py-2.5 px-3 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'bn' ? 'চেক-আউট সম্পন্ন' : 'Check Out'}</span>
              </button>
            )}

            {selectedBooking.status !== 'cancelled' && (
              <button
                onClick={() => {
                  if (confirm(language === 'bn' ? 'আপনি কি নিশ্চিত যে বুকিংটি বাতিল করবেন?' : 'Are you sure you want to cancel this booking?')) {
                    cancelBooking(selectedBooking.id);
                  }
                }}
                className="py-2.5 px-3 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Ban className="w-4 h-4" />
                <span>{language === 'bn' ? 'বুকিং বাতিল' : 'Cancel'}</span>
              </button>
            )}
          </div>

          <button
            onClick={handleSendWhatsAppConfirmation}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে কনফার্মেশন স্লিপ পাঠান' : 'Send WhatsApp Confirmation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
