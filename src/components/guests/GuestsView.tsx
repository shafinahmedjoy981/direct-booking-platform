import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  generateWhatsAppUrl,
} from '../../utils/formatters';
import {
  getGuestDisplayName,
  getTagDisplayName,
} from '../../utils/i18n';
import {
  Users,
  Search,
  MessageSquare,
  Phone,
  Tag,
  Calendar,
  Send,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Guest } from '../../types';

export const GuestsView: React.FC = () => {
  const {
    language,
    numeralFormat,
    property,
    guests,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Filter guests
  const filteredGuests = guests.filter((g) => {
    const matchSearch =
      !searchTerm ||
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.phone.includes(searchTerm) ||
      (g.city && g.city.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchTag = selectedTag === 'all' || g.tags.includes(selectedTag);

    return matchSearch && matchTag;
  });

  const sendWinterCampaignMessage = () => {
    const repeatGuests = guests.filter((g) => g.totalStays > 1);
    const samplePhone = repeatGuests[0]?.phone || property.phone;
    const text = language === 'bn'
      ? `আসসালামু আলাইকুম! সাজেক ভ্যালিতে শীতকালীন মেঘ ও কুয়াশার পিক সিজন শুরু হতে যাচ্ছে। ${property.nameBn}-এর নিয়মিত অতিথি হিসেবে আপনার জন্য থাকছে বিশেষ ২০% লয়ালটি ছাড়! সরাসরি বুকিং দিতে কল করুন: ${property.phone}`
      : `Hello from ${property.nameEn}! Winter peak season is arriving in Sajek Valley. Book directly for your 20% loyalty guest discount! Call: ${property.phone}`;

    window.open(generateWhatsAppUrl(samplePhone, text), '_blank');
    showToast(
      language === 'bn' ? 'শীতকালীন লয়ালটি প্রচার মেসেজ তৈরি হয়েছে!' : 'Winter loyalty broadcast ready!',
      { type: 'success' }
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0E2F76] tracking-tight">
            {language === 'bn' ? 'অতিথি তালিকা ও সম্পর্ক ব্যবস্থাপনা (মিনি CRM)' : 'Guests & Mini CRM'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            {language === 'bn'
              ? 'নিয়মিত মেহমানদের পছন্দ-অপছন্দ মনে রাখুন এবং এক ক্লিকে হোয়াটসঅ্যাপে শুভেচ্ছা পাঠান।'
              : 'Track repeat guests, total spending, guest preferences, and winter campaign follow-ups.'}
          </p>
        </div>

        {/* Campaign Broadcast Trigger Button */}
        <button
          onClick={sendWinterCampaignMessage}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer shadow-xs transition-colors"
        >
          <span>{language === 'bn' ? 'শীতের স্পেশাল অফার মেসেজ' : 'Winter Guest Follow-up'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-coastal p-3 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={language === 'bn' ? 'নাম, মোবাইল নম্বর বা শহর দিয়ে খুঁজুন...' : 'Search guest name, phone, city...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl text-xs sm:text-sm outline-none font-medium"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#0E2F76] bg-[#F4FEFF] px-3 py-2 rounded-xl border border-[#A9C0E0]/50">
          <Tag className="w-3.5 h-3.5" />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-transparent font-bold outline-none cursor-pointer"
          >
            <option value="all">{language === 'bn' ? 'সকল ট্যাগ' : 'All Tags'}</option>
            <option value="VIP">{language === 'bn' ? 'VIP মেহমান' : 'VIP'}</option>
            <option value="Regular">{language === 'bn' ? 'নিয়মিত (Regular)' : 'Regular'}</option>
            <option value="Family">{language === 'bn' ? 'ফ্যামিলি (Family)' : 'Family'}</option>
            <option value="Couple">{language === 'bn' ? 'কাপল (Couple)' : 'Couple'}</option>
            <option value="Sajek Lover">{language === 'bn' ? 'সাজেক লাভার' : 'Sajek Lover'}</option>
          </select>
        </div>
      </div>

      {/* Guests Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuests.map((guest) => {
          const guestDisplayName = getGuestDisplayName(guest, language);
          return (
            <div
              key={guest.id}
              className="card-coastal p-4 bg-white rounded-2xl border border-[#A9C0E0]/50 flex flex-col justify-between hover:border-[#0E2F76]/40 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-base text-[#0E2F76]">{guestDisplayName}</h4>
                      {guest.isReturning && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {language === 'bn' ? 'রিপিট' : 'Returning'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{guest.phone}</p>
                    {(guest.cityBn || guest.cityEn || guest.city) && (
                      <p className="text-[11px] text-neutral-400">
                        {language === 'bn' ? (guest.cityBn || guest.city) : (guest.cityEn || guest.city)}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-[#0E2F76]">
                      {formatCurrency(guest.totalSpent, language, numeralFormat)}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      {formatNumber(guest.totalStays, language, numeralFormat)} {language === 'bn' ? 'টি অবস্থান' : (guest.totalStays === 1 ? 'stay' : 'stays')}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {guest.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#A9C0E0]/25 text-[#0E2F76]"
                    >
                      {getTagDisplayName(t, language)}
                    </span>
                  ))}
                </div>

                {/* Preferences / Notes */}
                <div className="p-2.5 bg-[#F4FEFF] rounded-xl border border-[#A9C0E0]/30 text-xs text-neutral-600">
                  <span className="font-bold text-[#0E2F76] block text-[11px] mb-0.5">
                    {language === 'bn' ? 'পছন্দ ও বিশেষ নোট:' : 'Preferences:'}
                  </span>
                  <p className="line-clamp-2">
                    {language === 'bn' ? (guest.preferencesNotesBn || guest.preferencesNotes) : (guest.preferencesNotesEn || guest.preferencesNotes)}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 pt-3 border-t border-[#A9C0E0]/30 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  {language === 'bn' ? 'সর্বশেষ অবস্থান:' : 'Last stayed:'} {formatDate(guest.lastStayDate, language, numeralFormat, false)}
                </span>

                <button
                  onClick={() => {
                    const text = language === 'bn'
                      ? `আসসালামু আলাইকুম ${guestDisplayName} ভাই/আপু, ${property.nameBn} থেকে যোগাযোগ করছি...`
                      : `Hello ${guestDisplayName}, greetings from ${property.nameEn}...`;
                    window.open(generateWhatsAppUrl(guest.phone, text), '_blank');
                  }}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'মেসেজ দিন' : 'Message'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
