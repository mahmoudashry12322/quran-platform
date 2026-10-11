// Prayer Times & Qibla Direction Service

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  dateStr: string;
  hijriDate: string;
  cityName: string;
}

export interface NextPrayer {
  name: string;
  nameAr: string;
  time: string;
  remainingSeconds: number;
}

// Kaaba Coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

export const fetchPrayerTimesByCity = async (
  city: string = 'Cairo',
  country: string = 'Egypt'
): Promise<PrayerTimes> => {
  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=5`
    );
    const data = await res.json();
    if (data.code === 200 && data.data) {
      const timings = data.data.timings;
      const date = data.data.date;
      return {
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
        cityName: `${city}, ${country}`
      };
    }
  } catch (err) {
    console.error('Failed to fetch prayer timings', err);
  }

  // Fallback default times for Cairo
  return {
    Fajr: '04:15',
    Sunrise: '05:42',
    Dhuhr: '12:05',
    Asr: '15:40',
    Sunset: '18:28',
    Maghrib: '18:28',
    Isha: '19:48',
    Imsak: '04:05',
    Midnight: '00:05',
    dateStr: new Date().toLocaleDateString('ar-EG'),
    hijriDate: '13 صفر 1448 هـ',
    cityName: 'القاهرة، مصر'
  };
};

export const calculateNextPrayer = (timings: PrayerTimes): NextPrayer => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = currentMinutes * 60 + now.getSeconds();

  const prayers = [
    { key: 'Fajr', nameAr: 'الفجر' },
    { key: 'Sunrise', nameAr: 'الشروق' },
    { key: 'Dhuhr', nameAr: 'الظهر' },
    { key: 'Asr', nameAr: 'العصر' },
    { key: 'Maghrib', nameAr: 'المغرب' },
    { key: 'Isha', nameAr: 'العشاء' }
  ];

  for (const p of prayers) {
    const timeStr = (timings as any)[p.key];
    if (!timeStr) continue;
    const [h, m] = timeStr.split(':').map(Number);
    const prayerSeconds = h * 3600 + m * 60;

    if (prayerSeconds > currentSeconds) {
      return {
        name: p.key,
        nameAr: p.nameAr,
        time: timeStr,
        remainingSeconds: prayerSeconds - currentSeconds
      };
    }
  }

  // If all prayers today passed, next is tomorrow Fajr
  const [fajrH, fajrM] = timings.Fajr.split(':').map(Number);
  const fajrSecondsTomorrow = 86400 + (fajrH * 3600 + fajrM * 60);
  return {
    name: 'Fajr',
    nameAr: 'الفجر',
    time: timings.Fajr,
    remainingSeconds: fajrSecondsTomorrow - currentSeconds
  };
};

// Calculate exact Qibla bearing in degrees relative to True North from user lat/lng
export const calculateQiblaDirection = (userLat: number, userLng: number): number => {
  const phi1 = (userLat * Math.PI) / 180;
  const phi2 = (KAABA_LAT * Math.PI) / 180;
  const deltaLambda = ((KAABA_LNG - userLng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;

  return (qiblaDeg + 360) % 360;
};
