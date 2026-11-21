import React from 'react';
import { useAudio } from '../../context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Maximize2, Disc } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const {
    currentSurah,
    currentReciter,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seekTo,
    playNextSurah,
    playPrevSurah,
    setIsFullPlayerOpen
  } = useAudio();

  if (!currentSurah) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 shadow-2xl glass-panel !rounded-none border-t border-[#d4af37]/20">
      {/* Progress Bar — forced LTR so click-to-seek math is correct */}
      <div
        dir="ltr"
        className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--bg-elevated)] cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const ratio = Math.max(0, Math.min(1, clickX / rect.width));
          seekTo(ratio * duration);
        }}
      >
        <div
          className="h-full bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#d4af37] relative transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#ffd700] rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform gold-glow" />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 px-4 py-2.5 mt-0.5">
        {/* Surah Info */}
        <div
          className="flex items-center gap-3 cursor-pointer group min-w-0"
          onClick={() => setIsFullPlayerOpen(true)}
        >
          <div className={`relative w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0 ${isPlaying ? 'gold-glow' : ''}`}>
            <Disc className={`w-5 h-5 text-[#d4af37] ${isPlaying ? 'animate-spin-slow' : ''}`} />
          </div>
          <div className="min-w-0">
            <h4 className="font-heading font-bold text-sm text-[#ffd700] truncate group-hover:text-[var(--text-primary)] transition-colors duration-300">
              سورة {currentSurah.name}
            </h4>
            {currentReciter.availableSurahs && !currentReciter.availableSurahs.includes(currentSurah.number) ? (
              <p className="text-[10px] text-amber-300 truncate font-medium">
                بديل: مشاري العفاسي (غير مسجلة لـ {currentReciter.name.replace('الشيخ ', '')})
              </p>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)] truncate">{currentReciter.name}</p>
            )}
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3 dir-ltr">
          <button onClick={playPrevSurah} className="p-1.5 text-[var(--text-secondary)] hover:text-[#ffd700] transition-colors duration-300 rounded-full hover:bg-[var(--bg-card)]">
            <SkipBack className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd700] to-[#d4af37] text-[#030d14] flex items-center justify-center shadow-lg gold-glow hover:scale-105 transition-transform duration-300"
          >
            {isPlaying ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current ml-0.5" />}
          </button>
          <button onClick={playNextSurah} className="p-1.5 text-[var(--text-secondary)] hover:text-[#ffd700] transition-colors duration-300 rounded-full hover:bg-[var(--bg-card)]">
            <SkipForward className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Right Time + Expand */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline font-mono text-[11px] text-[var(--text-muted)]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            onClick={() => setIsFullPlayerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[#d4af37]/20 text-xs font-semibold text-[#d4af37] hover:bg-[var(--bg-elevated)] hover:border-[#ffd700]/40 transition-all duration-300"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">الشاشة الكاملة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
