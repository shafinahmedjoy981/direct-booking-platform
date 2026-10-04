import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  NumeralFormat,
  UserRole,
  PropertySettings,
  RoomType,
  SeasonalPriceRule,
  ExtraAddon,
  Booking,
  Guest,
  PaymentRecord,
  MessageTemplate,
  StaffUser,
  AuditLog,
  BookingStatus,
  PaymentMethod,
} from '../types';
import {
  initialPropertySettings,
  initialRoomTypes,
  initialPriceRules,
  initialExtraAddons,
  initialMessageTemplates,
  initialStaffUsers,
  initialAuditLogs,
  generateInitialBookings,
} from '../data/initialData';
import { formatCurrency } from '../utils/formatters';

export type ActiveScreen =
  | 'today'
  | 'calendar'
  | 'bookings'
  | 'rooms_pricing'
  | 'payments'
  | 'calculator'
  | 'guests'
  | 'messages'
  | 'reports'
  | 'settings'
  | 'public_booking';

export interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  undoAction?: () => void;
  undoLabel?: string;
}

interface AppContextType {
  // Localization & Preferences
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  numeralFormat: NumeralFormat;
  setNumeralFormat: (fmt: NumeralFormat) => void;
  toggleNumeralFormat: () => void;

  // View state
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;

  // Data
  property: PropertySettings;
  updateProperty: (updates: Partial<PropertySettings>) => void;
  roomTypes: RoomType[];
  updateRoomType: (id: string, updates: Partial<RoomType>) => void;
  priceRules: SeasonalPriceRule[];
  addPriceRule: (rule: Omit<SeasonalPriceRule, 'id'>) => void;
  updatePriceRule: (id: string, updates: Partial<SeasonalPriceRule>) => void;
  togglePriceRule: (id: string) => void;
  deletePriceRule: (id: string) => void;
  extraAddons: ExtraAddon[];
  updateExtraAddon: (id: string, updates: Partial<ExtraAddon>) => void;

  bookings: Booking[];
  addBooking: (newBooking: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'updatedAt'>) => Booking;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  cancelBooking: (id: string, reason?: string) => void;
  markAdvancePaid: (params: {
    bookingId: string;
    amount: number;
    method: PaymentMethod;
    transactionId: string;
    notes?: string;
  }) => void;
  checkInGuest: (bookingId: string) => void;
  checkOutGuest: (bookingId: string) => void;

  guests: Guest[];
  addOrUpdateGuestFromBooking: (booking: Booking) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;

  payments: PaymentRecord[];
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'recordedAt'>) => void;

  messageTemplates: MessageTemplate[];
  updateMessageTemplate: (id: string, updates: Partial<MessageTemplate>) => void;

  staffUsers: StaffUser[];
  auditLogs: AuditLog[];
  addAuditLog: (actionBn: string, actionEn: string, details: string) => void;

  // Interaction Dialogs & Drawers
  selectedBooking: Booking | null;
  setSelectedBooking: (booking: Booking | null) => void;
  isAddBookingOpen: boolean;
  setIsAddBookingOpen: (open: boolean) => void;
  addBookingPreset: {
    checkIn?: string;
    checkOut?: string;
    roomTypeId?: string;
    unitId?: string;
  } | null;
  openAddBooking: (preset?: {
    checkIn?: string;
    checkOut?: string;
    roomTypeId?: string;
    unitId?: string;
  }) => void;
  isPublicQrModalOpen: boolean;
  setIsPublicQrModalOpen: (open: boolean) => void;

  // Guided Tour
  isTourActive: boolean;
  tourStep: number;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  dismissTour: () => void;

  // Notifications & Toast
  toasts: ToastInfo[];
  showToast: (message: string, options?: { type?: ToastInfo['type']; undoAction?: () => void; undoLabel?: string }) => void;
  dismissToast: (id: string) => void;

  // Reset to factory
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'direct_booking_desk_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings & Localization
  const [language, setLanguage] = useState<Language>('bn');
  const [numeralFormat, setNumeralFormat] = useState<NumeralFormat>('bn');
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('today');
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Core Data
  const [property, setProperty] = useState<PropertySettings>(initialPropertySettings);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialRoomTypes);
  const [priceRules, setPriceRules] = useState<SeasonalPriceRule[]>(initialPriceRules);
  const [extraAddons, setExtraAddons] = useState<ExtraAddon[]>(initialExtraAddons);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>(initialMessageTemplates);
  const [staffUsers] = useState<StaffUser[]>(initialStaffUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  // Dialogs & Drawers
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState<boolean>(false);
  const [addBookingPreset, setAddBookingPreset] = useState<{
    checkIn?: string;
    checkOut?: string;
    roomTypeId?: string;
    unitId?: string;
  } | null>(null);
  const [isPublicQrModalOpen, setIsPublicQrModalOpen] = useState<boolean>(false);

  // Tour
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  // Toast
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Load state from localStorage on initial mount
  useEffect(() => {
    const initial = generateInitialBookings();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.property) setProperty(parsed.property);
        if (parsed.roomTypes) {
          const bengaliRegex = /[\u0980-\u09FF]/;
          // Ensure units and roomTypes have nameEn and nameBn
          const mergedRoomTypes = parsed.roomTypes.map((rt: RoomType) => {
            const defaultRt = initialRoomTypes.find((d) => d.id === rt.id);
            const resolvedRtNameEn = rt.nameEn && !bengaliRegex.test(rt.nameEn) ? rt.nameEn : (defaultRt?.nameEn || 'Deluxe Cottage');
            return {
              ...rt,
              nameEn: resolvedRtNameEn,
              units: (rt.units || []).map((u: any) => {
                const defaultUnit = defaultRt?.units.find((du) => du.id === u.id);
                const resolvedUnitNameEn = u.nameEn && !bengaliRegex.test(u.nameEn)
                  ? u.nameEn
                  : (defaultUnit?.nameEn || (u.roomNumber ? `Unit (${u.roomNumber})` : 'Room'));
                return {
                  ...u,
                  nameEn: resolvedUnitNameEn,
                  nameBn: u.nameBn || defaultUnit?.nameBn || u.name,
                };
              }),
            };
          });
          setRoomTypes(mergedRoomTypes);
        }
        if (parsed.priceRules) setPriceRules(parsed.priceRules);
        if (parsed.extraAddons) setExtraAddons(parsed.extraAddons);
        if (parsed.bookings) {
          const bengaliRegex = /[\u0980-\u09FF]/;
          // Hydrate bookings with guestNameEn/Bn if missing
          const hydratedBookings = parsed.bookings.map((b: Booking) => {
            const defBooking = initial.bookings.find((ib) => ib.id === b.id || ib.bookingCode === b.bookingCode);
            const resolvedGuestNameEn = b.guestNameEn && !bengaliRegex.test(b.guestNameEn)
              ? b.guestNameEn
              : (defBooking?.guestNameEn || 'Tanvir Ahmed');
            return {
              ...b,
              guestNameBn: b.guestNameBn || defBooking?.guestNameBn || b.guestName,
              guestNameEn: resolvedGuestNameEn,
              notesBn: b.notesBn || defBooking?.notesBn || b.notes,
              notesEn: b.notesEn && !bengaliRegex.test(b.notesEn) ? b.notesEn : (defBooking?.notesEn || 'Direct Guest Booking'),
            };
          });
          setBookings(hydratedBookings);
        } else {
          setBookings(initial.bookings);
        }
        if (parsed.guests) {
          const bengaliRegex = /[\u0980-\u09FF]/;
          const hydratedGuests = parsed.guests.map((g: Guest) => {
            const defGuest = initial.guests.find((ig) => ig.id === g.id || ig.phone === g.phone);
            const resolvedNameEn = g.nameEn && !bengaliRegex.test(g.nameEn)
              ? g.nameEn
              : (defGuest?.nameEn || 'Tanvir Ahmed');
            return {
              ...g,
              nameBn: g.nameBn || defGuest?.nameBn || g.name,
              nameEn: resolvedNameEn,
              cityBn: g.cityBn || defGuest?.cityBn || g.city,
              cityEn: g.cityEn && !bengaliRegex.test(g.cityEn) ? g.cityEn : (defGuest?.cityEn || 'Dhaka'),
              tagsBn: g.tagsBn || defGuest?.tagsBn || g.tags,
              tagsEn: g.tagsEn || defGuest?.tagsEn || g.tags,
              preferencesNotesBn: g.preferencesNotesBn || defGuest?.preferencesNotesBn || g.preferencesNotes,
              preferencesNotesEn: g.preferencesNotesEn && !bengaliRegex.test(g.preferencesNotesEn)
                ? g.preferencesNotesEn
                : (defGuest?.preferencesNotesEn || 'Enjoys mountain views'),
            };
          });
          setGuests(hydratedGuests);
        } else {
          setGuests(initial.guests);
        }
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.messageTemplates) setMessageTemplates(parsed.messageTemplates);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.numeralFormat) setNumeralFormat(parsed.numeralFormat);
        return;
      }
    } catch {
      // ignore parsing error and fallback
    }

    // Default seed
    setBookings(initial.bookings);
    setGuests(initial.guests);
    setPayments(initial.payments);
  }, []);

  // Save state on change
  useEffect(() => {
    if (bookings.length > 0) {
      try {
        const payload = {
          property,
          roomTypes,
          priceRules,
          extraAddons,
          bookings,
          guests,
          payments,
          messageTemplates,
          language,
          numeralFormat,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // quota exceeded or private mode
      }
    }
  }, [property, roomTypes, priceRules, extraAddons, bookings, guests, payments, messageTemplates, language, numeralFormat]);

  // Keep selectedBooking in sync with bookings list
  useEffect(() => {
    if (selectedBooking) {
      const refreshed = bookings.find((b) => b.id === selectedBooking.id);
      if (refreshed) {
        setSelectedBooking(refreshed);
      }
    }
  }, [bookings]);

  // Toast Helper
  const showToast = (
    message: string,
    options?: { type?: ToastInfo['type']; undoAction?: () => void; undoLabel?: string }
  ) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newToast: ToastInfo = {
      id,
      message,
      type: options?.type || 'info',
      undoAction: options?.undoAction,
      undoLabel: options?.undoLabel || (language === 'bn' ? 'পূর্বাবস্থায় ফেরান' : 'Undo'),
    };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'));
  };

  const toggleNumeralFormat = () => {
    // The १२৩ digit toggle only works in Bangla mode
    if (language === 'bn') {
      setNumeralFormat((prev) => (prev === 'bn' ? 'en' : 'bn'));
    }
  };

  const addAuditLog = (actionBn: string, actionEn: string, details: string) => {
    const roleUser = staffUsers.find((u) => u.role === currentRole);
    const actorName = roleUser ? `${roleUser.nameBn} (${currentRole})` : currentRole;
    const now = new Date();
    const timeStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: timeStr,
      actor: actorName,
      role: currentRole,
      actionBn,
      actionEn,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const updateProperty = (updates: Partial<PropertySettings>) => {
    setProperty((prev) => ({ ...prev, ...updates }));
    addAuditLog('প্রপার্টি তথ্য আপডেট', 'Updated Property Info', 'রিসোর্টের মূল তথ্য আপডেট করা হয়েছে');
    showToast(language === 'bn' ? 'প্রপার্টির তথ্য সংরক্ষিত হয়েছে' : 'Property settings saved', { type: 'success' });
  };

  const updateRoomType = (id: string, updates: Partial<RoomType>) => {
    setRoomTypes((prev) => prev.map((rt) => (rt.id === id ? { ...rt, ...updates } : rt)));
    addAuditLog('রুম ক্যাটাগরি আপডেট', 'Updated Room Category', `রুম আইডি ${id} পরিবর্তন করা হয়েছে`);
    showToast(language === 'bn' ? 'রুমের তথ্য আপডেট হয়েছে' : 'Room type updated', { type: 'success' });
  };

  const addPriceRule = (rule: Omit<SeasonalPriceRule, 'id'>) => {
    const id = 'rule-' + Date.now();
    const newRule: SeasonalPriceRule = { ...rule, id };
    setPriceRules((prev) => [...prev, newRule]);
    addAuditLog('নতুন সিজনাল প্রাইস রুল', 'Added Price Rule', `${rule.nameBn} যুক্ত করা হয়েছে`);
    showToast(language === 'bn' ? 'নতুন মূল্যের নিয়ম যুক্ত হয়েছে' : 'New price rule added', { type: 'success' });
  };

  const updatePriceRule = (id: string, updates: Partial<SeasonalPriceRule>) => {
    setPriceRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    addAuditLog('প্রাইস রুল আপডেট', 'Updated Price Rule', `রুল ${id} সংশোধিত হয়েছে`);
    showToast(language === 'bn' ? 'মূল্য নিয়ম আপডেট করা হয়েছে' : 'Price rule updated', { type: 'success' });
  };

  const togglePriceRule = (id: string) => {
    setPriceRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextActive = !r.isActive;
          addAuditLog('প্রাইস রুল অবস্থা পরিবর্তন', 'Toggled Price Rule', `${r.nameBn} ${nextActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}`);
          return { ...r, isActive: nextActive };
        }
        return r;
      })
    );
  };

  const deletePriceRule = (id: string) => {
    const deleted = priceRules.find((r) => r.id === id);
    setPriceRules((prev) => prev.filter((r) => r.id !== id));
    if (deleted) {
      addAuditLog('প্রাইস রুল মুছে ফেলা', 'Deleted Price Rule', `${deleted.nameBn} অপসারণ`);
      showToast(language === 'bn' ? 'নিয়মটি মুছে ফেলা হয়েছে' : 'Price rule removed', {
        type: 'info',
        undoAction: () => {
          setPriceRules((prev) => [...prev, deleted]);
          showToast(language === 'bn' ? 'মুছে ফেলা বাতিল হয়েছে' : 'Rule restored');
        },
      });
    }
  };

  const updateExtraAddon = (id: string, updates: Partial<ExtraAddon>) => {
    setExtraAddons((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    showToast(language === 'bn' ? 'অ্যাড-অন সার্ভিস আপডেট হয়েছে' : 'Addon updated', { type: 'success' });
  };

  const addOrUpdateGuestFromBooking = (booking: Booking) => {
    const cleanPhone = booking.guestPhone.replace(/\D/g, '');
    setGuests((prev) => {
      const existing = prev.find((g) => g.phone.replace(/\D/g, '') === cleanPhone);
      if (existing) {
        return prev.map((g) =>
          g.id === existing.id
            ? {
                ...g,
                name: booking.guestName,
                totalStays: g.totalStays + 1,
                totalSpent: g.totalSpent + booking.totalAmount,
                lastStayDate: booking.checkIn,
                isReturning: true,
              }
            : g
        );
      } else {
        const newGuest: Guest = {
          id: 'guest-' + Date.now(),
          name: booking.guestName,
          nameBn: booking.guestNameBn || booking.guestName,
          nameEn: booking.guestNameEn || booking.guestName,
          phone: booking.guestPhone,
          email: booking.guestEmail,
          totalStays: 1,
          totalSpent: booking.totalAmount,
          lastStayDate: booking.checkIn,
          tags: [booking.source === 'website' ? 'Direct Guest' : 'New Guest'],
          tagsBn: [booking.source === 'website' ? 'সরাসরি গেস্ট' : 'নতুন গেস্ট'],
          tagsEn: [booking.source === 'website' ? 'Direct Guest' : 'New Guest'],
          preferencesNotes: booking.notes || 'প্রথম আগমন',
          preferencesNotesBn: booking.notesBn || booking.notes || 'প্রথম আগমন',
          preferencesNotesEn: booking.notesEn || booking.notes || 'First arrival',
          isReturning: false,
        };
        return [newGuest, ...prev];
      }
    });
  };

  const addBooking = (newBookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'updatedAt'>): Booking => {
    const id = 'book-' + Date.now();
    const codeNum = Math.floor(2050 + Math.random() * 800);
    const bookingCode = `MP-${codeNum}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const booking: Booking = {
      ...newBookingData,
      id,
      bookingCode,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    setBookings((prev) => [booking, ...prev]);
    addOrUpdateGuestFromBooking(booking);
    addAuditLog(
      'নতুন বুকিং তৈরি',
      'Created Booking',
      `#${bookingCode} (${booking.guestName}) - ${language === 'bn' ? `রুম মোট: ${formatCurrency(booking.totalAmount, 'bn')}` : `Total: ${formatCurrency(booking.totalAmount, 'en')}`}`
    );

    // If advance payment was marked paid directly during creation, record the payment
    if (booking.advancePaid > 0 && booking.advanceMethod) {
      recordPayment({
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        guestName: booking.guestName,
        guestPhone: booking.guestPhone,
        amount: booking.advancePaid,
        method: booking.advanceMethod,
        transactionId: booking.advanceTxnId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'advance',
        status: 'verified',
        recordedBy: currentRole,
        notes: 'বুকিং তৈরির সময় সরাসরি প্রাপ্তি',
      });
    }

    showToast(
      language === 'bn'
        ? `বুকিং #${bookingCode} সফলভাবে তৈরি হয়েছে!`
        : `Booking #${bookingCode} created successfully!`,
      { type: 'success' }
    );

    return booking;
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = {
            ...b,
            ...updates,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          };
          return updated;
        }
        return b;
      })
    );
    addAuditLog('বুকিং আপডেট', 'Updated Booking', `বুকিং আইডি ${id} পরিবর্তন করা হয়েছে`);
  };

  const cancelBooking = (id: string, reason?: string) => {
    const target = bookings.find((b) => b.id === id);
    if (!target) return;

    const previousStatus = target.status;
    updateBooking(id, {
      status: 'cancelled',
      notes: target.notes ? `${target.notes} | বাতিল কারণ: ${reason || 'গেস্টের অনুরোধ'}` : `বাতিল কারণ: ${reason || 'গেস্টের অনুরোধ'}`,
    });

    addAuditLog('বুকিং বাতিল', 'Cancelled Booking', `#${target.bookingCode} (${target.guestName}) বাতিল করা হয়েছে`);

    showToast(
      language === 'bn'
        ? `বুকিং #${target.bookingCode} বাতিল করা হয়েছে`
        : `Booking #${target.bookingCode} was cancelled`,
      {
        type: 'warning',
        undoAction: () => {
          updateBooking(id, { status: previousStatus });
          showToast(language === 'bn' ? 'বাতিলকরণ প্রত্যাহার করা হয়েছে' : 'Cancellation undone');
        },
        undoLabel: language === 'bn' ? 'পূর্বাবস্থায় ফেরান' : 'Undo',
      }
    );
  };

  const markAdvancePaid = (params: {
    bookingId: string;
    amount: number;
    method: PaymentMethod;
    transactionId: string;
    notes?: string;
  }) => {
    const target = bookings.find((b) => b.id === params.bookingId);
    if (!target) return;

    const newAdvancePaid = (target.advancePaid || 0) + params.amount;
    const newBalance = Math.max(0, target.totalAmount - newAdvancePaid);
    const newStatus: BookingStatus = target.status === 'awaiting_advance' ? 'confirmed' : target.status;

    updateBooking(params.bookingId, {
      status: newStatus,
      advancePaid: newAdvancePaid,
      advanceStatus: newAdvancePaid >= target.advanceRequired ? 'paid' : 'partial',
      advanceMethod: params.method,
      advanceTxnId: params.transactionId,
      balanceDue: newBalance,
    });

    recordPayment({
      bookingId: target.id,
      bookingCode: target.bookingCode,
      guestName: target.guestName,
      guestPhone: target.guestPhone,
      amount: params.amount,
      method: params.method,
      transactionId: params.transactionId,
      type: 'advance',
      status: 'verified',
      recordedBy: currentRole,
      notes: params.notes || 'অগ্রিম পেমেন্ট কনফার্মেশন',
    });

    addAuditLog(
      'অগ্রিম পেমেন্ট গ্রহণ',
      'Received Advance Payment',
      `#${target.bookingCode} - ${formatCurrency(params.amount, language)} (${params.method}, TxnID: ${params.transactionId})`
    );

    showToast(
      language === 'bn'
        ? `অগ্রিম ${formatCurrency(params.amount, 'bn')} সফলভাবে রেকর্ড করা হয়েছে!`
        : `Advance ${formatCurrency(params.amount, 'en')} recorded!`,
      { type: 'success' }
    );
  };

  const checkInGuest = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    updateBooking(bookingId, { status: 'checked_in' });
    addAuditLog('অতিথি চেক-ইন', 'Guest Check-in', `#${target.bookingCode} (${target.guestName}) চেক-ইন সম্পন্ন`);
    showToast(
      language === 'bn'
        ? `${target.guestName} ভাই/আপু চেক-ইন করেছেন`
        : `${target.guestName} checked in successfully`,
      { type: 'success' }
    );
  };

  const checkOutGuest = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    updateBooking(bookingId, { status: 'checked_out' });
    addAuditLog('অতিথি চেক-আউট', 'Guest Check-out', `#${target.bookingCode} (${target.guestName}) চেক-আউট সম্পন্ন`);
    showToast(
      language === 'bn'
        ? `${target.guestName} চেক-আউট সম্পন্ন করেছেন`
        : `${target.guestName} checked out`,
      { type: 'info' }
    );
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    showToast(language === 'bn' ? 'গেস্টের তথ্য সংরক্ষিত হয়েছে' : 'Guest profile updated', { type: 'success' });
  };

  const recordPayment = (newPayment: Omit<PaymentRecord, 'id' | 'recordedAt'>) => {
    const id = 'pay-' + Date.now();
    const recordedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const rec: PaymentRecord = { ...newPayment, id, recordedAt };
    setPayments((prev) => [rec, ...prev]);
  };

  const updateMessageTemplate = (id: string, updates: Partial<MessageTemplate>) => {
    setMessageTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    showToast(language === 'bn' ? 'মেসেজ টেমপ্লেট সংরক্ষিত হয়েছে' : 'Template saved', { type: 'success' });
  };

  const openAddBooking = (preset?: {
    checkIn?: string;
    checkOut?: string;
    roomTypeId?: string;
    unitId?: string;
  }) => {
    setAddBookingPreset(preset || null);
    setIsAddBookingOpen(true);
  };

  // Guided Tour logic
  const startTour = () => {
    setIsTourActive(true);
    setTourStep(0);
  };
  const nextTourStep = () => {
    setTourStep((s) => s + 1);
  };
  const prevTourStep = () => {
    setTourStep((s) => Math.max(0, s - 1));
  };
  const dismissTour = () => {
    setIsTourActive(false);
    setTourStep(0);
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProperty(initialPropertySettings);
    setRoomTypes(initialRoomTypes);
    setPriceRules(initialPriceRules);
    setExtraAddons(initialExtraAddons);
    setMessageTemplates(initialMessageTemplates);
    const initial = generateInitialBookings();
    setBookings(initial.bookings);
    setGuests(initial.guests);
    setPayments(initial.payments);
    setSelectedBooking(null);
    showToast(
      language === 'bn'
        ? 'ডেমো ডেটা পুনরায় রিসেট করা হয়েছে'
        : 'Demo data reset to defaults',
      { type: 'info' }
    );
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        numeralFormat: language === 'en' ? 'en' : numeralFormat,
        setNumeralFormat,
        toggleNumeralFormat,
        activeScreen,
        setActiveScreen,
        currentRole,
        setCurrentRole,
        isOffline,
        setIsOffline,
        property,
        updateProperty,
        roomTypes,
        updateRoomType,
        priceRules,
        addPriceRule,
        updatePriceRule,
        togglePriceRule,
        deletePriceRule,
        extraAddons,
        updateExtraAddon,
        bookings,
        addBooking,
        updateBooking,
        cancelBooking,
        markAdvancePaid,
        checkInGuest,
        checkOutGuest,
        guests,
        addOrUpdateGuestFromBooking,
        updateGuest,
        payments,
        recordPayment,
        messageTemplates,
        updateMessageTemplate,
        staffUsers,
        auditLogs,
        addAuditLog,
        selectedBooking,
        setSelectedBooking,
        isAddBookingOpen,
        setIsAddBookingOpen,
        addBookingPreset,
        openAddBooking,
        isPublicQrModalOpen,
        setIsPublicQrModalOpen,
        isTourActive,
        tourStep,
        startTour,
        nextTourStep,
        prevTourStep,
        dismissTour,
        toasts,
        showToast,
        dismissToast,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
