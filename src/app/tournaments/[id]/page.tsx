'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, MapPin, Users, Share2, Heart, Copy, CheckCircle2, ChevronLeft, Info
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
        .single(); // 하나만 가져오기

      if (data) {
        setTournament(data);
        // 조회수 증가 로직 (옵션)
        await supabase.rpc('increment_view_count', { row_id: id });
      }
      setLoading(false);
    }
    fetchDetail();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3182F6]"></div></div>;
  if (!tournament) return <div className="min-h-screen flex items-center justify-center">대회 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-white pb-32"> {/* 하단 버튼 공간 확보 */}
      
      {/* 1. 상단 히어로 섹션 (포스터 & 핵심정보) */}
      <section className="relative pt-20 lg:pt-32 pb-10 px-5 max-w-7xl mx-auto">
        
        {/* 뒤로가기 (모바일용) */}
        <button onClick={() => router.back()} className="md:hidden flex items-center gap-1 text-slate-500 font-bold mb-4">
          <ChevronLeft size={20}/> 뒤로
        </button>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          
          {/* 왼쪽: 포스터 이미지 */}
          <div className="w-full md:w-[400px] flex-shrink-0">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-slate-100 shadow-2xl relative bg-slate-50">
               {tournament.poster_url ? (
                 <img src={tournament.poster_url} alt={tournament.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-300 text-6xl">🎾</div>
               )}
               {/* 상태 뱃지 */}
               <div className="absolute top-4 left-4">
                 <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-md backdrop-blur-md text-white
                   ${tournament.status === '접수중' ? 'bg-[#3182F6]/90' : 'bg-slate-800/80'}`}>
                   {tournament.status}
                 </span>
               </div>
            </div>
          </div>

          {/* 오른쪽: 상세 텍스트 정보 */}
          <div className="flex-1 w-full pt-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">{tournament.organization}</span>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#3182F6] text-xs font-bold">{tournament.division}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 leading-tight break-keep">
              {tournament.title}
            </h1>

            {/* 정보 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <InfoBox icon={<Calendar className="text-[#3182F6]"/>} label="대회 일시" value={tournament.start_date} />
              <InfoBox icon={<MapPin className="text-[#3182F6]"/>} label="대회 장소" value={tournament.location} />
              <InfoBox icon={<Users className="text-[#3182F6]"/>} label="참가 비용" value="팀당 60,000원 (예시)" />
              <InfoBox icon={<Info className="text-[#3182F6]"/>} label="모집 정원" value="선착순 120팀" />
            </div>

            {/* 주최측 계좌 정보 (복사 기능) */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1">입금 계좌</p>
                <p className="font-bold text-slate-900">카카오뱅크 3333-00-123456 (홍길동)</p>
              </div>
              <button 
                onClick={() => alert('계좌번호가 복사되었습니다!')}
                className="text-xs font-bold bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-1"
              >
                <Copy size={14}/> 복사
              </button>
            </div>

            {/* PC 버전 액션 버튼들 */}
            <div className="hidden md:flex gap-3">
              <button className="flex-1 bg-[#3182F6] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30">
                대회 신청하러 가기
              </button>
              <button className="px-6 py-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
                <Share2 size={20} className="text-slate-600"/>
              </button>
              <button className="px-6 py-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all group">
                <Heart size={20} className="text-slate-400 group-hover:text-red-500 transition-colors"/>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 상세 요강 및 지도 섹션 */}
      <section className="max-w-7xl mx-auto px-5 mt-10">
        <div className="border-t border-slate-100 pt-10">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <CheckCircle2 className="text-[#3182F6]"/> 상세 모집 요강
          </h2>
          <div className="bg-slate-50 rounded-3xl p-8 min-h-[300px] text-slate-600 leading-relaxed whitespace-pre-line">
            {/* 요강 내용이 없으면 기본 텍스트 */}
            {tournament.description || "등록된 상세 요강이 없습니다. 주최측 공지사항을 확인해주세요."}
            <br/><br/>
            (여기에 나중에 에디터로 작성한 긴 글이나 이미지가 들어갑니다.)
          </div>
        </div>
      </section>

      {/* 3. 모바일 하단 고정 바 (Sticky Bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-8 z-40 flex gap-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button className="p-3.5 rounded-xl border border-slate-200">
           <Heart size={20} className="text-slate-400"/>
        </button>
        <button className="flex-1 bg-[#3182F6] text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30">
          신청하기
        </button>
      </div>

    </div>
  );
}

// 정보 박스 컴포넌트
function InfoBox({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}