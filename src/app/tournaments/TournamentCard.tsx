'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Trophy, ExternalLink, Clock } from 'lucide-react';

export default function TournamentCard({ tournament }: { tournament: any }) {
  if (!tournament) return null;

  // 1. D-Day 계산
  const getDday = (dateString: string) => {
    const today = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - today.getTime();
    const dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (dDay < 0) return '종료';
    if (dDay === 0) return '오늘마감';
    return `D-${dDay}`;
  };

  // 2. 날짜 포맷팅: 03/01(일) 형식
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${mm}/${dd}(${dayOfWeek})`;
  };

  const dDay = getDday(tournament.date);
  const formattedDate = formatDate(tournament.date);
  
  const formattedFee = tournament.fee 
    ? `${Number(tournament.fee).toLocaleString()}원` 
    : '무료';
  
  const isExternal = !!tournament.site_url;
  const current = tournament.current_participants || 0;
  const max = tournament.max_participants || 32;
  const percent = Math.min((current / max) * 100, 100);

  // ✨ 배지 스타일 결정 (레퍼런스 스타일 적용)
  // 긴급 여부 확인 (오늘 마감이거나 D-3 이내)
  const isUrgent = dDay === '오늘마감' || (typeof dDay === 'string' && dDay.startsWith('D-') && parseInt(dDay.split('-')[1]) <= 3);
  
  // 🔥 [핵심 수정] 옐로우 뱃지 스타일 적용
  // 레퍼런스처럼 '노란 배경 + 빨간 텍스트 + 시계 아이콘' 조합
  const dDayBadgeStyle = isUrgent
    ? 'bg-yellow-100 text-red-600 border border-yellow-200 font-extrabold' // 긴급: 노랑+빨강 (주목도 UP)
    : 'bg-slate-50 text-slate-500 border border-slate-100 font-bold';     // 평소: 차분한 회색

  // 상태 배지 (좌측 상단)
  const statusBadgeStyle = tournament.status === 'recruiting'
    ? 'bg-white/90 text-blue-600 backdrop-blur-md' // 접수중: 깔끔한 화이트+블루
    : 'bg-slate-200/90 text-slate-500 backdrop-blur-md'; // 마감: 회색

  return (
    <Link 
      href={`/tournaments/${tournament.id}`} 
      className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 h-full"
    >
      {/* 🖼️ 썸네일 영역 */}
      <div className="relative aspect-[3/2] bg-slate-50 overflow-hidden">
        {tournament.image_url ? (
          <Image 
            src={tournament.image_url} 
            alt={tournament.title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
            <Trophy size={36} className="mb-2 opacity-30"/>
          </div>
        )}
        
        {/* 상태 배지 (좌측 상단) */}
        <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-sm ${statusBadgeStyle}`}>
                {tournament.status === 'recruiting' ? '접수중' : '마감'}
            </span>
        </div>

        {/* 🔥 D-Day 배지 (우측 상단 - 옐로우 스타일) */}
        {tournament.status === 'recruiting' && (
             <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-[11px] rounded-lg shadow-sm flex items-center gap-1 ${dDayBadgeStyle}`}>
                    {/* 긴급할 때만 시계 아이콘 표시 */}
                    {isUrgent && <Clock size={10} className="text-red-500"/>}
                    {dDay}
                </span>
             </div>
        )}
      </div>
      
      {/* 📝 내용 영역 */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* 1. 레벨 배지 */}
        <div className="mb-2">
            <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                {tournament.level || '오픈부'}
            </span>
        </div>

        {/* 2. 제목 */}
        <h3 className="font-bold text-slate-900 text-[17px] leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors tracking-tight">
            {tournament.title}
        </h3>

        {/* 3. 위치 정보 📍 */}
        <div className="flex items-start gap-1.5 mb-4 min-h-[20px]">
            <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0"/>
            <span className="text-sm text-slate-600 font-medium line-clamp-1">
                {tournament.location || '장소 미정'}
            </span>
        </div>

        <div className="mt-auto space-y-3">
            {/* 모집 현황 (내부 대회만) */}
            {!isExternal && (
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>실시간 현황</span>
                        <span className="text-blue-500">{current}/{max}팀</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${percent}%` }}
                        ></div>
                    </div>
                </div>
            )}
            {isExternal && (
                 <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-500">
                    <ExternalLink size={12} className="text-slate-400"/>
                    <span className="text-[11px] font-bold">주최측 사이트에서 접수</span>
                </div>
            )}

            {/* 4. 날짜 & 가격 */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar size={13} className="text-slate-400"/>
                    {formattedDate}
                </div>
                <div className="font-black text-slate-900 text-sm">
                    {formattedFee}
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
}