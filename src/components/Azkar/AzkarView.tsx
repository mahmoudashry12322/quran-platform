import React, { useState } from 'react';
import { AZKAR_CATEGORIES, AZKAR_ITEMS } from '../../services/azkarData';
import type { ZikrItem } from '../../services/azkarData';
import { Heart, CheckCircle2, RotateCcw, Sun, Moon, Bed, Compass, BookOpen, Sunrise } from 'lucide-react';

export const AzkarView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('sabah');
  const [userCounts, setUserCounts] = useState<{ [id: string]: number }>({});

  const currentCategoryAzkar = AZKAR_ITEMS.filter((item) => item.category === activeCategory);

  const getRemainingCount = (item: ZikrItem) => {
    const current = userCounts[item.id] || 0;
    return Math.max(0, item.count - current);
  };

  const handleIncrement = (item: ZikrItem) => {
    const current = userCounts[item.id] || 0;
    if (current < item.count) {
      setUserCounts((prev) => ({
        ...prev,
        [item.id]: current + 1
      }));
    }
  };

  const handleResetCategory = () => {
    setUserCounts((prev) => {
      const updated = { ...prev };
      currentCategoryAzkar.forEach((item) => {
        delete updated[item.id];
      });
      return updated;
    });
  };

  const completedCount = currentCategoryAzkar.filter((item) => (userCounts[item.id] || 0) >= item.count).length;
  const progressPercent = currentCategoryAzkar.length > 0 ? (completedCount / currentCategoryAzkar.length) * 100 : 0;

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'sabah': return <Sun className="w-4 h-4 text-[#ffd700]" />;
      case 'masaa': return <Moon className="w-4 h-4 text-[#d4af37]" />;
      case 'nawm': return <Bed className="w-4 h-4 text-[#4dd0e1]" />;
      case 'salah': return <Heart className="w-4 h-4 text-[#f43f5e]" />;
      case 'istiqadh': return <Sunrise className="w-4 h-4 text-[#fbbf24]" />;
      case 'safar': return <Compass className="w-4 h-4 text-[#38bdf8]" />;
      default: return <BookOpen className="w-4 h-4 text-[#d4af37]" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <span className="px-3.5 py-1 rounded-full bg-[var(--bg-card)] text-[#ffd700] border border-[#d4af37]/30 text-xs font-semibold inline-block mb-3">
          الأذكار والمأثورات
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#ffd700] gold-text-glow mb-2">
          حصن المسلم والأذكار اليومية
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          أذكار الصباح والمساء وأذكار اليوم والليلة مع العداد التفاعلي ومتابعة نسبة الإنجاز
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {AZKAR_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex-shrink-0 border ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] border-[#ffd700] shadow-lg gold-glow font-bold'
                : 'bg-[var(--bg-card)] border-[#4dd0e1]/15 text-[var(--text-secondary)] hover:text-[#ffd700] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            {getCategoryIcon(cat.id)}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Progress Bar Container */}
      <div className="glass-panel p-4 mb-8 shadow-xl flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-[#ffd700]">نسبة إنجاز الأذكار</span>
            <span className="text-[var(--text-secondary)]">
              {completedCount} من {currentCategoryAzkar.length} أذكار مكتملة
            </span>
          </div>
          <div className="h-2.5 bg-[var(--bg-mid)] rounded-full overflow-hidden border border-[#4dd0e1]/10">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] to-[#ffd700] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleResetCategory}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[#4dd0e1]/15 text-xs text-[var(--text-secondary)] hover:text-[#ffd700] transition-colors duration-300"
          title="إعادة ضبط العدادات"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">إعادة البدء</span>
        </button>
      </div>

      {/* Azkar Cards Stream */}
      <div className="space-y-6">
        {currentCategoryAzkar.map((item) => {
          const countDone = userCounts[item.id] || 0;
          const isCompleted = countDone >= item.count;
          const remaining = getRemainingCount(item);

          return (
            <div
              key={item.id}
              onClick={() => handleIncrement(item)}
              className={`p-6 rounded-3xl transition-all duration-300 border cursor-pointer glass-card relative overflow-hidden ${
                isCompleted
                  ? 'border-[#22c55e]/40 shadow-lg'
                  : 'border-[#4dd0e1]/15 hover:border-[#ffd700]/40'
              }`}
            >
              {isCompleted && (
                <div className="absolute top-4 left-4 flex items-center gap-1 text-xs font-bold text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full border border-[#22c55e]/30">
                  <CheckCircle2 className="w-4 h-4" /> مكتمل
                </div>
              )}

              {/* Zikr Text — using CSS var text-primary for high contrast in both Light & Dark modes */}
              <p className="font-quran text-xl sm:text-2xl text-[var(--text-primary)] leading-loose mb-4">
                {item.text}
              </p>

              {item.description && (
                <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-mid)] p-3 rounded-xl mb-4 border border-[#4dd0e1]/15">
                  💡 {item.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#4dd0e1]/10">
                <span className="text-xs text-[var(--text-muted)]">{item.reference}</span>

                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="text-[11px] text-[var(--text-muted)] block">التكرار المطلـوب</span>
                    <span className="font-mono text-sm font-bold text-[#ffd700]">
                      {countDone} / {item.count}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIncrement(item);
                    }}
                    disabled={isCompleted}
                    className={`w-12 h-12 rounded-2xl font-bold font-mono text-lg flex items-center justify-center transition-transform active:scale-95 shadow-lg ${
                      isCompleted
                        ? 'bg-[var(--bg-card)] text-[#22c55e] border border-[#22c55e]/30'
                        : 'bg-gradient-to-br from-[#ffd700] to-[#d4af37] text-[#030d14] gold-glow'
                    }`}
                  >
                    {isCompleted ? '✓' : remaining}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
