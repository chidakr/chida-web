'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, MapPin, Users, Share2, Heart, Copy, CheckCircle2, ChevronLeft, Info, Trophy
} from 'lucide-react';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setTournament(data);
        // 조회수 증가 로직
        await supabase.rpc('increment_view_count', { row_id: id });
      }
      setLoading(false);
    }
    fetchDetail();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3182F6]"></div></div>;
  if (!tournament) return <div className="min-h-screen flex items-center justify-center font-semibold text-slate-500">대회 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-white pb-32 font-sans text-slate-900">
      
      {/* 1. 상단 히어로 섹션 (3D 배경 적용) */}
      <section className="relative pt-24 pb-12 lg:pt-36 overflow-hidden bg-gradient-to-b from-blue-50/60 to-white">
        
        {/* 🔥 3D 오브젝트 배경 (메인과 통일감) */}
        <div className="absolute inset-0 pointer-events-none">
            {/* 우측 상단 큰 공 */}
            <div className="absolute top-10 right-[-5%] md:right-[10%] opacity-80 animate-float-slow">
                <CssTennisBall size={150} />
            </div>
            {/* 좌측 하단 작은 공 */}
            <div className="absolute bottom-10 left-[-5%] md:left-[5%] opacity-60 animate-float-medium delay-500">
                <CssTennisBall size={80} />
            </div>
            {/* 배경 블러 효과 */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5">
            {/* 뒤로가기 버튼 */}
            <button 
                onClick={() => router.back()} 
                className="group flex items-center gap-1 text-slate-500 font-semibold mb-6 hover:text-[#3182F6] transition-colors"
            >
                <div className="p-1 rounded-full group-hover:bg-blue-50 transition-colors">
                    <ChevronLeft size={20}/>
                </div>
                뒤로가기
            </button>

            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                
                {/* 왼쪽: 포스터 이미지 (Glassmorphism & Shadow) */}
                <div className="w-full md:w-[420px] flex-shrink-0 relative group perspective-1000">
                    <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-white shadow-2xl shadow-blue-900/10 border-4 border-white transform transition-transform duration-500 hover:rotate-y-2 hover:scale-[1.02]">
                        {tournament.poster_url ? (
                            <img src={tournament.poster_url} alt={tournament.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                                <Trophy size={64} className="mb-4 opacity-50"/>
                                <span className="font-semibold">이미지 없음</span>
                            </div>
                        )}
                        
                        {/* 상태 뱃지 */}
                        <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-md text-white ring-1 ring-white/30
                            ${tournament.status === '접수중' ? 'bg-[#3182F6]/90' : 'bg-slate-800/80'}`}>
                            {tournament.status}
                            </span>
                        </div>
                    </div>
                    
                    {/* 장식용 뒷배경 (Depth감) */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-purple-50 rounded-[2.5rem] -z-10 opacity-60 blur-xl group-hover:opacity-80 transition-opacity"></div>
                </div>

                {/* 오른쪽: 상세 정보 */}
                <div className="flex-1 w-full py-2">
                    {/* 태그 */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-white border border-slate-100 text-slate-500 text-xs font-semibold shadow-sm">{tournament.organization}</span>
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-[#3182F6] border border-blue-100 text-xs font-semibold">{tournament.division}</span>
                    </div>
                    
                    {/* 타이틀: Font-Semibold 적용 */}
                    <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6 leading-tight break-keep">
                        {tournament.title}
                    </h1>

                    {/* 정보 그리드 (깔끔한 박스 스타일) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <InfoBox icon={<Calendar size={20} className="text-[#3182F6]"/>} label="대회 일시" value={tournament.start_date} />
                        <InfoBox icon={<MapPin size={20} className="text-[#3182F6]"/>} label="대회 장소" value={tournament.location} />
                        <InfoBox icon={<Users size={20} className="text-[#3182F6]"/>} label="참가 비용" value="팀당 60,000원 (예시)" />
                        <InfoBox icon={<Info size={20} className="text-[#3182F6]"/>} label="모집 정원" value="선착순 120팀" />
                    </div>

                    {/* 계좌 정보 박스 */}
                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex items-center justify-between mb-8 hover:border-blue-200 transition-colors cursor-pointer group" onClick={() => alert('복사됨')}>
                        <div>
                            <p className="text-xs font-semibold text-slate-400 mb-1">입금 계좌</p>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-700 group-hover:text-[#3182F6] transition-colors">카카오뱅크 3333-00-123456</p>
                                <span className="text-xs text-slate-400">(홍길동)</span>
                            </div>
                        </div>
                        <button className="text-xs font-semibold bg-white border border-slate-200 px-3 py-2 rounded-lg group-hover:bg-blue-50 group-hover:text-[#3182F6] group-hover:border-blue-100 transition-all flex items-center gap-1">
                            <Copy size={14}/> <span className="hidden sm:inline">복사</span>
                        </button>
                    </div>

                    {/* PC 액션 버튼 */}
                    <div className="hidden md:flex gap-3">
                        <button className="flex-1 bg-[#3182F6] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                            대회 신청하러 가기
                        </button>
                        <button className="px-6 py-4 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 hover:text-slate-900">
                            <Share2 size={22} />
                        </button>
                        <button className="px-6 py-4 rounded-2xl border border-slate-200 hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all text-slate-400">
                            <Heart size={22} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 2. 상세 요강 섹션 */}
      <section className="max-w-7xl mx-auto px-5 mt-8">
        <div className="border-t border-slate-100 pt-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-[#3182F6]"/> 상세 모집 요강
          </h2>
          <div className="bg-slate-50 rounded-[2rem] p-8 md:p-12 min-h-[300px] text-slate-600 leading-relaxed whitespace-pre-line border border-slate-100">
            {tournament.description || "등록된 상세 요강이 없습니다.\n주최측 공지사항을 확인해주세요."}
            <br/><br/>
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm text-slate-500 text-center">
                📢 본 정보는 주최측 사정에 의해 변경될 수 있습니다.
            </div>
          </div>
        </div>
      </section>

      {/* 3. 모바일 하단 고정 바 (Sticky Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4 pb-8 z-40 flex gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button className="p-4 rounded-2xl border border-slate-200 bg-white text-slate-400 hover:text-red-500 transition-colors">
           <Heart size={24} />
        </button>
        <button className="flex-1 bg-[#3182F6] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
          신청하기
        </button>
      </div>

    </div>
  );
}

// 🎾 재사용 가능한 3D 테니스 공 컴포넌트
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

// 정보 박스 컴포넌트 (디자인 개선)
function InfoBox({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 bg-blue-50 rounded-xl text-[#3182F6]">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-slate-400 mb-0.5">{label}</p>
        <p className="text-base font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}