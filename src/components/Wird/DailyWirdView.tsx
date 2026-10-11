import React, { useState } from 'react';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { Plus, CheckCircle2, BookOpen } from 'lucide-react';


export const DailyWirdView: React.FC = () => {
  const { dailyWird, logWirdPageRead, setWirdTargetPages } = useUserPreferences();
  const [customInput, setCustomInput] = useState<number>(dailyWird.targetPages);

  const percent = Math.min(100, Math.round((dailyWird.completedTodayPages / dailyWird.targetPages) * 100));
  const isDone = dailyWird.completedTodayPages >= dailyWird.targetPages;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[#e2f1e9]">
      <div className="text-center mb-8">
        <span className="px-3.5 py-1 rounded-full bg-[#144733] text-[#ffd700] border border-[#d4af37]/30 text-xs font-semibold inline-block mb-3">
          الورد القرآني اليومي
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#ffd700] mb-2">
          مُتابِع ورْدِك اليومي
        </h2>
        <p className="text-sm text-[#9ca3af]">
          حافظ على عهدك اليومي مع كتاب الله وسجّل عدد الصفحات المقروءة يومياً
        </p>
      </div>

      {/* Main Wheel Progress Card */}
      <div className="bg-[#072116] border border-[#d4af37]/30 rounded-3xl p-8 shadow-2xl text-center glass-panel mb-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Progress Ring Visual */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 mb-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              className="text-[#144733] stroke-current"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="40%"
              className="text-[#ffd700] stroke-current transition-all duration-500"
              strokeWidth="12"
              strokeDasharray="250"
              strokeDashoffset={250 - (250 * percent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-[#9ca3af] block">إنجاز اليوم</span>
            <div className="font-mono font-bold text-3xl sm:text-4xl text-[#ffd700]">
              {dailyWird.completedTodayPages} / {dailyWird.targetPages}
            </div>
            <span className="text-xs text-[#a7f3d0] font-semibold mt-1">صفحة</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-6">
          {isDone ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" /> ماشاء الله! أكملت وردك اليومي بنجاح!
            </div>
          ) : (
            <p className="text-sm text-[#e2f1e9]">
              متبقي لك <span className="text-[#ffd700] font-bold">{dailyWird.targetPages - dailyWird.completedTodayPages} صفحة</span> لإكمال ورد اليوم
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => logWirdPageRead(1)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#030f0a] font-bold text-xs shadow-xl gold-glow hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+1 صفحة مقروءة</span>
          </button>

          <button
            onClick={() => logWirdPageRead(5)}
            className="px-5 py-3 rounded-2xl bg-[#0d2d20] border border-[#d4af37]/30 text-[#ffd700] font-bold text-xs hover:bg-[#144733] transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-[#ffd700]" />
            <span>+5 صفحات</span>
          </button>
        </div>
      </div>

      {/* Goal Setting Container */}
      <div className="bg-[#072116] border border-[#d4af37]/20 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-heading font-bold text-base text-[#ffd700]">تخصيص هدف الورد اليومي</h4>
          <p className="text-xs text-[#9ca3af]">اختر عدد الصفحات التي ترغب بقراءتها يومياً</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={100}
            value={customInput}
            onChange={(e) => setCustomInput(parseInt(e.target.value, 10) || 1)}
            className="w-20 bg-[#0d2d20] border border-[#d4af37]/30 rounded-xl px-3 py-2 text-center text-sm font-mono font-bold text-[#ffd700] outline-none"
          />
          <button
            onClick={() => setWirdTargetPages(customInput)}
            className="px-4 py-2 rounded-xl bg-[#144733] border border-[#22c55e]/30 text-xs font-semibold text-[#a7f3d0] hover:bg-[#15803d] transition-colors"
          >
            حفظ الهدف
          </button>
        </div>
      </div>
    </div>
  );
};
