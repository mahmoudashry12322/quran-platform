// Audio Service & Reciters Directory

export interface Reciter {
  id: string; // e.g. "ar.alafasy" or "7" (Quran.com reciter ID)
  quranComId: number;
  name: string; // Arabic Name
  englishName: string;
  rewaya: string; // e.g. "حفص عن عاصم"
  style?: string; // e.g. "مرتل" or "مجود"
  audioServerUrl: string; // Base CDN URL for full surah MP3s
  image?: string;
  availableSurahs?: number[];
}

export const RECITERS_LIST: Reciter[] = [
  {
    id: 'ar.abdulrahmanmossad',
    quranComId: 7,
    name: 'الشيخ عبد الرحمن مسعد',
    englishName: 'Abdul Rahman Mossad',
    rewaya: 'حفص عن عاصم',
    style: 'تلاوات خاشعة',
    audioServerUrl: '/audio/mossad',
    availableSurahs: [1, 10, 19, 23, 29, 32, 49, 67, 73, 78, 87, 88, 100, 107]
  },
  {
    id: 'ar.sherifmostafa',
    quranComId: 21,
    name: 'الشيخ شريف مصطفى',
    englishName: 'Sherif Mostafa',
    rewaya: 'حفص عن عاصم',
    style: 'تلاوات خاشعة',
    audioServerUrl: '/audio/sherif',
    availableSurahs: [1, 13, 15, 18, 19, 20, 31, 32, 53, 55, 56, 57, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 79, 85, 89, 90, 92, 99, 109, 112]
  },
  {
    id: 'ar.alafasy',
    quranComId: 7,
    name: 'الشيخ مشاري راشد العفاسي',
    englishName: 'Mishary Rashid Alafasy',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server8.mp3quran.net/afs'
  },
  {
    id: 'ar.ajmi',
    quranComId: 1,
    name: 'الشيخ أحمد بن علي العجمي',
    englishName: 'Ahmed Ibn Ali Al-Ajamy',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server10.mp3quran.net/ajm'
  },
  {
    id: 'ar.abdulbasitmurattal',
    quranComId: 2,
    name: 'الشيخ عبد الباسط عبد الصمد',
    englishName: 'Abdul Basit Abdul Samad',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server7.mp3quran.net/basit'
  },
  {
    id: 'ar.minshawi',
    quranComId: 10,
    name: 'الشيخ محمد صديق المنشاوي',
    englishName: 'Mohamed Siddiq El-Minshawi',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server10.mp3quran.net/minsh'
  },
  {
    id: 'ar.husary',
    quranComId: 6,
    name: 'الشيخ محمود خليل الحصري',
    englishName: 'Mahmoud Khalil Al-Husary',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server13.mp3quran.net/husr'
  },
  {
    id: 'ar.sudais',
    quranComId: 3,
    name: 'الشيخ عبد الرحمن السديس',
    englishName: 'Abderrahman Al-Sudais',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server11.mp3quran.net/sds'
  },
  {
    id: 'ar.shuraim',
    quranComId: 4,
    name: 'الشيخ سعود الشريم',
    englishName: 'Saoud Al-Shuraim',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server7.mp3quran.net/shur'
  },
  {
    id: 'ar.mahermuaiqly',
    quranComId: 8,
    name: 'الشيخ ماهر المعيقلي',
    englishName: 'Maher Al-Muaiqly',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server12.mp3quran.net/maher'
  },
  {
    id: 'ar.yasserallahtheem',
    quranComId: 11,
    name: 'الشيخ ياسر الدوسري',
    englishName: 'Yasser Al-Dosari',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server11.mp3quran.net/yasser'
  },
  {
    id: 'ar.ghamadi',
    quranComId: 5,
    name: 'الشيخ سعد الغامدي',
    englishName: 'Saad Al-Ghamdi',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server7.mp3quran.net/s_gmd'
  },
  {
    id: 'ar.shatri',
    quranComId: 9,
    name: 'الشيخ أبو بكر الشاطري',
    englishName: 'Abu Bakr Al-Shatri',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server11.mp3quran.net/shatri'
  },
  {
    id: 'ar.qatami',
    quranComId: 12,
    name: 'الشيخ ناصر القطامي',
    englishName: 'Nasser Al-Qatami',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server6.mp3quran.net/qtm'
  },
  {
    id: 'ar.abkar',
    quranComId: 13,
    name: 'الشيخ إدريس أبكر',
    englishName: 'Idrees Abkar',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server6.mp3quran.net/abkr'
  },
  {
    id: 'ar.abbad',
    quranComId: 14,
    name: 'الشيخ فارس عباد',
    englishName: 'Fares Abbad',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server8.mp3quran.net/frs_a'
  },
  {
    id: 'ar.jaleel',
    quranComId: 15,
    name: 'الشيخ خالد الجليل',
    englishName: 'Khalid Al-Jaleel',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server10.mp3quran.net/jleel'
  },
  {
    id: 'ar.mustafa',
    quranComId: 16,
    name: 'الشيخ مصطفى إسماعيل',
    englishName: 'Mustafa Ismail',
    rewaya: 'حفص عن عاصم',
    style: 'مجود',
    audioServerUrl: 'https://server8.mp3quran.net/mustafa'
  },
  {
    id: 'ar.banna',
    quranComId: 17,
    name: 'الشيخ محمود علي البنا',
    englishName: 'Mahmoud Ali Al-Banna',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server8.mp3quran.net/bna'
  },
  {
    id: 'ar.huthifi',
    quranComId: 18,
    name: 'الشيخ علي بن عبد الرحمن الحذيفي',
    englishName: 'Ali Ibn Abderrahman Al-Huthaify',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server9.mp3quran.net/hthfi'
  },
  {
    id: 'ar.juhany',
    quranComId: 19,
    name: 'الشيخ عبد الله الجهني',
    englishName: 'Abdullah Awad Al-Juhany',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server13.mp3quran.net/jhn'
  },
  {
    id: 'ar.ayyoub',
    quranComId: 20,
    name: 'الشيخ محمد أيوب',
    englishName: 'Muhammad Ayyoub',
    rewaya: 'حفص عن عاصم',
    style: 'مرتل',
    audioServerUrl: 'https://server8.mp3quran.net/ayyub'
  }
];

// Helper to construct formatted Surah MP3 stream URL
export const getSurahAudioUrl = (reciter: Reciter, surahNumber: number): string => {
  const formattedNumber = String(surahNumber).padStart(3, '0');

  // Special handling for Sheikh Abdul Rahman Mossad (recorded selected reverent surahs)
  if (reciter.id === 'ar.abdulrahmanmossad') {
    const available = reciter.availableSurahs || [1, 10, 19, 23, 29, 32, 49, 67, 73, 78, 87, 88, 100, 107];
    if (available.includes(surahNumber)) {
      return `/audio/mossad/${formattedNumber}.mp3`;
    }
    // Fallback to high-quality recitation if specific surah was not recorded by Sheikh Abdul Rahman Mossad
    return `https://server8.mp3quran.net/afs/${formattedNumber}.mp3`;
  }

  // Special handling for Sheikh Sherif Mostafa (recorded selected reverent surahs)
  if (reciter.id === 'ar.sherifmostafa') {
    const available = reciter.availableSurahs || [1, 13, 15, 18, 19, 20, 31, 32, 53, 55, 56, 57, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 79, 85, 89, 90, 92, 99, 109, 112];
    if (available.includes(surahNumber)) {
      return `/audio/sherif/${formattedNumber}.mp3`;
    }
    // Fallback to high-quality recitation if specific surah was not recorded by Sheikh Sherif Mostafa
    return `https://server8.mp3quran.net/afs/${formattedNumber}.mp3`;
  }

  return `${reciter.audioServerUrl}/${formattedNumber}.mp3`;
};

