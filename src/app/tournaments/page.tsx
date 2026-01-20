'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Filter, ChevronDown, Check, RefreshCw, Square, CheckSquare } from 'lucide-react';

export default function TournamentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-[#3182F6]">로딩중...</div>}>
      <TournamentListContent />
    </Suspense>
  );
}

// 📌 1. 카테고리 데이터
const CATEGORIES = [
  { 
    id: 'all', 
    label: '전체 보기', 
    sub: [] 
  },
  { 
    id: 'men', 
    label: '남자 복식', 
    color: 'bg-blue-500', 
    sub: ['오픈부', '전국신인부', '지역신인부', '초급자(1년미만)', '초급자(2년미만)', '초급자(3년미만)'] 
  },
  { 
    id: 'women', 
    label: '여자 복식', 
    color: 'bg-pink-500',
    sub: ['국화부', '개나리부', '초급자(1년미만)', '초급자(2년미만)', '초급자(3년미만)'] 
  },
  { 
    id: 'mixed', 
    label: '혼합 복식', 
    color: 'bg-purple-500',
    sub: ['혼복 오픈부', '혼복 신인부'] 
  },
  { 
    id: 'single', 
    label: '단식', 
    color: 'bg-green-500',
    sub: ['남자 단식', '여자 단식'] 
  }
];

// 📌 2. 지역 데이터
const LOCATIONS = [
  '서울', '경기', '인천', '경기 광주', 
  '강원',
  '대전', '세종', '충북', '충남', 
  '부산', '대구', '울산', '경북', '경남',
  '전북', '광주', '전남', 
  '제주'
];

function TournamentListContent() {
  const router = useRouter();
  
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🔹 필터 상태
  const [filterMain, setFilterMain] = useState('카테고리 선택');
  const [filterSub, setFilterSub] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🔹 드롭다운 UI 상태
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(CATEGORIES[1]);

  // 🔹 [NEW] Click Outside 감지를 위한 Ref
  const categoryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // 🔹 [NEW] 외부 클릭 감지 로직 (상용 서비스 표준)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // 카테고리 드롭다운 외부 클릭 시 닫기
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      // 지역 드롭다운 외부 클릭 시 닫기
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
    }

    // 마우스 클릭 이벤트 리스너 등록
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // 컴포넌트 언마운트 시 리스너 제거 (메모리 누수 방지)
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 데이터 불러오기
  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      
      let query = supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (filterSub) {
         query = query.eq('division', filterSub);
      } else if (filterMain !== '카테고리 선택' && filterMain !== '전체 보기') {
         query = query.ilike('division', `%${filterMain.replace(' 복식', '').replace('단식', '')}%`); 
      }

      if (selectedLocations.length > 0) {
        const orQuery = selectedLocations.map(loc => `location.ilike.%${loc}%`).join(',');
        query = query.or(orQuery);
      }

      if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);

      const { data, error } = await query;
      if (!error) setTournaments(data || []);
      setLoading(false);
    }

    fetchTournaments();
  }, [filterMain, filterSub, selectedLocations, searchTerm]);

  const resetFilters = () => {
    setFilterMain('카테고리 선택');
    setFilterSub('');
    setSelectedLocations([]);
    setSearchTerm('');
  };

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      setSelectedLocations(selectedLocations.filter(l => l !== loc));
    } else {
      setSelectedLocations([...selectedLocations, loc]);
    }
  };

  const toggleAllLocations = () => {
    if (selectedLocations.length === LOCATIONS.length) setSelectedLocations([]);
    else setSelectedLocations([...LOCATIONS]);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* 2. Sub Header (검색 + 필터) - Fixed Top */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-5 py-4 space-y-4">
          
          {/* 검색창 */}
          <div className="relative w-full max-w-md mx-auto md:mx-0">
             <input 
               type="text" 
               placeholder="찾으시는 대회나 지역을 입력하세요" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-slate-50 px-5 py-3 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#3182F6] transition-all pl-11 border border-transparent focus:border-transparent placeholder:text-slate-400"
             />
             <Search size={18} className="absolute left-4 top-3 text-slate-400"/>
          </div>

          {/* 🔥 필터 영역 */}
          <div className="flex flex-col md:flex-row items-start gap-3">
            
            {/* [필터 1] 카테고리 선택 (Ref 추가) */}
            <div className="relative z-50" ref={categoryRef}>
              <button 
                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsLocationOpen(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-bold min-w-[150px] justify-between
                  ${isCategoryOpen || (filterMain !== '카테고리 선택' && filterMain !== '전체 보기')
                    ? 'border-[#3182F6] bg-[#3182F6] text-white shadow-md shadow-blue-200' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="truncate">{filterSub || filterMain}</span>
                <ChevronDown size={16} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}/>
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-[340px] md:w-[480px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* 왼쪽 대분류 */}
                    <div className="w-1/3 bg-slate-50 border-r border-slate-100 py-2">
                      {CATEGORIES.map((cat) => (
                        <div 
                          key={cat.id}
                          onMouseEnter={() => setHoveredCategory(cat)}
                          onClick={() => {
                            if(cat.id === 'all') {
                                setFilterMain('전체 보기'); setFilterSub('');
                                setIsCategoryOpen(false);
                            }
                          }}
                          className={`px-4 py-3 text-sm font-bold cursor-pointer flex items-center justify-between transition-colors
                            ${hoveredCategory.id === cat.id ? 'bg-white text-[#3182F6]' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          <div className="flex items-center gap-2">
                            {cat.color && <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>}
                            {cat.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 오른쪽 소분류 */}
                    <div className="w-2/3 p-2 h-[300px] overflow-y-auto">
                      <p className="px-3 py-2 text-xs font-bold text-slate-400 mb-1">{hoveredCategory.label} 세부 선택</p>
                      {hoveredCategory.sub.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm">하위 카테고리가 없습니다.</div>
                      ) : (
                        <div className="grid grid-cols-1 gap-1">
                          {hoveredCategory.sub.map((subItem) => (
                            <div 
                              key={subItem}
                              onClick={() => {
                                setFilterMain(hoveredCategory.label);
                                setFilterSub(subItem);
                              }}
                              className={`px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-between transition-colors
                                ${filterSub === subItem ? 'bg-blue-50 text-[#3182F6] font-bold' : 'hover:bg-slate-100 text-slate-700'}`}
                            >
                              {subItem}
                              {filterSub === subItem && <Check size={14} />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                </div>
              )}
            </div>

            {/* [필터 2] 지역 선택 (Ref 추가) */}
            <div className="relative z-40" ref={locationRef}>
              <button 
                onClick={() => { setIsLocationOpen(!isLocationOpen); setIsCategoryOpen(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-bold min-w-[100px] justify-between
                  ${isLocationOpen || selectedLocations.length > 0
                    ? 'border-[#3182F6] bg-white text-[#3182F6] shadow-sm' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <span>{selectedLocations.length === 0 ? '지역' : `지역 ${selectedLocations.length}`}</span>
                <ChevronDown size={16} className={`transition-transform ${isLocationOpen ? 'rotate-180' : ''}`}/>
              </button>

              {isLocationOpen && (
                <div className="absolute top-full left-0 mt-2 w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-50">
                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-70" onClick={toggleAllLocations}>
                           {selectedLocations.length === LOCATIONS.length 
                             ? <CheckSquare size={16} className="text-[#3182F6]"/> 
                             : <Square size={16} className="text-slate-300"/>}
                           <span className="text-sm font-bold text-slate-900">전체 선택</span>
                        </div>
                        <button onClick={() => setSelectedLocations([])} className="text-xs text-slate-400 hover:text-[#3182F6] underline">초기화</button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {LOCATIONS.map((loc) => {
                        const isSelected = selectedLocations.includes(loc);
                        return (
                          <button
                            key={loc}
                            onClick={() => toggleLocation(loc)}
                            className={`px-1 py-2 rounded-lg text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1
                              ${isSelected 
                                ? 'bg-[#3182F6] text-white border-[#3182F6] shadow-md' 
                                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}
                          >
                            {isSelected ? <Check size={12} strokeWidth={4}/> : null}
                            {loc}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => setIsLocationOpen(false)}
                      className="w-full mt-4 bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800"
                    >
                      선택 완료 ({selectedLocations.length})
                    </button>
                </div>
              )}
            </div>

            {/* 초기화 버튼 */}
            <button 
              onClick={resetFilters}
              className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 transition-colors"
              title="필터 초기화"
            >
              <RefreshCw size={18}/>
            </button>

          </div>
        </div>
      </div>

      {/* 3. Tournament List Content */}
      <main className="max-w-7xl mx-auto px-5 pt-44 pb-20"> 
        
        {/* 리스트 헤더 정보 */}
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold flex items-center gap-2">
             <Filter size={20} className="text-slate-400"/>
             {filterSub || filterMain} 
             {selectedLocations.length > 0 && <span className="text-[#3182F6] text-sm"> · {selectedLocations.join(', ')}</span>}
             <span className="text-slate-400 text-sm font-normal ml-1">({tournaments.length})</span>
           </h2>
        </div>
        
        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {!loading && tournaments.map((t) => (
            <div 
              key={t.id}
              onClick={() => router.push(`/tournaments/${t.id}`)} 
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#3182F6] cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col h-full overflow-hidden group"
            >
              {/* 이미지 영역 */}
              <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
                {t.poster_url ? (
                  <img src={t.poster_url} alt={t.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50"><span className="text-4xl grayscale opacity-20">🎾</span></div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm backdrop-blur-md text-white
                    ${t.status === '접수중' ? 'bg-[#3182F6]/90' : t.status === '마감' ? 'bg-slate-800/80' : 'bg-red-500/90'}`}>
                    {t.status}
                  </span>
                </div>
              </div>

              {/* 텍스트 영역 */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex gap-1.5 mb-2.5">
                   <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded font-bold border border-slate-100">{t.organization}</span>
                   <span className="text-[10px] text-[#3182F6] bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-100">{t.division}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-lg leading-snug mb-3 line-clamp-2 group-hover:text-[#3182F6] transition-colors break-keep">
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

        {/* 결과 없음 UI (토스 블루 포인트) */}
        {!loading && tournaments.length === 0 && (
          <div className="py-24 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search size={32} className="text-[#3182F6]"/>
            </div>
            <p className="text-slate-900 font-bold text-lg mb-2">원하시는 대회를 찾지 못했어요.</p>
            <p className="text-slate-500 text-sm mb-6">다른 검색어나 필터로 다시 시도해보세요.</p>
            <button onClick={resetFilters} className="px-6 py-3 bg-[#3182F6] text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">
              필터 초기화하고 전체보기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}