'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import type { Tournament } from '@/types';
import {
  ChevronLeft, Calendar, MapPin, Users, Share2, Bookmark,
  CheckCircle2, Clock, ExternalLink,
} from 'lucide-react';
import { ApplyButton, BookmarkButton } from '@/components/tournaments';

export default function TournamentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTournament() {
      if (!id) return;
      const { data, error } = await supabase.from('tournaments').select('*').eq('id', id).single();
      if (error) { router.push('/tournaments'); } 
      else { setTournament(data); }
      setLoading(false);
    }
    fetchTournament();
  }, [id, router, supabase]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${days[date.getDay()]})`;
  };

  // D-Day 계산
  const getDday = (dateString: string) => {
    const today = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - today.getTime();
    const dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dDay < 0 ? '종료' : (dDay === 0 ? '오늘마감' : `D-${dDay}`);
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center font-bold text-slate-300">Loading...</div>;
  if (!tournament) return null;

  const dDay = getDday(tournament.date);
  const isRecruiting = tournament.status === 'recruiting';

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-32 font-sans">
      
      {/* 1. 상단 네비게이션 (심플하게) */}
      <div className="border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-50">
          <div className="max-w-7xl mx-auto px-5 h-14 flex items-center">
            <Link href="/tournaments" className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors">
                <ChevronLeft size={18}/> 목록으로 돌아가기
            </Link>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 pt-10">
        <div className="flex flex-col lg:flex-row gap-12 relative">
            
            {/* ================================================= */}
            {/* [LEFT] 메인 콘텐츠 영역 (배너 + 상세설명) - 2/3 차지 */}
            {/* ================================================= */}
            <div className="flex-1 min-w-0">
                
                {/* 2. 대형 배너 이미지 */}
                <div className="relative w-full aspect-[21/9] bg-slate-100 rounded-3xl overflow-hidden mb-10 border border-slate-100">
                    {tournament.image_url && (
                        <Image src={tournament.image_url} alt={tournament.title} fill className="object-cover" priority />
                    )}
                    {/* 배너 위 뱃지 */}
                    <div className="absolute top-6 left-6 flex gap-2">
                         <span className="bg-yellow-400 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                            EVENT
                         </span>
                    </div>
                </div>

                {/* 3. 타이틀 섹션 */}
                <div className="mb-10 pb-8 border-b border-slate-100">
                    <p className="text-blue-600 font-bold text-sm mb-2">{tournament.level || '오픈부'} 클래스</p>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 break-keep">
                        {tournament.title}
                    </h1>
                    
                    {/* 태그 모음 */}
                    <div className="flex flex-wrap gap-2">
                        <Badge text={`${tournament.location.split(' ')[0]} 지역`} />
                        <Badge text="오프라인" />
                        <Badge text={isRecruiting ? '모집중' : '모집마감'} active={isRecruiting} />
                        {tournament.site_url && <Badge text="외부신청" type="outline" />}
                    </div>
                </div>

                {/* 4. 프로그램 요약 (아이콘 박스) */}
                <div className="bg-slate-50 rounded-2xl p-6 mb-12 border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">프로그램 요약</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SummaryItem icon={<Calendar size={18}/>} label="일정" value={`${formatDate(tournament.date)} ${tournament.time}`} />
                        <SummaryItem icon={<MapPin size={18}/>} label="장소" value={tournament.location} />
                        <SummaryItem icon={<Users size={18}/>} label="모집" value={`${tournament.max_participants}팀 선착순`} />
                        <SummaryItem icon={<ExternalLink size={18}/>} label="방식" value={tournament.site_url ? '외부 사이트 접수' : '치다 간편 접수'} />
                    </div>
                </div>

                {/* 5. 상세 내용 (Editor Content) */}
                <div className="prose prose-slate max-w-none prose-lg prose-headings:font-black prose-p:text-slate-600 prose-li:text-slate-600">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">상세 모집 요강</h3>
                    {tournament.description ? (
                        <div className="whitespace-pre-wrap leading-loose font-medium">
                            {tournament.description}
                        </div>
                    ) : (
                         <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-2xl">
                            상세 내용이 없습니다.
                        </div>
                    )}
                </div>

                {/* 하단 유의사항 박스 */}
                <div className="mt-16 p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="text-slate-400 shrink-0 mt-1" size={20}/>
                        <div className="text-sm text-slate-500 leading-relaxed">
                            <strong className="block text-slate-700 mb-1">신청 시 유의사항</strong>
                            본 대회는 주최측의 사정에 따라 일정이 변경될 수 있습니다. <br/>
                            치다는 정보 중개자로서, 결제 및 환불에 대한 책임은 주최측에 있습니다.
                        </div>
                    </div>
                </div>
            </div>


            {/* ================================================= */}
            {/* [RIGHT] 스티키 사이드바 (핵심!) - 1/3 차지 */}
            {/* ================================================= */}
            <div className="lg:w-[380px] shrink-0 hidden lg:block">
                <div className="sticky top-24">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6">
                        
                        {/* Eyebrow */}
                        <div className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                            Summary
                        </div>

                        {/* 제목 (짧게) */}
                        <h2 className="text-xl font-bold text-slate-900 leading-snug mb-6 line-clamp-2">
                            {tournament.title}
                        </h2>

                        {/* 메인 액션 버튼 */}
                        <div className="mb-6">
                            {tournament.site_url ? (
                                <Link 
                                    href={tournament.site_url} 
                                    target="_blank"
                                    className="w-full h-14 bg-[#5C3AFF] hover:bg-[#4a2ee0] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 hover:-translate-y-0.5"
                                >
                                    신청페이지 바로가기
                                </Link>
                            ) : (
                                <button 
                                    disabled={!isRecruiting}
                                    className={`w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg 
                                        ${isRecruiting 
                                            ? 'bg-[#5C3AFF] hover:bg-[#4a2ee0] text-white shadow-indigo-100 hover:-translate-y-0.5' 
                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    {isRecruiting ? '참가 신청하기' : '마감되었습니다'}
                                </button>
                            )}
                        </div>

                        {/* 서브 버튼들 (북마크, 공유) */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <BookmarkButton tournamentId={tournament.id} variant="outline" />
                            <button className="h-11 flex items-center justify-center gap-2 border border-slate-200 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                <Share2 size={16}/> 공유하기
                            </button>
                        </div>

                        {/* 정보 리스트 (DL/DT/DD 구조) */}
                        <div className="space-y-4 border-t border-slate-100 pt-6">
                            <InfoRow label="모집마감" value={dDay} isHighlight={dDay !== '종료'} />
                            <InfoRow label="대회일정" value={formatDate(tournament.date)} />
                            <InfoRow label="대회장소" value={tournament.location.split(' ')[0] + ' (오프라인)'} />
                            <InfoRow label="참가비용" value={`${Number(tournament.fee ?? 0).toLocaleString()}원`} />
                        </div>

                        {/* 하단 프로모션 박스 (레퍼런스 느낌) */}
                        <div className="mt-8 bg-blue-50/50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-600 text-xs font-black bg-blue-100 px-1.5 py-0.5 rounded">EVENT</span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                🎾 대회 참가하고 후기를 남기면<br/>
                                <span className="text-slate-900 font-bold">1,000 포인트</span>를 드려요!
                            </p>
                        </div>

                    </div>
                </div>
            </div>

        </div>

        {/* 모바일 하단 고정 버튼 (모바일에서만 보임) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-50 safe-area-bottom">
             {tournament.site_url ? (
                <Link href={tournament.site_url} target="_blank" className="block w-full h-14 bg-[#5C3AFF] text-white rounded-xl font-bold text-lg flex items-center justify-center">
                    신청페이지 바로가기
                </Link>
            ) : (
                <button disabled={!isRecruiting} className={`w-full h-14 rounded-xl font-bold text-lg ${isRecruiting ? 'bg-[#5C3AFF] text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {isRecruiting ? '참가 신청하기' : '마감'}
                </button>
            )}
        </div>

      </div>
    </div>
  );
}

// ✨ 컴포넌트: 요약 아이템
function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm shrink-0">
                {icon}
            </div>
            <div>
                <span className="block text-xs font-bold text-slate-400 mb-0.5">{label}</span>
                <span className="block text-sm font-bold text-slate-800">{value}</span>
            </div>
        </div>
    )
}

// ✨ 컴포넌트: 뱃지
function Badge({ text, active, type = 'solid' }: any) {
    if (type === 'outline') {
        return <span className="border border-slate-200 text-slate-500 text-xs font-medium px-2.5 py-1.5 rounded-md bg-white">{text}</span>
    }
    return (
        <span className={`text-xs font-medium px-2.5 py-1.5 rounded-md ${
            active ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
        }`}>
            {text}
        </span>
    );
}

// ✨ 컴포넌트: 우측 사이드바 정보 행
function InfoRow({ label, value, isHighlight }: { label: string; value: string; isHighlight?: boolean }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">{label}</span>
            <span className={`font-bold ${isHighlight ? 'text-[#5C3AFF]' : 'text-slate-900'}`}>{value}</span>
        </div>
    )
}