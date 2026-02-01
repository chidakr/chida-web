'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Filter, ChevronDown, ChevronRight, Check, RefreshCw, Square, CheckSquare, Facebook, Youtube, Instagram, Heart, MapPin, Trophy, X } from 'lucide-react';
import { TournamentCard } from '@/components/tournaments';
import { useTournaments } from '@/hooks/useTournaments';
import { CATEGORIES, LOCATIONS, type CategoryItem } from '@/constants/tournaments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // URL에서 초기 상태 읽기
  const [filterMain, setFilterMain] = useState(() => searchParams.get('category') || DEFAULT_FILTER_MAIN);
  const [filterSub, setFilterSub] = useState(() => searchParams.get('subcategory') || '');
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    const locations = searchParams.get('locations');
    return locations ? locations.split(',') : [];
  });
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(() => searchParams.get('bookmark') === 'true');
  const [isSearchExpanded, setIsSearchExpanded] = useState(() => !!searchParams.get('search'));
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<CategoryItem>(CATEGORIES[0]);

  const categoryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const { data: tournaments, loading } = useTournaments({
    filterMain,
    filterSub,
    selectedLocations,
    searchTerm,
  });

  // URL 쿼리 파라미터 동기화 (필터 상태 → URL)
  useEffect(() => {
    const params = new URLSearchParams();
    
    // 카테고리
    if (filterMain && filterMain !== DEFAULT_FILTER_MAIN) {
      params.set('category', filterMain);
    }
    
    // 서브 카테고리
    if (filterSub) {
      params.set('subcategory', filterSub);
    }
    
    // 지역
    if (selectedLocations.length > 0) {
      params.set('locations', selectedLocations.join(','));
    }
    
    // 검색어
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    // 북마크
    if (showBookmarksOnly) {
      params.set('bookmark', 'true');
    }
    
    // URL 업데이트 (페이지 새로고침 없이)
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    
    // 현재 URL과 다를 때만 업데이트
    if (window.location.pathname + window.location.search !== newUrl) {
      router.push(newUrl, { scroll: false });
    }
  }, [filterMain, filterSub, selectedLocations, searchTerm, showBookmarksOnly, pathname, router]);

  // 드롭다운 외부 클릭 감지
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
    setShowBookmarksOnly(false);
    setIsSearchExpanded(false);
  };
  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) setSelectedLocations(selectedLocations.filter(l => l !== loc));
    else setSelectedLocations([...selectedLocations, loc]);
  };

  // 전체 선택 = 모든 필터 해제 + 드롭다운 닫기
  const handleSelectAll = () => {
    setSelectedLocations([]);
    setIsLocationOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      
      {/* BootTent Style Filter Bar - 헤더 바로 아래 */}
      <div className="sticky top-16 left-0 right-0 z-40 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-5 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* 북마크 버튼 - 토스 스타일 */}
            <Button
              variant="outline"
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={showBookmarksOnly 
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 hover:border-rose-300' 
                : 'hover:bg-slate-50'}
            >
              <Heart size={16} className={showBookmarksOnly ? 'fill-current' : ''} />
              북마크
            </Button>

            {/* 검색 버튼 */}
            <Button
              variant={isSearchExpanded ? "default" : "outline"}
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            >
              <Search size={16} />
              검색
            </Button>
            
            {/* [필터 1] 카테고리 */}
            <div className="relative z-50" ref={categoryRef}>
              <Button
                variant={isCategoryOpen || (filterMain !== '카테고리 선택' && filterMain !== '전체') ? "secondary" : "outline"}
                onClick={() => {
                  // 모달 열 때 전체로 초기화 (컴팩트하게)
                  if (!isCategoryOpen) {
                    setHoveredCategory(CATEGORIES[0]);
                  }
                  setIsCategoryOpen(!isCategoryOpen);
                  setIsLocationOpen(false);
                }}
                className="min-w-[160px] justify-between"
              >
                <span className="truncate max-w-[140px]">{filterSub || filterMain}</span>
                <ChevronDown size={14} className={`transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </Button>

              {isCategoryOpen && (
                <div className={`absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex z-50 animate-in fade-in slide-in-from-top-2 duration-200 transition-none ${
                  hoveredCategory.sub.length > 0 ? 'w-[500px]' : 'w-[240px]'
                }`}>
                    <div className="w-[240px] bg-slate-50/50 p-3 flex-shrink-0">
                      {/* 카테고리 헤더 (선택 불가) */}
                      <div className="px-4 py-2 mb-2 text-xs font-bold text-slate-400 pointer-events-none border-b border-slate-200 pb-3">
                        카테고리
                      </div>

                      {CATEGORIES.map((cat) => {
                        // Tailwind JIT를 위한 명시적 클래스명 매핑
                        const getCircleColor = (id: string) => {
                          switch (id) {
                            case 'all': return 'bg-slate-400';
                            case 'men': return 'bg-blue-500';
                            case 'women': return 'bg-pink-500';
                            case 'mixed': return 'bg-purple-500';
                            case 'single': return 'bg-green-500';
                            default: return '';
                          }
                        };

                        return (
                          <div
                            key={cat.id}
                            onMouseEnter={() => {
                              // 호버 시 서브메뉴 보여주기 (전체 제외)
                              if (cat.id !== 'all') {
                                setHoveredCategory(cat);
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();

                              // "전체" 클릭 시 모달 바로 닫기
                              if (cat.id === 'all') {
                                setFilterMain('카테고리 선택');
                                setFilterSub('');
                                setIsCategoryOpen(false);
                              } else {
                                // 다른 카테고리 클릭 시 필터 적용하고 모달 닫기
                                setFilterMain(cat.label);
                                setFilterSub('');
                                setIsCategoryOpen(false);
                              }
                            }}
                            className={`px-4 py-3 mb-1 rounded-xl text-sm font-medium cursor-pointer flex items-center justify-between transition-all
                              ${hoveredCategory.id === cat.id ? 'bg-white text-[#3182F6] shadow-sm' : 'text-slate-600 hover:bg-white/50'}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-2 h-2 rounded-full ${getCircleColor(cat.id)}`} />
                              <span>{cat.label}</span>
                            </div>
                            {cat.id !== 'all' && <ChevronRight size={14} className="text-slate-400" />}
                          </div>
                        );
                      })}
                    </div>
                    {hoveredCategory.sub.length > 0 && (
                      <div className="w-[260px] p-4 max-h-[380px] overflow-y-auto flex-shrink-0 border-l border-slate-200">
                        <p className="px-2 py-1 text-xs font-bold text-slate-400 mb-2">{hoveredCategory.label}</p>
                        <div className="grid grid-cols-1 gap-1">
                          {hoveredCategory.sub.map((subItem) => (
                            <div
                              key={subItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilterMain(hoveredCategory.label);
                                setFilterSub(subItem);
                                setIsCategoryOpen(false); // 모달 닫기
                              }}
                              className={`px-4 py-3 rounded-xl text-sm font-medium cursor-pointer flex items-center justify-between transition-all
                                ${filterSub === subItem ? 'bg-blue-50 text-[#3182F6] font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                              <span>{subItem}</span>
                              {filterSub === subItem && <Check size={16} />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* [필터 2] 지역 - 부트텐트 체크박스 스타일 */}
            <div className="relative z-40" ref={locationRef}>
              <Button
                variant={isLocationOpen || selectedLocations.length > 0 ? "secondary" : "outline"}
                onClick={() => { setIsLocationOpen(!isLocationOpen); setIsCategoryOpen(false); }}
              >
                <span>{selectedLocations.length === 0 ? '지역' : `지역 (${selectedLocations.length})`}</span>
                <ChevronDown size={14} className={`transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
              </Button>

              {isLocationOpen && (
                <div className="absolute top-full left-0 mt-2 w-[340px] bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* 헤더 */}
                    <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">지역 선택</span>
                          {selectedLocations.length > 0 && (
                            <span className="text-xs text-blue-600 font-semibold">
                              {selectedLocations.length}개
                            </span>
                          )}
                        </div>
                        {selectedLocations.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLocations([])}
                            className="h-6 text-xs px-2"
                          >
                            초기화
                          </Button>
                        )}
                    </div>

                    {/* 체크박스 그리드 - 3열 레이아웃 */}
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {LOCATIONS.map((loc) => {
                        const isSelected = selectedLocations.includes(loc);
                        return (
                          <div
                            key={loc}
                            onClick={() => toggleLocation(loc)}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-50 hover:bg-blue-100'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            {/* 커스텀 체크박스 */}
                            <div className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-all ${
                              isSelected
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white border-slate-300'
                            }`}>
                              {isSelected && (
                                <Check size={14} className="text-white" strokeWidth={3} />
                              )}
                            </div>

                            {/* 지역명 */}
                            <span className={`text-sm font-medium transition-colors ${
                              isSelected ? 'text-blue-700' : 'text-slate-700'
                            }`}>
                              {loc}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* 전체 선택 - 맨 아래 배치 (왼쪽 정렬, 체크박스 형태) */}
                    <div className="pt-3 border-t border-slate-100">
                      <div
                        onClick={handleSelectAll}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all hover:bg-slate-50"
                      >
                        {/* 체크박스 - 항상 unchecked 상태 */}
                        <div className="flex items-center justify-center w-5 h-5 rounded border-2 bg-white border-slate-300 transition-all">
                        </div>

                        {/* 텍스트 */}
                        <span className="text-sm font-semibold text-slate-700">
                          전체 선택
                        </span>
                      </div>
                    </div>
                </div>
              )}
            </div>

            {/* 필터 초기화 */}
            {(filterMain !== '카테고리 선택' || selectedLocations.length > 0 || showBookmarksOnly || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
              >
                초기화
              </Button>
            )}
          </div>

          {/* Expandable Search Input (Shadcn UI) */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isSearchExpanded ? 'max-h-20 opacity-100 mt-3' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="대회명, 지역으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-9 outline-none focus-visible:ring-2 focus-visible:ring-blue-100 transition-shadow"
                autoFocus={isSearchExpanded}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                >
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner - 부트텐트 스타일 프로모션 */}
      <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 overflow-hidden mt-12">
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
         
         <div className="max-w-7xl mx-auto px-5 py-10 md:py-12 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
               {/* 텍스트 영역 */}
               <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
                     나에게 딱 맞는 대회,<br className="hidden md:block" />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300"> 여기서 발견하세요!</span>
                  </h1>
                  <p className="text-slate-300 text-base md:text-lg font-medium">
                     원하는 조건으로 쉽고 빠르게 찾아보세요. 검증된 대회만 모았습니다.
                  </p>
               </div>

               {/* 우측 비주얼 (테니스 이모지 활용) */}
               <div className="hidden md:flex items-center justify-center">
                  <div className="relative">
                     <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                     <div className="relative text-8xl animate-bounce" style={{ animationDuration: '3s' }}>
                        🎾
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 하단 웨이브 효과 */}
         <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-4" viewBox="0 0 1200 20" preserveAspectRatio="none">
               <path d="M0,10 Q300,0 600,10 T1200,10 L1200,20 L0,20 Z" fill="#F8FAFC" />
            </svg>
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

      {/* Footer */}
      <footer className="bg-white pb-20 mt-auto">
        <div className="max-w-7xl mx-auto px-5 pt-20">
            <div className="border-t border-slate-200 pt-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
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
