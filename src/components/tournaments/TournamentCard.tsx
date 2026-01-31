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

  // 🔥 참가비 포맷: fee가 없거나 0이면 '문의' 표시
  const formattedFee = tournament.fee && Number(tournament.fee) > 0
    ? `${Number(tournament.fee).toLocaleString()}원`
    : '문의';

  const isExternal = !!tournament.site_url;
  const current = tournament.current_participants || 0;
  const max = tournament.max_participants || 32;
  const percent = Math.min((current / max) * 100, 100);

  const isUrgent =
    dDay === '오늘마감' ||
    (typeof dDay === 'string' && dDay.startsWith('D-') && parseInt(dDay.split('-')[1]) <= 3);

  const dDayBadgeStyle = isUrgent
    ? 'bg-gradient-to-r from-red-50 to-orange-50 text-red-600 border border-red-100'
    : 'bg-white/95 text-slate-600 border border-white/50 backdrop-blur-sm';

  const statusBadgeStyle =
    tournament.status === 'recruiting'
      ? 'bg-blue-500 text-white'
      : 'bg-slate-400 text-white';

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-300 h-full">
      {/* 이미지 영역 */}
      <Link href={`/tournaments/${tournament.id}`} className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {(tournament.thumbnail_url || tournament.image_url) ? (
          <Image
            src={tournament.thumbnail_url || tournament.image_url || ''}
            alt={tournament.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Trophy size={28} className="opacity-20" />
          </div>
        )}

        {/* 북마크 버튼 오버레이 - 우측 상단 */}
        <div 
          className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <BookmarkButton tournamentId={tournament.id} />
        </div>

        {/* 상태 뱃지 - 좌측 상단 */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full ${statusBadgeStyle} shadow-sm`}>
            {tournament.status === 'recruiting' ? '모집중' : '마감'}
          </span>
        </div>

        {/* D-Day 뱃지 */}
        {tournament.status === 'recruiting' && (
          <div className="absolute bottom-3 left-3">
            <span className={`px-2.5 py-1 text-[10px] rounded-full flex items-center gap-1 ${dDayBadgeStyle} shadow-sm font-semibold`}>
              {isUrgent && <Clock size={9} />}
              {dDay}
            </span>
          </div>
        )}
      </Link>

      {/* 텍스트 영역 */}
      <Link href={`/tournaments/${tournament.id}`} className="p-5 flex flex-col flex-1 gap-3">
        {/* 레벨 태그 */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {tournament.level || '오픈부'}
          </span>
        </div>

        {/* 제목 */}
        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {tournament.title}
        </h3>

        {/* 장소 */}
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate-400 shrink-0" />
          <span className="text-sm text-slate-600 line-clamp-1 font-medium">
            {tournament.location || '장소 미정'}
          </span>
        </div>

        {/* 하단 정보 */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar size={14} className="text-slate-400" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="text-base font-bold text-slate-900">{formattedFee}</div>
          </div>
        </div>
      </Link>
    </div>
  );
}