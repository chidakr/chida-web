'use client';

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Calendar, Trophy, ChevronLeft, Share2, Copy, ExternalLink, Loader2, Check, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TournamentDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Next.js 15: params 언랩핑
  const { id } = use(params);

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // 1. [NEW] 조회수 증가 로직 (페이지 들어오면 +1)
  useEffect(() => {
    if (id) {
      supabase.rpc('increment_view_count', { row_id: id }).then(({ error }) => {
        if (error) {
          console.error('조회수 증가 실패:', error);
          // SQL 함수가 아직 안 만들어졌을 수도 있으니, 에러 나도 조용히 넘어감
        }
      });
    }
  }, [id]);

  // 2. 데이터 불러오기
  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching detail:', error);
      } else {
        setTournament(data);
      }
      setLoading(false);
    }
    fetchDetail();
  }, [id]);

  // 계좌번호 복사
  const handleCopyAccount = (account: string) => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 신청하기 버튼 클릭 (외부 링크 이동)
  const handleApplyClick = () => {
    if (tournament.status === '마감') {
      alert('아쉽게도 접수가 마감된 대회입니다.');
      return;
    }
    
    if (tournament.registration_link) {
      window.open(tournament.registration_link, '_blank');
    } else {
      alert('현재 온라인 접수 링크가 등록되지 않았습니다.\n주최측 공지를 확인해주세요.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-slate-400 animate-spin"/>
    </div>
  );
  
  if (!tournament) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-lg font-bold mb-4 text-slate-500">대회 정보를 찾을 수 없습니다.</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">돌아가기</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col relative">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 h-14 flex items-center justify-between px-4 transition-all">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-base truncate px-4 opacity-0 md:opacity-100 transition-opacity">
          {tournament.title}
        </h1>
        <button className="p-2 -mr-2 hover:bg-slate-100 rounded-full transition-colors">
          <Share2 size={22} className="text-slate-600" />
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-1 w-full max-w-3xl mx-auto pb-32">
        
        {/* Poster Section */}
        <div className="w-full bg-slate-50 aspect-video md:aspect-[21/9] flex items-center justify-center relative overflow-hidden group">
          {tournament.poster_url ? (
            <img 
              src={tournament.poster_url} 
              alt="poster" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          ) : (
            <div className="flex flex-col items-center text-slate-300">
               <Trophy size={48} className="mb-2" />
               <span className="text-sm font-bold">이미지 준비중</span>
            </div>
          )}
          {/* 상태 뱃지 */}
          <div className="absolute top-5 left-5">
             <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg backdrop-blur-md
               ${tournament.status === '접수중' ? 'bg-blue-600/90 text-white' : 
                 tournament.status === '마감' ? 'bg-slate-800/80 text-white' : 'bg-red-600/90 text-white'}`}>
               {tournament.status}
             </span>
          </div>
        </div>

        {/* Title & Info Section */}
        <div className="px-5 pt-8 pb-4">
          
          {/* [NEW] 태그와 조회수를 한 줄에 배치 */}
          <div className="flex justify-between items-start mb-4">
             <div className="flex gap-2 flex-wrap">
               <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">
                 {tournament.organization}
               </span>
               <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">
                 {tournament.division}
               </span>
               <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200">
                 {tournament.court_type === 'Hard' ? '하드코트' : tournament.court_type === 'Clay' ? '클레이' : '인조잔디'}
               </span>
             </div>

             {/* 조회수 UI */}
             <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 select-none">
               <Eye size={14} />
               {tournament.view_count?.toLocaleString() || 0}
             </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-black leading-tight mb-2 break-keep text-slate-900">
            {tournament.title}
          </h2>
        </div>

        <div className="h-2 bg-slate-50 border-y border-slate-100"></div>

        {/* Details List */}
        <div className="px-5 py-8 space-y-8">
          
          {/* Date */}
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 text-slate-900">
              <Calendar size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Date</p>
              <p className="font-bold text-lg text-slate-900">{tournament.start_date}</p>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">경기 시작 시간은 주최측 공지 확인</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 text-slate-900">
              <MapPin size={22} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Location</p>
              <p className="font-bold text-lg text-slate-900">{tournament.location}</p>
              
              {tournament.parking_desc && (
                <div className="mt-3 bg-slate-50 p-3 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                  <span className="font-bold text-slate-800">🅿️ 주차/특이사항:</span><br/>
                  {tournament.parking_desc}
                </div>
              )}
            </div>
          </div>
          
          {/* Fee & Account */}
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 text-slate-900">
              <Copy size={22} />
            </div>
            <div className="w-full">
              <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Entry Fee</p>
              <p className="font-bold text-lg text-slate-900">
                {tournament.fee ? `${tournament.fee.toLocaleString()}원` : '무료'} 
                <span className="text-sm font-normal text-slate-400 ml-1">/ 팀</span>
              </p>
              
              <div 
                onClick={() => handleCopyAccount("우리은행 1002-123-456789")}
                className="mt-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 p-3 rounded-xl border border-slate-200 cursor-pointer transition-colors group select-none"
              >
                 <div className="text-sm font-medium text-slate-600">
                   <span className="block text-xs text-slate-400 mb-0.5">입금 계좌 (예시)</span>
                   우리은행 1002-123-456789
                 </div>
                 <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 text-xs font-bold text-slate-500 group-hover:text-black transition-colors">
                    {copied ? <Check size={12} className="text-green-600"/> : <Copy size={12}/>}
                    {copied ? '복사됨' : '복사'}
                 </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-slate-100 z-40 safe-area-bottom">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={handleApplyClick}
            disabled={tournament.status === '마감'}
            className={`w-full h-14 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]
              ${tournament.status === '마감' 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-black text-white hover:bg-slate-800'}`}
          >
             {tournament.status === '마감' ? (
               '접수가 마감되었습니다'
             ) : (
               <>
                 공식 접수처로 이동하기 <ExternalLink size={18} />
               </>
             )}
          </button>
        </div>
      </div>

    </div>
  );
}