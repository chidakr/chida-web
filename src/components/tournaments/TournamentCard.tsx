'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Trophy, ExternalLink, Clock } from 'lucide-react';
import type { Tournament } from '@/types';

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
    <Link
      href={`/tournaments/${tournament.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 h-full"
    >
      <div className="relative aspect-[3/2] bg-slate-50 overflow-hidden">
        {tournament.image_url ? (
          <Image
            src={tournament.image_url}
            alt={tournament.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              // 이미지 로드 실패 시 fallback
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
            unoptimized={tournament.image_url.includes('supabase.co')}
          />
        ) : null}
        {(!tournament.image_url || tournament.image_url === '') && (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
            <Trophy size={36} className="mb-2 opacity-30" />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-sm ${statusBadgeStyle}`}
          >
            {tournament.status === 'recruiting' ? '접수중' : '마감'}
          </span>
        </div>

        {tournament.status === 'recruiting' && (
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 text-[11px] rounded-lg shadow-sm flex items-center gap-1 ${dDayBadgeStyle}`}
            >
              {isUrgent && <Clock size={10} className="text-red-500" />}
              {dDay}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
            {tournament.level || '오픈부'}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-[17px] leading-snug mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors tracking-tight">
          {tournament.title}
        </h3>

        <div className="flex items-start gap-1.5 mb-4 min-h-[20px]">
          <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <span className="text-sm text-slate-600 font-medium line-clamp-1">
            {tournament.location || '장소 미정'}
          </span>
        </div>

        <div className="mt-auto space-y-3">
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
                />
              </div>
            </div>
          )}
          {isExternal && (
            <div className="flex items-center gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 text-slate-500">
              <ExternalLink size={12} className="text-slate-400" />
              <span className="text-[11px] font-bold">주최측 사이트에서 접수</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar size={13} className="text-slate-400" />
              {formattedDate}
            </div>
            <div className="font-black text-slate-900 text-sm">{formattedFee}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
