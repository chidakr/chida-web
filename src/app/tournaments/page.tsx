'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Search, MapPin, Calendar, Filter, ChevronDown, Check, RefreshCw, Square, CheckSquare, 
  Facebook, Youtube, Instagram // ✅ 소셜 아이콘 추가
} from 'lucide-react';
import TournamentCard from '@/src/components/layout/tournaments/TournamentCard';

export default function TournamentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-[#3182F6]">로딩중...</div>}>
      <TournamentListContent />
    </Suspense>
  );
}

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
  const supabase = createClient();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterMain, setFilterMain] = useState('카테고리 선택');
  const [filterSub, setFilterSub] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(CATEGORIES[1]);

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

  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      let query = supabase.from('tournaments').select('*').order('created_at', { ascending: false });

      if (filterSub) {
         query = query.ilike('level', `%${filterSub}%`);
      } else if (filterMain !== '카테고리 선택' && filterMain !== '전체 보기') {
         const keyword = filterMain.replace(' 복식', '').replace('단식', '');
         query = query.ilike('level', `%${keyword}%`); 
      }

      if (selectedLocations.length > 0) {
        const orQuery = selectedLocations.map(loc => `location.ilike.%${loc}%`).join(',');
        query = query.or(orQuery);
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,organizer.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (!error) setTournaments(data || []);
      setLoading(false);
    }
    fetchTournaments();
  }, [filterMain, filterSub, selectedLocations, searchTerm]);

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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 flex flex-col">
      
      <div className="relative pt-32 pb-12 bg-white overflow-hidden border-b border-slate-100">
         <div className="relative z-10 max-w-7xl mx-auto px-5">
            <h1 className="text-3xl md:text-4xl font-black mb-3 text-slate-900 tracking-tight">
               어떤 대회를 <span className="text-[#3182F6]">찾으시나요?</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">
               원하는 조건으로 검색하고 바로 신청해보세요.
            </p>
         </div>
         <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none"></div>
      </div>

      <div className="sticky top-16 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-5 py-4 space-y-4">
          
          <div className="relative w-full max-w-md mx-auto md:mx-0">
             <input 
               type="text" 
               placeholder="대회명, 지역, 주최 검색" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-slate-50 px-5 py-3.5 rounded-2xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#3182F6] transition-all pl-11 border border-slate-200 focus:border-transparent placeholder:text-slate-400 shadow-inner"
             />
             <Search size={18} className="absolute left-4 top-3.5 text-slate-400"/>
          </div>

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

            <button onClick={resetFilters} className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 transition-colors shadow-sm" title="필터 초기화">
              <RefreshCw size={18}/>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 py-12 flex-1 w-full"> 
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
             <Filter size={18} className="text-slate-400"/>
             {filterSub || filterMain} 
             {selectedLocations.length > 0 && <span className="text-[#3182F6] text-sm"> · {selectedLocations.join(', ')}</span>}
             <span className="text-slate-400 text-sm font-normal ml-1">({tournaments.length})</span>
           </h2>
        </div>
        
        {loading ? (
          <div className="text-center py-20 text-slate-400">대회 정보를 불러오는 중... 🎾</div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {tournaments.length > 0 ? (
               tournaments.map((t) => (
                 <TournamentCard key={t.id} data={t} />
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
