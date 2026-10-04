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
  formatDueAmount,
  getPaymentMethodName,
} from '../../utils/i18n';
import {
  WalletCards,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Building,
  Smartphone,
} from 'lucide-react';
import { PaymentMethod } from '../../types';

export const PaymentsView: React.FC = () => {
  const {
    language,
    numeralFormat,
    property,
    payments,
    bookings,
    roomTypes,
    recordPayment,
    markAdvancePaid,
    showToast,
  } = useApp();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(bookings[0]?.id || '');
  const [payAmount, setPayAmount] = useState<number>(3000);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('bkash');
  const [txnId, setTxnId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Total collected calculation
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  // Total outstanding balance across confirmed or awaiting bookings
  const totalOutstanding = bookings
    .filter((b) => b.status !== 'cancelled' && b.status !== 'checked_out')
    .reduce((sum, b) => sum + b.balanceDue, 0);

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBooking = bookings.find((b) => b.id === selectedBookingId);
    if (!targetBooking) return;
    if (!txnId.trim()) {
      showToast(language === 'bn' ? 'ট্রানজেকশন আইডি লিখুন' : 'Enter transaction ID', { type: 'warning' });
      return;
    }

    markAdvancePaid({
      bookingId: targetBooking.id,
      amount: payAmount,
      method: payMethod,
      transactionId: txnId,
      notes,
    });

    setIsManualModalOpen(false);
    setTxnId('');
    setNotes('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0E2F76] tracking-tight">
            {language === 'bn' ? 'পেমেন্ট ও বিকাশ কালেকশন ডেস্ক' : 'Payments & Collection Desk'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            {language === 'bn'
              ? 'বিকাশ, নগদ বা ব্যাংক মারফত অগ্রিম ও ব্যালেন্স গ্রহণ এবং ট্রানজেকশন হিসেব।'
              : 'Track bKash, Nagad, bank transfers, and generate instant payment links.'}
          </p>
        </div>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0E2F76] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#0E2F76]/90 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? '+ পেমেন্ট এন্ট্রি' : '+ Record Payment'}</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-coastal p-4.5 bg-[#0E2F76] text-white rounded-2xl flex flex-col justify-between">
          <span className="text-xs uppercase tracking-wider text-[#A9C0E0] font-semibold">
            {language === 'bn' ? 'সর্বমোট গৃহীত পেমেন্ট' : 'Total Collected'}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            {formatCurrency(totalCollected, language, numeralFormat)}
          </div>
          <p className="text-[11px] text-[#A9C0E0] mt-1">
            {formatNumber(payments.length, numeralFormat)} {language === 'bn' ? 'টি লেনদেন যাচাইকৃত' : 'transactions verified'}
          </p>
        </div>

        <div className="card-coastal p-4.5 bg-white rounded-2xl flex flex-col justify-between border border-[#A9C0E0]/50">
          <span className="text-xs font-semibold text-neutral-500">
            {language === 'bn' ? 'বকেয়া ব্যালেন্স (পৌঁছে প্রদেয়)' : 'Outstanding Balance Due'}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">
            {formatCurrency(totalOutstanding, language, numeralFormat)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {language === 'bn' ? 'অতিথিরা চেক-ইনের পর পরিশোধ করবেন' : 'Payable by guests on arrival'}
          </p>
        </div>

        <div className="card-coastal p-4.5 bg-white rounded-2xl flex flex-col justify-between border border-[#A9C0E0]/50">
          <span className="text-xs font-semibold text-neutral-500">
            {language === 'bn' ? 'বিকাশ ও নগদ মার্চেন্ট নম্বর' : 'Merchant Gateways'}
          </span>
          <div className="text-xs font-mono font-bold text-[#0E2F76] mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span>{language === 'bn' ? 'বিকাশ:' : 'bKash:'}</span> <span>{property.bKashMerchantNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{language === 'bn' ? 'নগদ:' : 'Nagad:'}</span> <span>{property.nagadMerchantNumber}</span>
            </div>
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold mt-1">
            {language === 'bn' ? 'পেমেন্ট গেটওয়ে প্রস্তুত (SSLCommerz/bKash API)' : 'Ready for payment API plug-in'}
          </p>
        </div>
      </div>

      {/* Manual Payment Entry Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <form onSubmit={handleRecordPaymentSubmit} className="bg-white rounded-2xl max-w-md w-full border border-[#A9C0E0]/60 shadow-2xl p-5 space-y-3">
            <h3 className="font-bold text-[#0E2F76] text-base">
              {language === 'bn' ? 'নতুন পেমেন্ট রেকর্ড করুন' : 'Record New Payment'}
            </h3>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {language === 'bn' ? 'বুকিং নির্বাচন করুন' : 'Select Booking'}
              </label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl text-xs outline-none"
              >
                {bookings.filter(b => b.status !== 'cancelled').map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookingCode} - {getBookingGuestName(b, language)} ({getUnitDisplayName(b.unitId, roomTypes, language)}) - {formatDueAmount(b.balanceDue, language, numeralFormat)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">{language === 'bn' ? 'মাধ্যম' : 'Method'}</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl outline-none"
                >
                  <option value="bkash">{language === 'bn' ? 'বিকাশ (bKash)' : 'bKash'}</option>
                  <option value="nagad">{language === 'bn' ? 'নগদ (Nagad)' : 'Nagad'}</option>
                  <option value="rocket">{language === 'bn' ? 'রকেট (Rocket)' : 'Rocket'}</option>
                  <option value="bank">{language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}</option>
                  <option value="cash">{language === 'bn' ? 'নগদ ক্যাশ' : 'Cash'}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">{language === 'bn' ? 'টাকার পরিমাণ' : 'Amount'}</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {language === 'bn' ? 'ট্রানজেকশন আইডি (TxnID)' : 'Transaction ID'}
              </label>
              <input
                type="text"
                placeholder={language === 'bn' ? 'যেমন: BKH998822' : 'e.g. BKH998822'}
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
                className="w-full p-2 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl text-xs outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-[#0E2F76] text-white text-xs font-bold rounded-xl hover:bg-[#0E2F76]/90 cursor-pointer"
              >
                {language === 'bn' ? 'পেমেন্ট জমা করুন' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction Records List */}
      <div className="card-coastal bg-white rounded-2xl border border-[#A9C0E0]/50 overflow-hidden">
        <div className="p-4 border-b border-[#A9C0E0]/30 bg-[#F4FEFF] flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#0E2F76]">
            {language === 'bn' ? 'সাম্প্রতিক পেমেন্ট হিস্ট্রি' : 'Recent Transaction Log'}
          </h3>
          <span className="text-xs text-neutral-500">
            {formatNumber(payments.length, language, numeralFormat)} {language === 'bn' ? 'টি পেমেন্ট' : 'records'}
          </span>
        </div>

        <div className="divide-y divide-[#A9C0E0]/30">
          {payments.map((p) => (
            <div
              key={p.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F4FEFF]/40 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#0E2F76]">{language === 'bn' ? (p.guestNameBn || p.guestName) : (p.guestNameEn || p.guestName)}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#A9C0E0]/30 text-[#0E2F76] font-bold">
                    {p.bookingCode}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {getPaymentMethodName(p.method, language)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  TxnID: <strong className="font-mono text-neutral-800">{p.transactionId}</strong> • {p.recordedAt}
                </p>
                {(p.notesBn || p.notesEn || p.notes) && <p className="text-[11px] text-neutral-400">{language === 'bn' ? (p.notesBn || p.notes) : (p.notesEn || p.notes)}</p>}
              </div>

              <div className="text-left sm:text-right">
                <div className="text-base font-extrabold text-emerald-700">
                  +{formatCurrency(p.amount, language, numeralFormat)}
                </div>
                <span className="text-[11px] text-neutral-500">
                  {language === 'bn' ? `গ্রহীতা: ${p.recordedByBn || p.recordedBy}` : `By: ${p.recordedByEn || p.recordedBy}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
