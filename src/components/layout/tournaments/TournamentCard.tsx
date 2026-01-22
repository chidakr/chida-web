import Link from 'next/link';
import { MapPin, Calendar, Trophy } from 'lucide-react';

interface TournamentCardProps {
  data: any;
  isMainPage?: boolean; // 메인페이지용 스타일 적용 여부
}

export default function TournamentCard({ data: t, isMainPage = false }: TournamentCardProps) {
  // 날짜 포맷팅 (예: 2026.03.01)
  const formattedDate = t.date ? new Date(t.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\.$/, '') : '날짜 미정';

  // 상태별 뱃지 스타일
  const statusStyle = {
    '접수중': 'bg-blue-500 text-white shadow-blue-200',
    '마감임박': 'bg-red-500 text-white shadow-red-200 animate-pulse',
    '마감': 'bg-slate-600 text-white',
    '접수예정': 'bg-amber-500 text-white shadow-amber-200'
  }[t.status] || 'bg-slate-500 text-white';

  return (
    <Link href={`/tournaments/${t.id}`} className="group block h-full">
      <div className={`
        relative bg-white rounded-[2rem] overflow-hidden transition-all duration-300 h-full border border-slate-100
        ${isMainPage ? 'shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 hover:shadow-blue-100/50' : 'shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-100'}
      `}>
        {/* 1. 이미지 영역 */}
        <div className={`relative w-full bg-slate-100 overflow-hidden ${isMainPage ? 'aspect-[4/3]' : 'aspect-[16/9]'}`}>
          {t.image_url ? (
            <img src={t.image_url} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                <Trophy size={isMainPage ? 40 : 30} strokeWidth={1.5} />
                <span className="text-xs mt-2 font-medium">이미지 준비중</span>
            </div>
          )}
          {/* 상태 뱃지 (좌측 상단) */}
          <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${statusStyle}`}>
            {t.status}
          </span>
          {/* 그라데이션 오버레이 (텍스트 가독성용) */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
        </div>

        {/* 2. 텍스트 정보 영역 */}
        <div className={`p-6 ${isMainPage ? 'pt-5' : 'pt-5'}`}>
          {/* 레벨/타이틀 */}
          <div className="mb-3">
            <span className="inline-block text-[#3182F6] text-xs font-bold bg-blue-50 px-2.5 py-1 rounded-md mb-2">
                {t.level || '전체 레벨'}
            </span>
            <h3 className={`font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#3182F6] transition-colors ${isMainPage ? 'text-xl' : 'text-lg'}`}>
              {t.title}
            </h3>
          </div>

          {/* 정보 (날짜, 장소) */}
          <div className="space-y-2 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400 shrink-0"/>
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-slate-400 shrink-0"/>
              <span className="line-clamp-1">{t.location || '장소 미정'}</span>
            </div>
          </div>
          
          {/* 참가비 (있을 경우) */}
          {t.fee && (
             <div className="mt-5 pt-4 border-t border-slate-50 flex justify-end items-center">
                <span className="font-extrabold text-lg text-slate-900">{Number(t.fee.replace(/[^0-9]/g, '')).toLocaleString()}원~</span>
             </div>
          )}
        </div>
      </div>
    </Link>
  );
}