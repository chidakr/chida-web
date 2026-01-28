'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Trophy, ExternalLink, Clock } from 'lucide-react';
import type { Tournament } from '@/types';
import { BookmarkButton } from './index';

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  if (!tournament) return null;

  const getDday = (dateString: string) => {
    const today = new Date();
    const target = new Date(dateString);
    const diff = target.getTime() - today.getTime();
    const dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (dDay < 0) return '종료';
    if (dDay === 0) return '오늘마감';
    return `D-${dDay}`;
  };

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

  const isUrgent =
    dDay === '오늘마감' ||
    (typeof dDay === 'string' && dDay.startsWith('D-') && parseInt(dDay.split('-')[1]) <= 3);

  const dDayBadgeStyle = isUrgent
    ? 'bg-yellow-100 text-red-600 border border-yellow-200 font-extrabold'
    : 'bg-slate-50 text-slate-500 border border-slate-100 font-bold';

  const statusBadgeStyle =
    tournament.status === 'recruiting'
      ? 'bg-white/90 text-blue-600 backdrop-blur-md'
      : 'bg-slate-200/90 text-slate-500 backdrop-blur-md';

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-md transition-all duration-300 h-full">
      {/* 이미지 영역 - 컴팩트 */}
      <Link href={`/tournaments/${tournament.id}`} className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
        {tournament.image_url ? (
          <Image
            src={tournament.image_url}
            alt={tournament.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            unoptimized={tournament.image_url.includes('supabase.co')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
            <Trophy size={32} className="opacity-30" />
          </div>
        )}

        {/* 북마크 버튼 오버레이 - 우측 상단 */}
        <div className="absolute top-2 right-2 z-10" onClick={(e) => e.preventDefault()}>
          <BookmarkButton tournamentId={tournament.id} />
        </div>

        {/* 상태 뱃지 - 좌측 상단 */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${statusBadgeStyle}`}>
            {tournament.status === 'recruiting' ? '모집중' : '마감'}
          </span>
        </div>

        {/* D-Day 뱃지 */}
        {tournament.status === 'recruiting' && (
          <div className="absolute bottom-2 left-2">
            <span className={`px-2 py-0.5 text-[10px] rounded flex items-center gap-1 ${dDayBadgeStyle}`}>
              {isUrgent && <Clock size={9} />}
              {dDay}
            </span>
          </div>
        )}
      </Link>

      {/* 텍스트 영역 - 컴팩트 */}
      <Link href={`/tournaments/${tournament.id}`} className="p-4 flex flex-col flex-1">
        {/* 레벨 태그 */}
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mb-2">
          {tournament.level || '오픈부'}
        </span>

        {/* 제목 - 2줄 고정 */}
        <h3 className="font-bold text-slate-900 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
          {tournament.title}
        </h3>

        {/* 장소 */}
        <div className="flex items-center gap-1 mb-3">
          <MapPin size={12} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 line-clamp-1">
            {tournament.location || '장소 미정'}
          </span>
        </div>

        {/* 하단 정보 */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar size={11} />
              {formattedDate}
            </div>
            <div className="font-bold text-slate-900">{formattedFee}</div>
          </div>
        </div>
      </Link>
    </div>
  );
}
