'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // 카드 클릭 시 이동을 위해 추가
import { MapPin, Calendar } from 'lucide-react';

// DB 데이터 타입 정의 (실제 테이블 컬럼명과 일치시킴)
interface TournamentProps {
  id: string;
  title: string;
  organizer: string; // 주최 (예: 윌슨)
  date: string;      // 날짜
  location: string;  // 장소
  level: string;     // 모집 레벨 (예: 개나리부)
  status: string;    // 상태 (접수중, 마감 등)
  fee: string;
  image_url: string; // 이미지 주소
}

export default function TournamentCard({ data }: { data: TournamentProps }) {
  const router = useRouter();

  // 상태(Status)에 따른 뱃지 색상 결정
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case '접수중': return 'bg-[#3182F6]/90 text-white';
      case '마감임박': return 'bg-red-500/90 text-white';
      case '마감': return 'bg-slate-800/80 text-white';
      case '접수예정': return 'bg-slate-500/80 text-white';
      default: return 'bg-slate-800/80 text-white';
    }
  };

  return (
    <div 
      onClick={() => router.push(`/tournaments/${data.id}`)}
      className="bg-white rounded-[1.5rem] p-3 border border-slate-100 hover:border-blue-100 cursor-pointer transition-all hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 flex flex-col h-full group"
    >
      {/* 1. 이미지 영역 */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden mb-4">
        {data.image_url ? (
          <img 
            src={data.image_url} 
            alt={data.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
            <span className="text-4xl">🎾</span>
          </div>
        )}
        
        {/* 상태 뱃지 (좌측 상단) */}
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold shadow-sm backdrop-blur-md ${getStatusBadgeStyle(data.status)}`}>
            {data.status}
          </span>
        </div>
      </div>

      {/* 2. 텍스트 영역 */}
      <div className="px-2 pb-2 flex flex-col flex-1">
        {/* 태그 (주최, 레벨) */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
           <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md font-semibold truncate max-w-[100px]">
             {data.organizer}
           </span>
           <span className="text-[10px] text-[#3182F6] bg-blue-50 px-2 py-1 rounded-md font-semibold truncate max-w-[120px]">
             {data.level}
           </span>
        </div>

        {/* 대회명 */}
        <h3 className="font-semibold text-slate-900 text-lg leading-snug mb-3 line-clamp-2 group-hover:text-[#3182F6] transition-colors break-keep">
          {data.title}
        </h3>

        {/* 하단 정보 (날짜, 장소) */}
        <div className="mt-auto pt-3 border-t border-slate-50 space-y-2">
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <Calendar size={13} className="mr-2 text-slate-400"/> 
            {data.date}
          </div>
          <div className="flex items-center text-xs text-slate-500 font-medium">
            <MapPin size={13} className="mr-2 text-slate-400"/> 
            {data.location}
          </div>
        </div>
      </div>
    </div>
  );
}