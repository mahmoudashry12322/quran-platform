import React, { useState } from 'react';
import { useAudio } from '../../context/AudioContext';
import { IslamicVisualizerCanvas } from './IslamicVisualizerCanvas';
import { RECITERS_LIST } from '../../services/audioApi';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Sparkles,
  Music,
  ChevronDown,
  ListMusic,
  Gauge
} from 'lucide-react';

export const FullAudioModal: React.FC = () => {
  const {
    currentSurah,
    currentReciter,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackSpeed,
    repeatMode,
    activeAyahNumber,
    isFullPlayerOpen,
    surahList,
    togglePlay,
    seekTo,
    setVolume,
    setPlaybackSpeed,
    setRepeatMode,
    setReciter,
    playSurah,
    playNextSurah,
    playPrevSurah,
    setIsFullPlayerOpen
  } = useAudio();

  const [showQueue, setShowQueue] = useState(false);
  const [showReciterList, setShowReciterList] = useState(false);

  if (!isFullPlayerOpen || !currentSurah) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRepeatToggle = () => {
    if (repeatMode === 'none') setRepeatMode('surah');
    else if (repeatMode === 'surah') setRepeatMode('ayah');
    else setRepeatMode('none');
  };

  const handleSpeedCycle = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" style={{
      background: 'linear-gradient(180deg, rgba(3,13,20,0.98) 0%, rgba(7,24,34,0.95) 100%)',
      backdropFilter: 'blur(40px)'
    }}>
      {/* Canvas Background */}
      <IslamicVisualizerCanvas isPlaying={isPlaying} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-5 flex items-center justify-between z-10" style={{
        background: 'linear-gradient(180deg, rgba(3,13,20,0.9) 0%, transparent 100%)'
      }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0c2231] border border-[#d4af37]/25 flex items-center justify-center gold-glow">
            <Sparkles className="w-4 h-4 text-[#ffd700]" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-[#ffd700] gold-text-glow">منصة القرآن الكريم</h3>
            <p className="text-[10px] text-[#5b7d92]">استماع تفاعلي روحاني</p>
          </div>
        </div>

        {/* Reciter Select */}
        <div className="relative">
          <button
            onClick={() => setShowReciterList(!showReciterList)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0c2231]/90 border border-[#d4af37]/30 text-xs font-semibold text-[#ffd700] hover:bg-[#112d40] transition-all duration-300"
          >
            <Music className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">{currentReciter.name}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showReciterList && (
            <div className="absolute left-0 top-12 w-72 max-h-72 overflow-y-auto bg-[#0c2231] border border-[#d4af37]/30 rounded-2xl p-2 shadow-2xl z-30">
              <div className="px-3 py-2 text-[11px] font-bold text-[#d4af37] border-b border-[#112d40] mb-1">اختر القارئ</div>
              {RECITERS_LIST.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setReciter(r); setShowReciterList(false); }}
                  className={`w-full text-right px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all duration-300 ${
                    currentReciter.id === r.id
                      ? 'bg-[#d4af37]/15 text-[#ffd700] border border-[#d4af37]/30 font-bold'
                      : 'hover:bg-[#112d40] text-[#e8f4fd]'
                  }`}
                >
                  <div>
                    <div>{r.name}</div>
                    <div className="text-[10px] text-[#5b7d92]">{r.rewaya}</div>
                  </div>
                  {currentReciter.id === r.id && <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsFullPlayerOpen(false)}
          className="p-2.5 rounded-full bg-[#0c2231]/80 border border-[#4dd0e1]/15 text-[#8bafc4] hover:text-white hover:bg-[#112d40] transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center gap-8">
        {/* Disc */}
        <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-full flex items-center justify-center animate-float">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#d4af37]/8 to-[#4dd0e1]/8 border-2 border-[#d4af37]/15 shadow-2xl" />
          <div className={`absolute inset-4 rounded-full border border-[#d4af37]/12 ${isPlaying ? 'animate-spin-slow' : ''}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full border border-[#d4af37]/12 rotate-45 rounded-full" />
              <div className="w-full h-full border border-[#4dd0e1]/8 absolute inset-0 rounded-full" />
              <div className="w-3/4 h-3/4 border border-[#d4af37]/8 rotate-[22.5deg] absolute rounded-full" />
            </div>
          </div>
          <div className="absolute inset-10 rounded-full bg-gradient-to-b from-[#0c2231] to-[#071822]" />
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#ffd700] to-[#d4af37] flex items-center justify-center text-[#030d14] shadow-xl gold-glow mb-2">
              <Music className="w-8 h-8" />
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0c2231] text-[#4dd0e1] border border-[#4dd0e1]/20">
              سورة {currentSurah.number}
            </span>
          </div>
          {isPlaying && <div className="absolute inset-0 rounded-full animate-pulse-ring" />}
        </div>

        {/* Surah Name */}
        <div className="text-center">
          <h2 className="font-heading text-4xl font-bold text-white gold-text-glow mb-1">{currentSurah.name}</h2>
          <p className="text-xs text-[#8bafc4]">
            {currentSurah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {currentSurah.numberOfAyahs} آية
          </p>
          {currentReciter.availableSurahs && (
            <div className="mt-2 inline-block">
              {currentReciter.availableSurahs.includes(currentSurah.number) ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  ✨ تلاوة مسجلة بصوت {currentReciter.name}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  ⚠️ غير مسجلة للقارئ — يتم التشغيل بصوت الشيخ مشاري العفاسي
                </span>
              )}
            </div>
          )}
        </div>

        {activeAyahNumber && (
          <div className="px-5 py-2.5 rounded-2xl bg-[#0c2231]/80 border border-[#d4af37]/20 text-center animate-shimmer">
            <span className="text-[11px] text-[#d4af37]">الآية {activeAyahNumber}</span>
          </div>
        )}

        {/* Controls Card */}
        <div className="w-full max-w-xl glass-panel p-6">
          <div className="mb-4" dir="ltr">
            <input
              type="range" min={0} max={duration || 100} value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))} className="w-full"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#5b7d92] mt-1.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-4">
            <button onClick={handleSpeedCycle}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#0c2231] border border-[#d4af37]/15 text-xs font-bold text-[#d4af37] hover:bg-[#112d40] transition-all duration-300">
              <Gauge className="w-3.5 h-3.5" /><span>{playbackSpeed}x</span>
            </button>

            <div className="flex items-center gap-5 dir-ltr">
              <button onClick={playPrevSurah} className="p-2.5 text-[#8bafc4] hover:text-[#ffd700] transition-colors duration-300">
                <SkipBack className="w-6 h-6" />
              </button>
              <button onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#b38f2a] text-[#030d14] flex items-center justify-center shadow-2xl gold-glow hover:scale-105 transition-transform duration-300">
                {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
              </button>
              <button onClick={playNextSurah} className="p-2.5 text-[#8bafc4] hover:text-[#ffd700] transition-colors duration-300">
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            <button onClick={handleRepeatToggle}
              className={`p-2 rounded-xl border text-xs transition-all duration-300 flex items-center gap-1 ${
                repeatMode !== 'none'
                  ? 'bg-[#d4af37]/15 border-[#d4af37]/30 text-[#ffd700]'
                  : 'bg-[#0c2231] border-[#4dd0e1]/10 text-[#5b7d92]'
              }`}>
              <Repeat className="w-4 h-4" />
              {repeatMode === 'surah' && <span>سورة</span>}
              {repeatMode === 'ayah' && <span>آية</span>}
            </button>
          </div>

          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#4dd0e1]/8" dir="ltr">
            <Volume2 className="w-4 h-4 text-[#4dd0e1]" />
            <input type="range" min={0} max={1} step={0.05} value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-1" />
            <button onClick={() => setShowQueue(!showQueue)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-all duration-300 ${
                showQueue ? 'bg-[#d4af37]/15 border-[#d4af37]/30 text-[#ffd700]' : 'bg-[#0c2231] border-[#4dd0e1]/10 text-[#8bafc4]'
              }`}>
              <ListMusic className="w-3.5 h-3.5" /><span>السور</span>
            </button>
          </div>
        </div>

        {showQueue && (
          <div className="w-full max-w-xl max-h-56 overflow-y-auto bg-[#0c2231] border border-[#d4af37]/25 rounded-2xl p-3 shadow-2xl">
            <h4 className="font-heading font-bold text-xs text-[#ffd700] mb-2">قائمة جميع السور (114)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {surahList.map((s) => (
                <button key={s.number}
                  onClick={() => { playSurah(s); setShowQueue(false); }}
                  className={`text-right p-2 rounded-xl border text-[11px] transition-all duration-300 flex items-center justify-between ${
                    currentSurah.number === s.number
                      ? 'bg-[#d4af37]/15 border-[#d4af37]/30 text-[#ffd700] font-bold'
                      : 'bg-[#071822] border-transparent text-[#e8f4fd] hover:border-[#d4af37]/20'
                  }`}>
                  <span className="truncate">{s.number}. {s.name}</span>
                  <span className="text-[9px] text-[#5b7d92]">{s.numberOfAyahs}آية</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
