import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface IslamicSplashScreenProps {
  onComplete?: () => void;
}

export const IslamicSplashScreen: React.FC<IslamicSplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Smooth progress bar filling up
    const startTime = Date.now();
    const duration = 2000; // 2 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(current);

      if (current >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsDone(true);
            if (onComplete) onComplete();
          }, 500); // 500ms fade out transition
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      onClick={() => {
        setIsExiting(true);
        setTimeout(() => {
          setIsDone(true);
          if (onComplete) onComplete();
        }, 300);
      }}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between py-12 px-6 bg-[#030d14] cursor-pointer select-none transition-all duration-500 overflow-hidden ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Lights & Islamic Mandala Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/15 via-[#030d14] to-[#030d14] pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#d4af37]/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#4dd0e1]/10 blur-[120px] pointer-events-none" />

      {/* Floating Star Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-[#ffd700] animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-12 w-1.5 h-1.5 rounded-full bg-[#4dd0e1] animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-2 h-2 rounded-full bg-[#ffd700] animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1.5s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
      </div>

      {/* Top Hanging Islamic Gold Lanterns */}
      <div className="relative z-10 w-full max-w-sm flex justify-between px-8 opacity-70">
        <div className="flex flex-col items-center animate-bounce-slow">
          <div className="w-px h-14 bg-gradient-to-b from-transparent via-[#d4af37]/60 to-[#d4af37]" />
          <div className="w-7 h-9 border border-[#d4af37] rounded-b-xl bg-[#d4af37]/20 flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
            <div className="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col items-center animate-bounce-slow" style={{ animationDelay: '1s' }}>
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-[#d4af37]/60 to-[#d4af37]" />
          <div className="w-8 h-10 border border-[#d4af37] rounded-b-xl bg-[#d4af37]/20 flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffd700] animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col items-center animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#d4af37]/60 to-[#d4af37]" />
          <div className="w-7 h-9 border border-[#d4af37] rounded-b-xl bg-[#d4af37]/20 flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
            <div className="w-2 h-2 rounded-full bg-[#ffd700] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Center 3D Golden Quran Emblem & Animated Text */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto px-4 max-w-md">

        {/* 3D Quran Logo Container with Rotating Light Rays */}
        <div className="relative mb-8">
          {/* Rotating Outer Geometric Ring */}
          <div className="absolute -inset-5 rounded-full border border-[#d4af37]/20 animate-spin-slow pointer-events-none flex items-center justify-center">
            <div className="w-full h-full border border-[#4dd0e1]/15 rotate-45 rounded-full" />
          </div>

          {/* Pulsing Light Glow behind emblem */}
          <div className="absolute inset-0 rounded-3xl bg-[#ffd700]/30 blur-2xl animate-pulse" />

          {/* The 3D Quran Logo Image */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl p-1 bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#8d711f] shadow-2xl shadow-[#d4af37]/40 transform transition-transform duration-700 hover:scale-105">
            <img
              src="/quran-logo-gold.png"
              alt="منصة القرآن الكريم"
              className="w-full h-full object-cover rounded-[22px] shadow-inner"
            />
          </div>
        </div>

        {/* Calligraphic Bismillah */}
        <div className="px-5 py-1.5 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 mb-4 inline-block shadow-lg">
          <p className="font-quran text-lg sm:text-xl text-[#ffd700] tracking-wide" style={{ textShadow: '0 0 15px rgba(255,215,0,0.4)' }}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#fff5c0] to-[#d4af37] mb-2 tracking-wide">
          منصّة القُرْآن الكريم
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-[#a3c2d6] font-medium leading-relaxed max-w-xs">
          التطبيق الإسلامي الشامل — المصحف المصوّر، التلاوات، الأذكار، والورد اليومي
        </p>
      </div>

      {/* Bottom Loading Progress Bar & Feet Info */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-3">
        {/* Progress Line Bar */}
        <div className="w-full h-1.5 bg-[#0f2130] rounded-full overflow-hidden border border-[#d4af37]/20 p-0.5 relative">
          <div
            className="h-full bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#4dd0e1] rounded-full transition-all duration-100 shadow-md shadow-[#ffd700]/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[11px] text-[#5b7d92] font-mono px-1">
          <span className="flex items-center gap-1 text-[#ffd700]">
            <Sparkles className="w-3 h-3 animate-spin" /> جاري التحميل...
          </span>
          <span className="text-[#ffd700] font-bold">{progress}%</span>
        </div>
      </div>
    </div>
  );
};
