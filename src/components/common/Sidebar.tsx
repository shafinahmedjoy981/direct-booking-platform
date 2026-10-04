import React from 'react';
import { useApp, ActiveScreen } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  BedDouble,
  WalletCards,
  Calculator,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  PlusCircle,
  ExternalLink,
  QrCode,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    language,
    activeScreen,
    setActiveScreen,
    openAddBooking,
    setIsPublicQrModalOpen,
    bookings,
  } = useApp();

  const awaitingCount = bookings.filter((b) => b.status === 'awaiting_advance').length;

  const navItems: {
    id: ActiveScreen;
    labelBn: string;
    labelEn: string;
    icon: React.ElementType;
    badge?: number;
  }[] = [
    {
      id: 'today',
      labelBn: 'আজকের ড্যাশবোর্ড',
      labelEn: 'Today Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'calendar',
      labelBn: 'রুম ক্যালেন্ডার',
      labelEn: 'Room Calendar',
      icon: Calendar,
    },
    {
      id: 'bookings',
      labelBn: 'বুকিং তালিকা',
      labelEn: 'All Bookings',
      icon: ClipboardList,
      badge: awaitingCount > 0 ? awaitingCount : undefined,
    },
    {
      id: 'rooms_pricing',
      labelBn: 'রুম ও সিজনাল রেট',
      labelEn: 'Rooms & Pricing',
      icon: BedDouble,
    },
    {
      id: 'payments',
      labelBn: 'পেমেন্ট ও বিকাশ',
      labelEn: 'Payments & bKash',
      icon: WalletCards,
    },
    {
      id: 'calculator',
      labelBn: 'কমিশন সাশ্রয়',
      labelEn: 'Savings Calculator',
      icon: Calculator,
    },
    {
      id: 'guests',
      labelBn: 'অতিথি তালিকা (CRM)',
      labelEn: 'Guests CRM',
      icon: Users,
    },
    {
      id: 'messages',
      labelBn: 'হোয়াটসঅ্যাপ মেসেজ',
      labelEn: 'WhatsApp Messages',
      icon: MessageSquare,
    },
    {
      id: 'reports',
      labelBn: 'হিসাব ও রিপোর্ট',
      labelEn: 'Reports',
      icon: BarChart3,
    },
    {
      id: 'settings',
      labelBn: 'সেটিংস ও ব্যাকআপ',
      labelEn: 'Settings & Audit',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0E2F76] text-white shrink-0 select-none min-h-screen">
      {/* Brand & Property Title */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white text-[#0E2F76] font-extrabold flex items-center justify-center text-sm shadow-xs">
            {language === 'bn' ? 'স' : 'D'}
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-white leading-tight">
              {language === 'bn' ? 'সরাসরি বুকিং ডেস্ক' : 'Direct Booking Desk'}
            </h2>
            <p className="text-[11px] text-[#A9C0E0]">
              {language === 'bn' ? 'রিসোর্ট ও কটেজ ম্যানেজার' : 'Guesthouse & Resort CRM'}
            </p>
          </div>
        </div>

        {/* Primary Action Button: Add Booking */}
        <button
          onClick={() => openAddBooking()}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[#A9C0E0] hover:bg-white text-[#0E2F76] font-bold text-sm py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4 text-[#0E2F76]" />
          <span>{language === 'bn' ? 'নতুন বুকিং (৩০ সেকেন্ড)' : 'New Booking (Fast)'}</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-white/15 text-white font-bold shadow-xs'
                  : 'text-[#A9C0E0] hover:text-white hover:bg-white/8'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#A9C0E0]' : 'text-[#A9C0E0]/80'
                  }`}
                  strokeWidth={1.75}
                />
                <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
              </div>

              {item.badge !== undefined && (
                <span className="bg-amber-400 text-[#0E2F76] font-bold text-[11px] px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Direct Booking Hook & QR Footer Tile */}
      <div className="p-3.5 m-3 rounded-xl bg-white/10 border border-white/10">
        <div className="flex items-center justify-between text-xs text-[#A9C0E0] font-medium mb-1">
          <span>{language === 'bn' ? 'সরাসরি বুকিং লিংক' : 'Direct Booking Page'}</span>
          <span className="text-emerald-400 font-bold">{language === 'bn' ? '০% কমিশন' : '0% Commission'}</span>
        </div>
        <p className="text-[11px] text-white/80 line-clamp-1 mb-2.5">
          meghpunji-sajek.direct/book
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveScreen('public_booking')}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#A9C0E0]" />
            <span>{language === 'bn' ? 'পেজ দেখুন' : 'Preview'}</span>
          </button>
          <button
            onClick={() => setIsPublicQrModalOpen(true)}
            className="p-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-white transition-colors cursor-pointer"
            title={language === 'bn' ? 'কিউআর কোড দেখুন' : 'Show QR'}
          >
            <QrCode className="w-4 h-4 text-[#A9C0E0]" />
          </button>
        </div>
      </div>
    </aside>
  );
};
