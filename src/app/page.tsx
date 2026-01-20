'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Trophy,
  Calendar,
  Users,
  ChevronRight,
  Star,
  ArrowRight,
  Eye,
  MapPin,
  Flame,
  Menu,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [hotTournaments, setHotTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHotTournaments() {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('view_count', { ascending: false })
        .limit(4);

      if (!error) setHotTournaments(data || []);
      setLoading(false);
    }
    fetchHotTournaments();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      {/* 1. 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 h-16 transition-all">
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* 로고: 블루 포인트 */}
            <div
              className="text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-1"
              onClick={() => router.push('/')}
            >
              <span className="text-black">치다</span>
              {/* 토스 블루 컬러 적용 */}
              <span className="w-2 h-2 rounded-full bg-[#3182F6] mt-3 animate-pulse"></span>
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
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity rounded-lg"></div>
              </button>
            </nav>
          </div>
          <button className="text-xs font-bold bg-black text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md hover:shadow-lg active:scale-95">
            로그인
          </button>
        </div>
      </header>

      {/* 2. 히어로 배너 (블루 테마) */}
      <section className="relative pt-32 pb-24 bg-slate-50/30">
        {/* 배경 그래픽: 블루 & 퍼플 계열로 변경 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[10%] right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-100/40 to-indigo-100/40 blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-100/30 to-blue-100/30 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-5 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
            <div className="flex-1 text-center md:text-left z-10">
              {/* 뱃지: 블루 포인트 */}
              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full mb-6 shadow-sm">
                <Sparkles size={14} className="text-[#3182F6] fill-blue-100" />
                <span className="text-xs font-bold text-slate-600">지금 가장 스마트한 테니스 플랫폼</span>
              </div>

              {/* 메인 타이틀: 블루 그라데이션 */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] mb-8 tracking-tight text-slate-900">
                코트 위의 <br className="hidden md:block" />
                모든 순간을 <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3182F6] via-cyan-500 to-[#3182F6] bg-[length:200%_auto] animate-gradient">
                  치다.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 leading-relaxed break-keep max-w-xl mx-auto md:mx-0">
                전국 랭킹 대회부터 동네 비랭킹 대회까지, <br />
                복잡한 검색 없이 <strong>치다</strong>에서 한 번에 찾고 참가하세요.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <button
                  onClick={() => router.push('/tournaments')}
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-95"
                >
                  모든 대회 보기
                  <ChevronRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all active:scale-95">
                  <Trophy size={20} className="text-yellow-500 fill-yellow-100" /> 랭킹 대회
                  모아보기
                </button>
              </div>
            </div>

            {/* 오른쪽: 일러스트 영역 (배경색 변경) */}
            <div className="flex-1 relative max-w-lg md:max-w-none w-full aspect-square md:aspect-[4/3]">
              <div className="w-full h-full rounded-[3rem] bg-gradient-to-br from-slate-100 to-white border border-slate-200 flex flex-col items-center justify-center p-10 relative overflow-hidden group shadow-2xl shadow-slate-200/50 tilt-in-fwd-tr">
                 {/* 장식 요소도 블루 계열로 */}
                 <div className="absolute top-10 right-10 w-32 h-32 bg-blue-400 rounded-full blur-2xl opacity-40 animate-bounce-slow"></div>
                 <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-300 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                 
                 <div className="relative z-10 flex flex-col items-center">
                    <span className="text-[100px] md:text-[150px] leading-none">🎾</span>
                    <span className="text-2xl font-black text-slate-400 mt-4">CHIDA. PLAY.</span>
                    <span className="text-sm font-bold text-slate-300">Smart Tennis Platform</span>
                    
                    <div className="absolute top-8 -left-8 bg-white border border-slate-100 px-4 py-2 rounded-full shadow-lg rotate-[-12deg] flex items-center gap-2 animate-float">
                        <span className="w-2 h-2 rounded-full bg-[#3182F6]"></span>
                        <span className="text-xs font-bold text-slate-700">실시간 접수중!</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 실시간 인기 대회 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              {/* 아이콘 배경: 블루 */}
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Flame size={24} className="text-[#3182F6] fill-[#3182F6]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">실시간 인기 대회</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  지금 가장 많은 사람들이 보고 있는 대회입니다.
                </p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/tournaments')}
              className="hidden md:flex items-center gap-1 text-sm font-bold text-slate-500 hover:text-black transition-colors group"
            >
              더 보기 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[400px] bg-slate-50 rounded-3xl animate-pulse"></div>
                ))
              : hotTournaments.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => router.push(`/tournaments/${t.id}`)}
                    className="group relative bg-white rounded-3xl border border-slate-200 p-3 hover:border-black transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col"
                  >
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4 bg-slate-100">
                      {t.poster_url ? (
                        <img
                          src={t.poster_url}
                          alt={t.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center">
                             <span className="text-4xl opacity-20 grayscale">🎾</span>
                         </div>
                      )}
                      
                      <div className="absolute top-3 left-3 z-10">
                         {/* 접수 상태 뱃지: 접수중일 때 토스 블루 사용 */}
                         <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-md backdrop-blur-md
                           ${t.status === '접수중' ? 'bg-[#3182F6]/90 text-white' : 
                             t.status === '마감' ? 'bg-slate-800/80 text-white' : 'bg-red-600/90 text-white'}`}>
                           {t.status === '접수중' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                           {t.status}
                         </span>
                      </div>

                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] text-white font-bold">
                        <Eye size={10} /> {t.view_count?.toLocaleString() || 0}
                      </div>
                    </div>

                    <div className="px-2 pb-2 flex flex-col flex-1">
                      <div className="flex gap-1.5 mb-2">
                        <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded font-bold border border-slate-100">
                          {t.organization}
                        </span>
                        <span className="text-[10px] text-[#3182F6] bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-100">
                          {t.division}
                        </span>
                      </div>
                      {/* 타이틀 호버: 블루 */}
                      <h3 className="font-bold text-lg leading-snug mb-3 line-clamp-2 group-hover:text-[#3182F6] transition-colors break-keep">
                        {t.title}
                      </h3>
                      <div className="mt-auto flex items-center gap-3 text-xs text-slate-500 font-medium border-t border-slate-50 pt-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" /> {t.start_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />{' '}
                          {t.location.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
           <button 
              onClick={() => router.push('/tournaments')}
              className="md:hidden w-full mt-8 flex items-center justify-center gap-1 text-sm font-bold text-slate-500 bg-slate-50 border border-slate-100 py-4 rounded-2xl hover:bg-slate-100 transition-colors"
            >
              대회 전체보기 <ArrowRight size={16}/>
            </button>
        </div>
      </section>

      {/* 4. 카테고리 섹션 */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-12">
             {/* 강조 텍스트: 블루 */}
             <h2 className="text-3xl font-black mb-3">원하는 대회를 <span className="text-[#3182F6]">빠르게</span></h2>
             <p className="text-slate-500 font-medium">참가 목적에 맞는 대회를 카테고리별로 모아보세요.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <CategoryCard
              icon={<Star size={28} className="text-[#3182F6] fill-[#3182F6]" />}
              title="랭킹 포인트 대회"
              desc="KATO, KATA 등 공식 랭킹 포인트를 획득할 수 있는 권위 있는 대회"
              color="bg-blue-100/50 border-blue-200"
              onClick={() => router.push('/tournaments?type=ranking')}
            />
            <CategoryCard
              icon={<Users size={28} className="text-green-600 fill-green-600" />}
              title="동호회/비랭킹"
              desc="부담 없이 즐겁게 참가할 수 있는 친선 위주의 로컬 및 이벤트 대회"
              color="bg-green-100/50 border-green-200"
              onClick={() => router.push('/tournaments?type=non-ranking')}
            />
            <CategoryCard
              icon={<Calendar size={28} className="text-purple-600 fill-purple-600" />}
              title="이번 주말 대회"
              desc="지금 바로 신청 가능한 가장 빠른 일정의 대회 리스트를 확인하세요"
              color="bg-purple-100/50 border-purple-200"
              onClick={() => router.push('/tournaments')}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ icon, title, desc, color, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className={`p-8 rounded-[2rem] bg-white border-2 border-transparent hover:${color} cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden h-full`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity ${color.replace('border-', 'bg-').replace('/50', '')} z-0`}></div>
      
      <div className="relative z-10 h-full flex flex-col">
        <div
          className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}
        >
          {icon}
        </div>
        <h3 className="text-2xl font-black mb-3">{title}</h3>
        <p className="text-slate-500 text-base leading-relaxed break-keep flex-1 font-medium">
          {desc}
        </p>
        <div className="mt-6 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
            <ArrowRight size={24} className="text-slate-900"/>
        </div>
      </div>
    </div>
  );
}