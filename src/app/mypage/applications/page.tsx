'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { ChevronLeft, Calendar, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

type ParticipantWithTournament = import('@/types').Participant & {
  tournaments: {
    title: string;
    date: string;
    location: string;
    fee: number;
  };
};

export default function ApplicationsPage() {
  const supabase = createClient();
  const [list, setList] = useState<ParticipantWithTournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 내 신청 내역 + 대회 정보까지 한번에 가져오기 (Join)
      const { data, error } = await supabase
        .from('participants')
        .select(`
          *,
          tournaments (
            title,
            date,
            location,
            fee
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setList(data || []);
      }
      setLoading(false);
    }
    fetchApplications();
  }, [supabase]);

  if (loading) return <div className="min-h-screen bg-[#F9FAFB] pt-20 flex justify-center text-sm text-slate-400">내역 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans pb-20">
      
      {/* 헤더 */}
      <header className="bg-white px-5 py-4 flex items-center gap-4 border-b border-slate-100 sticky top-0 z-10">
        <Link href="/mypage" className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors">
            <ChevronLeft size={24} className="text-slate-800"/>
        </Link>
        <h1 className="text-lg font-bold text-slate-900">대회 신청 내역</h1>
      </header>

      <main className="max-w-md mx-auto p-5">
        
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Calendar size={24} className="text-slate-400"/>
            </div>
            <p className="text-slate-800 font-bold mb-1">아직 신청한 대회가 없어요</p>
            <p className="text-slate-500 text-sm mb-6">나에게 딱 맞는 대회를 찾아보세요!</p>
            <Link href="/tournaments" className="px-5 py-3 bg-[#3182F6] text-white font-bold rounded-xl text-sm hover:bg-blue-600 transition-colors">
                대회 보러가기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                {/* 상단: 상태 뱃지 & 날짜 */}
                <div className="flex justify-between items-start mb-3">
                    <StatusBadge status={item.status || 'pending'} />
                    <span className="text-xs font-bold text-slate-400">{item.tournaments.date}</span>
                </div>

                {/* 대회 제목 */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                    {item.tournaments.title}
                </h3>

                {/* 하단: 장소 & 가격 */}
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-4">
                    <div className="flex items-center gap-1">
                        <MapPin size={12}/> {item.tournaments.location}
                    </div>
                    <div className="w-px h-3 bg-slate-200"></div>
                    <div>
                        {item.tournaments.fee.toLocaleString()}원
                    </div>
                </div>

                {/* 입금 안내 (대기 상태일 때만 표시) */}
                {item.status === 'pending' && (
                    <div className="bg-slate-50 p-3 rounded-xl flex items-start gap-2 text-xs text-slate-600">
                        <AlertCircle size={14} className="text-[#3182F6] shrink-0 mt-0.5"/>
                        <div>
                            <span className="font-bold">입금 확인 중입니다.</span><br/>
                            카카오뱅크 3333-00-123456 (홍길동)
                        </div>
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// 상태 뱃지 컴포넌트
function StatusBadge({ status }: { status: string }) {
    if (status === 'confirmed') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-[#3182F6] text-xs font-bold rounded-md">
                <CheckCircle2 size={12}/> 참가 확정
            </span>
        );
    }
    if (status === 'cancelled') {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-md">
                취소됨
            </span>
        );
    }
    // Default: Pending
    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-600 text-xs font-bold rounded-md">
            입금 대기
        </span>
    );
}