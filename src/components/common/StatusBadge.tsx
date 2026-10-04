import React from 'react';
import { BookingStatus, Language } from '../../types';
import { CheckCircle2, Clock, LogIn, LogOut, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: BookingStatus;
  lang: Language;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, lang, size = 'sm' }) => {
  const isSmall = size === 'sm';

  switch (status) {
    case 'confirmed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-emerald-50 text-emerald-800 border-emerald-200/80 ${
            isSmall ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'
          }`}
        >
          <CheckCircle2 className={isSmall ? 'w-3.5 h-3.5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
          <span>{lang === 'bn' ? 'কনফার্মড' : 'Confirmed'}</span>
        </span>
      );

    case 'awaiting_advance':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-amber-50 text-amber-900 border-amber-300/80 ${
            isSmall ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'
          }`}
        >
          <Clock className={isSmall ? 'w-3.5 h-3.5 text-amber-600' : 'w-4 h-4 text-amber-600'} />
          <span>{lang === 'bn' ? 'অগ্রিম অপেক্ষমাণ' : 'Awaiting Advance'}</span>
        </span>
      );

    case 'checked_in':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-sky-50 text-[#0E2F76] border-sky-200/80 ${
            isSmall ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'
          }`}
        >
          <LogIn className={isSmall ? 'w-3.5 h-3.5 text-[#0E2F76]' : 'w-4 h-4 text-[#0E2F76]'} />
          <span>{lang === 'bn' ? 'চেক-ইন করা' : 'Checked In'}</span>
        </span>
      );

    case 'checked_out':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-slate-100 text-slate-700 border-slate-300 ${
            isSmall ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'
          }`}
        >
          <LogOut className={isSmall ? 'w-3.5 h-3.5 text-slate-500' : 'w-4 h-4 text-slate-500'} />
          <span>{lang === 'bn' ? 'চেক-আউট সম্পন্ন' : 'Checked Out'}</span>
        </span>
      );

    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-rose-50 text-rose-800 border-rose-200 ${
            isSmall ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'
          }`}
        >
          <XCircle className={isSmall ? 'w-3.5 h-3.5 text-rose-600' : 'w-4 h-4 text-rose-600'} />
          <span>{lang === 'bn' ? 'বাতিলকৃত' : 'Cancelled'}</span>
        </span>
      );

    default:
      return null;
  }
};
