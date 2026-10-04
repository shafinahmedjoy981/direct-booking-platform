import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const GuidedTour: React.FC = () => {
  const {
    language,
    isTourActive,
    tourStep,
    nextTourStep,
    prevTourStep,
    dismissTour,
    setActiveScreen,
  } = useApp();

  if (!isTourActive) return null;

  const steps = [
    {
      titleBn: '১. আজকের ড্যাশবোর্ড (এক নজরে সব)',
      titleEn: '1. Today Dashboard (All at a glance)',
      descBn: 'আজ কে কে চেক-ইন করছেন, কার চেক-আউট বাকি, আর কাদের অগ্রিম পেমেন্ট এখনো আসেনি—সবকিছু এক স্ক্রিনে পাবেন। "জরুরি নজর দিন" তালিকা থেকে এক ক্লিকেই হোয়াটসঅ্যাপে তাগিদ পাঠাতে পারবেন।',
      descEn: 'Check today arrivals, departures, and pending advances immediately. Reach guests with one tap.',
      screen: 'today' as const,
    },
    {
      titleBn: '২. রুম ক্যালেন্ডার ও ডাবল বুকিং প্রতিরোধ',
      titleEn: '2. Room Calendar & Double-booking Prevention',
      descBn: 'রুমের খালি ঘরে ক্লিক করে সাথে সাথে বুকিং দিন। একই তারিখে অন্য বুকিং থাকলে সিস্টেম সরাসরি সতর্ক করবে এবং ডাবল বুকিং সম্পূর্ণ বন্ধ রাখবে।',
      descEn: 'Interactive room timeline. Automatic overlap detection prevents accidental double booking.',
      screen: 'calendar' as const,
    },
    {
      titleBn: '৩. ৩০ সেকেন্ডে নতুন বুকিং এন্ট্রি',
      titleEn: '3. 30-Second Quick Booking Flow',
      descBn: 'ফোন বা ফেসবুক থেকে গেস্ট নক দিলে মাত্র ৩টি সহজ ধাপে বুকিং তৈরি করুন। তারিখ দিলে স্বয়ংক্রিয়ভাবে সিজনাল রেট ও ৫০% অগ্রিম বিকাশ হিসাব হয়ে যাবে।',
      descEn: 'Fast 3-step booking flow. Instant price calculation with seasonal rules and auto 50% advance.',
      screen: 'bookings' as const,
    },
    {
      titleBn: '৪. ওটিএ কমিশন সাশ্রয় ও সরাসরি বিকাশ পেমেন্ট',
      titleEn: '4. OTA Commission Savings & Direct bKash Links',
      descBn: 'বুকিং.কম বা অন্য ওটিএ-তে ১৫-২০% কমিশন নষ্ট না করে আপনার নিজস্ব ডিরেক্ট বুকিং লিংক শেয়ার করুন। মেহমান বিকাশ বা নগদে পে করলেই পাকা কনফার্মেশন স্লিপ পাবেন।',
      descEn: 'Save 15-20% OTA commissions by sharing your branded direct link with instant bKash advance links.',
      screen: 'calculator' as const,
    },
  ];

  const current = steps[tourStep] || steps[0];
  const isLast = tourStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      dismissTour();
    } else {
      const nextIdx = tourStep + 1;
      nextTourStep();
      if (steps[nextIdx]) {
        setActiveScreen(steps[nextIdx].screen);
      }
    }
  };

  const handlePrev = () => {
    const prevIdx = Math.max(0, tourStep - 1);
    prevTourStep();
    if (steps[prevIdx]) {
      setActiveScreen(steps[prevIdx].screen);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#A9C0E0]/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#0E2F76] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {language === 'bn' ? 'ডেস্ক পরিচিতি গাইড' : 'Desk Quick Tour'}
              </h3>
              <p className="text-xs text-[#A9C0E0]">
                {language === 'bn' ? `ধাপ ${tourStep + 1} / ৪` : `Step ${tourStep + 1} of 4`}
              </p>
            </div>
          </div>
          <button
            onClick={dismissTour}
            className="text-[#A9C0E0] hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h4 className="text-base sm:text-lg font-bold text-[#0E2F76] mb-2">
            {language === 'bn' ? current.titleBn : current.titleEn}
          </h4>
          <p className="text-sm text-neutral-700 leading-relaxed mb-6">
            {language === 'bn' ? current.descBn : current.descEn}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-between pt-4 border-t border-[#A9C0E0]/30">
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === tourStep ? 'w-6 bg-[#0E2F76]' : 'w-2 bg-[#A9C0E0]/50'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {tourStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1.5 rounded-xl border border-[#A9C0E0]/60 text-xs font-semibold text-[#0E2F76] hover:bg-[#F4FEFF] cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'আগেরটি' : 'Back'}</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-1.5 rounded-xl bg-[#0E2F76] text-white text-xs font-bold hover:bg-[#0E2F76]/90 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>{isLast ? (language === 'bn' ? 'শুরু করুন' : 'Finish') : (language === 'bn' ? 'পরবর্তী' : 'Next')}</span>
                {isLast ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
