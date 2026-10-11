import React, { useState, useEffect } from 'react';
import { fetchSurahsList, fetchAyahTafsir, fetchSurahDetails } from '../../services/quranApi';
import type { Surah, Ayah } from '../../services/quranApi';
import { useAudio } from '../../context/AudioContext';
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Play,
  Share2,
  Check,
  Loader2,
  Sparkles,
  Search,
  Volume2
} from 'lucide-react';

interface TafsirViewProps {
  initialSurahNum?: number;
  initialAyahNum?: number;
}

export const TafsirView: React.FC<TafsirViewProps> = ({
  initialSurahNum = 1,
  initialAyahNum = 1
}) => {
  const { playSurah } = useAudio();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(initialSurahNum);
  const [selectedAyahNum, setSelectedAyahNum] = useState<number>(initialAyahNum);

  const [currentSurahDetails, setCurrentSurahDetails] = useState<{ surah: Surah; ayahs: Ayah[] } | null>(null);
  const [currentAyah, setCurrentAyah] = useState<Ayah | null>(null);

  const [tafsirText, setTafsirText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Popular Surahs quick shortcuts
  const popularSurahs = [
    { num: 1, name: 'الفاتحة' },
    { num: 18, name: 'الكهف' },
    { num: 36, name: 'يس' },
    { num: 67, name: 'الملك' },
    { num: 56, name: 'الواقعة' },
    { num: 55, name: 'الرحمن' },
    { num: 112, name: 'الإخلاص' }
  ];

  // 1. Fetch Surahs List
  useEffect(() => {
    fetchSurahsList().then((list) => {
      setSurahs(list);
    });
  }, []);

  // 2. Fetch Surah Details when selectedSurahNum changes
  useEffect(() => {
    let isMounted = true;
    fetchSurahDetails(selectedSurahNum).then((data) => {
      if (isMounted && data) {
        setCurrentSurahDetails(data);
        // Ensure valid ayah number
        const validAyahNum = Math.min(selectedAyahNum, data.surah.numberOfAyahs);
        if (validAyahNum !== selectedAyahNum) {
          setSelectedAyahNum(validAyahNum);
        }
      }
    });
    return () => { isMounted = false; };
  }, [selectedSurahNum]);

  // 3. Fetch Ayah Tafsir when selectedSurahNum or selectedAyahNum changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchAyahTafsir(selectedSurahNum, selectedAyahNum).then((text) => {
      if (isMounted) {
        setTafsirText(text);
        setLoading(false);
      }
    }).catch((err) => {
      console.error(err);
      if (isMounted) setLoading(false);
    });
  }, [selectedSurahNum, selectedAyahNum]);

  // Update currentAyah object from details
  useEffect(() => {
    if (currentSurahDetails) {
      const match = currentSurahDetails.ayahs.find((a) => a.numberInSurah === selectedAyahNum);
      if (match) setCurrentAyah(match);
      else if (currentSurahDetails.ayahs.length > 0) setCurrentAyah(currentSurahDetails.ayahs[0]);
    }
  }, [currentSurahDetails, selectedAyahNum]);

  const handleNextAyah = () => {
    if (!currentSurahDetails) return;
    if (selectedAyahNum < currentSurahDetails.surah.numberOfAyahs) {
      setSelectedAyahNum((prev) => prev + 1);
    } else if (selectedSurahNum === currentSurahDetails.surah.numberOfAyahs && selectedSurahNum < 114) {
      setSelectedSurahNum((prev) => Math.min(114, prev + 1));
      setSelectedAyahNum(1);
    }
  };

  const handlePrevAyah = () => {
    if (selectedAyahNum > 1) {
      setSelectedAyahNum((prev) => prev - 1);
    } else if (selectedSurahNum > 1) {
      setSelectedSurahNum((prev) => Math.max(1, prev - 1));
      setSelectedAyahNum(1);
    }
  };

  const handlePlayAudio = () => {
    if (currentSurahDetails) {
      playSurah(currentSurahDetails.surah, undefined, selectedAyahNum);
    }
  };

  const handleCopyText = () => {
    if (currentAyah && currentSurahDetails) {
      const textToCopy = `﴿ ${currentAyah.text} ﴾\n[تفسير سورة ${currentSurahDetails.surah.name} - الآية ${selectedAyahNum}]\n\nالتفسير الميسر:\n${tafsirText}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-[var(--text-primary)]">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d4af37]/15 text-[#ffd700] border border-[#d4af37]/30 text-xs font-semibold mb-3 gold-glow">
          <BookOpen className="w-4 h-4 text-[#ffd700]" />
          <span>التفسير الميسّر للقرآن الكريم</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#ffd700] gold-text-glow mb-2">
          موسوعة تفسير آيات الذكر الحكيم
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto">
          اختر السورة والآية للاستئناس بتفسيرها الميسر وفهم معاني القرآن الكريم بسهولة وبخط واضح
        </p>
      </div>

      {/* Quick Surah Shortcuts Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <span className="text-xs text-[var(--text-muted)] font-semibold ml-1">سور شائعة:</span>
        {popularSurahs.map((item) => (
          <button
            key={item.num}
            onClick={() => {
              setSelectedSurahNum(item.num);
              setSelectedAyahNum(1);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-300 ${
              selectedSurahNum === item.num
                ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] shadow-md gold-glow'
                : 'bg-[var(--bg-card)] text-[#8bafc4] border border-[#4dd0e1]/15 hover:text-[#ffd700] hover:border-[#ffd700]/30'
            }`}
          >
            سورة {item.name}
          </button>
        ))}
      </div>

      {/* Main Selectors Bar */}
      <div className="glass-panel p-4 sm:p-6 mb-8 rounded-3xl border-2 border-[#d4af37]/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Surah Dropdown */}
        <div className="w-full sm:w-auto flex-1">
          <label className="block text-[11px] text-[var(--text-muted)] font-semibold mb-1">اختر السورة:</label>
          <select
            value={selectedSurahNum}
            onChange={(e) => {
              setSelectedSurahNum(parseInt(e.target.value, 10));
              setSelectedAyahNum(1);
            }}
            className="w-full bg-[var(--bg-deep)] border border-[#d4af37]/40 text-[#ffd700] rounded-2xl px-4 py-2.5 font-heading font-bold text-base outline-none cursor-pointer hover:border-[#ffd700] transition-colors"
          >
            {surahs.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
              </option>
            ))}
          </select>
        </div>

        {/* Ayah Dropdown */}
        <div className="w-full sm:w-auto min-w-[160px]">
          <label className="block text-[11px] text-[var(--text-muted)] font-semibold mb-1">اختر رقم الآية:</label>
          <select
            value={selectedAyahNum}
            onChange={(e) => setSelectedAyahNum(parseInt(e.target.value, 10))}
            className="w-full bg-[var(--bg-deep)] border border-[#d4af37]/40 text-[#ffd700] rounded-2xl px-4 py-2.5 font-heading font-bold text-base outline-none cursor-pointer hover:border-[#ffd700] transition-colors"
          >
            {currentSurahDetails ? (
              Array.from({ length: currentSurahDetails.surah.numberOfAyahs }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  الآية {num} من {currentSurahDetails.surah.numberOfAyahs}
                </option>
              ))
            ) : (
              <option value={1}>الآية 1</option>
            )}
          </select>
        </div>

        {/* Quick Prev / Next Ayah Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handlePrevAyah}
            disabled={selectedAyahNum === 1 && selectedSurahNum === 1}
            className="p-3 rounded-2xl bg-[var(--bg-card)] border border-[#d4af37]/30 text-[#ffd700] hover:bg-[var(--bg-elevated)] disabled:opacity-30 transition-all cursor-pointer"
            title="الآية السابقة"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleNextAyah}
            disabled={currentSurahDetails ? selectedAyahNum === currentSurahDetails.surah.numberOfAyahs && selectedSurahNum === 114 : false}
            className="p-3 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-md gold-glow hover:scale-105 disabled:opacity-30 transition-all cursor-pointer"
            title="الآية التالية"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tafsir Display Card */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border-2 border-[#d4af37]/30 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Ayah Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#d4af37]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8d711f] flex items-center justify-center text-[#030d14] font-bold text-sm shadow-md gold-glow">
              {selectedAyahNum}
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-xl text-[#ffd700] gold-text-glow">
                سورة {currentSurahDetails?.surah.name || ''} — الآية {selectedAyahNum}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                {currentSurahDetails?.surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • الجزء {currentAyah?.juz || 1} • الصفحة {currentAyah?.page || 1}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayAudio}
              className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[#d4af37]/30 text-[#ffd700] hover:bg-[#ffd700] hover:text-[#030d14] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="استماع لتلاوة الآية"
            >
              <Play className="w-4 h-4 fill-current" />
              <span className="hidden sm:inline">استماع</span>
            </button>

            <button
              onClick={handleCopyText}
              className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[#4dd0e1]/20 text-[var(--text-muted)] hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="نسخ النص والتفسير"
            >
              {copied ? <Check className="w-4 h-4 text-[#22c55e]" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'مشاركة'}</span>
            </button>
          </div>
        </div>

        {/* Ayah Text Box */}
        <div className="p-6 rounded-2xl bg-[#030d14]/70 border border-[#d4af37]/30 text-center font-quran text-2xl sm:text-3xl text-[#ffd700] leading-loose gold-text-glow shadow-inner">
          ﴿ {currentAyah?.text || 'جاري التحميل...'} ﴾
        </div>

        {/* Tafsir Body Content */}
        <div className="pt-2">
          <h4 className="text-sm font-bold text-[#4dd0e1] mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ffd700]" />
            شرح وتفسير الآية (التفسير الميسّر):
          </h4>

          {loading ? (
            <div className="py-12 text-center text-[var(--text-muted)] bg-[var(--bg-mid)] rounded-2xl border border-white/5">
              <Loader2 className="w-8 h-8 text-[#ffd700] animate-spin mx-auto mb-3" />
              <p className="text-xs">جاري تحميل وتنسيق التفسير الميسر...</p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[var(--bg-mid)] border border-[#d4af37]/20 text-base sm:text-lg text-[var(--text-primary)] leading-relaxed font-ui shadow-md text-right">
              {tafsirText || 'لم يتم العثور على نص التفسير لهذه الآية.'}
            </div>
          )}
        </div>

        {/* Bottom Navigation Toolbar */}
        <div className="pt-4 border-t border-[#d4af37]/20 flex items-center justify-between gap-4 text-xs font-bold">
          <button
            onClick={handlePrevAyah}
            disabled={selectedAyahNum === 1 && selectedSurahNum === 1}
            className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#ffd700] disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" /> الآية السابقة
          </button>

          <span className="text-[var(--text-muted)] text-[11px] font-mono">
            {selectedSurahNum} : {selectedAyahNum}
          </span>

          <button
            onClick={handleNextAyah}
            disabled={currentSurahDetails ? selectedAyahNum === currentSurahDetails.surah.numberOfAyahs && selectedSurahNum === 114 : false}
            className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#ffd700] disabled:opacity-30 cursor-pointer"
          >
            الآية التالية <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
