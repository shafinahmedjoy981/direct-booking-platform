import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatNumber,
} from '../../utils/formatters';
import {
  BedDouble,
  Users,
  Plus,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit2,
  CheckCircle2,
  Utensils,
  Flame,
  Compass,
  Coffee,
  Info,
} from 'lucide-react';
import { RoomType, SeasonalPriceRule, ExtraAddon } from '../../types';

export const RoomsPricingView: React.FC = () => {
  const {
    language,
    numeralFormat,
    roomTypes,
    priceRules,
    extraAddons,
    togglePriceRule,
    deletePriceRule,
    addPriceRule,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rooms' | 'rules' | 'addons'>('rooms');
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);

  // New rule form state
  const [ruleNameBn, setRuleNameBn] = useState('');
  const [ruleType, setRuleType] = useState<SeasonalPriceRule['type']>('weekend');
  const [rulePercent, setRulePercent] = useState<number>(15);
  const [ruleStart, setRuleStart] = useState<string>('2026-11-15');
  const [ruleEnd, setRuleEnd] = useState<string>('2027-02-15');
  const [ruleMinStay, setRuleMinStay] = useState<number>(1);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleNameBn.trim()) {
      showToast(language === 'bn' ? 'নিয়মের নাম লিখুন' : 'Enter rule name', { type: 'warning' });
      return;
    }

    addPriceRule({
      roomTypeId: 'all',
      nameBn: ruleNameBn,
      nameEn: ruleNameBn,
      type: ruleType,
      daysOfWeek: ruleType === 'weekend' ? [5, 6] : undefined,
      startDate: ruleType !== 'weekend' ? ruleStart : undefined,
      endDate: ruleType !== 'weekend' ? ruleEnd : undefined,
      adjustmentType: 'percentage',
      adjustmentValue: rulePercent,
      minStayNights: ruleMinStay,
      isActive: true,
    });

    setIsAddRuleOpen(false);
    setRuleNameBn('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0E2F76] tracking-tight">
            {language === 'bn' ? 'রুম ও সিজনাল প্রাইসিং ম্যানেজমেন্ট' : 'Rooms & Seasonal Pricing'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            {language === 'bn'
              ? 'উইকেন্ড, শীতের পিক সিজন ও ঈদের স্পেশাল রেট নিয়ন্ত্রণ করুন।'
              : 'Configure room types, weekend uplifts, winter tourism peak, and extra packages.'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-white border border-[#A9C0E0]/50 rounded-xl p-1 shadow-xs">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'rooms' ? 'bg-[#0E2F76] text-white' : 'text-neutral-600 hover:text-[#0E2F76]'
            }`}
          >
            {language === 'bn' ? 'কটেজ ও রুম তালিকা' : 'Room Types'}
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'rules' ? 'bg-[#0E2F76] text-white' : 'text-neutral-600 hover:text-[#0E2F76]'
            }`}
          >
            {language === 'bn' ? 'সিজনাল প্রাইস রুল' : 'Seasonal Rules'}
          </button>
          <button
            onClick={() => setActiveTab('addons')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'addons' ? 'bg-[#0E2F76] text-white' : 'text-neutral-600 hover:text-[#0E2F76]'
            }`}
          >
            {language === 'bn' ? 'অ্যাড-অন সার্ভিস' : 'Addons & Dining'}
          </button>
        </div>
      </div>

      {/* TAB 1: ROOM TYPES */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roomTypes.map((rt) => (
            <div
              key={rt.id}
              className="card-coastal bg-white rounded-2xl overflow-hidden border border-[#A9C0E0]/50 shadow-sm flex flex-col justify-between"
            >
              {/* Image Frame */}
              <div className="h-44 w-full relative overflow-hidden bg-neutral-100">
                <img
                  src={rt.image}
                  alt={rt.nameBn}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-[#0E2F76] text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
                  {formatCurrency(rt.basePrice, language, numeralFormat)} / {language === 'bn' ? 'রাত' : 'night'}
                </div>
                <div className="absolute top-3 right-3 bg-white/90 text-[#0E2F76] px-2 py-1 rounded-lg text-xs font-bold shadow-xs">
                  {formatNumber(rt.units.length, language, numeralFormat)} {language === 'bn' ? 'টি ইউনিট' : 'Units'}
                </div>
              </div>

              {/* Room Details */}
              <div className="p-4 space-y-3 flex-1">
                <div>
                  <h3 className="font-bold text-base text-[#0E2F76]">
                    {language === 'bn' ? rt.nameBn : rt.nameEn}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                    {language === 'bn' ? rt.descriptionBn : rt.descriptionEn}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-neutral-600 pt-2 border-t border-[#A9C0E0]/30">
                  <div className="flex items-center gap-1 font-semibold text-[#0E2F76]">
                    <Users className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? `${formatNumber(rt.capacity.adults, 'bn', numeralFormat)} জন প্রাপ্তবয়স্ক` : `${formatNumber(rt.capacity.adults, 'en', numeralFormat)} Adults`}</span>
                  </div>
                  <span>•</span>
                  <span>{language === 'bn' ? rt.bedTypeBn : rt.bedTypeEn}</span>
                </div>

                {/* Amenities Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {(language === 'bn' ? rt.amenitiesBn : rt.amenitiesEn).slice(0, 4).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-[#A9C0E0]/20 text-[#0E2F76] font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Assigned Units List */}
                <div className="pt-2 text-xs">
                  <span className="font-bold text-[#0E2F76] block mb-1">
                    {language === 'bn' ? 'বরাদ্দকৃত ইউনিটসমূহ:' : 'Units:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rt.units.map((u) => (
                      <span
                        key={u.id}
                        className="px-2 py-1 rounded-lg border border-[#A9C0E0]/50 bg-[#F4FEFF] text-[#0E2F76] font-bold text-xs"
                      >
                        {language === 'bn' ? (u.nameBn || u.name) : (u.nameEn || u.name)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SEASONAL PRICING RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-600">
              {language === 'bn'
                ? 'পিক সিজন ও উইকেন্ডে রেট স্বয়ংক্রিয়ভাবে বুকিংয়ে যুক্ত হবে।'
                : 'Active rules apply automatically during date calculation.'}
            </p>
            <button
              onClick={() => setIsAddRuleOpen(!isAddRuleOpen)}
              className="px-3 py-1.5 bg-[#0E2F76] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? '+ নতুন সিজনাল নিয়ম' : '+ New Rule'}</span>
            </button>
          </div>

          {/* Add Rule Form */}
          {isAddRuleOpen && (
            <form onSubmit={handleCreateRule} className="card-coastal p-4 bg-[#F4FEFF] border-2 border-[#0E2F76] rounded-2xl space-y-3">
              <h4 className="font-bold text-sm text-[#0E2F76]">
                {language === 'bn' ? 'নতুন সিজনাল প্রাইসিং নিয়ম তৈরি' : 'Create Pricing Rule'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">{language === 'bn' ? 'নিয়মের নাম' : 'Rule Name'}</label>
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'যেমন: শীতকালীন পিক রেট' : 'e.g. Winter Peak Rate'}
                    value={ruleNameBn}
                    onChange={(e) => setRuleNameBn(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-[#A9C0E0]/50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">{language === 'bn' ? 'নিয়মের ধরন' : 'Rule Type'}</label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value as any)}
                    className="w-full p-2 bg-white rounded-lg border border-[#A9C0E0]/50 outline-none"
                  >
                    <option value="weekend">{language === 'bn' ? 'উইকেন্ড (শুক্র ও শনিবার)' : 'Weekend (Fri & Sat)'}</option>
                    <option value="winter_peak">{language === 'bn' ? 'শীতকালীন পিক সিজন' : 'Winter Peak Season'}</option>
                    <option value="eid_peak">{language === 'bn' ? 'ঈদের ছুটি ওভাররাইড' : 'Eid Holiday Peak'}</option>
                    <option value="monsoon_offpeak">{language === 'bn' ? 'বর্ষাকালিন অফ-পিক ছাড়' : 'Monsoon Off-peak Discount'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">{language === 'bn' ? 'মূল্য সমন্বয় (%)' : 'Adjustment (%)'}</label>
                  <input
                    type="number"
                    value={rulePercent}
                    onChange={(e) => setRulePercent(Number(e.target.value))}
                    className="w-full p-2 bg-white rounded-lg border border-[#A9C0E0]/50 outline-none"
                  />
                </div>
              </div>

              {ruleType !== 'weekend' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">{language === 'bn' ? 'শুরুর তারিখ' : 'Start Date'}</label>
                    <input
                      type="date"
                      value={ruleStart}
                      onChange={(e) => setRuleStart(e.target.value)}
                      className="w-full p-2 bg-white rounded-lg border border-[#A9C0E0]/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 font-semibold mb-1">{language === 'bn' ? 'শেষ তারিখ' : 'End Date'}</label>
                    <input
                      type="date"
                      value={ruleEnd}
                      onChange={(e) => setRuleEnd(e.target.value)}
                      className="w-full p-2 bg-white rounded-lg border border-[#A9C0E0]/50 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0E2F76] text-white text-xs font-bold rounded-lg hover:bg-[#0E2F76]/90 cursor-pointer"
                >
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Rule'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="px-3 py-2 bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </form>
          )}

          {/* Rules List */}
          <div className="space-y-3">
            {priceRules.map((rule) => (
              <div
                key={rule.id}
                className="card-coastal p-4 bg-white rounded-xl border border-[#A9C0E0]/50 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0E2F76]">
                      {language === 'bn' ? rule.nameBn : rule.nameEn}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        rule.adjustmentValue > 0
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {rule.adjustmentValue > 0 ? `+${rule.adjustmentValue}%` : `${rule.adjustmentValue}%`}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500">
                    {rule.type === 'weekend'
                      ? (language === 'bn' ? 'প্রতি শুক্রবার ও শনিবার রাতের বুকিংয়ে প্রযোজ্য' : 'Applies to Friday & Saturday nights')
                      : (language === 'bn' ? `${rule.startDate} থেকে ${rule.endDate} পর্যন্ত` : `${rule.startDate} to ${rule.endDate}`)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePriceRule(rule.id)}
                    className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  >
                    {rule.isActive ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <ToggleRight className="w-6 h-6 text-emerald-600" />
                        <span className="hidden sm:inline">{language === 'bn' ? 'সক্রিয়' : 'Active'}</span>
                      </span>
                    ) : (
                      <span className="text-neutral-400 flex items-center gap-1">
                        <ToggleLeft className="w-6 h-6 text-neutral-400" />
                        <span className="hidden sm:inline">{language === 'bn' ? 'বন্ধ' : 'Inactive'}</span>
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => deletePriceRule(rule.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADDONS & DINING */}
      {activeTab === 'addons' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {extraAddons.map((addon) => (
            <div
              key={addon.id}
              className="card-coastal p-4 bg-white rounded-xl border border-[#A9C0E0]/50 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-sm text-[#0E2F76]">{language === 'bn' ? addon.nameBn : addon.nameEn}</h4>
                  <span className="text-xs font-extrabold text-[#0E2F76] bg-[#A9C0E0]/20 px-2.5 py-1 rounded-lg">
                    {formatCurrency(addon.price, language, numeralFormat)}
                    {addon.isPerPerson ? (language === 'bn' ? '/জন' : '/person') : ''}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-2">
                  {language === 'bn' ? addon.descriptionBn : addon.descriptionEn}
                </p>
              </div>

              <div className="pt-2 text-[11px] text-neutral-400 flex items-center justify-between border-t border-[#A9C0E0]/30">
                <span>{addon.isPerNight ? (language === 'bn' ? 'প্রতি রাত হিসেবে' : 'Per night') : (language === 'bn' ? 'ওয়ান-টাইম সার্ভিস' : 'One-time service')}</span>
                <span className="font-semibold text-[#0E2F76]">{language === 'bn' ? 'বুকিং ফর্মে অন্তর্ভুক্ত' : 'Available in booking form'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
