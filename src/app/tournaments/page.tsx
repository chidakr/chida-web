'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Filter, ChevronDown, Check, RefreshCw, Square, CheckSquare, Sparkles } from 'lucide-react';

export default function TournamentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-[#3182F6]">로딩중...</div>}>
      <TournamentListContent />
    </Suspense>
  );
}

// 📌 데이터 (기존 유지)
const CATEGORIES = [
  { id: 'all', label: '전체 보기', sub: [] },
  { id: 'men', label: '남자 복식', color: 'bg-blue-500', sub: ['오픈부', '전국신인부', '지역신인부', '초급자(1년미만)', '초급자(2년미만)', '초급자(3년미만)'] },
  { id: 'women', label: '여자 복식', color: 'bg-pink-500', sub: ['국화부', '개나리부', '초급자(1년미만)', '초급자(2년미만)', '초급자(3년미만)'] },
  { id: 'mixed', label: '혼합 복식', color: 'bg-purple-500', sub: ['혼복 오픈부', '혼복 신인부'] },
  { id: 'single', label: '단식', color: 'bg-green-500', sub: ['남자 단식', '여자 단식'] }
];

const LOCATIONS = [
  '서울', '경기', '인천', '경기 광주', '강원', '대전', '세종', '충북', '충남', 
  '부산', '대구', '울산', '경북', '경남', '전북', '광주', '전남', '제주'
];

function TournamentListContent() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 필터 상태
  const [filterMain, setFilterMain] = useState('카테고리 선택');
  const [filterSub, setFilterSub] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 드롭다운 UI 상태
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(CATEGORIES[1]);

  // Click Outside 감지를 위한 Ref
  const categoryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 데이터 불러오기
  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      let query = supabase.from('tournaments').select('*').order('start_date', { ascending: true });

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

  // 핸들러
  const resetFilters = () => { setFilterMain('카테고리 선택'); setFilterSub(''); setSelectedLocations([]); setSearchTerm(''); };
  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) setSelectedLocations(selectedLocations.filter(l => l !== loc));
    else setSelectedLocations([...selectedLocations, loc]);
  };
  const toggleAllLocations = () => {
    if (selectedLocations.length === LOCATIONS.length) setSelectedLocations([]);
    else setSelectedLocations([...LOCATIONS]);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900">
      
      {/* 1. Page Title & 3D Background */}
      <div className="relative pt-32 pb-12 bg-white overflow-hidden">
         {/* 3D Objects */}
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] right-[-5%] opacity-40 animate-float-slow">
               <CssTennisBall size={180} />
            </div>
            <div className="absolute top-[40%] left-[5%] opacity-30 animate-float-medium delay-700">
               <CssTennisBall size={60} />
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50/50 to-white/0"></div>
         </div>

         <div className="relative z-10 max-w-7xl mx-auto px-5">
            <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-slate-900">
               어떤 대회를 <span className="text-[#3182F6]">찾으시나요?</span>
            </h1>
            <p className="text-slate-500 font-normal">
               원하는 조건으로 검색하고 바로 신청해보세요.
            </p>
         </div>
      </div>

      {/* 2. Sticky Filter Bar (Glassmorphism) */}
      <div className="sticky top-16 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-y border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-5 py-4 space-y-4">
          
          {/* 검색창 */}
          <div className="relative w-full max-w-md mx-auto md:mx-0">
             <input 
               type="text" 
               placeholder="대회명, 지역, 클럽명 검색" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-slate-50 px-5 py-3.5 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#3182F6] transition-all pl-11 border border-slate-200 focus:border-transparent placeholder:text-slate-400 shadow-inner"
             />
             <Search size={18} className="absolute left-4 top-3.5 text-slate-400"/>
          </div>

          {/* 필터 영역 */}
          <div className="flex flex-col md:flex-row items-start gap-3">
            
            {/* [필터 1] 카테고리 */}
            <div className="relative z-50" ref={categoryRef}>
              <button 
                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsLocationOpen(false); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm font-semibold min-w-[150px] justify-between shadow-sm active:scale-95
                  ${isCategoryOpen || (filterMain !== '카테고리 선택' && filterMain !== '전체 보기')
                    ? 'border-[#3182F6] bg-[#3182F6] text-white shadow-blue-200' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="truncate">{filterSub || filterMain}</span>
                <ChevronDown size={16} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}/>
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-3 w-[340px] md:w-[480px] bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden flex z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="w-1/3 bg-slate-50/50 border-r border-slate-100 py-3">
                      {CATEGORIES.map((cat) => (
                        <div 
                          key={cat.id}
                          onMouseEnter={() => setHoveredCategory(cat)}
                          onClick={() => { if(cat.id === 'all') { setFilterMain('전체 보기'); setFilterSub(''); setIsCategoryOpen(false); } }}
                          className={`px-5 py-3 text-sm font-semibold cursor-pointer flex items-center justify-between transition-colors
                            ${hoveredCategory.id === cat.id ? 'bg-white text-[#3182F6] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          <div className="flex items-center gap-2">
                            {cat.color && <div className={`w-2 h-2 rounded-full ${cat.color}`}></div>}
                            {cat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="w-2/3 p-3 h-[300px] overflow-y-auto custom-scrollbar">
                      <p className="px-3 py-2 text-xs font-bold text-slate-400 mb-1">{hoveredCategory.label}</p>
                      <div className="grid grid-cols-1 gap-1">
                        {hoveredCategory.sub.map((subItem) => (
                          <div 
                            key={subItem}
                            onClick={() => { setFilterMain(hoveredCategory.label); setFilterSub(subItem); }}
                            className={`px-4 py-3 rounded-xl text-sm font-medium cursor-pointer flex items-center justify-between transition-all
                              ${filterSub === subItem ? 'bg-blue-50 text-[#3182F6] font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                          >
                            {subItem}
                            {filterSub === subItem && <Check size={16} />}
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
              )}
            </div>

            {/* [필터 2] 지역 */}
            <div className="relative z-40" ref={locationRef}>
              <button 
                onClick={() => { setIsLocationOpen(!isLocationOpen); setIsCategoryOpen(false); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm font-semibold min-w-[100px] justify-between shadow-sm active:scale-95
                  ${isLocationOpen || selectedLocations.length > 0
                    ? 'border-[#3182F6] bg-white text-[#3182F6] ring-1 ring-[#3182F6]' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <span>{selectedLocations.length === 0 ? '지역' : `지역 ${selectedLocations.length}`}</span>
                <ChevronDown size={16} className={`transition-transform ${isLocationOpen ? 'rotate-180' : ''}`}/>
              </button>

              {isLocationOpen && (
                <div className="absolute top-full left-0 mt-3 w-[340px] bg-white rounded-[2rem] shadow-2xl shadow-blue-900/10 border border-slate-100 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-70" onClick={toggleAllLocations}>
                           {selectedLocations.length === LOCATIONS.length ? <CheckSquare size={18} className="text-[#3182F6]"/> : <Square size={18} className="text-slate-300"/>}
                           <span className="text-sm font-bold text-slate-900">전체 선택</span>
                        </div>
                        <button onClick={() => setSelectedLocations([])} className="text-xs text-slate-400 hover:text-[#3182F6] underline">초기화</button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {LOCATIONS.map((loc) => {
                        const isSelected = selectedLocations.includes(loc);
                        return (
                          <button key={loc} onClick={() => toggleLocation(loc)}
                            className={`px-1 py-2.5 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center justify-center gap-1
                              ${isSelected ? 'bg-[#3182F6] text-white border-[#3182F6] shadow-md' : 'bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100'}`}
                          >
                            {isSelected ? <Check size={12} strokeWidth={4}/> : null}
                            {loc}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => setIsLocationOpen(false)} className="w-full mt-6 bg-[#3182F6] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">
                      선택 완료 ({selectedLocations.length})
                    </button>
                </div>
              )}
            </div>

            {/* 초기화 버튼 */}
            <button onClick={resetFilters} className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 transition-colors shadow-sm" title="필터 초기화">
              <RefreshCw size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Tournament List Content */}
      <main className="max-w-7xl mx-auto px-5 py-12"> 
        
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
             <Filter size={18} className="text-slate-400"/>
             {filterSub || filterMain} 
             {selectedLocations.length > 0 && <span className="text-[#3182F6] text-sm"> · {selectedLocations.join(', ')}</span>}
             <span className="text-slate-400 text-sm font-normal ml-1">({tournaments.length})</span>
           </h2>
        </div>
        
        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {!loading && tournaments.map((t) => (
            <div 
              key={t.id}
              onClick={() => router.push(`/tournaments/${t.id}`)} 
              className="bg-white rounded-[1.5rem] p-3 border border-slate-100 hover:border-blue-100 cursor-pointer transition-all hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 flex flex-col h-full group"
            >
              {/* 이미지 영역 */}
              <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-4">
                {t.poster_url ? (
                  <img src={t.poster_url} alt={t.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><span className="text-4xl">🎾</span></div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold shadow-sm backdrop-blur-md text-white
                    ${t.status === '접수중' ? 'bg-[#3182F6]/90' : t.status === '마감' ? 'bg-slate-800/80' : 'bg-red-500/90'}`}>
                    {t.status}
                  </span>
                </div>
              </div>

              {/* 텍스트 영역 */}
              <div className="px-2 pb-2 flex flex-col flex-1">
                <div className="flex gap-1.5 mb-3">
                   <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md font-semibold">{t.organization}</span>
                   <span className="text-[10px] text-[#3182F6] bg-blue-50 px-2 py-1 rounded-md font-semibold">{t.division}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-lg leading-snug mb-3 line-clamp-2 group-hover:text-[#3182F6] transition-colors break-keep">
                  {t.title}
                </h3>
                <div className="mt-auto pt-3 border-t border-slate-50 space-y-2">
                  <div className="flex items-center text-xs text-slate-500 font-medium"><Calendar size={13} className="mr-2 text-slate-400"/> {t.start_date}</div>
                  <div className="flex items-center text-xs text-slate-500 font-medium"><MapPin size={13} className="mr-2 text-slate-400"/> {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 결과 없음 UI */}
        {!loading && tournaments.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search size={40} className="text-slate-300"/>
            </div>
            <p className="text-slate-900 font-semibold text-lg mb-2">원하시는 대회를 찾지 못했어요.</p>
            <p className="text-slate-500 text-sm mb-8 font-normal">필터를 변경하거나 다른 검색어로 찾아보세요.</p>
            <button onClick={resetFilters} className="px-8 py-3.5 bg-[#3182F6] text-white rounded-2xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30">
              필터 초기화
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// 🎾 3D Tennis Ball Component (재사용)
function CssTennisBall({ size }: { size: number }) {
  return (
    <div 
      style={{ width: size, height: size }}
      className="rounded-full bg-[#E8F664] relative shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.15),inset_10px_10px_30px_rgba(255,255,255,0.8),0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden"
    >
      <div className="absolute w-full h-full border-[6px] border-white rounded-full opacity-80" style={{ transform: 'scale(1.5) rotate(45deg)', borderRadius: '50%' }}></div>
      <div className="absolute w-[90%] h-[90%] border-[6px] border-white rounded-full opacity-80" style={{ top: '-45%', left: '-45%' }}></div>
      <div className="absolute w-[90%] h-[90%] border-[6px] border-white rounded-full opacity-80" style={{ bottom: '-45%', right: '-45%' }}></div>
      <div className="absolute top-[15%] left-[15%] w-[20%] h-[20%] bg-white rounded-full blur-md opacity-60"></div>
    </div>
  );
}

