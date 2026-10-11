import React, { useState } from 'react';

import { useUserPreferences } from '../../context/UserPreferencesContext';
import { CheckCircle2, Sparkles, BookOpen } from 'lucide-react';


export const KhatmaTrackerView: React.FC = () => {
  const { khatmaPlan, updateKhatmaPlan, logWirdPageRead } = useUserPreferences();
  const [customDays, setCustomDays] = useState<number>(khatmaPlan.durationDays);

  const pagesPerDay = Math.ceil(604 / khatmaPlan.durationDays);
  const currentDayIndex = Math.min(
    khatmaPlan.durationDays,
    Math.floor(khatmaPlan.completedPages / pagesPerDay) + 1
  );

  const percentComplete = Math.min(100, Math.round((khatmaPlan.completedPages / 604) * 100));

  // Calculate estimated finish date
  const remainingPages = Math.max(0, 604 - khatmaPlan.completedPages);
  const remainingDays = Math.ceil(remainingPages / pagesPerDay);
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + remainingDays);

  const handleSelectDuration = (days: number) => {
    setCustomDays(days);
    updateKhatmaPlan(days);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-[#e2f1e9]">
      <div className="text-center mb-8">
        <span className="px-3.5 py-1 rounded-full bg-[#144733] text-[#ffd700] border border-[#d4af37]/30 text-xs font-semibold inline-block mb-3">
          مُتابِع الختمة القرآنية
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#ffd700] mb-2">
          خطّط وختم القرآن الكريم
        </h2>
        <p className="text-sm text-[#9ca3af]">
          حدد المدة الزمنية المناسبة لختمتك وسيقوم النظام بجدولة صفحاتك اليومية مع متابعة نسبة الإنجاز
        </p>
      </div>

      {/* Select Plan Duration Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[7, 15, 30, 60].map((days) => {
          const isSelected = khatmaPlan.durationDays === days;
          const pages = Math.ceil(604 / days);

          return (
            <button
              key={days}
              onClick={() => handleSelectDuration(days)}
              className={`p-4 rounded-3xl text-center border transition-all glass-card ${
                isSelected
                  ? 'border-[#ffd700] bg-[#0d2d20] shadow-xl gold-glow'
                  : 'border-[#d4af37]/20 hover:border-[#d4af37]/50'
              }`}
            >
              <div className="font-heading font-bold text-2xl text-[#ffd700] mb-1">{days} يوماً</div>
              <div className="text-xs text-[#a7f3d0]">{pages} صفحة / يومياً</div>
            </button>
          );
        })}
      </div>

      {/* Progress Dashboard Overview */}
      <div className="bg-[#072116] border border-[#d4af37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl mb-10 glass-panel">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <span className="text-xs text-[#d4af37] font-semibold block mb-1">تقدم الختمة الحالية</span>
            <h3 className="font-heading font-bold text-3xl text-white">
              تم إنجاز {percentComplete}% من المصحف
            </h3>
            <p className="text-xs text-[#9ca3af] mt-1">
              تم قراءة {khatmaPlan.completedPages} صفحة من أصل 604 صفحة
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => logWirdPageRead(pagesPerDay)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#030f0a] font-bold text-xs shadow-xl gold-glow hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>إكمال ورد اليوم ({pagesPerDay} صفحة)</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-4 bg-[#144733] rounded-full overflow-hidden mb-6 p-0.5 border border-[#d4af37]/20">
          <div
            className="h-full bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#22c55e] rounded-full transition-all duration-500 shadow-md"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pt-4 border-t border-[#144733]">
          <div className="bg-[#0d2d20] p-3 rounded-2xl border border-[#d4af37]/15">
            <span className="text-[11px] text-[#9ca3af] block">اليوم الحالي</span>
            <span className="font-mono text-base font-bold text-[#ffd700]">
              اليوم {currentDayIndex} من {khatmaPlan.durationDays}
            </span>
          </div>

          <div className="bg-[#0d2d20] p-3 rounded-2xl border border-[#d4af37]/15">
            <span className="text-[11px] text-[#9ca3af] block">المتبقي</span>
            <span className="font-mono text-base font-bold text-[#a7f3d0]">
              {remainingPages} صفحة ({remainingDays} يوم)
            </span>
          </div>

          <div className="bg-[#0d2d20] p-3 rounded-2xl border border-[#d4af37]/15">
            <span className="text-[11px] text-[#9ca3af] block">الهدف اليومي</span>
            <span className="font-mono text-base font-bold text-[#ffd700]">
              {pagesPerDay} صفحة / اليوم
            </span>
          </div>

          <div className="bg-[#0d2d20] p-3 rounded-2xl border border-[#d4af37]/15">
            <span className="text-[11px] text-[#9ca3af] block">تاريخ الإتمام المتوقع</span>
            <span className="font-mono text-xs font-bold text-[#e2f1e9]">
              {finishDate.toLocaleDateString('ar-EG')}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Schedule Breakdown */}
      <div>
        <h3 className="font-heading font-bold text-xl text-[#ffd700] mb-4">
          جدول الختمة اليومي (خطة الـ {khatmaPlan.durationDays} يوماً)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
          {Array.from({ length: khatmaPlan.durationDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const startPage = idx * pagesPerDay + 1;
            const endPage = Math.min(604, (idx + 1) * pagesPerDay);
            const isDone = khatmaPlan.completedPages >= endPage;
            const isCurrent = dayNum === currentDayIndex;

            return (
              <div
                key={dayNum}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isDone
                    ? 'bg-[#0d2d20]/80 border-[#22c55e]/30 text-[#a7f3d0]'
                    : isCurrent
                    ? 'bg-[#0d2d20] border-[#ffd700] text-white gold-glow'
                    : 'bg-[#072116] border-[#d4af37]/15 text-[#9ca3af]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#ffd700]">اليوم {dayNum}</span>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffd700]/20 text-[#ffd700] font-bold">
                        اليوم الحالي
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-1">
                    من الصفحة {startPage} إلى {endPage}
                  </div>
                </div>

                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                ) : (
                  <BookOpen className="w-5 h-5 text-[#d4af37]/40" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
