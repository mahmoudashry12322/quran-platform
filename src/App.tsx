import React, { useState } from 'react';
import { AudioProvider } from './context/AudioContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { HomeView } from './components/Home/HomeView';
import { QuranReader } from './components/Quran/QuranReader';
import { TafsirView } from './components/Tafsir/TafsirView';
import { ReciterCatalogView } from './components/Reciters/ReciterCatalogView';
import { AzkarView } from './components/Azkar/AzkarView';
import { KhatmaTrackerView } from './components/Khatma/KhatmaTrackerView';
import { DailyWirdView } from './components/Wird/DailyWirdView';
import { PrayerAndQiblaView } from './components/PrayerTimes/PrayerAndQiblaView';
import { AdminView } from './components/Admin/AdminView';
import { MiniPlayer } from './components/AudioPlayer/MiniPlayer';
import { FullAudioModal } from './components/AudioPlayer/FullAudioModal';
import { QuranSearchModal } from './components/Quran/QuranSearchModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

import { IslamicSplashScreen } from './components/IslamicSplashScreen';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [targetSurahAyah, setTargetSurahAyah] = useState<{ surah: number; ayah: number } | null>(null);

  const handleSelectAyahFromSearch = (surahNum: number, ayahNum: number) => {
    setTargetSurahAyah({ surah: surahNum, ayah: ayahNum });
    setActiveTab('quran');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] pb-24 relative bg-islamic-pattern font-ui selection:bg-[#d4af37]/30 selection:text-[#ffd700] transition-colors duration-300">
      {/* Animated Islamic PWA Splash Screen */}
      <IslamicSplashScreen />

      {/* PWA Install Prompt Banner */}
      <PWAInstallPrompt />

      {/* Top Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main View Router Content */}
      <main className="animate-in fade-in duration-300">
        {activeTab === 'home' && (
          <HomeView
            setActiveTab={setActiveTab}
            onOpenSearch={() => setIsSearchOpen(true)}
            onSelectSurahForReading={(surahNum) => {
              setTargetSurahAyah({ surah: surahNum, ayah: 1 });
              setActiveTab('quran');
            }}
          />
        )}

        {activeTab === 'quran' && (
          <QuranReader
            initialSurahNum={targetSurahAyah?.surah || 1}
            initialAyahNum={targetSurahAyah?.ayah}
          />
        )}

        {activeTab === 'tafsir' && (
          <TafsirView
            initialSurahNum={targetSurahAyah?.surah || 1}
            initialAyahNum={targetSurahAyah?.ayah || 1}
          />
        )}

        {activeTab === 'reciters' && <ReciterCatalogView />}

        {activeTab === 'azkar' && <AzkarView />}

        {activeTab === 'khatma' && <KhatmaTrackerView />}

        {activeTab === 'wird' && <DailyWirdView />}

        {activeTab === 'prayer' && <PrayerAndQiblaView />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#4dd0e1]/8 py-8 text-center text-xs text-[#5b7d92]">
        <div className="max-w-[1400px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 منصة القرآن الكريم | جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('quran')} className="hover:text-[#ffd700] transition-colors duration-300">المصحف</button>
            <button onClick={() => setActiveTab('tafsir')} className="hover:text-[#ffd700] transition-colors duration-300">التفسير</button>
            <button onClick={() => setActiveTab('reciters')} className="hover:text-[#ffd700] transition-colors duration-300">القراء</button>
            <button onClick={() => setActiveTab('azkar')} className="hover:text-[#ffd700] transition-colors duration-300">الأذكار</button>
          </div>
        </div>
      </footer>

      {/* Persistent Audio Mini Player & Fullscreen Audio Ambient Modal */}
      <MiniPlayer />
      <FullAudioModal />

      {/* Real-time Ayah Search Overlay */}
      <QuranSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAyah={handleSelectAyahFromSearch}
      />
    </div>
  );
}

export default function App() {
  return (
    <UserPreferencesProvider>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </UserPreferencesProvider>
  );
}
