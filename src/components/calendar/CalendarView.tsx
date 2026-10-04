import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatDate,
  formatNumber,
  formatCurrency,
  parseDateSafe,
} from '../../utils/formatters';
import {
  getBookingGuestName,
  getUnitDisplayName,
  formatNights,
} from '../../utils/i18n';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  List,
  Calendar as CalendarIcon,
  AlertTriangle,
  Plus,
  Info,
} from 'lucide-react';
import { Booking, Unit } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const CalendarView: React.FC = () => {
  const {
    language,
    numeralFormat,
    roomTypes,
    bookings,
    setSelectedBooking,
    openAddBooking,
  } = useApp();

  const [zoomDays, setZoomDays] = useState<7 | 14 | 30>(14);
  const [startDateOffset, setStartDateOffset] = useState<number>(0);
  const [selectedRoomTypeFilter, setSelectedRoomTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Compute the visible date range
  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + startDateOffset);

  const dates: { dateStr: string; dayName: string; dayNum: number; isToday: boolean; isWeekend: boolean }[] = [];
  for (let i = 0; i < zoomDays; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    const dayName = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
    const isToday = d.toISOString().split('T')[0] === today.toISOString().split('T')[0];
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Fri or Sat in Bangladesh

    dates.push({
      dateStr,
      dayName,
      dayNum: d.getDate(),
      isToday,
      isWeekend,
    });
  }

  // Filter units
  const filteredRoomTypes = selectedRoomTypeFilter === 'all'
    ? roomTypes
    : roomTypes.filter((rt) => rt.id === selectedRoomTypeFilter);

  // Helper to find booking occupying unit on a specific date
  const getBookingForUnitOnDate = (unitId: string, dateStr: string): Booking | undefined => {
    return bookings.find((b) => {
      if (b.status === 'cancelled') return false;
      if (b.unitId !== unitId) return false;
      return dateStr >= b.checkIn && dateStr < b.checkOut;
    });
  };

  const handleCellClick = (unit: Unit, roomTypeId: string, dateStr: string) => {
    const existing = getBookingForUnitOnDate(unit.id, dateStr);
    if (existing) {
      setSelectedBooking(existing);
    } else {
      // Create new booking with this unit and dates
      const nextDay = new Date(parseDateSafe(dateStr));
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      openAddBooking({
        checkIn: dateStr,
        checkOut: nextDayStr,
        roomTypeId,
        unitId: unit.id,
      });
    }
  };

  const getStatusColor = (booking: Booking) => {
    switch (booking.status) {
      case 'confirmed':
        return 'bg-emerald-600 text-white hover:bg-emerald-700';
      case 'awaiting_advance':
        return 'bg-amber-500 text-white hover:bg-amber-600';
      case 'checked_in':
        return 'bg-[#0E2F76] text-white hover:bg-[#0E2F76]/90';
      case 'checked_out':
        return 'bg-slate-400 text-white';
      default:
        return 'bg-neutral-500 text-white';
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Screen Title & Inline Helper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0E2F76] tracking-tight">
            {language === 'bn' ? 'রুম ও কটেজ টাইমলাইন ক্যালেন্ডার' : 'Room & Unit Timeline Calendar'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 flex items-center gap-1.5 mt-0.5">
            <Info className="w-3.5 h-3.5 text-[#0E2F76] shrink-0" />
            <span>
              {language === 'bn'
                ? 'এই ক্যালেন্ডার দেখে ডাবল বুকিং একটুও হবে না। খালি ঘরে ট্যাপ করে দ্রুত বুকিং করুন।'
                : 'Zero double booking guarantee. Tap any vacant cell to instantly create a reservation.'}
            </span>
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-[#A9C0E0]/50 rounded-xl p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-[#0E2F76] text-white'
                  : 'text-neutral-600 hover:text-[#0E2F76]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'টাইমলাইন' : 'Timeline'}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#0E2F76] text-white'
                  : 'text-neutral-600 hover:text-[#0E2F76]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'লিস্ট ভিউ' : 'List View'}</span>
            </button>
          </div>

          <button
            onClick={() => openAddBooking()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0E2F76] text-white rounded-xl text-xs font-bold hover:bg-[#0E2F76]/90 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === 'bn' ? 'বুকিং যোগ' : 'Add'}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Zoom controls */}
      <div className="card-coastal p-3 sm:p-4 bg-white flex flex-wrap items-center justify-between gap-3">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStartDateOffset((prev) => prev - (zoomDays === 7 ? 7 : 14))}
            className="p-1.5 rounded-lg border border-[#A9C0E0]/50 text-[#0E2F76] hover:bg-[#A9C0E0]/20 cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setStartDateOffset(0)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#A9C0E0]/20 text-[#0E2F76] hover:bg-[#A9C0E0]/40 cursor-pointer"
          >
            {language === 'bn' ? 'আজকের তারিখ' : 'Today'}
          </button>

          <button
            onClick={() => setStartDateOffset((prev) => prev + (zoomDays === 7 ? 7 : 14))}
            className="p-1.5 rounded-lg border border-[#A9C0E0]/50 text-[#0E2F76] hover:bg-[#A9C0E0]/20 cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs sm:text-sm font-bold text-[#0E2F76] ml-2">
            {formatDate(dates[0]?.dateStr || '', language, numeralFormat, false)} — {formatDate(dates[dates.length - 1]?.dateStr || '', language, numeralFormat, true)}
          </span>
        </div>

        {/* Zoom days & Room Type Filter */}
        <div className="flex items-center gap-3">
          {/* Zoom Selector */}
          <div className="flex items-center bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl p-0.5 text-xs font-medium text-[#0E2F76]">
            <button
              onClick={() => setZoomDays(7)}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${zoomDays === 7 ? 'bg-[#0E2F76] text-white font-bold' : 'hover:bg-[#A9C0E0]/20'}`}
            >
              {language === 'bn' ? '৭ দিন' : '7 Days'}
            </button>
            <button
              onClick={() => setZoomDays(14)}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${zoomDays === 14 ? 'bg-[#0E2F76] text-white font-bold' : 'hover:bg-[#A9C0E0]/20'}`}
            >
              {language === 'bn' ? '১৪ দিন' : '14 Days'}
            </button>
            <button
              onClick={() => setZoomDays(30)}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${zoomDays === 30 ? 'bg-[#0E2F76] text-white font-bold' : 'hover:bg-[#A9C0E0]/20'}`}
            >
              {language === 'bn' ? '১ মাস' : '1 Month'}
            </button>
          </div>

          {/* Room filter dropdown */}
          <div className="flex items-center gap-1 text-xs text-[#0E2F76] bg-[#F4FEFF] px-2.5 py-1.5 rounded-xl border border-[#A9C0E0]/50">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedRoomTypeFilter}
              onChange={(e) => setSelectedRoomTypeFilter(e.target.value)}
              className="bg-transparent font-medium outline-none cursor-pointer"
            >
              <option value="all">{language === 'bn' ? 'সব রুম ক্যাটাগরি' : 'All Categories'}</option>
              {roomTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {language === 'bn' ? rt.nameBn : rt.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Colour Status Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs px-2 py-1 text-neutral-600">
        <span className="font-semibold text-neutral-700">{language === 'bn' ? 'নির্দেশক:' : 'Legend:'}</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-600" />
          <span>{language === 'bn' ? 'কনফার্মড' : 'Confirmed'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-500" />
          <span>{language === 'bn' ? 'অগ্রিম অপেক্ষমাণ' : 'Awaiting Advance'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#0E2F76]" />
          <span>{language === 'bn' ? 'চেক-ইন করা (স্টেয়িং)' : 'Checked-in'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-slate-400" />
          <span>{language === 'bn' ? 'চেক-আউট সম্পন্ন' : 'Checked-out'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-white border border-[#A9C0E0]" />
          <span>{language === 'bn' ? 'খালি (বুকিং দিতে ক্লিক করুন)' : 'Vacant (Click to book)'}</span>
        </div>
      </div>

      {/* TIMELINE VIEW */}
      {viewMode === 'timeline' ? (
        <div className="card-coastal overflow-x-auto bg-white rounded-2xl border border-[#A9C0E0]/40 shadow-sm">
          <table className="w-full border-collapse text-left text-xs min-w-[750px]">
            {/* Table Header: Dates */}
            <thead>
              <tr className="border-b border-[#A9C0E0]/40 bg-[#F4FEFF]">
                <th className="sticky left-0 z-20 bg-[#F4FEFF] p-3 w-48 font-bold text-[#0E2F76] border-r border-[#A9C0E0]/40 shadow-[1px_0_0_rgba(169,192,224,0.4)]">
                  {language === 'bn' ? 'রুম ও ইউনিট' : 'Room & Unit'}
                </th>
                {dates.map((d) => (
                  <th
                    key={d.dateStr}
                    className={`p-2 text-center min-w-[52px] border-r border-[#A9C0E0]/20 font-medium ${
                      d.isToday
                        ? 'bg-[#0E2F76] text-white font-bold'
                        : d.isWeekend
                        ? 'bg-[#A9C0E0]/20 text-[#0E2F76]'
                        : 'text-neutral-700'
                    }`}
                  >
                    <div className="text-[10px] uppercase">{d.dayName}</div>
                    <div className="text-sm font-bold">{formatNumber(d.dayNum, numeralFormat)}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: Rooms & Units */}
            <tbody className="divide-y divide-[#A9C0E0]/30">
              {filteredRoomTypes.map((rt) => (
                <React.Fragment key={rt.id}>
                  {/* Category Header Row */}
                  <tr className="bg-[#A9C0E0]/15 font-bold text-[#0E2F76]">
                    <td
                      colSpan={dates.length + 1}
                      className="p-2 px-3 text-xs tracking-wide uppercase border-b border-[#A9C0E0]/30"
                    >
                      {language === 'bn' ? rt.nameBn : rt.nameEn} • {formatCurrency(rt.basePrice, language, numeralFormat)}/{language === 'bn' ? 'রাত' : 'night'}
                    </td>
                  </tr>

                  {/* Individual Units */}
                  {rt.units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-[#F4FEFF]/60 transition-colors h-14">
                      {/* Fixed Left Header for Unit */}
                      <td className="sticky left-0 z-10 bg-white p-2.5 px-3 border-r border-[#A9C0E0]/40 font-semibold text-[#0E2F76] shadow-[1px_0_0_rgba(169,192,224,0.4)] truncate">
                        <div className="text-xs font-bold">{language === 'bn' ? (unit.nameBn || unit.name) : (unit.nameEn || unit.name)}</div>
                        <div className="text-[10px] text-neutral-400 font-normal">
                          {unit.status === 'maintenance'
                            ? (language === 'bn' ? 'মেরামত চলছে' : 'Maintenance')
                            : (language === 'bn' ? 'সক্রিয় ইউনিট' : 'Active')}
                        </div>
                      </td>

                      {/* Date Cells */}
                      {dates.map((d) => {
                        const booking = getBookingForUnitOnDate(unit.id, d.dateStr);

                        if (booking) {
                          const isFirstDay = booking.checkIn === d.dateStr;
                          const guestName = getBookingGuestName(booking, language);
                          return (
                            <td
                              key={d.dateStr}
                              onClick={() => setSelectedBooking(booking)}
                              className="p-1 border-r border-[#A9C0E0]/20 cursor-pointer relative"
                              title={`${guestName} (${booking.bookingCode})`}
                            >
                              <div
                                className={`h-10 rounded-lg p-1 px-1.5 flex flex-col justify-center text-[10px] leading-tight overflow-hidden transition-all shadow-xs ${getStatusColor(
                                  booking
                                )}`}
                              >
                                {isFirstDay ? (
                                  <>
                                    <span className="font-bold truncate">{guestName}</span>
                                    <span className="text-[9px] opacity-90 truncate">{booking.bookingCode}</span>
                                  </>
                                ) : (
                                  <div className="w-full text-center opacity-70">──</div>
                                )}
                              </div>
                            </td>
                          );
                        }

                        // Empty cell -> Click to create booking!
                        return (
                          <td
                            key={d.dateStr}
                            onClick={() => handleCellClick(unit, rt.id, d.dateStr)}
                            className={`p-1 border-r border-[#A9C0E0]/20 cursor-pointer transition-colors hover:bg-[#A9C0E0]/30 group ${
                              d.isWeekend ? 'bg-[#A9C0E0]/10' : ''
                            }`}
                            title={language === 'bn' ? 'খালি রুম: বুকিং তৈরি করতে ক্লিক করুন' : 'Vacant: Click to reserve'}
                          >
                            <div className="h-10 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-3.5 h-3.5 text-[#0E2F76]" />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ACCESSIBLE LIST VIEW FOR MOBILE & SCREEN READERS */
        <div className="space-y-3">
          <div className="card-coastal divide-y divide-[#A9C0E0]/30 bg-white overflow-hidden">
            {bookings
              .filter((b) => b.status !== 'cancelled')
              .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
              .map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F4FEFF] cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0E2F76]">{getBookingGuestName(b, language)}</span>
                      <StatusBadge status={b.status} lang={language} size="sm" />
                      <span className="text-xs px-2 py-0.5 rounded-md bg-[#A9C0E0]/20 text-[#0E2F76] font-semibold">
                        {getUnitDisplayName(b.unitId, roomTypes, language)}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      {formatDate(b.checkIn, language, numeralFormat, false)} → {formatDate(b.checkOut, language, numeralFormat, true)} ({formatNights(b.nights, language, numeralFormat)})
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {b.guestPhone} • {language === 'bn' ? 'কোড:' : 'Code:'} {b.bookingCode}
                    </p>
                  </div>

                  <div className="text-right sm:text-right">
                    <div className="text-sm font-extrabold text-[#0E2F76]">
                      {formatCurrency(b.totalAmount, language, numeralFormat)}
                    </div>
                    <span className="text-xs text-neutral-500">
                      {b.advanceStatus === 'paid'
                        ? (language === 'bn' ? 'অগ্রিম পরিশোধিত' : 'Advance Paid')
                        : (language === 'bn' ? `বাকি: ${formatCurrency(b.balanceDue, language, numeralFormat)}` : `Due: ${formatCurrency(b.balanceDue, language, numeralFormat)}`)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
