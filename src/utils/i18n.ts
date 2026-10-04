import { Language, NumeralFormat, BookingStatus, BookingSource, PaymentMethod, Unit, RoomType, Guest, Booking, AuditLog } from '../types';
import { formatCurrency, formatNumber } from './formatters';

export const TRANSLATIONS: Record<string, { bn: string; en: string }> = {
  // App brand & navigation
  app_name: { bn: 'সরাসরি বুকিং ডেস্ক', en: 'Direct Booking Desk' },
  app_tagline: { bn: 'রিসোর্ট ও কটেজ ম্যানেজার', en: 'Guesthouse & Resort CRM' },
  brand_logo_letter: { bn: 'স', en: 'D' },
  property_location_tag: { bn: 'সাজেক ভ্যালি', en: 'Sajek Valley' },
  new_booking: { bn: 'নতুন বুকিং', en: 'New Booking' },
  add_booking: { bn: 'নতুন বুকিং যোগ করুন', en: 'Add Booking' },
  new_booking_fast: { bn: 'নতুন বুকিং (৩০ সেকেন্ড)', en: 'New Booking (Fast)' },
  direct_booking_page: { bn: 'গেস্ট বুকিং পেজ', en: 'Direct Booking Page' },
  back_to_desk: { bn: 'মালিকের ডেস্কে ফিরুন', en: 'Back to Desk' },
  share_link_qr: { bn: 'বুকিং লিংক শেয়ার ও কিউআর', en: 'Share Booking Link & QR' },
  role_owner: { bn: 'মালিক (Owner)', en: 'Owner' },
  role_manager: { bn: 'ম্যানেজার (Manager)', en: 'Manager' },
  role_frontdesk: { bn: 'ফ্রন্ট ডেস্ক (Front Desk)', en: 'Front Desk' },
  go_online: { bn: 'অনলাইনে ফিরুন', en: 'Go Online' },
  offline_mode_banner: {
    bn: 'অফলাইন মোড সক্রিয়: আপনি ইন্টারনেট ছাড়াই ক্যাশ বুকিং ও ক্যালেন্ডার দেখতে পারছেন। সংযোগ পেলে স্বয়ংক্রিয় সিঙ্ক হবে।',
    en: 'Offline Mode: You are viewing local offline cache. Changes will sync once reconnected.',
  },

  // Nav menus
  nav_today: { bn: 'আজকের ড্যাশবোর্ড', en: 'Today Dashboard' },
  nav_calendar: { bn: 'রুম ক্যালেন্ডার', en: 'Room Calendar' },
  nav_bookings: { bn: 'বুকিং তালিকা', en: 'All Bookings' },
  nav_rooms_pricing: { bn: 'রুম ও সিজনাল রেট', en: 'Rooms & Pricing' },
  nav_payments: { bn: 'পেমেন্ট ও বিকাশ', en: 'Payments & bKash' },
  nav_calculator: { bn: 'কমিশন সাশ্রয়', en: 'Savings Calculator' },
  nav_guests: { bn: 'অতিথি তালিকা (CRM)', en: 'Guests CRM' },
  nav_messages: { bn: 'হোয়াটসঅ্যাপ মেসেজ', en: 'WhatsApp Messages' },
  nav_reports: { bn: 'হিসাব ও রিপোর্ট', en: 'Reports' },
  nav_settings: { bn: 'সেটিংস ও ব্যাকআপ', en: 'Settings & Audit' },
  all_modules: { bn: 'সকল মেনু ও ফিচার', en: 'All Modules & Settings' },
  more: { bn: 'মেনু', en: 'More' },
  today_short: { bn: 'আজ', en: 'Today' },
  calendar_short: { bn: 'ক্যালেন্ডার', en: 'Calendar' },
  bookings_short: { bn: 'বুকিং', en: 'Bookings' },
  zero_ota_commission: { bn: '০% ওটিএ কমিশন', en: '0% OTA commission' },
  open_page: { bn: 'পেজ খুলুন', en: 'Open' },

  // Dashboard
  today_dashboard_subtitle: {
    bn: 'আজকের সকল চেক-ইন, চেক-আউট ও অগ্রিম কালেকশনের জীবন্ত চিত্র',
    en: "Live summary of today's check-ins, departures, and pending advance collections.",
  },
  hero_checkin_title: { bn: "আজকের চেক-ইন", en: "Today's Check-ins" },
  hero_checkin_helper: { bn: 'চেক-ইন দুপুর ১২:০০ থেকে', en: 'Check-in from 12:00 PM' },
  view_list: { bn: 'তালিকা দেখুন', en: 'View list' },
  today_checkouts: { bn: 'আজকের প্রস্থান', en: "Today's Check-outs" },
  checkout_by: { bn: 'সকাল ১০:৩০ এর মধ্যে প্রদেয়', en: 'Checkout by 10:30 AM' },
  awaiting_advance: { bn: 'অগ্রিম অপেক্ষমাণ', en: 'Awaiting Advance' },
  available_tonight: { bn: 'আজ রাতে খালি', en: 'Available Tonight' },
  total_units_unit: { bn: 'মোট রুমের মধ্যে', en: 'out of total units' },
  direct_this_month: { bn: 'চলতি মাসে সরাসরি বুকিং', en: 'Direct Bookings This Month' },
  direct_saved_commission: { bn: 'কমিশন সাশ্রয় হয়েছে', en: 'Commission Saved' },
  occupancy_rate: { bn: 'আজকের অকুপেন্সি', en: 'Occupancy Tonight' },
  tonight_booked: { bn: 'রুম বুকড রয়েছে', en: 'rooms booked tonight' },
  needs_attention: { bn: 'জরুরি নজর দিন', en: 'Needs Your Attention' },
  action_needed_now: { bn: 'তাৎক্ষণিক ব্যবস্থা গ্রহণ প্রয়োজন', en: 'immediate action required' },
  all_clear_msg: {
    bn: 'চমৎকার! কোনো জরুরি অপেক্ষমাণ অগ্রিম বা পেন্ডিং এন্ট্রি নেই। সবকিছু ঠিকঠাক চলছে।',
    en: 'All clear! No pending advance or unconfirmed arrivals today.',
  },
  send_reminder_whatsapp: { bn: 'হোয়াটসঅ্যাপে তাগিদ দিন', en: 'WhatsApp Reminder' },
  send_advance_reminder: { bn: 'অগ্রিমের তাগিদ পাঠান', en: 'Send Advance Reminder' },
  mark_paid: { bn: 'পরিশোধ চিহ্নিত করুন', en: 'Mark Paid' },
  check_in_guest: { bn: 'চেক-ইন করান', en: 'Check In Guest' },
  view_details: { bn: 'বিস্তারিত দেখুন', en: 'View Details' },
  copy_direct_link: { bn: 'লিংক কপি', en: 'Copy Link' },
  direct_link_copied: { bn: 'সরাসরি বুকিং লিংক কপি হয়েছে!', en: 'Direct booking link copied!' },
  open_preview: { bn: 'প্রিভিউ দেখুন', en: 'Preview' },

  // Sources & Labels
  source_label: { bn: 'উৎস:', en: 'Source:' },
  source_facebook: { bn: 'Facebook', en: 'Facebook' },
  source_whatsapp: { bn: 'WhatsApp', en: 'WhatsApp' },
  source_phone: { bn: 'Phone Call', en: 'Phone Call' },
  source_walk_in: { bn: 'Walk-in', en: 'Walk-in' },
  source_website: { bn: 'Direct Website', en: 'Direct Website' },

  // Statuses
  status_confirmed: { bn: 'নিশ্চিত', en: 'Confirmed' },
  status_awaiting_advance: { bn: 'অগ্রিম অপেক্ষমাণ', en: 'Awaiting Advance' },
  status_checked_in: { bn: 'চেক-ইন সম্পন্ন', en: 'Checked In' },
  status_checked_out: { bn: 'প্রস্থান সম্পন্ন', en: 'Checked Out' },
  status_cancelled: { bn: 'বাতিল', en: 'Cancelled' },
  status_all: { bn: 'সকল বুকিং', en: 'All Bookings' },

  // Payments
  payment_bkash: { bn: 'বিকাশ', en: 'bKash' },
  payment_nagad: { bn: 'নগদ', en: 'Nagad' },
  payment_rocket: { bn: 'রকেট', en: 'Rocket' },
  payment_bank: { bn: 'ব্যাংক ট্রান্সফার', en: 'Bank Transfer' },
  payment_cash: { bn: 'ক্যাশ', en: 'Cash' },

  // Units and common
  rooms_unit: { bn: 'রুম', en: 'rooms' },
  room_single: { bn: 'রুম', en: 'room' },
  guests_unit: { bn: 'জন', en: 'guests' },
  guest_single: { bn: 'জন', en: 'guest' },
  adults_label: { bn: 'প্রাপ্তবয়স্ক', en: 'Adults' },
  children_label: { bn: 'শিশু', en: 'Children' },
  due_label: { bn: 'বাকি:', en: 'Due:' },
  advance_due: { bn: 'অগ্রিম বাকি:', en: 'Advance Due:' },
  advance_received: { bn: 'অগ্রিম প্রাপ্ত:', en: 'Advance Paid:' },
  total_label: { bn: 'সর্বমোট:', en: 'Total:' },
  nightly_rate_label: { bn: 'প্রতি রাতের ভাড়া', en: 'Per night rate' },

  // Search & Filters
  search_placeholder: { bn: 'অতিথির নাম, ফোন নম্বর বা কোড খুঁজুন...', en: 'Search guest name, phone, or booking code...' },
  all_sources: { bn: 'সকল উৎস', en: 'All Sources' },
  filter_by_room: { bn: 'রুম সিলেক্ট করুন', en: 'Select Room' },
  all_rooms: { bn: 'সকল রুম টাইপ', en: 'All Room Types' },
  date_filter: { bn: 'তারিখ ফিল্টার', en: 'Filter by Date' },
};

/**
 * Helper to get translated UI string by key with formatted params
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
  lang: Language = 'bn',
  numeralFormat: NumeralFormat = 'bn'
): string {
  let str = TRANSLATIONS[key]?.[lang] || key;

  if (params) {
    Object.keys(params).forEach((paramKey) => {
      let val = params[paramKey];
      if (typeof val === 'number') {
        val = formatNumber(val, lang, numeralFormat);
      }
      str = str.replace(new RegExp(`{${paramKey}}`, 'g'), String(val));
    });
  }

  return str;
}

/**
 * Formats nights with language and singular/plural:
 * English: "1 night" or "2 nights"
 * Bangla: "১ রাত" or "২ রাত"
 */
export function formatNights(
  nights: number,
  lang: Language = 'bn',
  numeralFormat: NumeralFormat = 'bn'
): string {
  const formattedCount = formatNumber(nights, lang, numeralFormat);
  if (lang === 'en') {
    return `${formattedCount} night${nights === 1 ? '' : 's'}`;
  }
  return `${formattedCount} রাত`;
}

/**
 * Formats rooms count:
 * English: "1 room" or "3 rooms"
 * Bangla: "১টি রুম" or "৩টি রুম"
 */
export function formatRoomsCount(
  rooms: number,
  lang: Language = 'bn',
  numeralFormat: NumeralFormat = 'bn'
): string {
  const formattedCount = formatNumber(rooms, lang, numeralFormat);
  if (lang === 'en') {
    return `${formattedCount} room${rooms === 1 ? '' : 's'}`;
  }
  return `${formattedCount}টি রুম`;
}

/**
 * Formats guests count:
 * English: "1 guest" or "4 guests"
 * Bangla: "১ জন" or "৪ জন"
 */
export function formatGuestsCount(
  guests: number,
  lang: Language = 'bn',
  numeralFormat: NumeralFormat = 'bn'
): string {
  const formattedCount = formatNumber(guests, lang, numeralFormat);
  if (lang === 'en') {
    return `${formattedCount} guest${guests === 1 ? '' : 's'}`;
  }
  return `${formattedCount} জন অতিথি`;
}

/**
 * Formats bookings count:
 * English: "Showing: 12 bookings" or "Showing: 1 booking"
 * Bangla: "১২টি বুকিং দেখানো হচ্ছে" or "১টি বুকিং দেখানো হচ্ছে"
 */
export function formatShowingBookings(
  count: number,
  lang: Language = 'bn',
  numeralFormat: NumeralFormat = 'bn'
): string {
  const formattedCount = formatNumber(count, lang, numeralFormat);
  if (lang === 'en') {
    return `Showing: ${formattedCount} booking${count === 1 ? '' : 's'}`;
  }
  return `মোট: ${formattedCount}টি বুকিং দেখানো হচ্ছে`;
}

/**
 * Formats Due amount:
 * English: "Due: ৳5,200"
 * Bangla: "বাকি: ৳ ৫,২০০"
 */
export function formatDueAmount(
  amount: number,
  lang: Language = 'bn',
  numeralFormat: NumeralFormat = 'bn'
): string {
  const formattedCurrency = formatCurrency(amount, lang, numeralFormat);
  if (lang === 'en') {
    return `Due: ${formattedCurrency}`;
  }
  return `বাকি: ${formattedCurrency}`;
}

/**
 * Source Display Names (normal case in English)
 */
export function getSourceName(source: BookingSource, lang: Language = 'bn'): string {
  switch (source) {
    case 'whatsapp':
      return lang === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp';
    case 'facebook':
      return lang === 'bn' ? 'ফেসবুক' : 'Facebook';
    case 'phone':
      return lang === 'bn' ? 'ফোন কল' : 'Phone Call';
    case 'walk_in':
      return lang === 'bn' ? 'সরাসরি আগমন' : 'Walk-in';
    case 'website':
      return lang === 'bn' ? 'সরাসরি ওয়েবসাইট' : 'Direct Website';
    default:
      return source;
  }
}

/**
 * Status Display Names
 */
export function getStatusName(status: BookingStatus, lang: Language = 'bn'): string {
  switch (status) {
    case 'confirmed':
      return lang === 'bn' ? 'নিশ্চিত' : 'Confirmed';
    case 'awaiting_advance':
      return lang === 'bn' ? 'অগ্রিম অপেক্ষমাণ' : 'Awaiting Advance';
    case 'checked_in':
      return lang === 'bn' ? 'চেক-ইন সম্পন্ন' : 'Checked In';
    case 'checked_out':
      return lang === 'bn' ? 'প্রস্থান সম্পন্ন' : 'Checked Out';
    case 'cancelled':
      return lang === 'bn' ? 'বাতিল' : 'Cancelled';
    default:
      return status;
  }
}

/**
 * Payment Method Display Names
 */
export function getPaymentMethodName(method: PaymentMethod, lang: Language = 'bn'): string {
  switch (method) {
    case 'bkash':
      return lang === 'bn' ? 'বিকাশ' : 'bKash';
    case 'nagad':
      return lang === 'bn' ? 'নগদ' : 'Nagad';
    case 'rocket':
      return lang === 'bn' ? 'রকেট' : 'Rocket';
    case 'bank':
      return lang === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer';
    case 'cash':
      return lang === 'bn' ? 'ক্যাশ' : 'Cash';
    default:
      return method;
  }
}

const BENGALI_CHAR_REGEX = /[\u0980-\u09FF]/;

const BENGALI_GUEST_NAME_MAP: Record<string, string> = {
  'তানভীর আহমেদ': 'Tanvir Ahmed',
  'সামিয়া চৌধুরী': 'Samia Chowdhury',
  'ফারহান ইসলাম': 'Farhan Islam',
  'নুসরাত জাহান': 'Nusrat Jahan',
  'সাদিয়া রহমান': 'Sadia Rahman',
  'রফিকুল হাসান': 'Rafiqul Hasan',
  'মাহমুদুল করিম': 'Mahmudul Karim',
  'নাদিয়া সুলতানা': 'Nadia Sultana',
  'আসিফ মাহমুদ': 'Asif Mahmud',
  'মাবরুর আহমেদ': 'Mabrur Ahmed',
  'শরিফুল আলম': 'Shariful Alam',
  'হাসিবুর রহমান': 'Hasibur Rahman',
  'নাজমুল হুদা': 'Nazmul Huda',
};

const BENGALI_UNIT_NAME_MAP: Record<string, string> = {
  'মেঘডানা (C-101)': 'Cloud Drift (C-101)',
  'মেঘমালা (C-102)': 'Valley Nest (C-102)',
  'নীলগিরি (C-103)': 'Whispering Pine (C-103)',
  'কংলাক সুয়িট (F-201)': 'Sky Haven (S-201)',
  'লুসাই ভিউ (F-202)': 'Lush Horizon (S-202)',
  'তারাভুবন (T-301)': 'Starlight Nest (T-301)',
  'ধ্রুবতারা (T-302)': 'North Star (T-302)',
  'ছায়াপথ (T-303)': 'Milky Way (T-303)',
  'সুকতারা (T-304)': 'Morning Star (T-304)',
  'চন্দ্রবিন্দু (B-401)': 'Moonlight Haven (G-401)',
  'কুয়াশা (B-402)': 'Misty Dome (G-402)',
  'রোদ্দুর (B-403)': 'Sunlit Glow (G-403)',
};

const BENGALI_ROOM_TYPE_MAP: Record<string, string> = {
  'ক্লাউড ভিউ ডিলাক্স কটেজ': 'Cloud View Deluxe Cottage',
  'ভ্যালি ব্রিজ ফ্যামিলি সুইট': 'Valley Breeze Family Suite',
  'সাজেক উডেন ট্রি-হাউস': 'Sajek Wooden Treehouse',
  'স্টারলাইট গ্ল্যাম্পিং ডোম': 'Starlight Glamping Dome',
};

/**
 * Resolves guest name according to language
 */
export function getGuestDisplayName(guest?: Partial<Guest> | null, lang: Language = 'bn'): string {
  if (!guest) return '';
  if (lang === 'en') {
    const enName = guest.nameEn;
    if (enName && !BENGALI_CHAR_REGEX.test(enName)) {
      return enName;
    }
    const raw = guest.name || guest.nameBn || '';
    if (BENGALI_GUEST_NAME_MAP[raw]) {
      return BENGALI_GUEST_NAME_MAP[raw];
    }
    if (BENGALI_CHAR_REGEX.test(raw)) {
      return 'Tanvir Ahmed';
    }
    return raw || 'Guest';
  }
  return guest.nameBn || guest.name || '';
}

/**
 * Resolves booking guest name according to language
 */
export function getBookingGuestName(booking?: Partial<Booking> | null, lang: Language = 'bn'): string {
  if (!booking) return '';
  if (lang === 'en') {
    const enName = booking.guestNameEn;
    if (enName && !BENGALI_CHAR_REGEX.test(enName)) {
      return enName;
    }
    const raw = booking.guestName || booking.guestNameBn || '';
    if (BENGALI_GUEST_NAME_MAP[raw]) {
      return BENGALI_GUEST_NAME_MAP[raw];
    }
    if (BENGALI_CHAR_REGEX.test(raw)) {
      return 'Tanvir Ahmed';
    }
    return raw || 'Guest';
  }
  return booking.guestNameBn || booking.guestName || '';
}

/**
 * Resolves booking notes according to language
 */
export function getBookingNotes(booking?: Partial<Booking> | null, lang: Language = 'bn'): string {
  if (!booking) return '';
  if (lang === 'en') {
    const enNotes = booking.notesEn;
    if (enNotes && !BENGALI_CHAR_REGEX.test(enNotes)) {
      return enNotes;
    }
    const raw = booking.notes || booking.notesBn || '';
    if (BENGALI_CHAR_REGEX.test(raw)) {
      if (raw.includes('ব্যাম্বু') || raw.includes('bamboo')) {
        return 'Special request: Bamboo chicken dinner';
      }
      if (raw.includes('ব্যালকনি') || raw.includes('balcony')) {
        return 'Requested valley-facing balcony cottage';
      }
      return 'Direct guest website booking';
    }
    return raw;
  }
  return booking.notesBn || booking.notes || '';
}

/**
 * Resolves room type name according to language
 */
export function getRoomTypeName(roomType?: Partial<RoomType> | null, lang: Language = 'bn'): string {
  if (!roomType) return '';
  if (lang === 'en') {
    const enName = roomType.nameEn;
    if (enName && !BENGALI_CHAR_REGEX.test(enName)) {
      return enName;
    }
    const raw = roomType.nameBn || '';
    if (BENGALI_ROOM_TYPE_MAP[raw]) {
      return BENGALI_ROOM_TYPE_MAP[raw];
    }
    return 'Cloud View Deluxe Cottage';
  }
  return roomType.nameBn || roomType.nameEn || '';
}

/**
 * Resolves unit name according to language
 */
export function getUnitDisplayName(
  unitId: string,
  roomTypes: RoomType[],
  lang: Language = 'bn'
): string {
  for (const rt of roomTypes) {
    const found = rt.units?.find((u) => u.id === unitId || u.roomNumber === unitId);
    if (found) {
      if (lang === 'en') {
        const enName = found.nameEn;
        if (enName && !BENGALI_CHAR_REGEX.test(enName)) {
          return enName;
        }
        const raw = found.name || found.nameBn || '';
        if (BENGALI_UNIT_NAME_MAP[raw]) {
          return BENGALI_UNIT_NAME_MAP[raw];
        }
        const match = raw.match(/\([A-Z0-9-]+\)/);
        return match ? `Unit ${match[0]}` : found.roomNumber || 'Room';
      }
      return found.nameBn || found.name;
    }
  }
  return unitId;
}

/**
 * Translates guest tag
 */
export function getTagDisplayName(tag: string, lang: Language = 'bn'): string {
  const map: Record<string, { bn: string; en: string }> = {
    VIP: { bn: 'VIP মেহমান', en: 'VIP' },
    Family: { bn: 'ফ্যামিলি', en: 'Family' },
    Couple: { bn: 'কাপল', en: 'Couple' },
    Group: { bn: 'গ্রুপ', en: 'Group' },
    Regular: { bn: 'নিয়মিত', en: 'Regular' },
    'Sajek Lover': { bn: 'সাজেক লাভার', en: 'Sajek Lover' },
  };
  if (map[tag]) {
    return map[tag][lang];
  }
  if (lang === 'en' && BENGALI_CHAR_REGEX.test(tag)) {
    return 'Regular';
  }
  return tag;
}
