import React, { useState, useEffect } from 'react';
import {

  fetchPrayerTimesByCity,
  calculateNextPrayer,
  calculateQiblaDirection
} from '../../services/prayerApi';
import type { PrayerTimes, NextPrayer } from '../../services/prayerApi';
import { Compass, Clock, MapPin, Sun, Moon, Sunrise, Sunset, Navigation } from 'lucide-react';

export const PrayerAndQiblaView: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
  const [qiblaAngle, setQiblaAngle] = useState<number>(136.5); // Default Cairo Qibla angle

  const loadTimes = async () => {
    const times = await fetchPrayerTimesByCity('Cairo', 'Egypt');
    setPrayerTimes(times);
    const next = calculateNextPrayer(times);
    setNextPrayer(next);
  };

  useEffect(() => {
    loadTimes();
  }, []);


  // Update countdown every second
  useEffect(() => {
    if (!prayerTimes) return;
    const interval = setInterval(() => {
      const next = calculateNextPrayer(prayerTimes);
      setNextPrayer(next);
    }, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Request browser geolocation for exact location & Qibla
  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const angle = calculateQiblaDirection(lat, lng);
          setQiblaAngle(angle);

          try {
            const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=5`);
            const data = await res.json();
            if (data.data) {
              const timings = data.data.timings;
              const date = data.data.date;
              const times: PrayerTimes = {
                Fajr: timings.Fajr,
                Sunrise: timings.Sunrise,
                Dhuhr: timings.Dhuhr,
                Asr: timings.Asr,
                Sunset: timings.Sunset,
                Maghrib: timings.Maghrib,
                Isha: timings.Isha,
                Imsak: timings.Imsak,
                Midnight: timings.Midnight,
                dateStr: date.readable,
                hijriDate: `${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year} هـ`,
                cityName: 'موقعك الحالي'
              };
              setPrayerTimes(times);
              setNextPrayer(calculateNextPrayer(times));
            }
          } catch (e) {
            console.error(e);
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
        }
      );
    }
  };

  const formatCountdown = (secs: number) => {
    if (!secs || secs < 0) return '00:00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-[#e2f1e9]">
      <div className="text-center mb-8">
        <span className="px-3.5 py-1 rounded-full bg-[#144733] text-[#ffd700] border border-[#d4af37]/30 text-xs font-semibold inline-block mb-3">
          مواقيت الصلاة اتجاه القبلة
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#ffd700] mb-2">
          مواقيت الصلاة والقبلة الشريفة
        </h2>
        <p className="text-sm text-[#9ca3af]">
          توقيت دقيق لجميع الصلوات مع العد التنازلي وبوصلة اتجاه القبلة نحو الكعبة المشرفة
        </p>
      </div>

      {/* Next Prayer Countdown Card */}
      {nextPrayer && prayerTimes && (
        <div className="bg-[#072116] border border-[#d4af37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl mb-10 text-center glass-panel relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 text-xs text-[#a7f3d0] font-semibold mb-2">
            <MapPin className="w-4 h-4 text-[#ffd700]" />
            <span>{prayerTimes.cityName}</span>
            <span className="mx-2">•</span>
            <span>{prayerTimes.hijriDate}</span>
          </div>

          <span className="text-xs text-[#9ca3af] block">الصلاة القادمة</span>
          <h3 className="font-heading text-4xl sm:text-5xl font-bold text-[#ffd700] my-2">
            صلاة {nextPrayer.nameAr} ({nextPrayer.time})
          </h3>

          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#22c55e] my-3 dir-ltr">
            {formatCountdown(nextPrayer.remainingSeconds)}
          </div>

          <p className="text-xs text-[#9ca3af]">متبقي على رفْع الآذان</p>

          <button
            onClick={handleUseMyLocation}
            className="mt-4 px-4 py-2 rounded-xl bg-[#0d2d20] border border-[#d4af37]/30 text-xs text-[#ffd700] hover:bg-[#144733] transition-colors inline-flex items-center gap-2"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>تحديث بالموقع الجغرافي الحالي</span>
          </button>
        </div>
      )}

      {/* Prayer Schedule Grid & Qibla Compass split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Prayer Times Table */}
        <div className="bg-[#072116] border border-[#d4af37]/20 rounded-3xl p-6 shadow-xl glass-card">
          <h3 className="font-heading font-bold text-xl text-[#ffd700] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" /> مواقيت الصلاة اليوم
          </h3>

          {prayerTimes && (
            <div className="space-y-3">
              {[
                { label: 'الفجر', key: 'Fajr', icon: <Sunrise className="w-4 h-4 text-[#38bdf8]" /> },
                { label: 'الشروق', key: 'Sunrise', icon: <Sun className="w-4 h-4 text-[#fbbf24]" /> },
                { label: 'الظهر', key: 'Dhuhr', icon: <Sun className="w-4 h-4 text-[#ffd700]" /> },
                { label: 'العصر', key: 'Asr', icon: <Sun className="w-4 h-4 text-[#f59e0b]" /> },
                { label: 'المغرب', key: 'Maghrib', icon: <Sunset className="w-4 h-4 text-[#f97316]" /> },
                { label: 'العشاء', key: 'Isha', icon: <Moon className="w-4 h-4 text-[#818cf8]" /> }
              ].map((p) => {
                const isNext = nextPrayer?.nameAr === p.label;
                const timeValue = (prayerTimes as any)[p.key];

                return (
                  <div
                    key={p.key}
                    className={`p-3.5 rounded-2xl flex items-center justify-between transition-colors border ${
                      isNext
                        ? 'bg-[#0d2d20] border-[#ffd700] text-white gold-glow font-bold'
                        : 'bg-[#030f0a]/60 border-[#144733] text-[#e2f1e9]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {p.icon}
                      <span className="text-sm font-semibold">{p.label}</span>
                    </div>
                    <span className="font-mono text-base font-bold text-[#ffd700]">{timeValue}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Interactive Qibla Compass */}
        <div className="bg-[#072116] border border-[#d4af37]/20 rounded-3xl p-6 shadow-xl glass-card flex flex-col items-center justify-center text-center">
          <h3 className="font-heading font-bold text-xl text-[#ffd700] mb-2 flex items-center gap-2">
            <Compass className="w-5 h-5" /> اتجاه القبلة الشريفة
          </h3>
          <p className="text-xs text-[#9ca3af] mb-6">
            زاوية القبلة بالنسبة للشمال: <span className="text-[#ffd700] font-bold">{Math.round(qiblaAngle)}°</span>
          </p>

          {/* Compass Dial Visual */}
          <div className="relative w-56 h-56 rounded-full border-4 border-[#d4af37]/40 bg-[#030f0a] flex items-center justify-center shadow-2xl gold-glow mb-4">
            {/* North Indicator */}
            <span className="absolute top-2 font-bold text-xs text-[#f43f5e]">شمال (N)</span>

            {/* Qibla Rotating Needle Arrow */}
            <div
              className="absolute inset-4 flex items-center justify-center transition-transform duration-500"
              style={{ transform: `rotate(${qiblaAngle}deg)` }}
            >
              <div className="flex flex-col items-center">
                {/* Kaaba Emblem */}
                <div className="w-7 h-7 bg-[#ffd700] border-2 border-black rounded-md shadow-lg flex items-center justify-center text-[10px] font-bold text-black mb-1">
                  🕋
                </div>
                <div className="w-1.5 h-20 bg-gradient-to-b from-[#ffd700] to-transparent rounded-full shadow-md" />
              </div>
            </div>

            {/* Center Axis */}
            <div className="w-4 h-4 rounded-full bg-[#ffd700] border-2 border-[#030f0a] z-10" />
          </div>

          <p className="text-xs text-[#a7f3d0] max-w-xs">
            قم بتوجيه أعلى الهاتف أو الشاشة نحو رمز الكعبة المضيء لمعرفة الاتجاه الدقيق للقبلة.
          </p>
        </div>
      </div>
    </div>
  );
};
