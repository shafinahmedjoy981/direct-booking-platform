import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Globe,
  HelpCircle,
  ExternalLink,
  Shield,
  Wifi,
  WifiOff,
  Share2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    toggleLanguage,
    numeralFormat,
    toggleNumeralFormat,
    currentRole,
    setCurrentRole,
    isOffline,
    setIsOffline,
    property,
    activeScreen,
    setActiveScreen,
    setIsPublicQrModalOpen,
    startTour,
  } = useApp();

  const isGuestView = activeScreen === 'public_booking';

  return (
    <>
      {isOffline && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            {language === 'bn'
              ? 'অফলাইন মোড সক্রিয়: আপনি ইন্টারনেট ছাড়াই ক্যাশ বুকিং ও ক্যালেন্ডার দেখতে পারছেন। সংযোগ পেলে স্বয়ংক্রিয় সিঙ্ক হবে।'
              : 'Offline Mode: You are viewing local offline cache. Changes will sync once reconnected.'}
          </span>
          <button
            onClick={() => setIsOffline(false)}
            className="underline font-bold ml-2 cursor-pointer hover:opacity-90"
          >
            {language === 'bn' ? 'অনলাইনে ফিরুন' : 'Go Online'}
          </button>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#A9C0E0]/40 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-[0_1px_2px_rgba(14,47,118,0.04)]">
        {/* Left: Property branding & active context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-[#0E2F76] text-base sm:text-lg truncate tracking-tight">
                {language === 'bn' ? property.nameBn : property.nameEn}
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#A9C0E0]/20 text-[#0E2F76] border border-[#A9C0E0]/40">
                {language === 'bn' ? 'সাজেক ভ্যালি' : 'Sajek Valley'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 truncate hidden sm:block">
              {language === 'bn' ? property.locationBn : property.locationEn}
            </p>
          </div>
        </div>

        {/* Right: Quick actions & controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Guest Facing Booking Page Switcher / CTA */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveScreen(isGuestView ? 'today' : 'public_booking')}
              className={`flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
                isGuestView
                  ? 'bg-[#0E2F76] text-white shadow-sm'
                  : 'bg-[#A9C0E0]/20 text-[#0E2F76] hover:bg-[#A9C0E0]/30 border border-[#A9C0E0]/40'
              }`}
              title={language === 'bn' ? 'গেস্টের জন্য সরাসরি বুকিং পেজ' : 'Public guest booking view'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">
                {isGuestView
                  ? language === 'bn'
                    ? 'মালিকের ডেস্কে ফিরুন'
                    : 'Back to Desk'
                  : language === 'bn'
                  ? 'গেস্ট বুকিং পেজ'
                  : 'Direct Booking Page'}
              </span>
            </button>

            <button
              onClick={() => setIsPublicQrModalOpen(true)}
              className="p-1.5 rounded-xl border border-[#A9C0E0]/40 text-[#0E2F76] hover:bg-[#A9C0E0]/20 cursor-pointer"
              title={language === 'bn' ? 'বুকিং লিংক শেয়ার ও কিউআর কোড' : 'Share booking link & QR'}
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-[#A9C0E0]/40 hidden sm:block" />

          {/* Role switcher dropdown (for demo permissions test) */}
          <div className="hidden lg:flex items-center gap-1 text-xs text-neutral-600 bg-neutral-50 px-2.5 py-1 rounded-xl border border-neutral-200">
            <Shield className="w-3.5 h-3.5 text-[#0E2F76]" />
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-semibold text-[#0E2F76] outline-none cursor-pointer"
              aria-label="Staff Role"
            >
              <option value="owner">{language === 'bn' ? 'মালিক (Owner)' : 'Owner'}</option>
              <option value="manager">{language === 'bn' ? 'ম্যানেজার (Manager)' : 'Manager'}</option>
              <option value="front_desk">{language === 'bn' ? 'ফ্রন্ট ডেস্ক (Front Desk)' : 'Front Desk'}</option>
            </select>
          </div>

          {/* Numeral toggle (Only active/visible in Bangla mode) */}
          {language === 'bn' && (
            <button
              onClick={toggleNumeralFormat}
              className="px-2 py-1 text-xs font-bold rounded-lg border border-[#A9C0E0]/50 text-[#0E2F76] bg-white hover:bg-[#A9C0E0]/20 cursor-pointer"
              title={language === 'bn' ? 'সংখ্যা ফরম্যাট পরিবর্তন (১২৩ / 123)' : 'Switch numeral format (123)'}
            >
              {numeralFormat === 'bn' ? '১২৩' : '123'}
            </button>
          )}

          {/* Language toggle: বাংলা / ENG */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#0E2F76] text-white hover:bg-[#0E2F76]/90 cursor-pointer transition-colors shadow-xs"
            title={language === 'bn' ? 'Switch to English' : 'Switch to Bangla'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ENG' : 'BN'}</span>
          </button>

          {/* Quick Offline toggle button for test */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
              isOffline
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'border-[#A9C0E0]/40 text-neutral-600 hover:bg-[#A9C0E0]/20'
            }`}
            title={isOffline ? 'Online test' : 'Offline test'}
          >
            {isOffline ? <WifiOff className="w-4 h-4 text-amber-700" /> : <Wifi className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Guided Tour trigger */}
          <button
            onClick={startTour}
            className="p-1.5 rounded-lg text-[#0E2F76] hover:bg-[#A9C0E0]/20 border border-[#A9C0E0]/40 cursor-pointer"
            title={language === 'bn' ? 'সহায়িকা ও গাইড' : 'Quick Tour'}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>
    </>
  );
};
