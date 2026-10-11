import React, { createContext, useContext, useState } from 'react';


export interface Bookmark {
  id: string; // "surahNum:ayahNum"
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  createdAt: string;
}

export interface LastRead {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  updatedAt: string;
}

export interface KhatmaPlan {
  durationDays: number;
  completedPages: number;
  totalPages: number;
  startDate: string;
}

export interface DailyWird {
  targetPages: number;
  completedTodayPages: number;
  lastUpdatedDate: string;
}

interface UserPreferencesContextType {
  lastRead: LastRead | null;
  bookmarks: Bookmark[];
  fontSize: number;
  khatmaPlan: KhatmaPlan;
  dailyWird: DailyWird;
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  saveLastRead: (surahNumber: number, surahName: string, ayahNumber: number) => void;
  toggleBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  setFontSize: (size: number) => void;
  updateKhatmaPlan: (durationDays: number, completedPages?: number) => void;
  logWirdPageRead: (count?: number) => void;
  setWirdTargetPages: (pages: number) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Last Read state
  const [lastRead, setLastReadState] = useState<LastRead | null>(() => {
    const saved = localStorage.getItem('quran_last_read');
    return saved ? JSON.parse(saved) : { surahNumber: 2, surahName: 'البقرة', ayahNumber: 255, updatedAt: new Date().toISOString() };
  });

  // Bookmarks state
  const [bookmarks, setBookmarksState] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('quran_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  // Font Size state (in px)
  const [fontSize, setFontSizeState] = useState<number>(() => {
    const saved = localStorage.getItem('quran_font_size');
    return saved ? parseInt(saved, 10) : 26;
  });

  // Khatma Plan state
  const [khatmaPlan, setKhatmaPlanState] = useState<KhatmaPlan>(() => {
    const saved = localStorage.getItem('quran_khatma_plan');
    return saved
      ? JSON.parse(saved)
      : { durationDays: 30, completedPages: 45, totalPages: 604, startDate: new Date().toISOString() };
  });

  // Daily Wird state
  const [dailyWird, setDailyWirdState] = useState<DailyWird>(() => {
    const saved = localStorage.getItem('quran_daily_wird');
    const today = new Date().toISOString().split('T')[0];
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.lastUpdatedDate === today) {
        return parsed;
      }
      // Reset today count if it's a new day
      return { targetPages: parsed.targetPages || 10, completedTodayPages: 0, lastUpdatedDate: today };
    }
    return { targetPages: 10, completedTodayPages: 4, lastUpdatedDate: today };
  });

  const saveLastRead = (surahNumber: number, surahName: string, ayahNumber: number) => {
    const item: LastRead = {
      surahNumber,
      surahName,
      ayahNumber,
      updatedAt: new Date().toISOString()
    };
    setLastReadState(item);
    localStorage.setItem('quran_last_read', JSON.stringify(item));
  };

  const toggleBookmark = (bm: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const id = `${bm.surahNumber}:${bm.ayahNumber}`;
    setBookmarksState((prev) => {
      const exists = prev.some((b) => b.id === id);
      let updated: Bookmark[];
      if (exists) {
        updated = prev.filter((b) => b.id !== id);
      } else {
        const newBm: Bookmark = {
          ...bm,
          id,
          createdAt: new Date().toISOString()
        };
        updated = [newBm, ...prev];
      }
      localStorage.setItem('quran_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = (surahNumber: number, ayahNumber: number): boolean => {
    return bookmarks.some((b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
  };

  const setFontSize = (size: number) => {
    const clamped = Math.min(48, Math.max(18, size));
    setFontSizeState(clamped);
    localStorage.setItem('quran_font_size', clamped.toString());
  };

  const updateKhatmaPlan = (durationDays: number, completedPages?: number) => {
    setKhatmaPlanState((prev) => {
      const updated: KhatmaPlan = {
        ...prev,
        durationDays,
        completedPages: completedPages !== undefined ? completedPages : prev.completedPages
      };
      localStorage.setItem('quran_khatma_plan', JSON.stringify(updated));
      return updated;
    });
  };

  const logWirdPageRead = (count: number = 1) => {
    const today = new Date().toISOString().split('T')[0];
    setDailyWirdState((prev) => {
      const updated: DailyWird = {
        ...prev,
        completedTodayPages: Math.min(604, prev.completedTodayPages + count),
        lastUpdatedDate: today
      };
      localStorage.setItem('quran_daily_wird', JSON.stringify(updated));
      return updated;
    });

    // Also update Khatma progress
    setKhatmaPlanState((prev) => {
      const updated: KhatmaPlan = {
        ...prev,
        completedPages: Math.min(604, prev.completedPages + count)
      };
      localStorage.setItem('quran_khatma_plan', JSON.stringify(updated));
      return updated;
    });
  };

  const setWirdTargetPages = (pages: number) => {
    const today = new Date().toISOString().split('T')[0];
    setDailyWirdState((prev) => {
      const updated: DailyWird = {
        ...prev,
        targetPages: Math.max(1, pages),
        lastUpdatedDate: today
      };
      localStorage.setItem('quran_daily_wird', JSON.stringify(updated));
      return updated;
    });
  };

  // Theme state ('dark' | 'light')
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('quran_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
    localStorage.setItem('quran_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        lastRead,
        bookmarks,
        fontSize,
        khatmaPlan,
        dailyWird,
        theme,
        toggleTheme,
        saveLastRead,
        toggleBookmark,
        isBookmarked,
        setFontSize,
        updateKhatmaPlan,
        logWirdPageRead,
        setWirdTargetPages
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
