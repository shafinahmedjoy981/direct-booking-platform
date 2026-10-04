import { Language, NumeralFormat } from '../types';

export const BANGLA_NUMERALS: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export const BANGLA_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export const ENGLISH_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const BANGLA_DAYS = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
];

export const ENGLISH_DAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

/**
 * Shared Number Formatter:
 * When lang === 'en', ALWAYS returns English 0-9 digits.
 * When lang === 'bn', respects numeralFormat (defaults to 'bn' = ০-৯).
 * Also accepts (val, numeralFormat) for backward compatibility when lang defaults to 'bn'.
 */
export function formatNumber(
  val: number | string,
  langOrNumeralFormat: Language | NumeralFormat = 'bn',
  maybeNumeralFormat?: NumeralFormat
): string {
  const str = String(val ?? 0);

  let lang: Language = 'bn';
  let numFmt: NumeralFormat = 'bn';

  if (maybeNumeralFormat !== undefined) {
    lang = langOrNumeralFormat as Language;
    numFmt = maybeNumeralFormat;
  } else {
    if (langOrNumeralFormat === 'en') {
      return str;
    }
    // If only 'bn' was passed, default both to bn
    numFmt = langOrNumeralFormat as NumeralFormat;
  }

  // English mode is strictly 0-9
  if (lang === 'en' || numFmt === 'en') {
    return str;
  }

  return str.replace(/[0-9]/g, (match) => BANGLA_NUMERALS[match] || match);
}

/**
 * Formats a number with Bangladeshi lakh grouping (e.g. 1,36,080 / 8,300 / 11,340)
 */
export function formatLakhNumber(val: number | string): string {
  const num = typeof val === 'number' ? val : Number(val);
  const rounded = Math.round(isNaN(num) ? 0 : num);
  const isNegative = rounded < 0;
  const absStr = Math.abs(rounded).toString();

  if (absStr.length <= 3) {
    return (isNegative ? '-' : '') + absStr;
  }

  const lastThree = absStr.substring(absStr.length - 3);
  const otherNumbers = absStr.substring(0, absStr.length - 3);
  const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return (isNegative ? '-' : '') + formattedOthers + ',' + lastThree;
}

/**
 * Shared Currency Formatter:
 * - In English mode: "BDT 8,300" (code first, space, English digits, comma grouping).
 * - In Bangla mode: "৳৮,৩০০" (keep the "৳" sign with Bangla digits, or English digits if numeralFormat === 'en').
 */
export function formatCurrency(
  amount: number,
  lang: Language = 'bn',
  numeralFormat: NumeralFormat = 'bn'
): string {
  const formattedWithCommas = formatLakhNumber(amount);
  if (lang === 'en') {
    return `BDT ${formattedWithCommas}`;
  }
  const numberStr = formatNumber(formattedWithCommas, 'bn', numeralFormat);
  return `৳${numberStr}`;
}

/**
 * Format percentage:
 * e.g. 25% in English mode, ২৫% in Bangla mode.
 */
export function formatPercent(
  val: number,
  lang: Language = 'bn',
  numeralFormat: NumeralFormat = 'bn'
): string {
  return `${formatNumber(val, lang, numeralFormat)}%`;
}

/**
 * Parses YYYY-MM-DD safely into a local Date
 */
export function parseDateSafe(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Formats a single date (e.g., 2026-10-02 -> "2 Oct, 2026" or "২ অক্টোবর, ২০২৬")
 */
export function formatDate(
  dateStr: string,
  lang: Language = 'bn',
  numeralFormat: NumeralFormat = 'bn',
  includeYear: boolean = true
): string {
  if (!dateStr) return '';
  const date = parseDateSafe(dateStr);
  const day = date.getDate();
  const monthIdx = date.getMonth();
  const year = date.getFullYear();

  const formattedDay = formatNumber(day, lang, numeralFormat);
  const formattedYear = formatNumber(year, lang, numeralFormat);

  if (lang === 'bn') {
    const month = BANGLA_MONTHS[monthIdx];
    return includeYear 
      ? `${formattedDay} ${month}, ${formattedYear}`
      : `${formattedDay} ${month}`;
  } else {
    const month = ENGLISH_MONTHS[monthIdx];
    return includeYear 
      ? `${formattedDay} ${month}, ${formattedYear}`
      : `${formattedDay} ${month}`;
  }
}

/**
 * Formats date range with night count:
 * English: "2 - 4 Oct, 2026 (2 nights)" or "2 - 3 Oct, 2026 (1 night)"
 * Bangla: "২ - ৪ অক্টোবর, ২০২৬ (২ রাত)" or "২ - ৩ অক্টোবর, ২০২৬ (১ রাত)"
 */
export function formatDateRange(
  checkIn: string,
  checkOut: string,
  lang: Language = 'bn',
  numeralFormat: NumeralFormat = 'bn'
): string {
  if (!checkIn || !checkOut) return '';
  const start = parseDateSafe(checkIn);
  const end = parseDateSafe(checkOut);
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  const startDay = formatNumber(start.getDate(), lang, numeralFormat);
  const endDay = formatNumber(end.getDate(), lang, numeralFormat);
  const nightsFormatted = formatNumber(nights, lang, numeralFormat);

  const nightsText = lang === 'bn' 
    ? `${nightsFormatted} রাত` 
    : `${nightsFormatted} night${nights === 1 ? '' : 's'}`;

  if (start.getMonth() === end.getMonth()) {
    const month = lang === 'bn' ? BANGLA_MONTHS[start.getMonth()] : ENGLISH_MONTHS[start.getMonth()];
    return `${startDay} - ${endDay} ${month} (${nightsText})`;
  } else {
    const startMonth = lang === 'bn' ? BANGLA_MONTHS[start.getMonth()] : ENGLISH_MONTHS[start.getMonth()];
    const endMonth = lang === 'bn' ? BANGLA_MONTHS[end.getMonth()] : ENGLISH_MONTHS[end.getMonth()];
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} (${nightsText})`;
  }
}

/**
 * Calculates number of nights between two date strings
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1;
  const start = parseDateSafe(checkIn);
  const end = parseDateSafe(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const nights = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 1;
}

/**
 * Formats a phone number for Bangladeshi display and international deep-links
 */
export function cleanBangladeshiPhone(raw: string): string {
  let cleaned = (raw || '').replace(/\D/g, '');
  if (cleaned.startsWith('880')) {
    cleaned = cleaned.slice(3);
  }
  if (!cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

/**
 * Generates direct wa.me link with prefilled text
 */
export function generateWhatsAppUrl(phone: string, text: string): string {
  let cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '88' + cleaned;
  } else if (!cleaned.startsWith('880') && cleaned.length === 10) {
    cleaned = '880' + cleaned;
  }
  const encodedText = encodeURIComponent(text.trim());
  return `https://wa.me/${cleaned}?text=${encodedText}`;
}

/**
 * Relative date descriptor
 */
export function getRelativeDayDescription(dateStr: string, lang: Language): string {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) {
    return lang === 'bn' ? 'আজ' : 'Today';
  } else if (dateStr === tomorrowStr) {
    return lang === 'bn' ? 'আগামীকাল' : 'Tomorrow';
  } else if (dateStr === yesterdayStr) {
    return lang === 'bn' ? 'গতকাল' : 'Yesterday';
  }
  return '';
}
