import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  generateWhatsAppUrl,
  formatDate,
  formatCurrency,
} from '../../utils/formatters';
import {
  MessageSquare,
  Copy,
  Check,
  Send,
  Edit2,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { MessageTemplate } from '../../types';

export const MessagesView: React.FC = () => {
  const {
    language,
    numeralFormat,
    property,
    messageTemplates,
    updateMessageTemplate,
    showToast,
  } = useApp();

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<MessageTemplate['key']>('confirmation');
  const [testPhone, setTestPhone] = useState<string>('01711223344');
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const activeTemplate = messageTemplates.find((t) => t.key === selectedTemplateKey) || messageTemplates[0];

  // Editable body buffer
  const [editBodyBn, setEditBodyBn] = useState(activeTemplate.bodyBn);
  const [editBodyEn, setEditBodyEn] = useState(activeTemplate.bodyEn);

  const handleSelectTemplate = (key: MessageTemplate['key']) => {
    setSelectedTemplateKey(key);
    const tmpl = messageTemplates.find((t) => t.key === key);
    if (tmpl) {
      setEditBodyBn(tmpl.bodyBn);
      setEditBodyEn(tmpl.bodyEn);
      setIsEditing(false);
    }
  };

  const handleSaveTemplate = () => {
    updateMessageTemplate(activeTemplate.id, {
      bodyBn: editBodyBn,
      bodyEn: editBodyEn,
    });
    setIsEditing(false);
  };

  // Generate live substituted preview text
  const rawText = language === 'bn' ? (isEditing ? editBodyBn : activeTemplate.bodyBn) : (isEditing ? editBodyEn : activeTemplate.bodyEn);
  const livePreview = rawText
    .replace(/{guest_name}/g, language === 'bn' ? 'তানভীর আহমেদ' : 'Tanvir Ahmed')
    .replace(/{property_name}/g, language === 'bn' ? property.nameBn : property.nameEn)
    .replace(/{booking_code}/g, 'MP-2041')
    .replace(/{room_name}/g, language === 'bn' ? 'ক্লাউড ভিউ ডিলাক্স কটেজ' : 'Cloud View Deluxe Cottage')
    .replace(/{unit_number}/g, language === 'bn' ? 'মেঘডানা (C-101)' : 'Cloud Drift (C-101)')
    .replace(/{dates}/g, language === 'bn' ? '১২ - ১৪ অক্টোবর' : '12 - 14 Oct')
    .replace(/{nights}/g, language === 'bn' ? (numeralFormat === 'bn' ? '২' : '2') : '2')
    .replace(/{adults}/g, language === 'bn' ? (numeralFormat === 'bn' ? '২' : '2') : '2')
    .replace(/{total_amount}/g, formatCurrency(10200, language, numeralFormat))
    .replace(/{advance_required}/g, formatCurrency(5100, language, numeralFormat))
    .replace(/{advance_paid}/g, formatCurrency(5100, language, numeralFormat))
    .replace(/{advance_method}/g, language === 'bn' ? 'বিকাশ' : 'bKash')
    .replace(/{balance_due}/g, formatCurrency(5100, language, numeralFormat))
    .replace(/{txn_id}/g, 'BKH987612')
    .replace(/{location}/g, language === 'bn' ? property.locationBn : property.locationEn)
    .replace(/{phone}/g, property.phone)
    .replace(/{bkash_number}/g, property.bKashMerchantNumber)
    .replace(/{payment_link}/g, 'https://meghpunjisajek.com/pay/mp2041');

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(livePreview);
    setCopied(true);
    showToast(language === 'bn' ? 'মেসেজ টেক্সট কপি করা হয়েছে!' : 'Message copied to clipboard!', { type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTestWhatsApp = () => {
    window.open(generateWhatsAppUrl(testPhone, livePreview), '_blank');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0E2F76] tracking-tight">
          {language === 'bn' ? 'হোয়াটসঅ্যাপ মেসেজ ও কনফার্মেশন টেমপ্লেট' : 'WhatsApp Message Templates'}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
          {language === 'bn'
            ? 'এক ট্যাপে পাঠাতে তৈরি করা পেশাদার মেসেজ টেমপ্লেট। বাংলা ও ইংরেজি উভয় ভাষায় ব্যবহার উপযোগী।'
            : 'Pre-written WhatsApp confirmation and reminder templates with auto-inserted booking variables.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Template Selectors (4 cols) */}
        <div className="md:col-span-4 space-y-2">
          {messageTemplates.map((tmpl) => {
            const isSelected = tmpl.key === selectedTemplateKey;
            return (
              <button
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl.key)}
                className={`w-full p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#0E2F76] bg-[#0E2F76] text-white shadow-xs'
                    : 'border-[#A9C0E0]/50 bg-white text-[#0A0A0A] hover:bg-[#F4FEFF]'
                }`}
              >
                <div>
                  <div className="font-bold text-xs sm:text-sm">
                    {language === 'bn' ? tmpl.titleBn : tmpl.titleEn}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-[#A9C0E0]' : 'text-neutral-500'}`}>
                    {tmpl.key}
                  </div>
                </div>
                <MessageSquare className={`w-4 h-4 ${isSelected ? 'text-[#A9C0E0]' : 'text-[#0E2F76]'}`} />
              </button>
            );
          })}

          <div className="p-4 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl text-xs text-neutral-600 space-y-2 mt-4">
            <span className="font-bold text-[#0E2F76] block">
              {language === 'bn' ? 'স্বয়ংক্রিয় ভেরিয়েবলসমূহ:' : 'Available Auto-Variables:'}
            </span>
            <div className="flex flex-wrap gap-1 font-mono text-[10px]">
              {['{guest_name}', '{booking_code}', '{room_name}', '{dates}', '{total_amount}', '{advance_paid}', '{payment_link}'].map((v) => (
                <span key={v} className="bg-white px-1.5 py-0.5 rounded border border-[#A9C0E0]/40 text-[#0E2F76]">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live WhatsApp Screen Preview & Editor (8 cols) */}
        <div className="md:col-span-8 space-y-4">
          <div className="card-coastal p-5 bg-white rounded-2xl border border-[#A9C0E0]/50 space-y-4">
            <div className="flex items-center justify-between border-b border-[#A9C0E0]/30 pb-3">
              <div>
                <h3 className="font-bold text-base text-[#0E2F76]">
                  {language === 'bn' ? activeTemplate.titleBn : activeTemplate.titleEn}
                </h3>
                <span className="text-xs text-neutral-500">
                  {language === 'bn' ? 'লাইভ প্রিভিউ ও টেস্ট পাঠানো' : 'Live Preview & Test Send'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3 py-1.5 rounded-lg border border-[#A9C0E0]/60 text-xs font-semibold text-[#0E2F76] hover:bg-[#F4FEFF] cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditing ? (language === 'bn' ? 'প্রিভিউ দেখুন' : 'Preview') : (language === 'bn' ? 'টেক্সট সম্পাদনা' : 'Edit')}</span>
                </button>
              </div>
            </div>

            {/* Template Editor Mode */}
            {isEditing ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-neutral-700">
                  {language === 'bn' ? 'টেমপ্লেটের ভাষা সংশোধন করুন:' : 'Edit Template Body:'}
                </label>
                <textarea
                  rows={10}
                  value={language === 'bn' ? editBodyBn : editBodyEn}
                  onChange={(e) => language === 'bn' ? setEditBodyBn(e.target.value) : setEditBodyEn(e.target.value)}
                  className="w-full p-3 bg-[#F4FEFF] border border-[#A9C0E0]/60 rounded-xl font-mono text-xs outline-none text-neutral-800 leading-relaxed"
                />
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-[#0E2F76] text-white text-xs font-bold rounded-xl hover:bg-[#0E2F76]/90 cursor-pointer"
                >
                  {language === 'bn' ? 'টেমপ্লেট সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            ) : (
              /* Simulated WhatsApp Chat Bubble */
              <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-neutral-300 shadow-inner">
                <div className="max-w-md ml-auto bg-[#E7FFDB] text-[#111B21] p-3.5 rounded-2xl rounded-tr-none shadow-xs text-xs sm:text-sm leading-relaxed whitespace-pre-line border border-emerald-100">
                  {livePreview}
                  <div className="text-[10px] text-neutral-500 text-right mt-1 font-mono">
                    12:30 PM • ✓✓
                  </div>
                </div>
              </div>
            )}

            {/* Test Send & Copy Controls */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#A9C0E0]/30">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-neutral-600">{language === 'bn' ? 'টেস্ট নম্বর:' : 'Test Phone:'}</span>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="p-1.5 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-lg text-xs font-mono outline-none w-32"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPreview}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#A9C0E0]/60 text-xs font-bold text-[#0E2F76] hover:bg-[#F4FEFF] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
                </button>

                <button
                  onClick={handleSendTestWhatsApp}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে টেস্ট পাঠান' : 'Send via WhatsApp'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
