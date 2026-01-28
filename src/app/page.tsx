'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTournamentsSimple } from '@/hooks/useTournaments';
import { TournamentCard } from '@/components/tournaments';
import type { Tournament } from '@/types';
import {
  Search, ChevronRight, TrendingUp, ArrowRight,
  Facebook, Youtube, Instagram, Trophy, PlayCircle, X,
} from 'lucide-react';

export default function HomePage() {
  const { data: tournaments, loading } = useTournamentsSimple();
  const [filter, setFilter] = useState('전체 보기');
  const [searchQuery, setSearchQuery] = useState('');

  const closingSoon = tournaments
    .filter((t: Tournament) => t.status === 'recruiting')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const filteredList = tournaments.filter((t: Tournament) => {
      // 1. 검색어 필터링 (제목, 장소)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(query);
        const matchesLocation = t.location?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesLocation) return false;
      }
      
      // 2. 카테고리 필터링 (복식 타입별 - 제목 기반)
      if (filter === '전체 보기') return true;
      const titleLower = t.title?.toLowerCase() || '';
      if (filter === '남자 복식') return titleLower.includes('남자') && (titleLower.includes('복식') || titleLower.includes('더블'));
      if (filter === '여자 복식') return titleLower.includes('여자') && (titleLower.includes('복식') || titleLower.includes('더블'));
      if (filter === '혼합 복식') return titleLower.includes('혼합') || titleLower.includes('혼복') || titleLower.includes('믹스');
      if (filter === '단식') return titleLower.includes('단식') || titleLower.includes('싱글');
      return true;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-200 text-3xl animate-pulse">CHIDA.</div>;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* =========================================
          1. Hero Section (Ultra Detail)
          - 그라데이션 텍스트, 플로팅 애니메이션 강화
      ========================================= */}
      <section className="w-full bg-[#F8FAFC] pt-48 pb-32 relative overflow-hidden border-b border-slate-200">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-5 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-16">
                
                {/* 텍스트 영역 */}
                <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full shadow-sm mb-8 hover:shadow-md transition-all cursor-default">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                        <span className="text-sm font-bold text-slate-600">
                            현재 <span className="text-blue-600 tabular-nums">128</span>개의 대회가 모집 중
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                        테니스의 모든 순간,<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3182F6] to-[#8B5CF6]">치다</span>에서 시작하세요.
                    </h1>
                    <p className="text-slate-500 text-xl font-medium leading-relaxed mb-12 max-w-2xl">
                        전국 대회 정보 검색부터 스마트한 파트너 매칭까지.<br/>
                        더 이상 단톡방을 헤매지 마세요. <b>검증된 정보</b>만 모았습니다.
                    </p>

                    {/* 대형 검색바 (Toss Premium Web Style) */}
                    <div className="relative max-w-xl group transition-all hover:-translate-y-1">
                        <input 
                            type="text" 
                            placeholder="지역, 대회명으로 검색..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-20 pl-16 pr-20 bg-gray-50 border-0 rounded-[2rem] focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100/50 font-bold text-xl text-slate-800 transition-all placeholder:text-gray-400 shadow-sm"
                        />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={28}/>
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600 transition-colors"
                          >
                            <X size={24} />
                          </button>
                        )}
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-blue-500/30">
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>

                {/* 우측 비주얼 (플로팅 애니메이션) */}
                <div className="hidden md:block relative w-[450px] h-[500px] animate-in fade-in slide-in-from-right-12 duration-1000 delay-200">
                     {/* 뒷배경 카드 */}
                     <div className="absolute right-0 top-10 w-80 h-96 bg-gradient-to-br from-white to-slate-50 rounded-[2.5rem] border border-white shadow-2xl rotate-6 animate-float-slow"></div>
                     {/* 메인 카드 */}
                     <div className="absolute right-10 top-0 w-80 h-96 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500 animate-float">
                        <div className="flex justify-between items-start">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">🏆</div>
                            <div className="px-3 py-1 bg-red-50 text-red-500 text-xs font-bold rounded-full border border-red-100 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> 마감임박
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-400 font-bold text-sm mb-1 uppercase tracking-wider">Weekly Best</p>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">제1회<br/>치다 오픈</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                                <span>참가 현황</span>
                                <span className="text-blue-600">98%</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="w-[98%] h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </section>


      {/* =========================================
          2. Curation Section (호버 인터랙션 강화)
      ========================================= */}
      <section className="w-full bg-white py-24 border-b border-slate-50">
        <div className="max-w-7xl mx-auto px-5">
            <div className="flex items-end justify-between mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="text-rose-500" size={24}/>
                        <span className="text-rose-500 font-black text-sm tracking-widest uppercase">Closing Soon</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                        놓치면 후회할 <span className="relative inline-block z-0"><span className="absolute bottom-2 left-0 w-full h-4 bg-rose-100 -z-10"></span>마감 임박 대회</span>
                    </h2>
                </div>
                <Link href="/tournaments" className="hidden md:flex items-center gap-2 text-base font-bold text-slate-400 hover:text-slate-900 transition-colors group">
                    전체보기 <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {closingSoon.length > 0 ? (
                    closingSoon.map((t) => (
                        <div key={t.id} className="h-full">
                            <TournamentCard tournament={t} />
                        </div>
                    ))
                ) : (
                    <div className="col-span-4 py-24 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                        <Trophy className="mx-auto text-slate-300 mb-4" size={48}/>
                        <p className="font-bold text-slate-500 text-lg">현재 마감 임박한 대회가 없습니다.</p>
                        <p className="text-slate-400 text-sm mt-1">하지만 곧 새로운 대회가 열릴 거예요!</p>
                    </div>
                )}
            </div>
        </div>
      </section>


      {/* =========================================
          3. Trust Section (숫자 카운팅 애니메이션)
          - useCounter 훅 사용
      ========================================= */}
      <section className="w-full bg-[#0F172A] py-24 text-white relative overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-5 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x divide-white/10">
                <TrustItem end={128} label="진행 중인 대회" suffix="+" />
                <TrustItem end={15200} label="월간 방문자 수" separator />
                <TrustItem end={8240} label="누적 참가자" separator />
                <TrustItem end={98} label="대회 만족도" suffix="%" />
            </div>
        </div>
      </section>


      {/* =========================================
          4. Main List Section (Pill Filter)
      ========================================= */}
      <section className="w-full bg-[#F8FAFC] py-24">
        <div className="max-w-7xl mx-auto px-5">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                        나에게 맞는 대회를 찾아보세요
                    </h2>
                    <p className="text-slate-500 font-medium">
                        지역별, 레벨별로 원하는 대회를 필터링할 수 있습니다.
                    </p>
                </div>
                
                {/* Premium Horizontal Category Chips (Toss Style) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto no-scrollbar">
                    {['전체 보기', '남자 복식', '여자 복식', '혼합 복식', '단식'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                                filter === tab 
                                ? 'bg-black text-white shadow-sm' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-20">
                {filteredList.length > 0 ? (
                    filteredList.map((t) => (
                        <div key={t.id}>
                            <TournamentCard tournament={t} />
                        </div>
                    ))
                ) : (
                    <div className="col-span-4 py-32 text-center">
                        <div className="inline-block p-4 rounded-full bg-slate-100 mb-4"><Search size={32} className="text-slate-400"/></div>
                        <p className="text-slate-900 font-bold text-lg">조건에 맞는 대회가 없습니다.</p>
                        <p className="text-slate-500 mt-2">다른 필터를 선택해보세요.</p>
                    </div>
                )}
            </div>

            <div className="text-center">
                 <Link href="/tournaments" className="group inline-flex items-center gap-2 px-12 py-5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm text-lg hover:-translate-y-1">
                    모든 대회 보러가기 <ArrowRight size={20} className="text-slate-400 group-hover:text-slate-900 transition-colors"/>
                 </Link>
            </div>
        </div>
      </section>


      {/* =========================================
          5. Insights Section (Interactive Cards)
      ========================================= */}
      <section className="w-full bg-white py-32 border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-5">
            <div className="mb-16">
                <span className="text-blue-600 font-bold text-sm tracking-widest uppercase mb-3 block">Career Insights</span>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                    우승자들의<br/>
                    <span className="text-slate-400">생생한 노하우를 들어보세요</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InsightCard 
                    category="우승 인터뷰"
                    title="구력 1년차 테린이가 신인부 우승한 비결"
                    desc="매일 벽치기 30분이 만든 기적같은 스토리. 라켓 잡는 법부터 멘탈 관리까지."
                    color="from-blue-100 to-indigo-50"
                    icon="🏆"
                />
                <InsightCard 
                    category="대회 꿀팁"
                    title="첫 대회 나가기 전, 가방에 뭘 챙겨야 할까?"
                    desc="고수들이 말하는 필수 준비물 체크리스트 10. 이것만 챙기면 당황하지 않아요."
                    color="from-rose-100 to-orange-50"
                    icon="🎒"
                />
                <InsightCard 
                    category="파트너 구하기"
                    title="나와 딱 맞는 복식 파트너 알아보는 법"
                    desc="성격 유형(MBTI)으로 보는 테니스 파트너 궁합. 싸우지 않고 오래가는 법."
                    color="from-purple-100 to-pink-50"
                    icon="🤝"
                />
            </div>
         </div>
      </section>


      {/* =========================================
          6. Banner Section (Impact CTA)
      ========================================= */}
      <section className="w-full bg-[#111] py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-5 relative z-10 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tight">
                지금 바로 코트로<br/>나갈 준비 되셨나요?
            </h2>
            <p className="text-slate-400 text-xl font-medium mb-12">
                10만 테니스인과 함께하는 국내 최대 플랫폼.<br/>
                고민하는 순간 마감됩니다. 3초 만에 시작하세요.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link href="/tournaments" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-black hover:bg-slate-200 rounded-2xl font-bold text-xl transition-all hover:-translate-y-1 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    대회 찾아보기 <ArrowRight size={20}/>
                </Link>
                <Link href="/admin/write" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-transparent border border-white/20 text-white hover:bg-white/10 rounded-2xl font-bold text-xl transition-all">
                    주최자 등록하기
                </Link>
            </div>
        </div>
      </section>


      {/* =========================================
          ✅ Footer (Simple & Clean)
      ========================================= */}
      <footer className="bg-white pb-20 mt-24">
        <div className="max-w-7xl mx-auto px-5 pt-20">
            
            <div className="border-t border-slate-200 pt-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                
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

// --------------------------------------------------------
// 👇 Sub Components (Micro-interactions)
// --------------------------------------------------------

// ✨ 숫자 카운팅 훅 (직접 구현)
function useCounter(end: number, duration: number = 2000) {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        let startTime: number | null = null;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Ease-out effect
            const easeOut = 1 - Math.pow(1 - percentage, 3);
            
            setCount(Math.floor(end * easeOut));

            if (progress < duration) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    animationFrameId = requestAnimationFrame(animate);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            observer.disconnect();
        };
    }, [end, duration]);

    return { count, countRef };
}

// ✨ 신뢰도 아이템 (카운팅 적용)
function TrustItem({
  end,
  label,
  suffix = '',
  separator = false,
}: {
  end: number;
  label: string;
  isLast?: boolean;
  suffix?: string;
  separator?: boolean;
}) {
    const { count, countRef } = useCounter(end);
    const containerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (containerRef.current && countRef.current) {
            const observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        observer.disconnect();
                    }
                },
                { threshold: 0.5 }
            );
            observer.observe(containerRef.current);
        }
    }, []);
    
    return (
        <div className={`flex flex-col items-center`} ref={containerRef}>
            <span className="text-4xl md:text-6xl font-black mb-3 tabular-nums tracking-tight" ref={countRef}>
                {separator ? count.toLocaleString() : count}{suffix}
            </span>
            <span className="text-slate-400 font-bold text-sm tracking-wide uppercase">{label}</span>
        </div>
    );
}
function InsightCard({
  category,
  title,
  desc,
  color,
  icon,
}: {
  category: string;
  title: string;
  desc: string;
  color: string;
  icon: string;
}) {
    return (
        <div className="group cursor-pointer">
            <div className={`relative aspect-video rounded-3xl bg-gradient-to-br ${color} mb-6 overflow-hidden flex items-center justify-center shadow-inner`}>
                <div className="text-7xl group-hover:scale-110 transition-transform duration-500 drop-shadow-sm transform group-hover:rotate-3">{icon}</div>
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <PlayCircle className="text-slate-900 ml-1" size={32} fill="currentColor" />
                    </div>
                </div>
            </div>
            <div className="px-2">
                <span className="text-blue-600 font-bold text-xs mb-2 block tracking-wider uppercase">{category}</span>
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-medium">
                    {desc}
                </p>
            </div>
        </div>
    )
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