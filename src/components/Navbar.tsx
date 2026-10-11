import React from 'react';
import { useUserPreferences } from '../context/UserPreferencesContext';
import {
  BookOpen,
  Search,
  Bookmark,
  Compass,
  Calendar,
  Layers,
  Home,
  Music,
  Heart,
  Sparkles,
  Sun,
  Moon,
  Smartphone,
  FileText
} from 'lucide-react';

export type ActiveTab = 'home' | 'quran' | 'tafsir' | 'reciters' | 'azkar' | 'khatma' | 'wird' | 'prayer';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenSearch }) => {
  const { bookmarks, theme, toggleTheme } = useUserPreferences();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'الرئيسية', icon: <Home className="w-4 h-4" /> },
    { id: 'quran', label: 'المصحف', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tafsir', label: 'التفسير', icon: <FileText className="w-4 h-4 text-[#ffd700]" /> },
    { id: 'reciters', label: 'القراء', icon: <Music className="w-4 h-4" /> },
    { id: 'azkar', label: 'الأذكار', icon: <Heart className="w-4 h-4" /> },
    { id: 'khatma', label: 'الختمة', icon: <Calendar className="w-4 h-4" /> },
    { id: 'wird', label: 'الورد', icon: <Layers className="w-4 h-4" /> },
    { id: 'prayer', label: 'المواقيت', icon: <Compass className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#4dd0e1]/10 header-navbar">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="relative w-11 h-11 rounded-2xl p-0.5 shadow-xl gold-glow group-hover:scale-105 transition-transform duration-300 overflow-hidden bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#8d711f]">
            <img
              src="/quran-logo-gold.png"
              alt="منصة القرآن الكريم"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <h1 className="font-heading text-lg sm:text-xl font-extrabold text-[#ffd700] gold-text-glow tracking-wide group-hover:text-white transition-colors duration-300 flex items-center gap-1.5">
              <span>منصّة القُرْآن الكريم</span>
            </h1>
            <p className="text-[10px] text-[#4dd0e1] font-semibold -mt-0.5 subtext-brand">المصحف • التفسير • التلاوات • الأذكار</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#071822]/80 p-1.5 rounded-2xl border border-[#4dd0e1]/10 nav-container">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-lg gold-glow'
                  : 'text-[#8bafc4] hover:text-[#ffd700] hover:bg-[#0c2231] nav-btn-inactive'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0c2231] border border-[#4dd0e1]/15 text-xs text-[#ffd700] hover:border-[#ffd700]/40 transition-all duration-300 shadow-sm theme-btn"
            title={theme === 'dark' ? 'الوضع النهار المريح' : 'الوضع الليلي الروحاني'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#ffd700] animate-spin-slow" />
                <span className="hidden sm:inline font-medium text-[11px]">نهار</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#030d14]" />
                <span className="hidden sm:inline font-medium text-[11px] text-[#030d14]">ليل</span>
              </>
            )}
          </button>

          {/* PWA Install App Button */}
          <button
            onClick={() => {
              const event = new CustomEvent('open-pwa-install');
              window.dispatchEvent(event);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#ffd700]/15 to-[#d4af37]/15 border border-[#ffd700]/30 text-xs text-[#ffd700] hover:bg-[#ffd700] hover:text-[#030d14] transition-all duration-300 shadow-sm font-semibold"
            title="إضافة المنصّة إلى الشاشة الرئيسية (تثبيت التطبيق)"
          >
            <Smartphone className="w-4 h-4 text-[#ffd700]" />
            <span className="hidden md:inline text-[11px]">تثبيت المنصة</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0c2231] border border-[#4dd0e1]/15 text-xs text-[#8bafc4] hover:border-[#ffd700]/40 hover:text-[#ffd700] transition-all duration-300 shadow-sm action-btn"
          >
            <Search className="w-4 h-4 text-[#4dd0e1]" />
            <span className="hidden sm:inline">ابحث عن آية...</span>
          </button>
          <button
            onClick={() => setActiveTab('quran')}
            className="relative p-2.5 rounded-xl bg-[#0c2231] border border-[#4dd0e1]/15 text-[#ffd700] hover:bg-[#112d40] transition-all duration-300 action-btn"
            title="المفضلة"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ffd700] text-[#030d14] font-bold text-[10px] rounded-full flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 bg-[#030d14]/80 border-t border-[#4dd0e1]/8 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all duration-300 ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#030d14] font-bold shadow-md'
                : 'bg-[#0c2231] text-[#8bafc4] hover:text-[#ffd700]'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
