// Quran API Service - Quran.com v4 & AlQuran Cloud Integration

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number; // Global ayah number
  numberInSurah: number;
  text: string;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | object;
  tafsir?: string;
  translation?: string;
  audioUrl?: string;
  surahNumber?: number;
  surahName?: string;
}

export interface AudioSegment {
  verseKey: string; // e.g. "1:1"
  timestampFrom: number; // in milliseconds
  timestampTo: number; // in milliseconds
  duration: number;
}

export interface SearchResult {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  highlightedText?: string;
}

const BASE_QURAN_COM = 'https://api.quran.com/api/v4';
const BASE_ALQURAN_CLOUD = 'https://api.alquran.cloud/v1';

// Static Surah directory cache to make browsing instant
let surahCache: Surah[] | null = null;

export const fetchSurahsList = async (): Promise<Surah[]> => {
  if (surahCache && surahCache.length === 114) {
    return surahCache;
  }
  try {
    const res = await fetch(`${BASE_ALQURAN_CLOUD}/surah`);
    const data = await res.json();
    if (data.code === 200 && Array.isArray(data.data)) {
      surahCache = data.data;
      return data.data;
    }
  } catch (err) {
    console.error('Failed to fetch surah list from AlQuran Cloud, trying fallback', err);
  }

  // Fallback to Quran.com v4
  try {
    const res = await fetch(`${BASE_QURAN_COM}/chapters?language=ar`);
    const data = await res.json();
    if (data.chapters) {
      surahCache = data.chapters.map((ch: any) => ({
        number: ch.id,
        name: ch.name_arabic,
        englishName: ch.name_simple,
        englishNameTranslation: ch.translated_name.name,
        numberOfAyahs: ch.verses_count,
        revelationType: ch.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'
      }));
      return surahCache!;
    }
  } catch (err) {
    console.error('Fallback surah list fetch failed', err);
  }

  return [];
};

// Fetch full Surah with Ayahs and optional translation/tafsir
export const fetchSurahDetails = async (
  surahNumber: number,
  reciterAudioId: string = 'ar.alafasy'
): Promise<{ surah: Surah; ayahs: Ayah[] }> => {
  try {
    // Fetch Arabic Uthmani text with audio URLs from AlQuran Cloud
    const res = await fetch(`${BASE_ALQURAN_CLOUD}/surah/${surahNumber}/${reciterAudioId}`);
    const data = await res.json();
    
    if (data.code === 200 && data.data) {
      const surahInfo: Surah = {
        number: data.data.number,
        name: data.data.name,
        englishName: data.data.englishName,
        englishNameTranslation: data.data.englishNameTranslation,
        numberOfAyahs: data.data.numberOfAyahs,
        revelationType: data.data.revelationType
      };

      const ayahs: Ayah[] = data.data.ayahs.map((a: any) => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        text: a.text,
        juz: a.juz,
        manzil: a.manzil,
        page: a.page,
        ruku: a.ruku,
        hizbQuarter: a.hizbQuarter,
        sajda: a.sajda,
        audioUrl: a.audio
      }));

      return { surah: surahInfo, ayahs };
    }
  } catch (err) {
    console.error(`Failed to fetch surah ${surahNumber}`, err);
  }

  throw new Error(`تعذر تحميل السورة رقم ${surahNumber}`);
};

export interface QuranPageData {
  pageNumber: number;
  juz: number;
  surahsInPage: { number: number; name: string; englishName: string }[];
  ayahs: Ayah[];
}

const pageCache = new Map<number, QuranPageData>();

export const fetchQuranPage = async (pageNumber: number): Promise<QuranPageData> => {
  const pageNum = Math.max(1, Math.min(604, pageNumber));

  if (pageCache.has(pageNum)) {
    return pageCache.get(pageNum)!;
  }

  try {
    const res = await fetch(`${BASE_ALQURAN_CLOUD}/page/${pageNum}/ar.uthmani`);
    const data = await res.json();

    if (data.code === 200 && data.data && Array.isArray(data.data.ayahs)) {
      const ayahsRaw = data.data.ayahs;
      const surahsMap = new Map<number, { number: number; name: string; englishName: string }>();

      const ayahs: Ayah[] = ayahsRaw.map((a: any) => {
        if (a.surah) {
          surahsMap.set(a.surah.number, {
            number: a.surah.number,
            name: a.surah.name,
            englishName: a.surah.englishName
          });
        }
        return {
          number: a.number,
          numberInSurah: a.numberInSurah,
          text: a.text,
          juz: a.juz,
          manzil: a.manzil,
          page: pageNum,
          ruku: a.ruku,
          hizbQuarter: a.hizbQuarter,
          sajda: a.sajda,
          surahNumber: a.surah ? a.surah.number : undefined,
          surahName: a.surah ? a.surah.name : undefined
        };
      });

      const pageData: QuranPageData = {
        pageNumber: pageNum,
        juz: ayahs.length > 0 ? ayahs[0].juz : 1,
        surahsInPage: Array.from(surahsMap.values()),
        ayahs
      };

      pageCache.set(pageNum, pageData);

      // Prefetch adjacent pages in background for instant page flips
      if (pageNum + 1 <= 604 && !pageCache.has(pageNum + 1)) {
        fetchQuranPage(pageNum + 1).catch(() => {});
      }
      if (pageNum - 1 >= 1 && !pageCache.has(pageNum - 1)) {
        fetchQuranPage(pageNum - 1).catch(() => {});
      }

      return pageData;
    }
  } catch (err) {
    console.error(`Failed to fetch page ${pageNum}`, err);
  }

  throw new Error(`تعذر تحميل الصفحة رقم ${pageNum}`);
};

// Fetch Tafsir for a specific Ayah (e.g. Tafsir Saadi or Muyassar)
export const fetchAyahTafsir = async (surahNumber: number, ayahNumberInSurah: number): Promise<string> => {
  try {
    // Quran.com Tafsir endpoint (Tafsir Al-Muyassar id = 16 or Saadi id = 91)
    const res = await fetch(`${BASE_QURAN_COM}/tafsirs/ar-tafsir-muyassar/by_ayah/${surahNumber}:${ayahNumberInSurah}`);
    const data = await res.json();
    if (data.tafsir && data.tafsir.text) {
      // Strip HTML tags if any
      return data.tafsir.text.replace(/<[^>]*>?/gm, '');
    }
  } catch (err) {
    console.error('Failed to fetch tafsir from Quran.com', err);
  }

  // Fallback to AlQuran Cloud Tafsir
  try {
    const res = await fetch(`${BASE_ALQURAN_CLOUD}/ayah/${surahNumber}:${ayahNumberInSurah}/ar.veryeasy`);
    const data = await res.json();
    if (data.data && data.data.text) {
      return data.data.text;
    }
  } catch (err) {
    console.error('Fallback tafsir failed', err);
  }

  return 'التفسير الميسر غير متاح حالياً لهذه الآية.';
};

// Fetch Ayah timing segments for timestamp synchronization
export const fetchSurahAudioTimestamps = async (
  quranComReciterId: number,
  surahNumber: number
): Promise<AudioSegment[]> => {
  try {
    const res = await fetch(
      `${BASE_QURAN_COM}/recitations/${quranComReciterId}/by_surah/${surahNumber}?fields=segments`
    );
    const data = await res.json();
    if (data.audio_files && data.audio_files[0] && data.audio_files[0].verse_timings) {
      return data.audio_files[0].verse_timings.map((vt: any) => ({
        verseKey: vt.verse_key,
        timestampFrom: vt.timestamp_from,
        timestampTo: vt.timestamp_to,
        duration: vt.duration
      }));
    }
  } catch (err) {
    console.error('Audio timestamp sync fetch error:', err);
  }
  return [];
};

// Quran Search Engine with Arabic query support
export const searchQuran = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${BASE_QURAN_COM}/search?q=${encodeURIComponent(query)}&size=30&language=ar`);
    const data = await res.json();
    if (data.search && data.search.results) {
      return data.search.results.map((r: any) => {
        const [surahNum, ayahNum] = r.verse_key.split(':');
        return {
          surahNumber: parseInt(surahNum, 10),
          surahName: r.text ? `سورة ${surahNum}` : '',
          ayahNumber: parseInt(ayahNum, 10),
          text: r.text.replace(/<[^>]*>?/gm, ''),
          highlightedText: r.highlighted || r.text
        };
      });
    }
  } catch (err) {
    console.error('Quran search error', err);
  }
  return [];
};
