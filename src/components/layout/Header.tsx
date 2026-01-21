'use client';

import React, { useState, useEffect, useRef } from 'react'; // useRef 추가
import { useRouter } from 'next/navigation';
import { Menu, User, LogOut, Settings, Bookmark, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/src/utils/supabase/client';
import LoginModal from '@/src/app/auth/LoginModal';

export default function Header() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 🌟 메뉴 영역을 감지하기 위한 Ref(이름표) 생성
  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [nickname, setNickname] = useState<string>('');
  const supabase = createClient();

  // 1. 화면 아무 데나 클릭했을 때 메뉴 닫기 로직
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // 메뉴가 열려있고, 클릭한 곳이 메뉴 영역(menuRef)의 바깥이라면? -> 닫기!
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    // 마우스 누르는 순간 감지 시작
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // 청소(Cleanup)
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('users')
          .select('nickname')
          .eq('id', session.user.id)
          .single();
        if (profile) setNickname(profile.nickname);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNickname('');
    setIsMenuOpen(false);
    window.location.reload();
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 h-16 transition-all">
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
          
          {/* 로고 & 네비게이션 */}
          <div className="flex items-center gap-8">
            <div
              className="text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-1"
              onClick={() => router.push('/')}
            >
              <span className="text-black">치다</span>
              <span className="w-2 h-2 rounded-full bg-[#3182F6] mt-3"></span>
            </div>

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

          {/* 우측 사용자 영역 */}
          {user ? (
            // 🌟 여기가 핵심: ref={menuRef} 로 감싸서 이 안쪽/바깥쪽을 구분합니다.
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 py-1 px-2 rounded-full hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                   <User size={16} className="text-slate-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {nickname || '플레이어'}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* 드롭다운 메뉴 */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-scale-up origin-top-right">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium mb-1">내 계정</p>
                    <p className="text-sm font-bold text-slate-800">{nickname}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>

                  <div className="p-2">
                    <Link href="/mypage/profile" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <Settings size={18} className="text-slate-400 group-hover:text-[#3182F6]" />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">개인정보 설정</span>
                      </div>
                    </Link>

                    <Link href="/mypage/bookmarks" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <Bookmark size={18} className="text-slate-400 group-hover:text-[#3182F6]" />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">내가 북마크한 대회</span>
                      </div>
                    </Link>
                  </div>

                  <div className="h-px bg-slate-100 mx-2"></div>

                  <div className="p-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 transition-colors cursor-pointer group text-left"
                    >
                      <LogOut size={18} className="text-slate-400 group-hover:text-red-500" />
                      <span className="text-sm font-medium text-slate-600 group-hover:text-red-500">로그아웃</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="text-xs font-bold bg-black text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <User size={14} />
              로그인
            </button>
          )}
        </div>
      </header>

      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}
    </>
  );
}