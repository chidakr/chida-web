'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Trophy, ExternalLink, Clock } from 'lucide-react';
import type { Tournament } from '@/types';
import { BookmarkButton } from './index';
import { parseLocation } from '@/lib/utils';

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

  const { region, detail } = parseLocation(tournament.location, tournament.location_detail);

  const isRecruiting = tournament.status === 'recruiting';
  const isUpcoming = tournament.status === 'upcoming';
  const isClosed = !isRecruiting && !isUpcoming;

  const isUrgent =
    dDay === '오늘마감' ||
    (typeof dDay === 'string' && dDay.startsWith('D-') && parseInt(dDay.split('-')[1]) <= 3);

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-300 h-full">
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

        <div
          className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <BookmarkButton tournamentId={tournament.id} />
        </div>

        {/* 🔥 [UI FIX] 배지 디자인: 배경은 모두 화이트로 통일, 점(Dot) 색상으로 구분 */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          
          {/* 1. 접수중: 녹색 점 */}
          {isRecruiting && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border border-slate-100 shadow-sm backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
              <span className="text-xs font-bold text-slate-800 tracking-tight">접수중</span>
            </div>
          )}

          {/* 2. 준비중: 주황 점 (배경색 제거 -> 깔끔함 UP) */}
          {isUpcoming && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border border-slate-100 shadow-sm backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span className="text-xs font-bold text-slate-800 tracking-tight">대회준비중</span>
            </div>
          )}

          {/* 3. 마감: 회색 점 */}
          {isClosed && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border border-slate-100 shadow-sm backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span className="text-xs font-medium text-slate-500 tracking-tight">마감</span>
            </div>
          )}

          {/* D-Day 뱃지 */}
          {isRecruiting && dDay && (
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm flex items-center bg-white/95 border ${isUrgent ? 'border-red-100 text-red-600' : 'border-blue-100 text-blue-600'}`}>
              {dDay}
            </div>
          )}
        </div>
      </Link>

      <Link href={`/tournaments/${tournament.id}`} className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            {tournament.level || '오픈부'}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors break-keep">
          {tournament.title}
        </h3>

        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 text-sm">{region}</div>
            {detail && (
              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{detail}</div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar size={14} className="text-slate-400" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            {tournament.fee && Number(tournament.fee) > 0 ? (
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs text-gray-500">참가비</span>
                <span className="text-lg font-extrabold text-gray-900 ml-1">
                  {Number(tournament.fee).toLocaleString()}
                </span>
                <span className="text-xs text-gray-500">원</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs text-gray-500">참가비</span>
                <span className="text-base font-bold text-gray-900 ml-1">문의</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}