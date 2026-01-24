'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // params 대신 useParams 사용 (v15 호환성)
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/src/utils/supabase/client';
import { ChevronLeft, Calendar, MapPin, Users, Trophy, DollarSign, Clock } from 'lucide-react';
import ApplyButton from '@/src/components/layout/tournaments/ApplyButton';

// 대회 데이터 타입 정의
type Tournament = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  fee: number;
  current_participants: number;
  max_participants: number;
  description: string;
  status: string; // recruiting, closed, etc.
  image_url?: string;
};

export default function TournamentDetailPage() {
  const params = useParams();
  const id = params?.id as string; // URL에서 ID 추출
  const router = useRouter();
  const supabase = createClient();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTournament() {
      if (!id) return;

      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('대회 로딩 실패:', error);
        alert('대회 정보를 불러올 수 없습니다.');
        router.push('/tournaments');
      } else {
        setTournament(data);
      }
      setLoading(false);
    }

    fetchTournament();
  }, [id, router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-[#3182F6] rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 font-bold">코트 입장 중...</p>
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="min-h-screen bg-white pb-28 font-sans">
      
      {/* 1. 헤더 (뒤로가기) */}
      <header className="fixed top-0 left-0 right-0 z-20 p-4 flex items-center bg-gradient-to-b from-black/50 to-transparent">
        <Link href="/tournaments" className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors">
          <ChevronLeft size={24} />
        </Link>
      </header>

      {/* 2. 히어로 이미지 영역 */}
      <div className="relative w-full aspect-video md:aspect-[21/9] bg-slate-200">
        <Image
          src={tournament.image_url || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=2942&auto=format&fit=crop'}
          alt={tournament.title}
          fill
          className="object-cover"
          priority
        />
        {/* 상태 뱃지 */}
        <div className="absolute bottom-5 left-5 px-3 py-1 bg-[#3182F6] text-white text-xs font-bold rounded-full shadow-lg">
           {tournament.status === 'recruiting' ? '모집중 🔥' : '마감임박'}
        </div>
      </div>

      {/* 3. 대회 상세 정보 */}
      <main className="px-5 py-8 max-w-2xl mx-auto">
        
        {/* 제목 */}
        <h1 className="text-2xl font-black text-slate-900 mb-6 leading-tight">
          {tournament.title}
        </h1>

        {/* 정보 그리드 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <InfoBox 
                icon={<Calendar size={18} className="text-blue-500"/>}
                label="날짜"
                value={tournament.date}
            />
             <InfoBox 
                icon={<Clock size={18} className="text-purple-500"/>}
                label="시간"
                value={tournament.time || '09:00'}
            />
            <InfoBox 
                icon={<MapPin size={18} className="text-red-500"/>}
                label="장소"
                value={tournament.location}
            />
            <InfoBox 
                icon={<DollarSign size={18} className="text-green-500"/>}
                label="참가비"
                value={`${tournament.fee.toLocaleString()}원`}
            />
        </div>

        {/* 모집 현황 바 */}
        <div className="bg-slate-50 p-5 rounded-2xl mb-8 border border-slate-100">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-600 flex items-center gap-1">
                    <Users size={16}/> 현재 모집 현황
                </span>
                <span className="text-blue-600 font-black text-lg">
                    {tournament.current_participants} <span className="text-slate-400 text-sm font-medium">/ {tournament.max_participants}팀</span>
                </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-[#3182F6] rounded-full transition-all duration-1000"
                    style={{ width: `${(tournament.current_participants / tournament.max_participants) * 100}%` }}
                ></div>
            </div>
        </div>

        {/* 상세 요강 */}
        <div className="mb-10">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-500"/> 대회 요강
            </h3>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                {tournament.description || '상세 요강이 없습니다.'}
            </div>
        </div>

      </main>

      {/* 4. 하단 고정 신청 버튼 (ApplyButton 컴포넌트) */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/90 backdrop-blur-md border-t border-slate-100 z-50 safe-area-bottom">
        <div className="max-w-2xl mx-auto">
           {/* 👇 우리가 만든 신청 버튼이 여기서 작동합니다 */}
           <ApplyButton tournamentId={id} />
        </div>
      </div>

    </div>
  );
}

// 작은 정보 박스 컴포넌트
function InfoBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                {icon}
            </div>
            <div className="overflow-hidden">
                <p className="text-xs text-slate-400 font-bold mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
            </div>
        </div>
    );
}