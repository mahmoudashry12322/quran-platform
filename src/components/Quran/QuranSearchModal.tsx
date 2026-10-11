import React, { useState, useEffect } from 'react';
import { searchQuran } from '../../services/quranApi';
import type { SearchResult } from '../../services/quranApi';

import { Search, X, BookOpen, Loader2, ArrowLeft } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAyah: (surahNum: number, ayahNum: number) => void;
}

export const QuranSearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectAyah }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchQuran(query);
      setResults(res);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-[#030f0a]/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#072116] border border-[#d4af37]/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-[#144733] flex items-center gap-3 bg-[#0d2d20]">
          <Search className="w-5 h-5 text-[#ffd700]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب كلمة أو آية للبحث في القرآن الكريـم..."
            autoFocus
            className="w-full bg-transparent text-base text-[#e2f1e9] placeholder-[#9ca3af] outline-none font-quran"
          />
          {loading && <Loader2 className="w-5 h-5 text-[#d4af37] animate-spin" />}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9ca3af] hover:text-white hover:bg-[#144733] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {query.trim() === '' && (
            <div className="text-center py-12 text-[#9ca3af]">
              <BookOpen className="w-12 h-12 text-[#d4af37]/40 mx-auto mb-3" />
              <p className="text-sm">اكتب في مربع البحث أعلاه لعرض جميع الآيات المطابقة فوراً</p>
            </div>
          )}

          {query.trim() !== '' && !loading && results.length === 0 && (
            <div className="text-center py-12 text-[#9ca3af]">
              <p className="text-sm">لم يتم العثور على نتائج تطابق: "{query}"</p>
            </div>
          )}

          {results.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectAyah(item.surahNumber, item.ayahNumber);
                onClose();
              }}
              className="p-4 rounded-2xl bg-[#0d2d20] border border-[#d4af37]/15 hover:border-[#d4af37]/50 hover:bg-[#144733] transition-all cursor-pointer group flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#144733] text-[#ffd700] text-xs font-bold border border-[#d4af37]/20">
                    سورة {item.surahNumber} • الآية {item.ayahNumber}
                  </span>
                </div>
                <p className="font-quran text-lg text-[#e2f1e9] group-hover:text-[#ffd700] transition-colors leading-relaxed">
                  {item.text}
                </p>
              </div>
              <ArrowLeft className="w-5 h-5 text-[#9ca3af] group-hover:text-[#ffd700] transition-colors flex-shrink-0 mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
