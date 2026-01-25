'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/src/utils/supabase/client';
import { ChevronLeft, Calendar, MapPin, Users, Trophy, DollarSign, Copy, Share2, Heart, Info } from 'lucide-react';
import ApplyButton from '@/src/components/layout/tournaments/ApplyButton';

// 대회 데이터 타입
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
  status: string;
  image_url?: string;
  site_url?: string; // 👈 이거 추가!
};

export default function TournamentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
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
        alert('대회 정보를 불러올 수 없습니다.');
        router.push('/tournaments');
      } else {
        setTournament(data);
      }
      setLoading(false);
    }
    fetchTournament();
  }, [id, router, supabase]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('3333-00-123456');
    alert('계좌번호가 복사되었습니다!');
  };

  if (loading) return <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">로딩중...</div>;
  if (!tournament) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20 pt-20">
      
      {/* 배경 데코레이션 (테니스 공) */}
      <div className="fixed top-20 right-[-5%] w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-[-5%] w-48 h-48 bg-blue-300/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-5">
        
        {/* 뒤로가기 버튼 */}
        <Link href="/tournaments" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-bold mb-6 transition-colors">
            <ChevronLeft size={20}/> 뒤로가기
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* 왼쪽: 포스터 이미지 영역 (5칸 차지) */}
            <div className="lg:col-span-5">
                <div className="relative aspect-[3/4] bg-white rounded-3xl shadow-sm border border-white overflow-hidden group">
                    {/* 상태 뱃지 */}
                    <div className="absolute top-5 left-5 z-10">
                        <span className="px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-full shadow-lg">
                            {tournament.status === 'recruiting' ? '모집중' : '마감임박'}
                        </span>
                    </div>

                    {/* 이미지 */}
                    {tournament.image_url ? (
                        <Image
                            src={tournament.image_url}
                            alt={tournament.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                            <Trophy size={48} className="mb-2 opacity-50"/>
                            <span className="font-bold">이미지 없음</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 오른쪽: 정보 및 신청 영역 (7칸 차지) */}
            <div className="lg:col-span-7 flex flex-col">
                
                {/* 제목 */}
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-tight">
                    {tournament.title}
                </h1>

                {/* 정보 그리드 (2x2) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <InfoBox 
                        icon={<Calendar className="text-[#3182F6]"/>} 
                        label="대회 일시" 
                        value={`${tournament.date} ${tournament.time || ''}`} 
                    />
                    <InfoBox 
                        icon={<MapPin className="text-[#3182F6]"/>} 
                        label="대회 장소" 
                        value={tournament.location} 
                    />
                    <InfoBox 
                        icon={<DollarSign className="text-[#3182F6]"/>} 
                        label="참가 비용" 
                        value={`팀당 ${tournament.fee.toLocaleString()}원`} 
                    />
                    <InfoBox 
                        icon={<Users className="text-[#3182F6]"/>} 
                        label="모집 정원" 
                        value={`선착순 ${tournament.max_participants}팀`} 
                    />
                </div>

                {/* 계좌 정보 박스 */}
                <div className="bg-slate-100/50 p-5 rounded-2xl flex items-center justify-between mb-8 border border-slate-100">
                    <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">입금 계좌</p>
                        <p className="font-bold text-slate-700 text-sm md:text-base">
                            카카오뱅크 3333-00-123456 <span className="text-slate-400 font-medium">(홍길동)</span>
                        </p>
                    </div>
                    <button 
                        onClick={handleCopyAccount}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Copy size={12}/> 복사
                    </button>
                </div>

                {/* 버튼 액션 영역 (신청하기 + 공유 + 찜) */}
                <div className="flex items-stretch gap-3 mt-auto">
                    <div className="flex-1">
                        {/* 👇 우리가 만든 신청 버튼 (기능은 그대로, 디자인은 여기서 CSS로 제어됨) */}
                        <ApplyButton tournamentId={id} url={tournament.site_url} />
                    </div>
                    
                    <button className="w-14 h-14 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-colors">
                        <Share2 size={20}/>
                    </button>
                    <button className="w-14 h-14 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                        <Heart size={20}/>
                    </button>
                </div>

            </div>
        </div>

        {/* 하단: 상세 모집 요강 */}
        <div className="mt-20">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Info size={20} className="text-[#3182F6]"/> 상세 모집 요강
            </h3>
            
            {tournament.description ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {tournament.description}
                </div>
            ) : (
                <div className="bg-slate-50 p-10 rounded-3xl border border-slate-100 text-center">
                    <p className="text-slate-500 text-sm mb-1">등록된 상세 요강이 없습니다.</p>
                    <p className="text-slate-400 text-xs">주최측 공지사항을 확인해주세요.</p>
                </div>
            )}
            
            {/* 하단 안내 문구 */}
            <div className="mt-6 p-4 bg-blue-50/50 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>📢 본 정보는 주최측 사정에 의해 변경될 수 있습니다.</span>
            </div>
        </div>

      </div>
    </div>
  );
}

// 정보 박스 컴포넌트 (스크린샷과 동일한 디자인)
function InfoBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-blue-100 hover:shadow-md transition-all flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
                <p className="text-slate-900 font-bold">{value}</p>
            </div>
        </div>
    );
}