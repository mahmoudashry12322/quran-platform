import React from 'react';
import { RECITERS_LIST } from '../../services/audioApi';
import type { Reciter } from '../../services/audioApi';
import { ShieldCheck, Database, Activity, Lock } from 'lucide-react';


export const AdminView: React.FC = () => {
  const reciters = RECITERS_LIST;


  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-[#e2f1e9]">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#144733]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center text-[#ffd700]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-[#ffd700]">لوحة الإدارة والنظام</h2>
            <p className="text-xs text-[#9ca3af]">إدارة القراء، المصادر، الإحصائيات وإعدادات المنصة</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#144733] text-[#22c55e] text-xs font-bold border border-[#22c55e]/30 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5" /> النظام يعمل بنجاح (PM2 Active)
        </span>
      </div>

      {/* Platform Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#072116] border border-[#d4af37]/20 p-5 rounded-2xl">
          <span className="text-xs text-[#9ca3af] block">إجمالي القراء المتاحين</span>
          <span className="font-mono text-3xl font-bold text-[#ffd700]">{reciters.length}</span>
        </div>

        <div className="bg-[#072116] border border-[#d4af37]/20 p-5 rounded-2xl">
          <span className="text-xs text-[#9ca3af] block">السور القرآنية</span>
          <span className="font-mono text-3xl font-bold text-[#a7f3d0]">114 سورة</span>
        </div>

        <div className="bg-[#072116] border border-[#d4af37]/20 p-5 rounded-2xl">
          <span className="text-xs text-[#9ca3af] block">مصدر الصوت والمزامنة</span>
          <span className="text-sm font-bold text-[#ffd700]">Quran.com & MP3Quran CDN</span>
        </div>

        <div className="bg-[#072116] border border-[#d4af37]/20 p-5 rounded-2xl">
          <span className="text-xs text-[#9ca3af] block">حماية النص القرآني</span>
          <span className="text-xs font-bold text-[#22c55e] flex items-center gap-1 mt-2">
            <Lock className="w-4 h-4" /> مشفّر ومحمي من التعديل العشوائي
          </span>
        </div>
      </div>

      {/* Reciter Directory Management */}
      <div className="bg-[#072116] border border-[#d4af37]/20 rounded-3xl p-6 shadow-xl mb-8 glass-card">
        <h3 className="font-heading font-bold text-lg text-[#ffd700] mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" /> إدارة القراء والمزودين (Metadata)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[#144733] text-[#9ca3af]">
                <th className="pb-3">الاسم</th>
                <th className="pb-3">الرواية</th>
                <th className="pb-3">النمط</th>
                <th className="pb-3">رابط الخادم (CDN Server)</th>
                <th className="pb-3 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#144733]/50">
              {reciters.map((r) => (
                <tr key={r.id} className="hover:bg-[#0d2d20]">
                  <td className="py-3 font-bold text-[#ffd700]">{r.name}</td>
                  <td className="py-3 text-[#a7f3d0]">{r.rewaya}</td>
                  <td className="py-3">{r.style || 'مرتل'}</td>
                  <td className="py-3 font-mono text-[11px] text-[#9ca3af] truncate max-w-xs">{r.audioServerUrl}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#22c55e] text-[10px] font-bold">
                      نشط
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
