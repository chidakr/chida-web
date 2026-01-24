'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function ApplyButton({ tournamentId }: { tournamentId: string }) {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'none' | 'pending' | 'confirmed'>('none');

  // 1. 내 신청 상태 확인 (페이지 들어오자마자)
  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('participants')
        .select('status')
        .eq('user_id', user.id)
        .eq('tournament_id', tournamentId)
        .single();

      if (data) setStatus(data.status as any);
    }
    checkStatus();
  }, [tournamentId, supabase]);

  // 2. 신청하기 버튼 클릭
  const handleApply = async () => {
    setLoading(true);
    
    // 로그인 체크
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('로그인이 필요합니다!');
      router.push('/login'); // 혹은 로그인 모달 띄우기
      return;
    }

    // 진짜 신청
    const { error } = await supabase
      .from('participants')
      .insert({
        user_id: user.id,
        tournament_id: tournamentId,
        status: 'pending' // 기본 상태: 입금 대기
      });

    if (error) {
      console.error(error);
      alert('신청 중 오류가 발생했습니다 😭');
    } else {
      alert('🎉 신청이 완료되었습니다! (입금 확인 후 확정됩니다)');
      setStatus('pending'); // 버튼 상태 변경
      router.refresh(); // 데이터 갱신
    }
    setLoading(false);
  };

  // 3. 버튼 UI 렌더링
  if (status === 'pending') {
    return (
      <button disabled className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-xl cursor-not-allowed">
        입금 확인 대기중 ⏳
      </button>
    );
  }

  if (status === 'confirmed') {
    return (
      <button disabled className="w-full py-4 bg-blue-50 text-[#3182F6] font-bold rounded-xl cursor-not-allowed">
        참가 확정됨 ✅
      </button>
    );
  }

  return (
    <button
      onClick={handleApply}
      disabled={loading}
      className="w-full py-4 bg-[#3182F6] text-white font-bold text-lg rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 active:scale-95"
    >
      {loading ? '처리중...' : '1초 만에 신청하기 🚀'}
    </button>
  );
}