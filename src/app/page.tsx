'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Search, Trophy, Calendar, Users, ChevronRight, Star, ArrowRight, Eye, MapPin, FireExtinguisher, Flame } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [hotTournaments, setHotTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 실시간 인기 대회 데이터 가져오기 (조회수 높은 순)
  useEffect(() => {
    async function fetchHotTournaments() {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('view_count', { ascending: false }) // 조회수 높은 순
        .limit(4); // 4개만 노출

      if (!error) setHotTournaments(data || []);
      setLoading(false);
    }
    fetchHotTournaments();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* 1. 글로벌 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16">
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-black tracking-tighter cursor-pointer flex items-center gap-1" onClick={() => router.push('/')}>
              <span className="text-black">치다</span>
              <span className="w-2 h-2 rounded-full bg-red-500 mt-3"></span>
            </div>
            <nav className="hidden md:flex gap-8 text-sm font-bold text-slate-500">
              <button onClick={() => router.push('/tournaments')} className="hover:text-black transition-colors">대회 리스트</button>
              <button className="hover:text-black transition-colors">랭킹</button>
              <button className="hover:text-black transition-colors">커뮤니티</button>
            </nav>
          </div>
          <button className="text-xs font-bold bg-black text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all">
            로그인
          </button>
        </div>
      </header>

      {/* 2. 메인 히어로 섹션 */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-slate-50 to-white -z-10"></div>
        <div className="max-w-7xl mx-auto px-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
              <span className="text-xs font-bold text-slate-600">지금 가장 핫한 테니스 플랫폼</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-8 tracking-tight">
              테니스 대회의 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                모든 순간
              </span>
              을 함께.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 leading-relaxed break-keep">
              전국 랭킹 대회부터 동네 비랭킹 대회까지, <br />
              치다에서 한 번에 찾고 간편하게 신청하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => router.push('/tournaments')}
                className="group flex items-center justify-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-black/10"
              >
                대회 찾기 <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </button>
              <button className="flex items-center justify-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                <Trophy size={20} className="text-yellow-500"/> 랭킹 대회 보기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 실시간 인기 대회 섹션 (NEW!) */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-red-50 rounded-lg">
              <Flame size={24} className="text-red-500 fill-red-500" />
            </div>
            <h2 className="text-2xl font-black">실시간 인기 대회</h2>
            <span className="ml-2 text-sm font-bold text-slate-400">조회수 급상승 중</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="h-64 bg-slate-50 rounded-3xl animate-pulse"></div>
              ))
            ) : (
              hotTournaments.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => router.push(`/tournaments/${t.id}`)}
                  className="group relative bg-white rounded-3xl border border-slate-100 p-2 hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                    <img 
                      src={t.poster_url || 'https://via.placeholder.com/400x300?text=Tennis'} 
                      alt={t.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] text-white font-bold">
                      <Eye size={10} /> {t.view_count || 0}
                    </div>
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-[10px] font-bold text-blue-600 mb-1">{t.organization} · {t.division}</p>
                    <h3 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">{t.title}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={12}/> {t.start_date}</span>
                      <span className="flex items-center gap-1"><MapPin size={12}/> {t.location.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 4. 카테고리 섹션 */}
      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-3xl font-black mb-10 text-center">원하는 대회를 빠르게</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryCard 
              icon={<Star className="text-blue-600"/>} 
              title="랭킹 포인트 대회" 
              desc="KATO, KATA 등 공식 랭킹 포인트를 획득할 수 있는 권위 있는 대회"
              color="bg-blue-50"
              onClick={() => router.push('/tournaments?type=ranking')}
            />
            <CategoryCard 
              icon={<Users className="text-green-600"/>} 
              title="동호회/비랭킹" 
              desc="부담 없이 즐겁게 참가할 수 있는 친선 위주의 로컬 대회"
              color="bg-green-50"
              onClick={() => router.push('/tournaments?type=non-ranking')}
            />
            <CategoryCard 
              icon={<Calendar className="text-purple-600"/>} 
              title="이번 주말 대회" 
              desc="지금 바로 신청 가능한 가장 빠른 일정의 대회 리스트"
              color="bg-purple-50"
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
    <div onClick={onClick} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-black cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-2 group">
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed break-keep">{desc}</p>
    </div>
  );
}