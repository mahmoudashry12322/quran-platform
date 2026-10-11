import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import {
  fetchSurahsList,
  fetchSurahDetails,
  fetchAyahTafsir,
  fetchQuranPage
} from '../../services/quranApi';
import type { Surah, Ayah, QuranPageData } from '../../services/quranApi';
import {
  Play,
  Bookmark,
  BookOpen,
  Share2,
  Check,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  X,
  Sparkles,
  Info,
  Loader2,
  Layers,
  ArrowRight,
  ArrowLeft,
  BookmarkCheck,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

interface QuranReaderProps {
  initialSurahNum?: number;
  initialAyahNum?: number;
}

export const QuranReader: React.FC<QuranReaderProps> = ({ initialSurahNum = 1, initialAyahNum }) => {
  const { playSurah, isPlaying, activeAyahNumber } = useAudio();

  const {
    fontSize,
    setFontSize,
    saveLastRead,
    toggleBookmark,
    isBookmarked,
    logWirdPageRead,
    lastRead
  } = useUserPreferences();

  // Mushaf View Mode: 'image' (Scanned Saudi Madinah Mushaf) | 'text' (Digital Uthmani Page) | 'surah' (Surah List)
  const [mushafMode, setMushafMode] = useState<'image' | 'text' | 'surah'>('image');

  // Page State (1 to 604)
  const [currentPageNum, setCurrentPageNum] = useState<number>(() => {
    return lastRead?.surahNumber ? Math.max(1, Math.min(604, Math.floor(lastRead.surahNumber * 5.2))) : 1;
  });
  const [pageData, setPageData] = useState<QuranPageData | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  // Surah Mode State (1 to 114)
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(initialSurahNum);
  const [surahData, setSurahData] = useState<{ surah: Surah; ayahs: Ayah[] } | null>(null);
  const [surahLoading, setSurahLoading] = useState<boolean>(true);

  // Tafsir Modal State
  const [activeTafsirAyah, setActiveTafsirAyah] = useState<Ayah | null>(null);
  const [tafsirText, setTafsirText] = useState<string>('');
  const [tafsirLoading, setTafsirLoading] = useState<boolean>(false);

  // Copied alert state
  const [copiedAyahId, setCopiedAyahId] = useState<string | null>(null);

  const ayahRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Get official Saudi Madinah Mushaf Page Image URL (King Saud University CDN / mجمع الملك فهد)
  const getSaudiMushafImgUrl = (page: number) => {
    return `https://quran.ksu.edu.sa/png_big/${page}.png`;
  };

  // Preload adjacent page images for instant page flips
  useEffect(() => {
    if (currentPageNum < 604) {
      const imgNext = new Image();
      imgNext.src = getSaudiMushafImgUrl(currentPageNum + 1);
    }
    if (currentPageNum > 1) {
      const imgPrev = new Image();
      imgPrev.src = getSaudiMushafImgUrl(currentPageNum - 1);
    }
  }, [currentPageNum]);

  // Load surahs directory list
  useEffect(() => {
    fetchSurahsList().then((list) => {
      setSurahs(list);
    });
  }, []);

  // Fetch Page Data when currentPageNum changes
  useEffect(() => {
    if (mushafMode === 'surah') return;
    let isMounted = true;
    setPageLoading(true);
    setImgLoaded(false);

    fetchQuranPage(currentPageNum)
      .then((data) => {
        if (isMounted) {
          setPageData(data);
          setPageLoading(false);
          const firstSurah = data.surahsInPage[0];
          if (firstSurah) {
            saveLastRead(firstSurah.number, firstSurah.name, 1);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setPageLoading(false);
      });

    return () => { isMounted = false; };
  }, [currentPageNum, mushafMode]);

  // Fetch Surah Details when selectedSurahNum changes (Surah Mode)
  useEffect(() => {
    if (mushafMode !== 'surah') return;
    let isMounted = true;
    setSurahLoading(true);
    fetchSurahDetails(selectedSurahNum)
      .then((data) => {
        if (isMounted) {
          setSurahData(data);
          setSurahLoading(false);
          saveLastRead(data.surah.number, data.surah.name, 1);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setSurahLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedSurahNum, mushafMode]);

  // Handle keyboard navigation for page flipping (Left/Right Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mushafMode !== 'surah') {
        if (e.key === 'ArrowRight') {
          // Right Arrow -> Previous Page in RTL
          setCurrentPageNum((prev) => Math.max(1, prev - 1));
        } else if (e.key === 'ArrowLeft') {
          // Left Arrow -> Next Page in RTL
          setCurrentPageNum((prev) => Math.min(604, prev + 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mushafMode]);

  const handleNextPage = () => setCurrentPageNum((prev) => Math.min(604, prev + 1));
  const handlePrevPage = () => setCurrentPageNum((prev) => Math.max(1, prev - 1));

  const handleOpenTafsir = async (ayah: Ayah) => {
    setActiveTafsirAyah(ayah);
    setTafsirLoading(true);
    const surahNum = ayah.surahNumber || selectedSurahNum;
    const text = await fetchAyahTafsir(surahNum, ayah.numberInSurah);
    setTafsirText(text);
    setTafsirLoading(false);
  };

  const handleCopyAyah = (ayah: Ayah) => {
    const sName = ayah.surahName || surahData?.surah.name || '';
    const text = `﴿ ${ayah.text} ﴾ [سورة ${sName}: الآية ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(text);
    setCopiedAyahId(`${ayah.surahNumber || selectedSurahNum}:${ayah.numberInSurah}`);
    setTimeout(() => setCopiedAyahId(null), 2000);
  };

  const handlePlayAyah = (ayah: Ayah) => {
    const sNum = ayah.surahNumber || selectedSurahNum;
    const matchedSurah = surahs.find((s) => s.number === sNum);
    if (matchedSurah) {
      playSurah(matchedSurah, undefined, ayah.numberInSurah);
      saveLastRead(matchedSurah.number, matchedSurah.name, ayah.numberInSurah);
    }
  };

  const isPageBookmarked = pageData ? isBookmarked(pageData.surahsInPage[0]?.number || 1, pageData.pageNumber) : false;

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6">

      {/* Top Header Controls: Mode Selector & Zoom */}
      <div className="glass-panel p-4 mb-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">

        {/* Mushaf Mode Selector Buttons */}
        <div className="flex items-center gap-1 bg-[var(--bg-deep)] p-1 rounded-2xl border border-[#4dd0e1]/15 text-xs font-semibold">
          <button
            onClick={() => setMushafMode('image')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-300 ${
              mushafMode === 'image'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-lg gold-glow'
                : 'text-[var(--text-secondary)] hover:text-[#ffd700]'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>مصحف المدينة المصور (النمط السعودي)</span>
          </button>

          <button
            onClick={() => setMushafMode('text')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-300 ${
              mushafMode === 'text'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-lg gold-glow'
                : 'text-[var(--text-secondary)] hover:text-[#ffd700]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>النص الرقمي</span>
          </button>

          <button
            onClick={() => setMushafMode('surah')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-300 ${
              mushafMode === 'surah'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-lg gold-glow'
                : 'text-[var(--text-secondary)] hover:text-[#ffd700]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>عرض السور</span>
          </button>
        </div>

        {/* Font Adjuster & Wird Logger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => logWirdPageRead(1)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[#4dd0e1]/20 text-xs font-semibold text-[#4dd0e1] hover:bg-[var(--bg-elevated)] transition-all duration-300"
            title="تسجيل قراءة صفحة في الورد والختمة"
          >
            <Sparkles className="w-4 h-4 text-[#ffd700]" />
            <span>+1 صفحة للورد</span>
          </button>

          {mushafMode === 'text' && (
            <div className="flex items-center gap-2 bg-[var(--bg-deep)] p-1.5 rounded-xl border border-[#4dd0e1]/15">
              <button onClick={() => setFontSize(fontSize - 2)} className="p-1 text-[var(--text-muted)] hover:text-[#ffd700]">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-[#ffd700] px-1">{fontSize}px</span>
              <button onClick={() => setFontSize(fontSize + 2)} className="p-1 text-[var(--text-muted)] hover:text-[#ffd700]">
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PAGE NAV BAR (For Image & Text Page Modes) */}
      {mushafMode !== 'surah' && (
        <div className="glass-card p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Previous Page Button (Right side in RTL) */}
          <button
            onClick={handlePrevPage}
            disabled={currentPageNum === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--bg-card)] border border-[#d4af37]/30 text-sm font-bold text-[#ffd700] hover:bg-[var(--bg-elevated)] disabled:opacity-30 transition-all duration-300"
          >
            <ArrowRight className="w-4 h-4" />
            <span>الصفحة السابقة ({currentPageNum > 1 ? currentPageNum - 1 : 1})</span>
          </button>

          {/* Jump to Page / Juz Select */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)] hidden sm:inline">انتقل إلى الصفحة:</span>
            <select
              value={currentPageNum}
              onChange={(e) => setCurrentPageNum(parseInt(e.target.value, 10))}
              className="bg-[var(--bg-deep)] border border-[#d4af37]/40 text-[#ffd700] rounded-xl px-3 py-1.5 font-heading font-bold text-sm outline-none cursor-pointer hover:border-[#ffd700]"
            >
              {Array.from({ length: 604 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  صفحة {num} من 604
                </option>
              ))}
            </select>

            <select
              onChange={(e) => setCurrentPageNum(parseInt(e.target.value, 10))}
              className="bg-[var(--bg-deep)] border border-[#4dd0e1]/30 text-[var(--text-secondary)] rounded-xl px-3 py-1.5 font-heading font-bold text-xs outline-none cursor-pointer"
            >
              <option value="">انتقل بالجزء (1 - 30)</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                const estimatedPage = Math.min(604, Math.max(1, (juzNum - 1) * 20 + 2));
                return (
                  <option key={juzNum} value={estimatedPage}>
                    الجزء {juzNum} (ص {estimatedPage})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Next Page Button (Left side in RTL) */}
          <button
            onClick={handleNextPage}
            disabled={currentPageNum === 604}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold text-sm shadow-lg gold-glow hover:scale-105 disabled:opacity-30 transition-all duration-300"
          >
            <span>الصفحة التالية ({currentPageNum < 604 ? currentPageNum + 1 : 604})</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODE 1: AUTHENTIC SCANNED SAUDI MADINAH MUSHAF PAGE VIEWER */}
      {mushafMode === 'image' && (
        <div className="relative glass-panel p-4 sm:p-8 shadow-2xl rounded-3xl border-2 border-[#d4af37]/30 overflow-hidden flex flex-col items-center justify-between min-h-[700px]">

          {/* Ribbon Bookmark */}
          <div
            onClick={() => {
              if (pageData && pageData.surahsInPage[0]) {
                const s = pageData.surahsInPage[0];
                toggleBookmark({
                  surahNumber: s.number,
                  surahName: s.name,
                  ayahNumber: pageData.pageNumber,
                  text: `علامة صفحة ${pageData.pageNumber} - سورة ${s.name}`
                });
              }
            }}
            className={`absolute top-0 right-8 z-20 cursor-pointer transition-all duration-300 ${
              isPageBookmarked ? 'h-28 opacity-100' : 'h-10 opacity-40 hover:opacity-100'
            }`}
            title={isPageBookmarked ? 'علامة الفاصلة موضوعة على هذه الصفحة' : 'انقر لوضع فاصلة المرجع'}
          >
            <div className={`w-8 h-full rounded-b-md shadow-2xl flex flex-col items-center justify-end pb-2 ${
              isPageBookmarked ? 'bg-gradient-to-b from-[#e11d48] to-[#9f1239] gold-glow' : 'bg-[#d4af37]/50'
            }`}>
              <BookmarkCheck className={`w-4 h-4 ${isPageBookmarked ? 'text-[#ffd700]' : 'text-white'}`} />
            </div>
          </div>

          {/* Top Page Header Metadata */}
          {pageData && (
            <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-[#d4af37]/20 text-xs font-heading font-bold text-[#d4af37]">
              <span>الجزء {pageData.juz}</span>
              <span className="text-base text-[#ffd700] gold-text-glow">
                {pageData.surahsInPage.map((s) => `سورة ${s.name}`).join(' • ')}
              </span>
              <span>مصحف المدينة المنورة — صفحة {currentPageNum}</span>
            </div>
          )}

          {/* Page Image Frame */}
          <div className="relative w-full max-w-[700px] flex items-center justify-center my-2 p-2 bg-[#ffffff] rounded-2xl border-4 border-[#d4af37]/40 shadow-2xl overflow-hidden">
            {!imgLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8faf8] text-[#5b7d92] py-24">
                <Loader2 className="w-10 h-10 text-[#d4af37] animate-spin mb-3" />
                <p className="text-xs font-semibold">جاري فتح صفحة مصحف المدينة رقم {currentPageNum}...</p>
              </div>
            )}
            <img
              key={currentPageNum}
              src={getSaudiMushafImgUrl(currentPageNum)}
              alt={`صفحة المصحف الشريف ${currentPageNum}`}
              onLoad={() => setImgLoaded(true)}
              className={`w-full h-auto max-h-[850px] object-contain transition-opacity duration-300 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ filter: 'contrast(1.05) brightness(1.02)' }}
            />
          </div>

          {/* Bottom Controls Bar */}
          <div className="w-full pt-4 mt-4 border-t border-[#d4af37]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <button
              onClick={handlePrevPage}
              disabled={currentPageNum === 1}
              className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#ffd700] disabled:opacity-30"
            >
              <ArrowRight className="w-4 h-4" /> الصفحة السابقة
            </button>

            {pageData && pageData.ayahs[0] && (
              <button
                onClick={() => handlePlayAyah(pageData.ayahs[0])}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-md gold-glow hover:scale-105 transition-transform"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>استماع لتلاوة هذه الصفحة بصوت القارئ</span>
              </button>
            )}

            <button
              onClick={handleNextPage}
              disabled={currentPageNum === 604}
              className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#ffd700] disabled:opacity-30"
            >
              الصفحة التالية <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: DIGITAL TEXT PAGE VIEW */}
      {mushafMode === 'text' && (
        <div className="relative glass-panel p-6 sm:p-12 shadow-2xl rounded-3xl border-2 border-[#d4af37]/30 overflow-hidden min-h-[650px] flex flex-col justify-between">
          {pageLoading && (
            <div className="text-center py-24">
              <Loader2 className="w-12 h-12 text-[#ffd700] animate-spin mx-auto mb-4" />
              <p className="text-sm text-[var(--text-muted)]">جاري فتح صفحة المصحف الرقمي رقم {currentPageNum}...</p>
            </div>
          )}

          {!pageLoading && pageData && (
            <>
              <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-[#d4af37]/20 text-xs font-heading font-bold text-[#d4af37]">
                <span>الجزء {pageData.juz}</span>
                <span className="text-base text-[#ffd700] gold-text-glow">
                  {pageData.surahsInPage.map((s) => `سورة ${s.name}`).join(' • ')}
                </span>
                <span>صفحة {pageData.pageNumber} من 604</span>
              </div>

              <div className="flex-1 flex flex-col justify-center text-center my-4 px-2 sm:px-6">
                <div className="leading-[2.6] text-right font-quran tracking-wide text-[var(--text-primary)] transition-all duration-300" style={{ fontSize: `${fontSize + 2}px` }}>
                  {pageData.ayahs.map((ayah) => {
                    const isNewSurahStart = ayah.numberInSurah === 1;

                    return (
                      <React.Fragment key={ayah.number}>
                        {isNewSurahStart && (
                          <div className="my-6 text-center border-y-2 border-[#d4af37]/30 py-3 bg-[#d4af37]/5 rounded-2xl">
                            <h3 className="font-heading font-bold text-2xl text-[#ffd700] gold-text-glow">
                              سورة {ayah.surahName}
                            </h3>
                            {ayah.surahNumber !== 9 && (
                              <p className="font-quran text-xl text-[#d4af37] mt-2">
                                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                              </p>
                            )}
                          </div>
                        )}

                        <span
                          className={`inline cursor-pointer px-1 py-0.5 rounded-lg transition-colors duration-300 hover:bg-[#d4af37]/15 ${
                            activeAyahNumber === ayah.numberInSurah ? 'bg-[#d4af37]/25 text-[#ffd700]' : ''
                          }`}
                          onClick={() => handlePlayAyah(ayah)}
                          title={`سورة ${ayah.surahName} - الآية ${ayah.numberInSurah}`}
                        >
                          {ayah.text}{' '}
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTafsir(ayah);
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 mx-1 rounded-full border border-[#d4af37]/40 text-xs font-mono font-bold text-[#ffd700] bg-[var(--bg-card)] shadow-sm hover:scale-110 transition-transform"
                          >
                            {ayah.numberInSurah}
                          </span>
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-6 border-t-2 border-[#d4af37]/20 flex items-center justify-between text-xs">
                <button onClick={handlePrevPage} disabled={currentPageNum === 1} className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#ffd700] disabled:opacity-30">
                  <ArrowRight className="w-4 h-4" /> الصفحة السابقة
                </button>
                {pageData.ayahs[0] && (
                  <button onClick={() => handlePlayAyah(pageData.ayahs[0])} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-md gold-glow">
                    <Play className="w-4 h-4 fill-current" />
                    <span>تشغيل تلاوة الصفحة</span>
                  </button>
                )}
                <button onClick={handleNextPage} disabled={currentPageNum === 604} className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[#ffd700] disabled:opacity-30">
                  الصفحة التالية <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* MODE 3: SURAH LIST VIEW */}
      {mushafMode === 'surah' && (
        <div className="space-y-6">
          <div className="glass-card p-4 flex items-center justify-between gap-4">
            <select
              value={selectedSurahNum}
              onChange={(e) => setSelectedSurahNum(parseInt(e.target.value, 10))}
              className="bg-[var(--bg-deep)] border border-[#d4af37]/30 text-[#ffd700] rounded-xl px-4 py-2 font-heading font-bold text-base outline-none cursor-pointer hover:border-[#ffd700]"
            >
              {surahs.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 dir-ltr">
              <button onClick={() => setSelectedSurahNum((prev) => Math.max(1, prev - 1))} disabled={selectedSurahNum === 1} className="p-2 rounded-lg bg-[var(--bg-card)] border border-[#4dd0e1]/15 text-[#ffd700] disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setSelectedSurahNum((prev) => Math.min(114, prev + 1))} disabled={selectedSurahNum === 114} className="p-2 rounded-lg bg-[var(--bg-card)] border border-[#4dd0e1]/15 text-[#ffd700] disabled:opacity-30">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {surahLoading && (
            <div className="text-center py-20">
              <Loader2 className="w-12 h-12 text-[#ffd700] animate-spin mx-auto mb-4" />
              <p className="text-sm text-[var(--text-muted)]">جاري تحميل آيات سورة القرآن الكريم...</p>
            </div>
          )}

          {!surahLoading && surahData && (
            <div className="glass-panel p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="text-center pb-8 mb-8 border-b border-[#4dd0e1]/10 relative z-10">
                <span className="text-[11px] px-3 py-1 rounded-full bg-[var(--bg-mid)] text-[#4dd0e1] border border-[#4dd0e1]/20 font-semibold inline-block mb-3">
                  {surahData.surah.revelationType === 'Meccan' ? 'سورة مكية' : 'سورة مدنية'} • {surahData.surah.numberOfAyahs} آية
                </span>
                <h2 className="font-heading text-4xl sm:text-5xl font-bold text-[#ffd700] gold-text-glow tracking-wider mb-2">
                  سورة {surahData.surah.name}
                </h2>
                {selectedSurahNum !== 9 && (
                  <p className="font-quran text-2xl sm:text-3xl text-[#d4af37] mt-6 leading-relaxed gold-text-glow">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                )}
              </div>

              <div className="space-y-5 relative z-10">
                {surahData.ayahs.map((ayah) => {
                  const isCurrentAyahActive = activeAyahNumber === ayah.numberInSurah;
                  const isBm = isBookmarked(selectedSurahNum, ayah.numberInSurah);

                  return (
                    <div
                      key={ayah.numberInSurah}
                      ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el; }}
                      className={`p-5 rounded-2xl transition-all duration-500 ${
                        isCurrentAyahActive ? 'ayah-highlight gold-glow' : 'hover:bg-[var(--bg-mid)] border border-transparent hover:border-[#4dd0e1]/15'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#4dd0e1]/8">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-sm font-bold shadow-md transition-all duration-300 ${
                            isCurrentAyahActive ? 'bg-gradient-to-br from-[#ffd700] to-[#d4af37] text-[#030d14] gold-glow' : 'bg-[var(--bg-card)] border border-[#d4af37]/25 text-[#ffd700]'
                          }`}>
                            {ayah.numberInSurah}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            الجزء {ayah.juz} • الصفحة {ayah.page}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handlePlayAyah(ayah)} className="p-2 rounded-xl bg-[var(--bg-card)] border border-[#d4af37]/20 text-[#ffd700] hover:bg-[var(--bg-elevated)]">
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button onClick={() => handleOpenTafsir(ayah)} className="p-2 rounded-xl bg-[var(--bg-card)] border border-[#4dd0e1]/15 text-[#4dd0e1] hover:bg-[var(--bg-elevated)]">
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleBookmark({ surahNumber: selectedSurahNum, surahName: surahData.surah.name, ayahNumber: ayah.numberInSurah, text: ayah.text })} className={`p-2 rounded-xl border transition-all duration-300 ${isBm ? 'bg-[#ffd700] text-[#030d14] border-[#ffd700]' : 'bg-[var(--bg-card)] border-[#d4af37]/20 text-[var(--text-muted)]'}`}>
                            <Bookmark className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button onClick={() => handleCopyAyah(ayah)} className="p-2 rounded-xl bg-[var(--bg-card)] border border-[#4dd0e1]/15 text-[var(--text-muted)]">
                            {copiedAyahId === `${selectedSurahNum}:${ayah.numberInSurah}` ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Share2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <p className="font-quran text-right leading-[2.2] text-[var(--text-primary)] tracking-wide" style={{ fontSize: `${fontSize}px` }}>
                        {ayah.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tafsir Modal */}
      {activeTafsirAyah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-[#030d14]/80">
          <div className="w-full max-w-2xl glass-panel p-6 shadow-2xl relative animate-slide-up">
            <button onClick={() => setActiveTafsirAyah(null)} className="absolute top-4 left-4 p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-[#ffd700]">
              <Info className="w-5 h-5" />
              <h3 className="font-heading font-bold text-lg gold-text-glow">
                تفسير الآية {activeTafsirAyah.numberInSurah} - سورة {activeTafsirAyah.surahName || surahData?.surah.name}
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-mid)] border border-[#d4af37]/15 mb-4 font-quran text-lg text-[#ffd700] leading-loose text-right">
              ﴿ {activeTafsirAyah.text} ﴾
            </div>

            <div className="max-h-60 overflow-y-auto pr-2">
              {tafsirLoading ? (
                <div className="py-8 text-center text-[var(--text-muted)]">
                  <Loader2 className="w-8 h-8 text-[#ffd700] animate-spin mx-auto mb-2" />
                  <p className="text-xs">جاري جلب التفسير الميسر...</p>
                </div>
              ) : (
                <p className="text-base text-[var(--text-primary)] leading-relaxed font-ui">{tafsirText}</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
