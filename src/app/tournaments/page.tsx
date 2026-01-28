'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronDown, ChevronRight, Check, RefreshCw, Square, CheckSquare, Facebook, Youtube, Instagram } from 'lucide-react';
import { TournamentCard } from '@/components/tournaments';
import { useTournaments } from '@/hooks/useTournaments';
import { CATEGORIES, LOCATIONS, type CategoryItem } from '@/constants/tournaments';

export default function TournamentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-[#3182F6]">로딩중...</div>}>
      <TournamentListContent />
    </Suspense>
  );
}

const DEFAULT_FILTER_MAIN = '카테고리 선택';

function TournamentListContent() {
  const router = useRouter();
  const [filterMain, setFilterMain] = useState(DEFAULT_FILTER_MAIN);
  const [filterSub, setFilterSub] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<CategoryItem>(CATEGORIES[1]);

  const categoryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const { data: tournaments, loading } = useTournaments({
    filterMain,
    filterSub,
    selectedLocations,
    searchTerm,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetFilters = () => {
    setFilterMain(DEFAULT_FILTER_MAIN);
    setFilterSub('');
    setSelectedLocations([]);
    setSearchTerm('');
  };
  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) setSelectedLocations(selectedLocations.filter(l => l !== loc));
    else setSelectedLocations([...selectedLocations, loc]);
  };
  const toggleAllLocations = () => {
    if (selectedLocations.length === LOCATIONS.length) setSelectedLocations([]);
    else setSelectedLocations([...LOCATIONS]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      
      {/* Compact Filter Bar - 헤더 바로 아래 */}
      <div className="sticky top-16 left-0 right-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 py-3">
          <div className="flex flex-col md:flex-row items-start gap-3">
            
            {/* [필터 1] 카테고리 */}
            <div className="relative z-50" ref={categoryRef}>
              <button 
                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsLocationOpen(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium min-w-[120px] justify-between
                  ${isCategoryOpen || (filterMain !== '카테고리 선택' && filterMain !== '전체 보기')
                    ? 'border-slate-300 bg-slate-50 text-slate-900' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
              >
                <span className="truncate">{filterSub || filterMain}</span>
                <ChevronDown size={14} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''} ml-auto`}/>
              </button>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 mt-2 w-[360px] md:w-[500px] bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="w-[40%] bg-slate-50/50 border-r border-slate-200 p-4">
                      {CATEGORIES.map((cat) => (
                        <div 
                          key={cat.id}
                          onMouseEnter={() => setHoveredCategory(cat)}
                          onClick={(e) => { 
                            e.stopPropagation();
                            setFilterMain(cat.label); 
                            setFilterSub(''); 
                          }}
                          className={`px-4 py-3 mb-1.5 rounded-lg text-sm font-semibold cursor-pointer flex items-center justify-between transition-colors
                            ${hoveredCategory.id === cat.id ? 'bg-white text-[#3182F6] shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
                        >
                          <div className="flex items-center gap-2.5">
                            {'color' in cat && cat.color ? <div className={`w-2 h-2 rounded-full ${cat.color}`} /> : null}
                            {cat.label}
                          </div>
                          <ChevronRight size={14} className="text-slate-400 ml-3" />
                        </div>
                      ))}
                    </div>
                    <div className="w-[60%] p-5 h-[320px] overflow-y-auto custom-scrollbar">
                      <p className="px-1 py-1 text-xs font-bold text-slate-400 mb-3">{hoveredCategory.label}</p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {hoveredCategory.sub.map((subItem) => (
                          <div 
                            key={subItem}
                            onClick={(e) => { 
                              e.stopPropagation();
                              setFilterMain(hoveredCategory.label); 
                              setFilterSub(subItem); 
                              // 메뉴 닫지 않음
                            }}
                            className={`px-4 py-3 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-between transition-all
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
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium min-w-[100px] justify-between
                  ${isLocationOpen || selectedLocations.length > 0
                    ? 'border-slate-300 bg-slate-50 text-slate-900' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
              >
                <span>{selectedLocations.length === 0 ? '지역' : `지역 ${selectedLocations.length}`}</span>
                <ChevronDown size={14} className={`transition-transform ${isLocationOpen ? 'rotate-180' : ''}`}/>
              </button>

              {isLocationOpen && (
                <div className="absolute top-full left-0 mt-2 w-[360px] bg-white rounded-lg shadow-2xl border border-slate-200 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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

            <button onClick={resetFilters} className="p-2 rounded-lg border border-slate-200 bg-white hover:border-slate-300 text-slate-400 hover:text-slate-600 transition-colors" title="필터 초기화">
              <RefreshCw size={16}/>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section - 필터 아래 (컴팩트) */}
      <div className="relative bg-white border-b border-slate-100">
         <div className="max-w-7xl mx-auto px-5 py-8">
            <h1 className="text-2xl md:text-3xl font-black mb-2 text-slate-900 tracking-tight">
               어떤 대회를 <span className="text-[#3182F6]">찾으시나요?</span>
            </h1>
            <p className="text-slate-500 font-medium">
               원하는 조건으로 검색하고 바로 신청해보세요.
            </p>
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 py-6 flex-1 w-full"> 
        
        {/* FilterBar (N개 찾았어요 + 정렬/검색) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="text-lg">
            <span className="text-slate-900 font-bold">모집 중인 대회 </span>
            <span className="text-[#3182F6] font-bold text-xl">{tournaments.length}</span>
            <span className="text-slate-900 font-bold">개를 찾았어요.</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* 정렬 드롭다운 */}
            <div className="relative">
              <select className="appearance-none px-5 py-2.5 pr-10 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-300 bg-white hover:border-slate-300 transition-all cursor-pointer font-medium text-slate-700">
                <option>기본 정렬</option>
                <option>마감 임박순</option>
                <option>대회 시작순</option>
                <option>참가비 낮은순</option>
                <option>참가비 높은순</option>
                <option>대회 기간 짧은순</option>
                <option>대회 기간 긴순</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
            </div>
            
            {/* 검색창 */}
            <div className="relative flex-1 max-w-md">
              <input 
                type="text" 
                placeholder="대회 검색" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-slate-300 pl-10 transition-all"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-20 text-slate-400">대회 정보를 불러오는 중... 🎾</div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {tournaments.length > 0 ? (
               tournaments.map((t) => (
                 <TournamentCard key={t.id} tournament={t} />
               ))
             ) : (
                <div className="col-span-full py-20 text-center">
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
           </div>
        )}
      </main>

      {/* ✅ Footer 추가 (메인 페이지 디자인 유지) */}
      <footer className="bg-white pb-20 mt-auto border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-5">
            
            {/* 구분선 (border-t를 위로 이동시킴) */}
            <div className="pt-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                
                {/* 왼쪽: 회사 정보 */}
                <div className="text-left space-y-2">
                    <p className="text-[#65676A] font-medium text-base">© 2026 Chida Corp.</p>
                    
                    <div className="flex flex-col gap-1 text-base text-[#A7A7AA] font-normal">
                        <div className="flex flex-wrap items-center gap-2">
                            <span>주식회사 치다</span>
                            <span className="w-px h-3 bg-slate-300 hidden sm:block"></span>
                            <span>대표자 : 박영승</span>
                        </div>
                        <p>사업자등록번호 : 000-00-00000</p>
                    </div>
                </div>

                {/* 오른쪽: 소셜 아이콘 */}
                <div className="flex gap-3">
                    <SocialIcon href="https://facebook.com" icon={<Facebook size={20} />} />
                    <SocialIcon href="https://youtube.com" icon={<Youtube size={20} />} />
                    <SocialIcon href="https://instagram.com" icon={<Instagram size={20} />} />
                </div>

            </div>
        </div>
      </footer>
    </div>
  );
}

// ✨ Footer용 소셜 아이콘 컴포넌트
function SocialIcon({ href, icon }: { href: string, icon: React.ReactNode }) {
    return (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#A7A7AA] hover:bg-slate-200 hover:text-slate-600 transition-colors"
        >
            {icon}
        </a>
    )
}
