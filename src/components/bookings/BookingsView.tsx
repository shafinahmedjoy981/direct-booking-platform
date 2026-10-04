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
  getUnitDisplayName,
  formatNights,
  formatShowingBookings,
  formatDueAmount,
  getSourceName,
} from '../../utils/i18n';
import {
  Search,
  Filter,
  Plus,
  MessageSquare,
  ArrowRight,
  Phone,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { BookingStatus, BookingSource } from '../../types';

export const BookingsView: React.FC = () => {
  const {
    language,
    numeralFormat,
    bookings,
    roomTypes,
    setSelectedBooking,
    openAddBooking,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    // Search
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      !searchTerm ||
      b.guestName.toLowerCase().includes(searchLower) ||
      b.guestPhone.includes(searchLower) ||
      b.bookingCode.toLowerCase().includes(searchLower) ||
      b.unitId.toLowerCase().includes(searchLower);

    // Status
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;

    // Source
    const matchSource = sourceFilter === 'all' || b.source === sourceFilter;

    return matchSearch && matchStatus && matchSource;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0E2F76] tracking-tight">
            {language === 'bn' ? 'সকল বুকিং ও রিজার্ভেশন তালিকা' : 'All Bookings & Reservations'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            {language === 'bn'
              ? 'গেস্টের নাম, ফোন বা বুকিং কোড দিয়ে খুঁজুন এবং এক ক্লিকে হোয়াটসঅ্যাপে যোগাযোগ করুন।'
              : 'Search guests, manage payment statuses, and trigger WhatsApp confirmations.'}
          </p>
        </div>

        <button
          onClick={() => openAddBooking()}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0E2F76] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#0E2F76]/90 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন বুকিং (৩০ সেকেন্ড)' : 'New Booking'}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-coastal p-3 sm:p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={language === 'bn' ? 'নাম, মোবাইল নম্বর বা বুকিং কোড...' : 'Search by name, phone, code...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl text-xs sm:text-sm outline-none font-medium text-[#0A0A0A]"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl text-xs font-semibold text-[#0E2F76]">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              <option value="all">{language === 'bn' ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
              <option value="confirmed">{language === 'bn' ? 'কনফার্মড' : 'Confirmed'}</option>
              <option value="awaiting_advance">{language === 'bn' ? 'অগ্রিম অপেক্ষমাণ' : 'Awaiting Advance'}</option>
              <option value="checked_in">{language === 'bn' ? 'চেক-ইন করা' : 'Checked In'}</option>
              <option value="checked_out">{language === 'bn' ? 'চেক-আউট সম্পন্ন' : 'Checked Out'}</option>
              <option value="cancelled">{language === 'bn' ? 'বাতিলকৃত' : 'Cancelled'}</option>
            </select>
          </div>

          {/* Source Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl text-xs font-semibold text-[#0E2F76]">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              <option value="all">{language === 'bn' ? 'সকল উৎস' : 'All Sources'}</option>
              <option value="whatsapp">{language === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</option>
              <option value="facebook">{language === 'bn' ? 'ফেসবুক' : 'Facebook'}</option>
              <option value="phone">{language === 'bn' ? 'ফোন কল' : 'Phone Call'}</option>
              <option value="walk_in">{language === 'bn' ? 'ওয়াক-ইন' : 'Walk-in'}</option>
              <option value="website">{language === 'bn' ? 'ওয়েবসাইট (ডিরেক্ট)' : 'Direct Website'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Count Summary Badge */}
      <div className="flex items-center justify-between text-xs text-neutral-500 px-2">
        <span className="font-semibold text-[#0E2F76]">
          {formatShowingBookings(filteredBookings.length, language, numeralFormat)}
        </span>
      </div>

      {/* Bookings List Card */}
      {filteredBookings.length === 0 ? (
        <div className="card-coastal p-12 text-center bg-white rounded-2xl">
          <CheckCircle2 className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <p className="font-bold text-[#0E2F76] text-sm">
            {language === 'bn' ? 'কোনো বুকিং খুঁজে পাওয়া যায়নি' : 'No bookings matched'}
          </p>
          <p className="text-xs text-neutral-500 mt-1 mb-4">
            {language === 'bn' ? 'সার্চ ফিল্টার পরিবর্তন করুন অথবা নতুন বুকিং যুক্ত করুন।' : 'Try changing filters or add a new booking.'}
          </p>
          <button
            onClick={() => openAddBooking()}
            className="px-4 py-2 bg-[#0E2F76] text-white text-xs font-bold rounded-xl"
          >
            {language === 'bn' ? '+ নতুন বুকিং তৈরি করুন' : '+ Create Booking'}
          </button>
        </div>
      ) : (
        <div className="card-coastal divide-y divide-[#A9C0E0]/30 bg-white rounded-2xl overflow-hidden shadow-sm">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBooking(b)}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F4FEFF] cursor-pointer transition-colors"
            >
              {/* Left Column: Guest, Status, Room */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#0E2F76]">{getBookingGuestName(b, language)}</span>
                  <StatusBadge status={b.status} lang={language} size="sm" />
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#A9C0E0]/25 text-[#0E2F76] font-bold">
                    {b.bookingCode}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <span>{getUnitDisplayName(b.unitId, roomTypes, language)}</span>
                  <span>•</span>
                  <span>{formatDate(b.checkIn, language, numeralFormat, false)} → {formatDate(b.checkOut, language, numeralFormat, true)}</span>
                  <span>•</span>
                  <span>{formatNights(b.nights, language, numeralFormat)}</span>
                </div>

                <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                  <span>{b.guestPhone}</span>
                  <span>•</span>
                  <span className="text-[10px] font-semibold text-[#0E2F76]">
                    {language === 'bn' ? 'উৎস:' : 'Source:'} {getSourceName(b.source, language)}
                  </span>
                </div>
              </div>

              {/* Right Column: Amount, Due & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                <div className="text-left sm:text-right">
                  <div className="text-sm font-extrabold text-[#0E2F76]">
                    {formatCurrency(b.totalAmount, language, numeralFormat)}
                  </div>
                  <div className="text-xs">
                    {b.advanceStatus === 'paid' ? (
                      <span className="text-emerald-700 font-semibold">
                        {language === 'bn' ? 'অগ্রিম পরিশোধিত' : 'Advance Paid'}
                      </span>
                    ) : (
                      <span className="text-amber-700 font-semibold">
                        {formatDueAmount(b.balanceDue, language, numeralFormat)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const guestName = getBookingGuestName(b, language);
                      const text = language === 'bn'
                        ? `আসসালামু আলাইকুম ${guestName} ভাই/আপু, ${b.bookingCode} বুকিং সংক্রান্ত তথ্য...`
                        : `Hello ${guestName}, details regarding your booking ${b.bookingCode}...`;
                      window.open(generateWhatsAppUrl(b.guestPhone, text), '_blank');
                    }}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                  </button>

                  <div className="p-1 text-neutral-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
