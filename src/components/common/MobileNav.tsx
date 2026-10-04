import React, { useState } from 'react';
import { useApp, ActiveScreen } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Plus,
  Menu,
  X,
  BedDouble,
  WalletCards,
  Calculator,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  ExternalLink,
  QrCode,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const {
    language,
    activeScreen,
    setActiveScreen,
    openAddBooking,
    setIsPublicQrModalOpen,
    bookings,
  } = useApp();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const awaitingCount = bookings.filter((b) => b.status === 'awaiting_advance').length;

  const navigateTo = (screen: ActiveScreen) => {
    setActiveScreen(screen);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Slide-up "More" Menu for Mobile */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50">
          <div className="bg-white rounded-t-2xl max-h-[80vh] flex flex-col border-t border-[#A9C0E0]/40 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#A9C0E0]/30">
              <h3 className="font-bold text-[#0E2F76] text-base">
                {language === 'bn' ? 'সকল মেনু ও ফিচার' : 'All Modules & Settings'}
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-2.5 overflow-y-auto">
              <button
                onClick={() => navigateTo('rooms_pricing')}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#A9C0E0]/40 bg-[#F4FEFF] text-[#0E2F76] text-left text-xs font-semibold cursor-pointer active:bg-[#A9C0E0]/20"
              >
                <BedDouble className="w-4 h-4 text-[#0E2F76]" />
                <span>{language === 'bn' ? 'রুম ও সিজনাল রেট' : 'Rooms & Pricing'}</span>
              </button>

              <button
                onClick={() => navigateTo('payments')}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#A9C0E0]/40 bg-[#F4FEFF] text-[#0E2F76] text-left text-xs font-semibold cursor-pointer active:bg-[#A9C0E0]/20"
              >
                <WalletCards className="w-4 h-4 text-[#0E2F76]" />
                <span>{language === 'bn' ? 'পেমেন্ট ও বিকাশ' : 'Payments & bKash'}</span>
              </button>

              <button
                onClick={() => navigateTo('calculator')}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#A9C0E0]/40 bg-[#F4FEFF] text-[#0E2F76] text-left text-xs font-semibold cursor-pointer active:bg-[#A9C0E0]/20"
              >
                <Calculator className="w-4 h-4 text-[#0E2F76]" />
                <span>{language === 'bn' ? 'কমিশন সেভিংস' : 'Savings Calculator'}</span>
              </button>

              <button
                onClick={() => navigateTo('guests')}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#A9C0E0]/40 bg-[#F4FEFF] text-[#0E2F76] text-left text-xs font-semibold cursor-pointer active:bg-[#A9C0E0]/20"
              >
                <Users className="w-4 h-4 text-[#0E2F76]" />
                <span>{language === 'bn' ? 'অতিথি তালিকা (CRM)' : 'Guests CRM'}</span>
              </button>

              <button
                onClick={() => navigateTo('messages')}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#A9C0E0]/40 bg-[#F4FEFF] text-[#0E2F76] text-left text-xs font-semibold cursor-pointer active:bg-[#A9C0E0]/20"
              >
                <MessageSquare className="w-4 h-4 text-[#0E2F76]" />
                <span>{language === 'bn' ? 'মেসেজ টেমপ্লেট' : 'WhatsApp Messages'}</span>
              </button>

              <button
                onClick={() => navigateTo('reports')}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#A9C0E0]/40 bg-[#F4FEFF] text-[#0E2F76] text-left text-xs font-semibold cursor-pointer active:bg-[#A9C0E0]/20"
              >
                <BarChart3 className="w-4 h-4 text-[#0E2F76]" />
                <span>{language === 'bn' ? 'হিসাব ও রিপোর্ট' : 'Reports'}</span>
              </button>

              <button
                onClick={() => navigateTo('settings')}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[#A9C0E0]/40 bg-[#F4FEFF] text-[#0E2F76] text-left text-xs font-semibold cursor-pointer active:bg-[#A9C0E0]/20 col-span-2"
              >
                <Settings className="w-4 h-4 text-[#0E2F76]" />
                <span>{language === 'bn' ? 'রিসোর্ট সেটিংস ও অডিট লগ' : 'Settings & Audit Log'}</span>
              </button>
            </div>

            {/* Public Link Card on Mobile */}
            <div className="p-4 border-t border-[#A9C0E0]/30 bg-[#A9C0E0]/15 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#0E2F76]">
                  {language === 'bn' ? 'পাবলিক গেস্ট বুকিং পেজ' : 'Public Booking Page'}
                </p>
                <p className="text-[11px] text-neutral-600">
                  {language === 'bn' ? '০% ওটিএ কমিশন' : '0% OTA Commission'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    setActiveScreen('public_booking');
                  }}
                  className="px-3 py-1.5 bg-[#0E2F76] text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{language === 'bn' ? 'পেজ খুলুন' : 'Open'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    setIsPublicQrModalOpen(true);
                  }}
                  className="p-1.5 bg-white border border-[#A9C0E0]/50 rounded-lg text-[#0E2F76]"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#A9C0E0]/40 shadow-lg px-2 py-1.5 flex items-center justify-around">
        {/* 1. Today */}
        <button
          onClick={() => setActiveScreen('today')}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] rounded-xl text-[10px] font-semibold cursor-pointer transition-colors ${
            activeScreen === 'today'
              ? 'text-[#0E2F76] font-bold'
              : 'text-neutral-500 hover:text-[#0E2F76]'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 mb-0.5 ${activeScreen === 'today' ? 'text-[#0E2F76]' : 'text-neutral-400'}`} />
          <span>{language === 'bn' ? 'আজ' : 'Today'}</span>
        </button>

        {/* 2. Calendar */}
        <button
          onClick={() => setActiveScreen('calendar')}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] rounded-xl text-[10px] font-semibold cursor-pointer transition-colors ${
            activeScreen === 'calendar'
              ? 'text-[#0E2F76] font-bold'
              : 'text-neutral-500 hover:text-[#0E2F76]'
          }`}
        >
          <Calendar className={`w-5 h-5 mb-0.5 ${activeScreen === 'calendar' ? 'text-[#0E2F76]' : 'text-neutral-400'}`} />
          <span>{language === 'bn' ? 'ক্যালেন্ডার' : 'Calendar'}</span>
        </button>

        {/* 3. Center Elevated + New Booking Button */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={() => openAddBooking()}
            className="w-12 h-12 rounded-full bg-[#0E2F76] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer border-2 border-white"
            title={language === 'bn' ? 'নতুন বুকিং' : 'New Booking'}
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Bookings */}
        <button
          onClick={() => setActiveScreen('bookings')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 min-w-[56px] rounded-xl text-[10px] font-semibold cursor-pointer transition-colors ${
            activeScreen === 'bookings'
              ? 'text-[#0E2F76] font-bold'
              : 'text-neutral-500 hover:text-[#0E2F76]'
          }`}
        >
          <ClipboardList className={`w-5 h-5 mb-0.5 ${activeScreen === 'bookings' ? 'text-[#0E2F76]' : 'text-neutral-400'}`} />
          <span>{language === 'bn' ? 'বুকিং' : 'Bookings'}</span>
          {awaitingCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {/* 5. More */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] rounded-xl text-[10px] font-semibold cursor-pointer transition-colors ${
            isMoreOpen ? 'text-[#0E2F76]' : 'text-neutral-500 hover:text-[#0E2F76]'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5 text-neutral-400" />
          <span>{language === 'bn' ? 'মেনু' : 'More'}</span>
        </button>
      </nav>
    </>
  );
};
