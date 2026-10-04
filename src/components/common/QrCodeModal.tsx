import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Copy, Check, Share2, Printer, ExternalLink, QrCode } from 'lucide-react';
import { generateWhatsAppUrl } from '../../utils/formatters';

export const QrCodeModal: React.FC = () => {
  const {
    language,
    isPublicQrModalOpen,
    setIsPublicQrModalOpen,
    property,
    showToast,
    setActiveScreen,
  } = useApp();

  const [copied, setCopied] = useState(false);

  if (!isPublicQrModalOpen) return null;

  const publicUrl = window.location.origin ? `${window.location.origin}/?direct=${property.publicSlug}` : `https://directbooking.com/${property.publicSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast(
      language === 'bn' ? 'সরাসরি বুকিং লিংক কপি করা হয়েছে!' : 'Booking link copied!',
      { type: 'success' }
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = language === 'bn'
      ? `আসসালামু আলাইকুম! ${property.nameBn}-এ কোনো ওটিএ কমিশন ছাড়াই সেরা রেটে সরাসরি রুম বুকিং করতে এই লিংকে ক্লিক করুন: ${publicUrl}`
      : `Hello! Book your stay directly at ${property.nameEn} with zero OTA commissions and the best rates: ${publicUrl}`;
    
    window.open(generateWhatsAppUrl(property.phone, text), '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#A9C0E0]/50 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#A9C0E0]/40 bg-[#F4FEFF]">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#0E2F76]" />
            <h3 className="font-bold text-[#0E2F76] text-base">
              {language === 'bn' ? 'সরাসরি বুকিং কিউআর ও লিংক' : 'Direct Booking QR & Link'}
            </h3>
          </div>
          <button
            onClick={() => setIsPublicQrModalOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 text-center">
          <p className="text-xs sm:text-sm text-neutral-600 mb-4">
            {language === 'bn'
              ? 'এই কিউআর কোডটি রিসেপশন, রেস্টুরেন্ট বা ভিজিটিং কার্ডে প্রিন্ট করে রাখুন। মেহমানরা স্ক্যান করেই সরাসরি বিকাশ বা নগদে বুকিং দিতে পারবেন।'
              : 'Print this QR code at your reception or dining tables. Guests scan to book directly with zero OTA commission.'}
          </p>

          {/* Clean Vector Stylized QR Card */}
          <div className="inline-block p-4 bg-white rounded-2xl border-2 border-[#0E2F76] shadow-sm mb-4">
            <div className="w-48 h-48 mx-auto bg-[#F4FEFF] p-3 rounded-xl border border-[#A9C0E0]/40 flex flex-col items-center justify-center relative">
              {/* SVG QR Code Simulation */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#0E2F76]" fill="currentColor">
                {/* Top-left position marker */}
                <rect x="5" y="5" width="25" height="25" rx="3" fill="#0E2F76" />
                <rect x="9" y="9" width="17" height="17" rx="2" fill="#FFFFFF" />
                <rect x="13" y="13" width="9" height="9" rx="1.5" fill="#0E2F76" />

                {/* Top-right position marker */}
                <rect x="70" y="5" width="25" height="25" rx="3" fill="#0E2F76" />
                <rect x="74" y="9" width="17" height="17" rx="2" fill="#FFFFFF" />
                <rect x="78" y="13" width="9" height="9" rx="1.5" fill="#0E2F76" />

                {/* Bottom-left position marker */}
                <rect x="5" y="70" width="25" height="25" rx="3" fill="#0E2F76" />
                <rect x="9" y="74" width="17" height="17" rx="2" fill="#FFFFFF" />
                <rect x="13" y="78" width="9" height="9" rx="1.5" fill="#0E2F76" />

                {/* Data blocks */}
                <rect x="35" y="10" width="5" height="5" />
                <rect x="45" y="10" width="5" height="5" />
                <rect x="55" y="10" width="10" height="5" />
                <rect x="35" y="20" width="10" height="5" />
                <rect x="50" y="20" width="5" height="10" />

                <rect x="10" y="35" width="5" height="10" />
                <rect x="20" y="40" width="5" height="5" />
                <rect x="35" y="35" width="15" height="15" rx="2" fill="#0E2F76" />
                <rect x="55" y="35" width="10" height="5" />
                <rect x="70" y="35" width="5" height="10" />
                <rect x="85" y="40" width="10" height="5" />

                <rect x="10" y="50" width="10" height="5" />
                <rect x="25" y="55" width="5" height="10" />
                <rect x="40" y="55" width="10" height="5" />
                <rect x="60" y="50" width="5" height="15" />
                <rect x="75" y="50" width="10" height="5" />

                <rect x="35" y="70" width="10" height="5" />
                <rect x="50" y="70" width="5" height="10" />
                <rect x="60" y="75" width="10" height="5" />
                <rect x="75" y="70" width="5" height="10" />
                <rect x="85" y="75" width="10" height="10" />

                <rect x="35" y="85" width="5" height="10" />
                <rect x="45" y="80" width="10" height="5" />
                <rect x="60" y="85" width="15" height="5" />
                <rect x="80" y="85" width="5" height="10" />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-lg bg-white shadow-xs border border-[#A9C0E0] flex items-center justify-center font-bold text-xs text-[#0E2F76]">
                  {language === 'bn' ? 'স' : 'D'}
                </div>
              </div>
            </div>

            <p className="mt-2 text-xs font-bold text-[#0E2F76]">
              {language === 'bn' ? property.nameBn : property.nameEn}
            </p>
            <p className="text-[10px] text-neutral-500">
              {language === 'bn' ? 'স্ক্যান করে সরাসরি বুক করুন' : 'Scan to Book Directly'}
            </p>
          </div>

          {/* URL Box */}
          <div className="flex items-center gap-1.5 p-2 bg-[#F4FEFF] border border-[#A9C0E0]/50 rounded-xl mb-4 text-xs font-mono text-[#0E2F76]">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="bg-transparent flex-1 outline-none text-xs truncate select-all px-1"
            />
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-[#0E2F76] text-white rounded-lg font-sans font-bold flex items-center gap-1 hover:bg-[#0E2F76]/90 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-[#A9C0E0]/60 hover:bg-[#F4FEFF] text-[#0E2F76] rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
            </button>

            <button
              onClick={() => {
                setIsPublicQrModalOpen(false);
                setActiveScreen('public_booking');
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#A9C0E0]/30 hover:bg-[#A9C0E0]/50 text-[#0E2F76] rounded-xl text-xs font-semibold cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'পেজে যান' : 'Visit'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
