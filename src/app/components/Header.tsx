'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function Header() {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 h-16 transition-all">
      <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* 로고 */}
          <div
            className="text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-1"
            onClick={() => router.push('/')}
          >
            <span className="text-black">치다</span>
            <span className="w-2 h-2 rounded-full bg-[#3182F6] mt-3"></span>
          </div>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center text-sm font-bold text-slate-500">
            <button
              onClick={() => router.push('/tournaments')}
              className="group flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-slate-100 relative overflow-hidden"
            >
              <Menu size={18} className="text-slate-400 group-hover:text-black transition-colors" />
              <span className="relative z-10 group-hover:text-black transition-colors">
                대회 리스트
              </span>
            </button>
          </nav>
        </div>

        {/* 로그인 버튼 */}
        <button className="text-xs font-bold bg-black text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md active:scale-95">
          로그인
        </button>
      </div>
    </header>
  );
}