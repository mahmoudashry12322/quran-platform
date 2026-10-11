import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Check, Share, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone app mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    setIsIOS(ios);

    // Listen for BeforeInstallPrompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Check if user dismissed prompt recently
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleCustomOpen = () => {
      if (isIOS) {
        setShowIOSGuide(true);
      } else {
        setShowBanner(true);
      }
    };
    window.addEventListener('open-pwa-install', handleCustomOpen);

    // Show banner on iOS if not dismissed
    if (ios && !localStorage.getItem('pwa_prompt_dismissed')) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleCustomOpen);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isInstalled || (!showBanner && !deferredPrompt && !isIOS)) return null;

  return (
    <>
      {/* Top Banner (App Store / Add to Home Screen Prompt) */}
      {showBanner && (
        <div className="bg-gradient-to-r from-[#0c2231] via-[#112d40] to-[#0c2231] border-b border-[#ffd700]/30 px-4 py-3 text-[#e8f4fd] shadow-xl relative z-40 animate-slide-up">
          <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ffd700] to-[#d4af37] flex items-center justify-center text-[#030d14] shadow-md gold-glow flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h4 className="font-heading font-bold text-sm text-[#ffd700] flex items-center gap-1.5">
                  <span>أضف المنصّة إلى الشاشة الرئيسية!</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </h4>
                <p className="text-xs text-[#8bafc4]">
                  افتح منصة القرآن الكريم مباشرةً كـ تطبيق من شاشة هاتفك بدون كتابة الدومين كل مرة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-[#030d14] font-bold text-xs shadow-lg gold-glow hover:scale-105 transition-transform duration-300"
              >
                <Download className="w-4 h-4" />
                <span>إضافة إلى الشاشة الرئيسية</span>
              </button>

              <button
                onClick={handleDismiss}
                className="p-2 rounded-xl text-[#5b7d92] hover:text-white hover:bg-[#030d14] transition-colors"
                title="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030d14]/90 backdrop-blur-xl">
          <div className="w-full max-w-md glass-panel p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 left-4 p-2 rounded-xl text-[#5b7d92] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffd700] to-[#d4af37] text-[#030d14] mx-auto flex items-center justify-center shadow-xl gold-glow mb-4">
              <Smartphone className="w-7 h-7" />
            </div>

            <h3 className="font-heading font-bold text-xl text-[#ffd700] mb-2">تثبيت التطبيق على آيفون (Safari)</h3>
            <p className="text-xs text-[#8bafc4] mb-6">اتبع الخطوات البسيطة التالية لإضافة المنصة إلى شاشتك الرئيسية:</p>

            <div className="space-y-4 text-right text-xs text-[#e8f4fd] mb-6">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#030d14] border border-[#4dd0e1]/15">
                <span className="w-7 h-7 rounded-full bg-[#ffd700] text-[#030d14] font-bold flex items-center justify-center flex-shrink-0">1</span>
                <p>اضغط على زر المشاركة <Share className="w-4 h-4 text-[#ffd700] inline mx-1" /> بالأسفل في متصفح سفاري</p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#030d14] border border-[#4dd0e1]/15">
                <span className="w-7 h-7 rounded-full bg-[#ffd700] text-[#030d14] font-bold flex items-center justify-center flex-shrink-0">2</span>
                <p>اختر من القائمة <strong className="text-[#ffd700]">"إضافة إلى الصفحة الرئيسية"</strong> (Add to Home Screen)</p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#030d14] border border-[#4dd0e1]/15">
                <span className="w-7 h-7 rounded-full bg-[#ffd700] text-[#030d14] font-bold flex items-center justify-center flex-shrink-0">3</span>
                <p>اضغط على زر <strong className="text-[#ffd700]">"إضافة"</strong> أعلى الشاشة وسيظهر رمز المنصة فوراً</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ffd700] to-[#d4af37] text-[#030d14] font-bold text-sm shadow-xl gold-glow"
            >
              تم، فهمت الخطوات
            </button>
          </div>
        </div>
      )}
    </>
  );
};
