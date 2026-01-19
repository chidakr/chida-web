'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, MapPin, Calendar, Menu, Bell } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [recentTournaments, setRecentTournaments] = useState<any[]>([]);
  
  // 데이터 로딩 (없으면 빈 배열)
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentTournaments(data || []);
    }
    fetchData();
  }, []);

  // src/app/page.tsx 안에 있는 TournamentCard 컴포넌트를 이걸로 바꾸세요!

const TournamentCard = ({ t }: { t: any }) => (
  <div 
    onClick={() => router.push(`/tournaments/${t.id}`)}
    className="min-w-[280px] bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 snap-start flex flex-col h-full group"
  >
    {/* 1. 이미지 영역 (비율 16:9) */}
    <div className="relative w-full aspect-video bg-slate-100 overflow-hidden">
      {t.poster_url ? (
        <img 
          src={t.poster_url} 
          alt={t.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
      ) : (
        // 이미지가 없을 때 보여줄 예쁜 그라데이션
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
           <span className="text-4xl opacity-50">🎾</span>
        </div>
      )}
      
      {/* 상태 뱃지 (이미지 위에 둥둥 떠있게) */}
      <div className="absolute top-3 left-3 flex gap-1">
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-md
          ${t.status === '접수중' ? 'bg-blue-600/90 text-white' : 'bg-slate-800/80 text-white'}`}>
          {t.status}
        </span>
      </div>
    </div>

    {/* 2. 텍스트 영역 */}
    <div className="p-5 flex flex-col flex-1">
      <div className="flex justify-between items-start mb-2">
         <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">{t.organization}</span>
         <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">{t.division}</span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
        {t.title}
      </h3>
      
      <div className="mt-auto space-y-1.5 pt-3 border-t border-slate-50">
        <div className="flex items-center text-xs text-slate-500 font-medium">
          <Calendar size={14} className="mr-2 text-slate-400"/> {t.start_date}
        </div>
        <div className="flex items-center text-xs text-slate-500 font-medium">
          <MapPin size={14} className="mr-2 text-slate-400"/> {t.location}
        </div>
      </div>
    </div>
  </div>
);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* 1. Header (깔끔하게 고정) */}
{/* src/app/page.tsx 의 <header> 부분을 이걸로 덮어쓰세요 */}

<header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 transition-all">
  <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
    <div className="flex items-center gap-8">
      {/* 로고: 클릭하면 메인으로 */}
      <div className="text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-1" onClick={() => window.location.href='/'}>
        <span className="text-black">치다</span>
        <span className="w-2 h-2 rounded-full bg-red-500 mt-3"></span>
      </div>
      
      {/* PC 메뉴: 심플하게 '대회 리스트' 하나만! */}
      <nav className="hidden md:flex gap-8 text-sm font-bold text-slate-500">
        <button 
          onClick={() => router.push('/tournaments')} 
          className="hover:text-black hover:bg-slate-100 px-3 py-2 rounded-lg transition-all"
        >
          대회 리스트
        </button>
        {/* 나중에 메뉴 추가할 자리 (예: 랭킹, 커뮤니티 등) */}
        {/* <button className="hover:text-black transition-colors">랭킹</button> */}
      </nav>
    </div>

    <div className="flex items-center gap-4">
      <button 
        onClick={() => alert('로그인 준비중')} 
        className="hidden md:flex text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors"
      >
        로그인
      </button>
      <button className="md:hidden p-2"><Menu size={24} /></button>
    </div>
  </div>
</header>

      {/* 2. Main Hero (여백 확보 및 디자인 강화) */}
      <main className="pt-16">
        
        {/* 히어로 섹션 */}
        <section className="bg-slate-900 text-white py-20 md:py-32 px-5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <span className="inline-block px-3 py-1 rounded-full border border-white/20 text-xs font-bold mb-6 text-white/80">
              🎾 2026 테니스 시즌 오픈
            </span>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              코트 위, <br className="md:hidden"/>
              가장 완벽한 <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">임팩트.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mb-10 leading-relaxed">
              전국 테니스 대회 정보를 한눈에 확인하세요.<br/>
              복잡한 검색은 그만, '치다'에서 1분 만에 접수까지.
            </p>
            <button 
              onClick={() => router.push('/tournaments')}
              className="bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-200 transition-transform active:scale-95 flex items-center gap-2"
            >
              대회 찾아보기 <ChevronRight size={18}/>
            </button>
          </div>
          
          {/* 배경 장식 (심심하지 않게) */}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-red-600/20 to-transparent pointer-events-none"></div>
        </section>

        {/* 3. Content Section (최대 너비 제한으로 깨짐 방지) */}
        <section className="max-w-7xl mx-auto px-5 py-16 space-y-16">
          
          {/* 가로 스크롤 섹션 */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">🔥 지금 핫한 대회</h2>
              <button onClick={() => router.push('/tournaments')} className="text-sm font-medium text-slate-400 hover:text-black">전체보기</button>
            </div>
            
            {/* 스크롤 영역 */}
            <div className="flex gap-4 overflow-x-auto pb-8 -mx-5 px-5 md:mx-0 md:px-0 no-scrollbar scroll-smooth">
              {recentTournaments.length > 0 ? (
                recentTournaments.map((t) => <TournamentCard key={t.id} t={t} />)
              ) : (
                // 데이터 없을 때 보여줄 예비 카드 (Empty State)
                [1, 2, 3].map((i) => (
                  <div key={i} className="min-w-[280px] bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
                    <p className="text-4xl mb-3">🔜</p>
                    <p className="font-bold text-slate-400">오픈 준비중입니다</p>
                    <p className="text-xs text-slate-300 mt-1">곧 새로운 대회가 올라와요!</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 배너 영역 */}
          <div className="w-full aspect-[4/1] bg-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center relative overflow-hidden group cursor-pointer">
             <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-white"></div>
             <div className="relative z-10 text-center">
               <p className="text-sm font-bold text-slate-400 mb-1">PARTNER</p>
               <p className="text-xl md:text-2xl font-bold text-slate-700">우리 클럽 대회를 홍보하고 싶다면?</p>
             </div>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
             <h2 className="text-xl font-black mb-2">CHIDA</h2>
             <p className="text-xs text-slate-400">
               © 2026 CHIDA Corp. All rights reserved.<br/>
               The standard for tennis tournaments.
             </p>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
            <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
            <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
          </div>
        </div>
      </footer>

    </div>
  );
}

