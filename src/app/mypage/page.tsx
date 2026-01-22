'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, CreditCard, ChevronRight, LogOut, Trophy } from 'lucide-react';

// 프로필 타입 정의 (안전성을 위해)
type Profile = {
    full_name: string;
    ntrp: string;
    years: string;
};

export default function MyPage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(data);
      setLoading(false);
    }
    fetchUser();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // 확실한 새로고침을 위해 href 사용
  };

  if (loading) return <div className="min-h-screen bg-[#F9FAFB] pt-32 flex justify-center">로딩중...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      
      {/* 1. 상단 프로필 요약 섹션 
          ✅ [수정됨] pt-10 -> pt-28 
          헤더가 fixed(떠있음)라서, 내용을 헤더 아래로 내리기 위해 위쪽 여백을 크게 주었습니다.
      */}
      <section className="bg-white pt-28 pb-10 px-5 rounded-b-[2rem] shadow-sm border-b border-slate-100">
        <div className="max-w-md mx-auto flex items-center gap-5">
           {/* 프로필 이미지 */}
           <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner">
               {/* 이미지가 있다면 img 태그 사용, 지금은 아이콘 */}
               {profile?.full_name ? (
                   <span className="text-2xl font-black text-slate-400">
                       {profile.full_name.slice(0, 2)}
                   </span>
               ) : (
                   <User size={32} className="text-slate-400"/>
               )}
           </div>
           
           <div>
              <h1 className="text-2xl font-black text-slate-900 leading-tight">
                {profile?.full_name || '플레이어'} <span className="text-lg font-medium text-slate-400">님</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                 <span className="px-2.5 py-1 bg-blue-50 text-[#3182F6] text-xs font-bold rounded-md border border-blue-100">
                    NTRP {profile?.ntrp || '?'}
                 </span>
                 <span className="text-sm text-slate-500 font-medium flex items-center gap-1">
                    <Trophy size={12} className="text-yellow-500"/>
                    구력 {profile?.years || '0'}년차
                 </span>
              </div>
           </div>
        </div>
      </section>

      {/* 2. 메인 메뉴 리스트 */}
      <main className="max-w-md mx-auto px-5 mt-8 space-y-6">
        
        {/* 🔥 내 선수 카드 보러가기 */}
        <Link href="/my-card" className="block group">
            <div className="bg-[#111] rounded-2xl p-6 text-white shadow-xl shadow-slate-200 transition-transform group-hover:-translate-y-1 relative overflow-hidden">
                {/* 배경 데코 */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <div className="text-blue-400 text-[10px] font-black tracking-widest mb-1">MY PLAYER ID</div>
                        <h2 className="text-xl font-bold">나의 선수 카드 보기</h2>
                        <p className="text-slate-400 text-xs mt-1 font-medium">인스타 자랑용 이미지 저장하기 📸</p>
                    </div>
                    <CreditCard size={32} className="text-white/80"/>
                </div>
            </div>
        </Link>

        {/* 메뉴 목록 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <MenuItem 
                icon={<User size={20} className="text-slate-500"/>} 
                label="프로필 정보 수정" 
                href="/profile/setup" 
            />
            <div className="h-px bg-slate-50 mx-5"></div>
            <MenuItem 
                icon={<Trophy size={20} className="text-slate-500"/>} 
                label="내가 찜한 대회 (준비중)" 
                href="#" 
            />
            <div className="h-px bg-slate-50 mx-5"></div>
            <MenuItem 
                icon={<Settings size={20} className="text-slate-500"/>} 
                label="환경 설정 (준비중)" 
                href="#" 
            />
            <MenuItem 
              icon={<Settings size={20} className="text-slate-500"/>} 
              label="개인정보 설정" 
              href="/mypage/settings" 
            />
        </div>

        {/* 로그아웃 버튼 */}
        <button 
            onClick={handleLogout}
            className="w-full py-4 text-slate-400 text-sm font-medium hover:text-red-500 flex items-center justify-center gap-2 transition-colors mt-4"
        >
            <LogOut size={16}/> 로그아웃
        </button>

      </main>
    </div>
  );
}

// 메뉴 아이템 컴포넌트
function MenuItem({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
    return (
        <Link href={href} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-3">
                {icon}
                <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
            </div>
            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500"/>
        </Link>
    )
}