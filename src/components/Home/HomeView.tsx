import React, { useState, useMemo } from 'react';
import { useAudio } from '../../context/AudioContext';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { RECITERS_LIST } from '../../services/audioApi';
import type { Surah } from '../../services/quranApi';
import type { ActiveTab } from '../Navbar';
import {
  Play,
  Pause,
  Music,
  Search,
  BookOpen,
  Heart,
  SkipBack,
  SkipForward,
  Repeat,
  ChevronDown,
  ChevronUp,
  X,
  LayoutGrid,
  List as ListIcon,
  Volume2,
  Sparkles
} from 'lucide-react';

interface HomeViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
  onSelectSurahForReading: (surahNum: number) => void;
}

type FilterTab = 'all' | 'meccan' | 'medinan' | 'bookmarks' | 'reciter';
type ViewMode = 'list' | 'grid';

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  onOpenSearch,
  onSelectSurahForReading
}) => {
  const {
    currentSurah,
    currentReciter,
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    surahList,
    playSurah,
    togglePlay,
    seekTo,
    setReciter,
    setRepeatMode,
    playNextSurah,
    playPrevSurah
  } = useAudio();

  const { bookmarks, toggleBookmark, isBookmarked } = useUserPreferences();

  const [searchFilter, setSearchFilter] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isMobilePlayerExpanded, setIsMobilePlayerExpanded] = useState(false);

  const selectedSurah = currentSurah || (surahList.length > 0 ? surahList[0] : null);

  const filteredSurahs = useMemo(() => {
    const trimmed = searchFilter.trim().toLowerCase();
    return surahList.filter((s) => {
      const matchesSearch =
        !trimmed ||
        s.name.includes(trimmed) ||
        s.englishName.toLowerCase().includes(trimmed) ||
        s.number.toString().includes(trimmed);

      if (!matchesSearch) return false;

      if (activeFilterTab === 'meccan') return s.revelationType === 'Meccan';
      if (activeFilterTab === 'medinan') return s.revelationType === 'Medinan';
      if (activeFilterTab === 'bookmarks') return isBookmarked(s.number, 1);
      if (activeFilterTab === 'reciter' && currentReciter.availableSurahs) {
        return currentReciter.availableSurahs.includes(s.number);
      }

      return true;
    });
  }, [surahList, searchFilter, activeFilterTab, isBookmarked, currentReciter]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !secs) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRepeatToggle = () => {
    if (repeatMode === 'none') setRepeatMode('surah');
    else if (repeatMode === 'surah') setRepeatMode('ayah');
    else setRepeatMode('none');
  };

  const counts = useMemo(() => {
    return {
      all: surahList.length,
      meccan: surahList.filter((s) => s.revelationType === 'Meccan').length,
      medinan: surahList.filter((s) => s.revelationType === 'Medinan').length,
      bookmarks: bookmarks.length,
      reciter: currentReciter.availableSurahs ? currentReciter.availableSurahs.length : 0
    };
  }, [surahList, bookmarks, currentReciter]);

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Majestic Islamic Welcome Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-6 shadow-2xl border border-[#d4af37]/30 glass-panel">
        {/* Background Artwork */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: `url('/islamic-hero-bg.png')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-deep)] via-[var(--bg-card)]/80 to-[var(--bg-deep)] pointer-events-none" />

        {/* Hanging Lanterns on Desktop */}
        <div className="absolute top-0 right-12 hidden md:flex gap-10 pointer-events-none opacity-40">
          <div className="flex flex-col items-center">
            <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#d4af37]" />
            <div className="w-6 h-8 border border-[#d4af37] rounded-b-lg bg-[#d4af37]/20 flex items-center justify-center shadow-lg gold-glow">
              <div className="w-2 h-2 rounded-full bg-[#ffd700] animate-glow-breathe" />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-px h-16 bg-gradient-to-b from-transparent to-[#d4af37]" />
            <div className="w-7 h-9 border border-[#d4af37] rounded-b-lg bg-[#d4af37]/20 flex items-center justify-center shadow-lg gold-glow">
              <div
                className="w-2 h-2 rounded-full bg-[#ffd700] animate-glow-breathe"
                style={{ animationDelay: '1.2s' }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 p-5 sm:p-8 flex flex-col items-center text-center">
          {/* Central Quran Emblem */}
          <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl sm:rounded-3xl p-0.5 shadow-2xl gold-glow mb-3 bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#8d711f] animate-float">
            <img
              src="/quran-logo-gold.png"
              alt="شعار منصة القرآن الكريم"
              className="w-full h-full object-cover rounded-[14px] sm:rounded-[22px]"
            />
          </div>

          {/* Calligraphic Quranic Verse Banner */}
          <div className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 mb-2.5 inline-block max-w-full">
            <p className="font-quran text-sm sm:text-xl md:text-2xl text-[#ffd700] gold-text-glow leading-relaxed truncate sm:whitespace-normal">
              ﴿ ٱلَّذِينَ ءَامَنُوا۟ وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ ۗ أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ ﴾
            </p>
          </div>

          <h1 className="font-heading text-xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-1.5">
            منصّة القُرْآن الكريم
          </h1>
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            استمع لأعذب التلاوات لأشهر القراء، اقرأ من مصحف المدينة المصوّر، وتدبر الآيات بكل سكينة.
          </p>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* LEFT: Audio Player Panel (Sticky ONLY on Desktop, Flowing on Mobile) */}
        <div className="lg:col-span-4 glass-panel p-4 sm:p-6 lg:sticky lg:top-24 overflow-hidden relative">
          {/* Decorative Ambient Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#d4af37]/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#4dd0e1]/5 blur-3xl pointer-events-none" />

          {/* Reciter Dropdown */}
          <div className="flex items-center justify-between gap-2 pb-3.5 mb-4 border-b border-[#4dd0e1]/10 relative z-10">
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 font-semibold">
              <Music className="w-3.5 h-3.5 text-[#d4af37]" /> اختيار القارئ
            </span>
            <div className="relative">
              <select
                value={currentReciter.id}
                onChange={(e) => {
                  const r = RECITERS_LIST.find((i) => i.id === e.target.value);
                  if (r) setReciter(r);
                }}
                className="bg-[var(--bg-card)] border border-[#d4af37]/25 text-[#ffd700] rounded-xl px-3 py-1.5 font-heading font-bold text-xs outline-none cursor-pointer hover:border-[#ffd700] transition-all duration-300 appearance-none pr-3 pl-7 truncate max-w-[190px]"
              >
                {RECITERS_LIST.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#d4af37] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Player Main Widget */}
          {selectedSurah && (
            <div className="flex flex-col items-center text-center relative z-10">
              {/* Desktop Full Disc View OR Mobile Expanded Disc */}
              <div className={`${isMobilePlayerExpanded ? 'block' : 'hidden lg:block'} mb-5`}>
                <div className="relative w-44 h-44 sm:w-56 sm:h-56 mx-auto rounded-full flex items-center justify-center">
                  {/* Outer Glow Ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#d4af37]/10 to-[#4dd0e1]/10 border-2 border-[#d4af37]/20 shadow-2xl" />

                  {/* Spinning Geometric Pattern */}
                  <div
                    className={`absolute inset-3 rounded-full border border-[#d4af37]/15 ${
                      isPlaying ? 'animate-spin-slow' : ''
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-full border border-[#d4af37]/15 rotate-45 rounded-full" />
                      <div className="w-full h-full border border-[#4dd0e1]/10 absolute inset-0 rounded-full" />
                      <div className="w-3/4 h-3/4 border border-[#d4af37]/10 rotate-[22.5deg] absolute rounded-full" />
                    </div>
                  </div>

                  {/* Inner Glow */}
                  <div className="absolute inset-7 rounded-full bg-[var(--bg-mid)]" />

                  {/* Play/Pause Button Center */}
                  <button
                    onClick={togglePlay}
                    className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#ffd700] to-[#d4af37] text-[#030d14] flex items-center justify-center font-bold shadow-xl gold-glow hover:scale-110 transition-transform duration-300"
                    aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-1" />
                    )}
                  </button>

                  {/* Active Pulse Ring */}
                  {isPlaying && <div className="absolute inset-0 rounded-full animate-pulse-ring" />}
                </div>
              </div>

              {/* Surah Info Header */}
              <div className="w-full flex items-center justify-between lg:justify-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[var(--bg-card)] text-[#4dd0e1] font-bold border border-[#4dd0e1]/20 cyan-glow">
                    السورة {selectedSurah.number}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[#d4af37]/20 text-[#ffd700]">
                    {selectedSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                  </span>
                </div>

                {/* Mobile Toggle Disc Expansion Button */}
                <button
                  onClick={() => setIsMobilePlayerExpanded(!isMobilePlayerExpanded)}
                  className="lg:hidden flex items-center gap-1 text-[11px] text-[#8bafc4] hover:text-[#ffd700] p-1"
                >
                  <span>{isMobilePlayerExpanded ? 'تصغير القرص' : 'عرض القرص'}</span>
                  {isMobilePlayerExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] gold-text-glow mb-1">
                {selectedSurah.name}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                {selectedSurah.englishName} • {selectedSurah.numberOfAyahs} آية
              </p>

              {/* Progress Bar */}
              <div className="w-full mb-4 px-1" dir="ltr">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="w-full accent-[#ffd700] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-center gap-3 sm:gap-5 dir-ltr w-full">
                <button
                  onClick={handleRepeatToggle}
                  title="تكرار السورة"
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    repeatMode !== 'none'
                      ? 'bg-[#d4af37]/15 text-[#ffd700] border border-[#d4af37]/30'
                      : 'text-[var(--text-muted)] hover:text-[#ffd700] border border-transparent'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </button>

                <button
                  onClick={playPrevSurah}
                  title="السورة السابقة"
                  className="p-2 text-[var(--text-secondary)] hover:text-[#ffd700] transition-colors duration-300"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ffd700] to-[#d4af37] text-[#030d14] flex items-center justify-center shadow-xl gold-glow hover:scale-105 active:scale-95 transition-all duration-300"
                  aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={playNextSurah}
                  title="السورة التالية"
                  className="p-2 text-[var(--text-secondary)] hover:text-[#ffd700] transition-colors duration-300"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <button
                  onClick={() => onSelectSurahForReading(selectedSurah.number)}
                  title="قراءة في المصحف"
                  className="p-2 rounded-xl text-[#4dd0e1] hover:text-[#ffd700] border border-[#4dd0e1]/15 hover:border-[#ffd700]/30 transition-all duration-300 flex items-center gap-1 text-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">قراءة</span>
                </button>
              </div>

              {/* Limited Catalog Notice Banner */}
              {currentReciter.availableSurahs && !currentReciter.availableSurahs.includes(selectedSurah.number) && (
                <div className="w-full mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-right text-xs text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <span>⚠️</span>
                    <span>سورة {selectedSurah.name} غير مسجلة بصوت {currentReciter.name}</span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 mb-2 leading-relaxed">
                    (تلاوات خاشعة مختارة) — يتم التشغيل تلقائياً بصوت الشيخ مشاري العفاسي كبديل.
                  </p>
                  <button
                    onClick={() => {
                      setActiveFilterTab('reciter');
                      const first = surahList.find((s) => currentReciter.availableSurahs!.includes(s.number));
                      if (first) playSurah(first);
                    }}
                    className="py-1 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold border border-amber-500/30 transition-all duration-200 inline-block"
                  >
                    عرض تلاوات {currentReciter.name.replace('الشيخ ', '')} ({currentReciter.availableSurahs.length} سورة مسجلة)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Surah List (Primary content on Mobile) */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Search, View Mode & Filters Card */}
          <div className="glass-card p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#4dd0e1]/10 space-y-3">
            {/* Search Input + View Mode Toggle */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#4dd0e1] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="ابحث برقم السورة أو اسمها (مثال: البقرة، 2)..."
                  className="w-full bg-[var(--bg-deep)] border border-[#4dd0e1]/15 rounded-xl pr-10 pl-9 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[#ffd700]/50 transition-all duration-300"
                />
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Switcher Toggle (List / Grid) */}
              <div className="flex items-center bg-[var(--bg-deep)] p-1 rounded-xl border border-[#4dd0e1]/15 flex-shrink-0">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#d4af37] text-[#030d14] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  title="عرض القائمة"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#d4af37] text-[#030d14] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                  title="عرض الشبكة"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Pills Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
              <button
                onClick={() => setActiveFilterTab('all')}
                className={`px-3.5 py-1.5 rounded-xl flex-shrink-0 transition-all duration-300 flex items-center gap-1.5 ${
                  activeFilterTab === 'all'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-md'
                    : 'bg-[var(--bg-deep)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[#4dd0e1]/10'
                }`}
              >
                <span>جميع السور</span>
                <span className="font-mono text-[10px] opacity-80">({counts.all})</span>
              </button>

              <button
                onClick={() => setActiveFilterTab('meccan')}
                className={`px-3.5 py-1.5 rounded-xl flex-shrink-0 transition-all duration-300 flex items-center gap-1.5 ${
                  activeFilterTab === 'meccan'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-md'
                    : 'bg-[var(--bg-deep)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[#4dd0e1]/10'
                }`}
              >
                <span>مكية</span>
                <span className="font-mono text-[10px] opacity-80">({counts.meccan})</span>
              </button>

              <button
                onClick={() => setActiveFilterTab('medinan')}
                className={`px-3.5 py-1.5 rounded-xl flex-shrink-0 transition-all duration-300 flex items-center gap-1.5 ${
                  activeFilterTab === 'medinan'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-md'
                    : 'bg-[var(--bg-deep)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[#4dd0e1]/10'
                }`}
              >
                <span>مدنية</span>
                <span className="font-mono text-[10px] opacity-80">({counts.medinan})</span>
              </button>

              <button
                onClick={() => setActiveFilterTab('bookmarks')}
                className={`px-3.5 py-1.5 rounded-xl flex-shrink-0 transition-all duration-300 flex items-center gap-1.5 ${
                  activeFilterTab === 'bookmarks'
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-md'
                    : 'bg-[var(--bg-deep)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[#4dd0e1]/10'
                }`}
              >
                <Heart className="w-3 h-3 text-[#f43f5e] fill-current" />
                <span>المفضلة</span>
                <span className="font-mono text-[10px] opacity-80">({counts.bookmarks})</span>
              </button>

              {currentReciter.availableSurahs && (
                <button
                  onClick={() => setActiveFilterTab('reciter')}
                  className={`px-3.5 py-1.5 rounded-xl flex-shrink-0 transition-all duration-300 flex items-center gap-1.5 ${
                    activeFilterTab === 'reciter'
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-md'
                      : 'bg-[#d4af37]/15 text-[#ffd700] hover:bg-[#d4af37]/25 border border-[#d4af37]/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                  <span>تلاوات {currentReciter.name.replace('الشيخ ', '')}</span>
                  <span className="font-mono text-[10px] opacity-90">({counts.reciter})</span>
                </button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {filteredSurahs.length === 0 && (
            <div className="glass-card p-10 text-center rounded-3xl border border-[#4dd0e1]/15 space-y-3">
              <Sparkles className="w-10 h-10 text-[#d4af37] mx-auto opacity-70 animate-pulse" />
              <h3 className="font-heading font-bold text-lg text-[var(--text-primary)]">
                لم يتم العثور على أي سورة
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
                جرّب البحث باسم آخر أو إزالة التصفية لعرض كافة السور.
              </p>
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="px-4 py-1.5 rounded-xl bg-[var(--bg-mid)] border border-[#ffd700]/30 text-[#ffd700] text-xs font-semibold hover:bg-[var(--bg-elevated)]"
                >
                  إلغاء البحث
                </button>
              )}
            </div>
          )}

          {/* ================= MODE 1: LIST VIEW ================= */}
          {viewMode === 'list' && filteredSurahs.length > 0 && (
            <div className="space-y-2">
              {filteredSurahs.map((surah) => {
                const isCurrentActive = currentSurah?.number === surah.number;
                const isCurrentPlaying = isCurrentActive && isPlaying;
                const isBm = isBookmarked(surah.number, 1);

                return (
                  <div
                    key={surah.number}
                    onClick={() => {
                      if (isCurrentActive) togglePlay();
                      else playSurah(surah);
                    }}
                    className={`group p-3 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrentActive
                        ? 'bg-[var(--bg-elevated)] border-[#d4af37]/60 shadow-xl gold-glow'
                        : 'bg-[var(--bg-card)] border-[#4dd0e1]/10 hover:border-[#d4af37]/40 hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    {/* RIGHT: Surah Number in Islamic Badge (Natural Arabic RTL Start) */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 border ${
                          isCurrentActive
                            ? 'bg-gradient-to-br from-[#ffd700] to-[#d4af37] text-[#030d14] border-transparent shadow-lg gold-glow scale-105'
                            : 'bg-[var(--bg-mid)] border-[#d4af37]/25 text-[#ffd700] group-hover:border-[#ffd700] group-hover:bg-[#d4af37]/15'
                        }`}
                      >
                        {surah.number}
                      </div>
                    </div>

                    {/* CENTER: Surah Info */}
                    <div className="flex-1 min-w-0 text-right pr-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-heading font-bold text-base sm:text-lg transition-colors duration-300 truncate ${
                            isCurrentActive
                              ? 'text-[#ffd700] gold-text-glow'
                              : 'text-[var(--text-primary)] group-hover:text-[#ffd700]'
                          }`}
                        >
                          سورة {surah.name}
                        </h3>

                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md border flex-shrink-0 font-medium ${
                            surah.revelationType === 'Meccan'
                              ? 'bg-[#d4af37]/10 border-[#d4af37]/25 text-[#d4af37]'
                              : 'bg-[#4dd0e1]/10 border-[#4dd0e1]/25 text-[#4dd0e1]'
                          }`}
                        >
                          {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                        </span>

                        {currentReciter.availableSurahs && (
                          currentReciter.availableSurahs.includes(surah.number) ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold flex-shrink-0">
                              تلاوة مسجلة
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300/80 flex-shrink-0">
                              بديل (العفاسي)
                            </span>
                          )
                        )}

                        {isCurrentPlaying && (
                          <div className="flex items-center gap-0.5 mr-1 h-3.5">
                            <span className="w-1 bg-[#ffd700] rounded-full animate-pulse h-2" />
                            <span className="w-1 bg-[#ffd700] rounded-full animate-pulse h-3.5" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 bg-[#ffd700] rounded-full animate-pulse h-2.5" style={{ animationDelay: '300ms' }} />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                        <span>{surah.englishName}</span>
                        <span>•</span>
                        <span className="text-[var(--text-secondary)] font-medium">{surah.numberOfAyahs} آية</span>
                      </p>
                    </div>

                    {/* LEFT: Quick Action Buttons (Natural Arabic RTL End) */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      {/* Play / Listen Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrentActive) togglePlay();
                          else playSurah(surah);
                        }}
                        title={isCurrentPlaying ? 'إيقاف التلاوة' : 'الاستماع للسورة'}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isCurrentActive
                            ? 'bg-gradient-to-br from-[#ffd700] to-[#d4af37] text-[#030d14] shadow-md gold-glow'
                            : 'bg-[var(--bg-mid)] border border-[#4dd0e1]/15 text-[#8bafc4] hover:text-[#ffd700] hover:border-[#ffd700]/40'
                        }`}
                      >
                        {isCurrentPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Read in Mushaf Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSurahForReading(surah.number);
                        }}
                        title="قراءة في المصحف"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--bg-mid)] border border-[#4dd0e1]/15 text-[#4dd0e1] hover:text-[#ffd700] hover:border-[#ffd700]/40 flex items-center justify-center transition-all duration-300"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>

                      {/* Bookmark / Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark({
                            surahNumber: surah.number,
                            surahName: surah.name,
                            ayahNumber: 1,
                            text: `سورة ${surah.name}`
                          });
                        }}
                        title={isBm ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isBm
                            ? 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30'
                            : 'bg-[var(--bg-mid)] border border-[#4dd0e1]/15 text-[var(--text-muted)] hover:text-[#f43f5e]'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isBm ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ================= MODE 2: GRID VIEW ================= */}
          {viewMode === 'grid' && filteredSurahs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5">
              {filteredSurahs.map((surah) => {
                const isCurrentActive = currentSurah?.number === surah.number;
                const isCurrentPlaying = isCurrentActive && isPlaying;
                const isBm = isBookmarked(surah.number, 1);

                return (
                  <div
                    key={surah.number}
                    onClick={() => {
                      if (isCurrentActive) togglePlay();
                      else playSurah(surah);
                    }}
                    className={`group p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                      isCurrentActive
                        ? 'bg-[var(--bg-elevated)] border-[#d4af37]/60 shadow-lg gold-glow'
                        : 'bg-[var(--bg-card)] border-[#4dd0e1]/10 hover:border-[#d4af37]/40 hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    {/* Top Row: Number & Revelation Type */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                          isCurrentActive
                            ? 'bg-[#ffd700] text-[#030d14]'
                            : 'bg-[var(--bg-mid)] text-[#ffd700] border border-[#d4af37]/20'
                        }`}
                      >
                        {surah.number}
                      </span>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md border font-medium ${
                          surah.revelationType === 'Meccan'
                            ? 'bg-[#d4af37]/10 border-[#d4af37]/25 text-[#d4af37]'
                            : 'bg-[#4dd0e1]/10 border-[#4dd0e1]/25 text-[#4dd0e1]'
                        }`}
                      >
                        {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                      </span>

                      {currentReciter.availableSurahs && (
                        currentReciter.availableSurahs.includes(surah.number) ? (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                            مسجلة
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300/80 border border-amber-500/20">
                            بديل
                          </span>
                        )
                      )}
                    </div>

                    {/* Center: Surah Name */}
                    <div className="text-center py-2">
                      <h4
                        className={`font-heading font-bold text-base sm:text-lg transition-colors truncate ${
                          isCurrentActive
                            ? 'text-[#ffd700] gold-text-glow'
                            : 'text-[var(--text-primary)] group-hover:text-[#ffd700]'
                        }`}
                      >
                        سورة {surah.name}
                      </h4>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">
                        {surah.englishName}
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-semibold text-[#8bafc4]">
                        {surah.numberOfAyahs} آية
                      </span>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#4dd0e1]/8 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrentActive) togglePlay();
                          else playSurah(surah);
                        }}
                        className={`p-1.5 rounded-lg transition-all ${
                          isCurrentActive
                            ? 'bg-[#ffd700] text-[#030d14]'
                            : 'text-[#8bafc4] hover:text-[#ffd700]'
                        }`}
                        title="استماع"
                      >
                        {isCurrentPlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSurahForReading(surah.number);
                        }}
                        className="p-1.5 rounded-lg text-[#4dd0e1] hover:text-[#ffd700] transition-colors"
                        title="قراءة"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark({
                            surahNumber: surah.number,
                            surahName: surah.name,
                            ayahNumber: 1,
                            text: `سورة ${surah.name}`
                          });
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBm ? 'text-[#f43f5e]' : 'text-[var(--text-muted)] hover:text-[#f43f5e]'
                        }`}
                        title="المفضلة"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isBm ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
