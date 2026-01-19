'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Calendar, Menu, Filter } from 'lucide-react';

// 1. 서스펜스 (에러 방지용)
export default function TournamentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">로딩중...</div>}>
      <TournamentListContent />
    </Suspense>
  );
}

// 2. 메인 콘텐츠
function TournamentListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type');
  
  const getInitialTab = () => {
    if (initialType === 'ranking') return '랭킹';
    if (initialType === 'non-ranking') return '비랭킹';
    return '전체';
  };

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 필터 상태
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [locationFilter, setLocationFilter] = useState('전국');
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태

  const TABS = ['전체', '랭킹', '비랭킹', '신인부', '오픈부', '개나리', '국화부'];
  const LOCATIONS = ['전국', '서울', '경기', '인천', '강원', '충청', '전라', '경상', '제주'];

  // 데이터 불러오기
  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      
      let query = supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      // 1. 탭 필터
      if (activeTab === '랭킹') query = query.in('organization', ['KATO', 'KATA', 'KTA']);
      else if (activeTab === '비랭킹') query = query.not('organization', 'in', '("KATO","KATA","KTA")'); 
      else if (activeTab !== '전체') query = query.eq('division', activeTab);
      
      // 2. 지역 필터
      if (locationFilter !== '전국') query = query.ilike('location', `%${locationFilter}%`);

      // 3. 검색어 필터 (제목 검색)
      if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);

      const { data, error } = await query;
      if (!error) setTournaments(data || []);
      setLoading(false);
    }

    fetchTournaments();
  }, [activeTab, locationFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* 1. Global Header (메인 페이지와 100% 동일하게 통일) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 transition-all">
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-1" onClick={() => window.location.href='/'}>
              <span className="text-black">치다</span>
              <span className="w-2 h-2 rounded-full bg-red-500 mt-3"></span>
            </div>
            {/* PC 메뉴 */}
            <nav className="hidden md:flex gap-8 text-sm font-bold text-slate-500">
              <button onClick={() => router.push('/tournaments')} className="text-black bg-slate-100 px-3 py-2 rounded-lg transition-all">
                대회 리스트
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:flex text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors">
              로그인
            </button>
            <button className="md:hidden p-2"><Menu size={24} /></button>
          </div>
        </div>
      </header>

      {/* 2. Sub Header (검색창 + 필터) - 헤더 바로 아래 고정 */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-4 space-y-4">
          
          {/* 검색창 영역 */}
          <div className="relative w-full max-w-md mx-auto md:mx-0">
             <input 
               type="text" 
               placeholder="찾으시는 대회나 지역을 입력하세요" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-slate-100 px-5 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black transition-all pl-11"
             />
             <Search size={18} className="absolute left-4 top-3 text-slate-400"/>
          </div>

          {/* 가로 스크롤 필터 */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-1">
            {/* 필터 1: 카테고리 */}
            <div className="flex gap-2 shrink-0">
              {TABS.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                    ${activeTab === tab 
                      ? 'bg-black text-white shadow-md' 
                      : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="w-px h-6 bg-slate-200 shrink-0"></div>

            {/* 필터 2: 지역 */}
            <div className="flex gap-2 shrink-0">
              {LOCATIONS.map(loc => (
                <button 
                  key={loc}
                  onClick={() => setLocationFilter(loc)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                    ${locationFilter === loc 
                      ? 'text-blue-600 bg-blue-50 font-bold' 
                      : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {loc === '전국' ? <MapPin size={14}/> : null} {loc}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Tournament List Grid */}
      {/* [수정 포인트] pt-48 -> pt-64 (여백을 넉넉하게 256px로 늘림) */}
      <main className="max-w-7xl mx-auto px-5 pt-64 pb-20"> 

        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold flex items-center gap-2">
             <Filter size={20} className="text-slate-400"/>
             {activeTab} 리스트 
             <span className="text-slate-400 text-sm font-normal">({tournaments.length})</span>
           </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 로딩 스켈레톤 */}
          {loading && [1,2,3,4].map(i => (
            <div key={i} className="h-80 bg-white rounded-2xl border border-slate-100 p-4 space-y-4">
               <div className="w-full h-40 bg-slate-50 rounded-xl animate-pulse"></div>
               <div className="w-3/4 h-6 bg-slate-50 rounded animate-pulse"></div>
            </div>
          ))}
          
          {/* 실제 카드 */}
          {!loading && tournaments.map((t) => (
            <div 
              key={t.id}
              onClick={() => router.push(`/tournaments/${t.id}`)} 
              className="bg-white rounded-2xl border border-slate-200 hover:border-black cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col h-full overflow-hidden group"
            >
              <div className="relative w-full h-44 bg-slate-100 overflow-hidden">
                {t.poster_url ? (
                  <img src={t.poster_url} alt={t.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50"><span className="text-4xl grayscale opacity-20">🎾</span></div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md 
                    ${t.status === '접수중' ? 'bg-blue-600/90 text-white' : t.status === '마감' ? 'bg-slate-800/80 text-white' : 'bg-red-600/90 text-white'}`}>
                    {t.status}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex gap-1.5 mb-2.5">
                   <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded font-bold border border-slate-100">{t.organization}</span>
                   <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded font-bold border border-slate-100">{t.division}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {t.title}
                </h3>
                <div className="mt-auto pt-3 border-t border-slate-50 space-y-1.5">
                  <div className="flex items-center text-xs text-slate-500 font-medium"><Calendar size={13} className="mr-1.5 text-slate-400"/> {t.start_date}</div>
                  <div className="flex items-center text-xs text-slate-500 font-medium"><MapPin size={13} className="mr-1.5 text-slate-400"/> {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 결과 없음 */}
        {!loading && tournaments.length === 0 && (
          <div className="py-20 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-500 font-bold">검색 결과가 없습니다.</p>
            <button onClick={() => { setSearchTerm(''); setActiveTab('전체'); setLocationFilter('전국'); }} className="mt-4 text-sm text-blue-600 underline font-bold">
              모든 필터 초기화
            </button>
          </div>
        )}
      </main>
    </div>
  );
}