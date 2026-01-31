'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Trophy, Heart, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  // 현재 메뉴가 활성화되었는지 체크
  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
        
        {/* 프로필 영역 */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="text-slate-400" />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-900">내 프로필</p>
                <Link href="/my-card" className="text-xs text-blue-500 hover:underline">
                    선수 카드 보기 &gt;
                </Link>
            </div>
        </div>

        {/* 메뉴 리스트 */}
        <nav className="space-y-1">
            <MenuItem 
                href="/mypage" 
                icon={<Trophy size={18}/>} 
                label="대회 신청 내역" 
                active={isActive('/mypage') || isActive('/mypage/applications')}
            />
            <MenuItem 
                href="/mypage/bookmarks" 
                icon={<Heart size={18}/>} 
                label="내가 찜한 대회" 
                active={isActive('/mypage/bookmarks')}
            />
            <MenuItem 
                href="/mypage/settings" 
                icon={<Settings size={18}/>} 
                label="개인정보 설정" 
                active={isActive('/mypage/settings')}
            />
        </nav>

        {/* 로그아웃 */}
        <div className="mt-8 pt-4 border-t border-slate-50">
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
            >
                <LogOut size={18}/> 로그아웃
            </button>
        </div>

      </div>
    </aside>
  );
}

function MenuItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
    return (
        <Link 
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                active 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
            {icon}
            {label}
        </Link>
    );
}