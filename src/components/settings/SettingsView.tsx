import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  Save,
  RotateCcw,
  Download,
  Upload,
  UserCheck,
  CheckCircle2,
  Clock,
  Building,
  CreditCard,
  History,
} from 'lucide-react';
import { PropertySettings } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    language,
    setLanguage,
    numeralFormat,
    setNumeralFormat,
    property,
    updateProperty,
    staffUsers,
    currentRole,
    setCurrentRole,
    auditLogs,
    resetToDemoData,
    showToast,
  } = useApp();

  const [form, setForm] = useState<PropertySettings>(property);
  const [activeTab, setActiveTab] = useState<'profile' | 'policy' | 'staff' | 'audit'>('profile');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProperty(form);
  };

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(localStorage.getItem('direct_booking_desk_state_v1') || '{}');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DirectBookingDesk_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(language === 'bn' ? 'ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে' : 'Backup downloaded', { type: 'success' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0E2F76] tracking-tight">
            {language === 'bn' ? 'রিসোর্ট সেটিংস ও অডিট ট্রায়াল' : 'Settings & Audit Log'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            {language === 'bn'
              ? 'কটেজের প্রোফাইল, বিকাশ মার্চেন্ট নম্বর, স্টাফ রোল ও নিরাপত্তা সংক্রান্ত অডিট হিস্ট্রি।'
              : 'Configure guesthouse profile, merchant accounts, staff permissions, and backup.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white border border-[#A9C0E0]/50 rounded-xl p-1 shadow-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'profile' ? 'bg-[#0E2F76] text-white' : 'text-neutral-600 hover:text-[#0E2F76]'
            }`}
          >
            {language === 'bn' ? 'প্রপার্টি প্রোফাইল' : 'Profile'}
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'policy' ? 'bg-[#0E2F76] text-white' : 'text-neutral-600 hover:text-[#0E2F76]'
            }`}
          >
            {language === 'bn' ? 'পলিসি ও বিকাশ' : 'Policies'}
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'staff' ? 'bg-[#0E2F76] text-white' : 'text-neutral-600 hover:text-[#0E2F76]'
            }`}
          >
            {language === 'bn' ? 'স্টাফ ও পারমিশন' : 'Staff'}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeTab === 'audit' ? 'bg-[#0E2F76] text-white' : 'text-neutral-600 hover:text-[#0E2F76]'
            }`}
          >
            {language === 'bn' ? 'অডিট হিস্ট্রি' : 'Audit Log'}
          </button>
        </div>
      </div>

      {/* TAB 1: PROPERTY PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="card-coastal p-6 bg-white rounded-2xl border border-[#A9C0E0]/50 space-y-4">
          <h3 className="font-bold text-sm text-[#0E2F76] border-b border-[#A9C0E0]/30 pb-2">
            {language === 'bn' ? 'কটেজ / রিসোর্টের সাধারণ তথ্য' : 'General Property Information'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'রিসোর্টের নাম (বাংলা)' : 'Resort Name (Bangla)'}
              </label>
              <input
                type="text"
                value={form.nameBn}
                onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'রিসোর্টের নাম (ইংরেজি)' : 'Resort Name (English)'}
              </label>
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'ঠিকানা (বাংলা)' : 'Address (Bangla)'}
              </label>
              <input
                type="text"
                value={form.locationBn}
                onChange={(e) => setForm({ ...form, locationBn: e.target.value })}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'ঠিকানা (ইংরেজি)' : 'Address (English)'}
              </label>
              <input
                type="text"
                value={form.locationEn}
                onChange={(e) => setForm({ ...form, locationEn: e.target.value })}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'অফিসিয়াল যোগাযোগ মোবাইল' : 'Official Contact Mobile'}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'চেক-ইন সময়' : 'Check-in Time'}
              </label>
              <input
                type="text"
                value={form.checkInTime}
                onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'চেক-আউট সময়' : 'Check-out Time'}
              </label>
              <input
                type="text"
                value={form.checkOutTime}
                onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#A9C0E0]/30 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0E2F76] text-white rounded-xl text-xs font-bold hover:bg-[#0E2F76]/90 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'bn' ? 'তথ্য সংরক্ষণ করুন' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: POLICIES & BKASH */}
      {activeTab === 'policy' && (
        <form onSubmit={handleSave} className="card-coastal p-6 bg-white rounded-2xl border border-[#A9C0E0]/50 space-y-4">
          <h3 className="font-bold text-sm text-[#0E2F76] border-b border-[#A9C0E0]/30 pb-2">
            {language === 'bn' ? 'অগ্রিম পেমেন্ট ও বাতিল নীতিমালা' : 'Advance & Cancellation Policy'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'ডিফল্ট প্রয়োজনীয় অগ্রিম (%)' : 'Default Advance Required (%)'}
              </label>
              <input
                type="number"
                value={form.defaultAdvancePercent}
                onChange={(e) => setForm({ ...form, defaultAdvancePercent: Number(e.target.value) })}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none font-bold text-[#0E2F76]"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'বিকাশ মার্চেন্ট নম্বর (Make Payment)' : 'bKash Merchant'}
              </label>
              <input
                type="text"
                value={form.bKashMerchantNumber}
                onChange={(e) => setForm({ ...form, bKashMerchantNumber: e.target.value })}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none font-mono font-bold text-[#0E2F76]"
              />
            </div>

            <div>
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'নগদ মার্চেন্ট নম্বর' : 'Nagad Merchant'}
              </label>
              <input
                type="text"
                value={form.nagadMerchantNumber}
                onChange={(e) => setForm({ ...form, nagadMerchantNumber: e.target.value })}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'ব্যাংক একাউন্ট বিবরণ' : 'Bank Account Details'}
              </label>
              <input
                type="text"
                value={language === 'bn' ? form.bankDetailsBn : (form.bankDetailsEn || form.bankDetailsBn)}
                onChange={(e) => {
                  if (language === 'bn') {
                    setForm({ ...form, bankDetailsBn: e.target.value });
                  } else {
                    setForm({ ...form, bankDetailsEn: e.target.value });
                  }
                }}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-700 font-bold mb-1">
                {language === 'bn' ? 'বাতিলকরণ ও রিফান্ড নীতি' : 'Cancellation & Refund Policy'}
              </label>
              <textarea
                rows={2}
                value={language === 'bn' ? form.cancellationPolicyBn : (form.cancellationPolicyEn || form.cancellationPolicyBn)}
                onChange={(e) => {
                  if (language === 'bn') {
                    setForm({ ...form, cancellationPolicyBn: e.target.value });
                  } else {
                    setForm({ ...form, cancellationPolicyEn: e.target.value });
                  }
                }}
                className="w-full p-2.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#A9C0E0]/30 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0E2F76] text-white rounded-xl text-xs font-bold hover:bg-[#0E2F76]/90 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{language === 'bn' ? 'নীতিমালা সংরক্ষণ করুন' : 'Save Policies'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: STAFF & ROLES */}
      {activeTab === 'staff' && (
        <div className="card-coastal p-6 bg-white rounded-2xl border border-[#A9C0E0]/50 space-y-4">
          <div className="flex items-center justify-between border-b border-[#A9C0E0]/30 pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0E2F76]">
                {language === 'bn' ? 'স্টাফ একাউন্ট ও অনুমতি তালিকা' : 'Staff Accounts & Permissions'}
              </h3>
              <p className="text-xs text-neutral-500">
                {language === 'bn' ? 'মালিক, ম্যানেজার ও ফ্রন্ট ডেস্ক কর্মকর্তাদের ভূমিকা' : 'Role-based access control'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-neutral-600">
                {language === 'bn' ? 'বর্তমান টেস্ট রোল:' : 'Current Test Role:'}
              </span>
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value as any)}
                className="p-1.5 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-lg text-xs font-bold text-[#0E2F76]"
              >
                <option value="owner">{language === 'bn' ? 'মালিক (Owner)' : 'Owner'}</option>
                <option value="manager">{language === 'bn' ? 'ম্যানেজার (Manager)' : 'Manager'}</option>
                <option value="front_desk">{language === 'bn' ? 'ফ্রন্ট ডেস্ক (Front Desk)' : 'Front Desk'}</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {staffUsers.map((user) => (
              <div
                key={user.id}
                className="p-3.5 bg-[#F4FEFF] rounded-xl border border-[#A9C0E0]/40 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0E2F76] text-white flex items-center justify-center font-bold text-sm">
                    {language === 'bn'
                      ? (user.avatarLetterBn || user.avatarLetter)
                      : (user.avatarLetterEn || user.avatarLetter || user.nameEn?.charAt(0) || 'U')}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0E2F76]">
                      {language === 'bn' ? user.nameBn : (user.nameEn || user.nameBn)}
                    </h4>
                    <p className="text-xs text-neutral-500 font-mono">{user.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-white border border-[#A9C0E0]/50 text-[#0E2F76]">
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Backup & Demo Data Controls */}
          <div className="pt-6 border-t border-[#A9C0E0]/30 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-[#A9C0E0]/60 text-xs font-semibold text-[#0E2F76] hover:bg-[#F4FEFF] rounded-xl cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'bn' ? 'সম্পূর্ণ ডেটা ব্যাকআপ নিন (JSON)' : 'Download Backup'}</span>
            </button>

            <button
              onClick={() => {
                if (confirm(language === 'bn' ? 'আপনি কি ডেমো ডেটা ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?' : 'Reset to default demo data?')) {
                  resetToDemoData();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-rose-300 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'bn' ? 'ডেমো ডেটা রিসেট' : 'Reset Demo Data'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="card-coastal p-6 bg-white rounded-2xl border border-[#A9C0E0]/50 space-y-4">
          <div className="border-b border-[#A9C0E0]/30 pb-3">
            <h3 className="font-bold text-sm text-[#0E2F76] flex items-center gap-2">
              <History className="w-4 h-4 text-[#0E2F76]" />
              <span>{language === 'bn' ? 'নিরাপত্তা ও অ্যাক্টিভিটি অডিট লগ' : 'Security & Action Audit Trail'}</span>
            </h3>
            <p className="text-xs text-neutral-500">
              {language === 'bn' ? 'কে, কখন কোন বুকিং বা পেমেন্ট পরিবর্তন করেছেন তার স্বচ্ছ রেকর্ড।' : 'Tamper-evident audit trail of all staff activities.'}
            </p>
          </div>

          <div className="divide-y divide-[#A9C0E0]/30 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0E2F76]">
                      {language === 'bn' ? log.actionBn : (log.actionEn || log.actionBn)}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-[#A9C0E0]/30 text-[#0E2F76] rounded">
                      {log.role}
                    </span>
                  </div>
                  <p className="text-neutral-600">
                    {language === 'bn' ? (log.detailsBn || log.details) : (log.detailsEn || log.details)}
                  </p>
                </div>

                <div className="text-right text-[11px] text-neutral-400 shrink-0 font-mono">
                  {log.timestamp}
                  <div className="text-neutral-500 font-sans">
                    {language === 'bn' ? (log.actorBn || log.actor) : (log.actorEn || log.actor)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
