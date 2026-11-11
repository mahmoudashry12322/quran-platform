import React, { useState } from 'react';
import { RECITERS_LIST } from '../../services/audioApi';
import type { Reciter } from '../../services/audioApi';

import { useAudio } from '../../context/AudioContext';
import { Music, Play, Search, Check } from 'lucide-react';


export const ReciterCatalogView: React.FC = () => {
  const { currentReciter, setReciter, playSurah, surahList } = useAudio();
  const [filterText, setFilterText] = useState('');

  const filteredReciters = RECITERS_LIST.filter(
    (r) =>
      r.name.includes(filterText) ||
      r.englishName.toLowerCase().includes(filterText.toLowerCase()) ||
      r.rewaya.includes(filterText)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-[#e2f1e9]">
      <div className="text-center mb-10">
        <span className="px-3.5 py-1 rounded-full bg-[#144733] text-[#ffd700] border border-[#d4af37]/30 text-xs font-semibold inline-block mb-3">
          كبار القراء والتلاوات
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#ffd700] mb-3">
          دليل القراء والتلاوات القرآنية
        </h2>
        <p className="text-sm text-[#9ca3af] max-w-xl mx-auto">
          اختر قارئك المفضل للاستماع للتلاوات العذبة بصوت عالي الجودة وبث مباشر من المصادر المعتمدة
        </p>
      </div>

      {/* Filter Input */}
      <div className="max-w-md mx-auto mb-8 relative">
        <Search className="w-5 h-5 text-[#ffd700] absolute right-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="ابحث باسم القارئ أو الرواية..."
          className="w-full bg-[#072116] border border-[#d4af37]/30 rounded-2xl pr-12 pl-4 py-3 text-sm text-[#e2f1e9] placeholder-[#9ca3af] outline-none focus:border-[#ffd700] transition-colors shadow-lg"
        />
      </div>

      {/* Grid of Reciters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReciters.map((r) => {
          const isCurrent = currentReciter.id === r.id;

          return (
            <div
              key={r.id}
              className={`p-6 rounded-3xl transition-all duration-300 glass-card flex flex-col justify-between ${
                isCurrent ? 'border-[#ffd700] gold-glow bg-[#0d2d20]' : 'border-[#d4af37]/20 hover:border-[#d4af37]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8d711f] flex items-center justify-center text-[#030f0a] font-bold shadow-md gold-glow">
                    <Music className="w-6 h-6" />
                  </div>
                  {isCurrent && (
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#ffd700]/20 text-[#ffd700] border border-[#ffd700]/40 font-bold">
                      <Check className="w-3.5 h-3.5" /> القارئ الحالي
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-xl text-[#ffd700] mb-1">{r.name}</h3>
                <p className="text-xs text-[#9ca3af] mb-3">{r.englishName}</p>

                <div className="flex flex-wrap gap-2 text-xs mb-4">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#144733] text-[#a7f3d0]">
                    الرواية: {r.rewaya}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#072116] border border-[#d4af37]/20 text-[#d4af37]">
                    النمط: {r.style || 'مرتل'}
                  </span>
                  {r.availableSurahs && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#ffd700]/15 border border-[#ffd700]/30 text-[#ffd700] font-semibold">
                      {r.availableSurahs.length} سورة مسجلة
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#144733] flex items-center gap-3">
                <button
                  onClick={() => {
                    setReciter(r);
                    if (surahList.length > 0) {
                      playSurah(surahList[0], r);
                    }
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-[#030f0a] font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-md"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>تحديد وتشغيل سورة الفاتحة</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
