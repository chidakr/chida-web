'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, User, Grid } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || pathname.startsWith(path);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-between items-center px-6 h-16">
        
        {/* 홈 */}
        <Link href="/" className="flex flex-col items-center gap-1 min-w-[60px]">
          <Home size={24} className={pathname === '/' ? 'text-slate-900' : 'text-slate-300'} strokeWidth={pathname === '/' ? 2.5 : 2} />
          <span className={`text-[10px] font-bold ${pathname === '/' ? 'text-slate-900' : 'text-slate-300'}`}>홈</span>
        </Link>

        {/* 대회 */}
        <Link href="/tournaments" className="flex flex-col items-center gap-1 min-w-[60px]">
          <Trophy size={24} className={isActive('/tournaments') ? 'text-slate-900' : 'text-slate-300'} strokeWidth={isActive('/tournaments') ? 2.5 : 2} />
          <span className={`text-[10px] font-bold ${isActive('/tournaments') ? 'text-slate-900' : 'text-slate-300'}`}>대회</span>
        </Link>

        {/* 클럽 */}
        <Link href="#" className="flex flex-col items-center gap-1 min-w-[60px]">
          <Grid size={24} className="text-slate-200" />
          <span className="text-[10px] font-bold text-slate-300">클럽</span>
        </Link>

        {/* 마이페이지 */}
        <Link href="/mypage" className="flex flex-col items-center gap-1 min-w-[60px]">
          <User size={24} className={isActive('/mypage') ? 'text-slate-900' : 'text-slate-300'} strokeWidth={isActive('/mypage') ? 2.5 : 2} />
          <span className={`text-[10px] font-bold ${isActive('/mypage') ? 'text-slate-900' : 'text-slate-300'}`}>MY</span>
        </Link>

      </div>
    </div>
  );
}