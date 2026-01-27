'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, User, LogOut, LayoutDashboard, CreditCard, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { LoginModal } from '@/components/auth';

export default function Header() {
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 메뉴 영역 감지 Ref
  const menuRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [nickname, setNickname] = useState<string>(''); // 실제로는 full_name을 담음
  const supabase = createClient();

  // 1. 화면 클릭 감지 (메뉴 닫기)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 2. 유저 정보 불러오기 (profiles 테이블 연동)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // 👇 [수정됨] users 테이블 -> profiles 테이블로 변경
        // 방금 만든 프로필 설정 페이지에서 저장한 이름을 가져옵니다.
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name') // nickname 대신 full_name 사용
          .eq('id', session.user.id)
          .single();
          
        if (profile?.full_name) {
            setNickname(profile.full_name);
        } else {
            // 프로필이 없으면 이메일 앞부분이라도 보여줌
            setNickname(session.user.email?.split('@')[0] || '플레이어');
        }
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNickname('');
    setIsMenuOpen(false);
    // 로그아웃 후 메인으로 이동하며 새로고침
    window.location.href = '/'; 
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
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 py-1 px-2 rounded-full hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                   {/* 프로필 이미지가 있다면 여기에 img 태그 넣으면 됩니다 */}
                   <User size={16} className="text-slate-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {nickname}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* 드롭다운 메뉴 */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-scale-up origin-top-right">
                  <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium mb-1">내 계정</p>
                    <p className="text-lg font-black text-slate-800">{nickname} 님</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                  </div>

                  <div className="p-2 space-y-1">
                    
                    {/* 👇 1. 마이페이지 (허브)로 연결 */}
                    <Link href="/mypage" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <LayoutDashboard size={18} className="text-slate-400 group-hover:text-[#3182F6]" />
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">마이페이지</span>
                      </div>
                    </Link>

                    {/* 👇 2. 내 선수 카드 바로가기 (추가됨) */}
                    <Link href="/my-card" onClick={() => setIsMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                        <CreditCard size={18} className="text-slate-400 group-hover:text-purple-500" />
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">내 선수 카드</span>
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