'use client';

import React, { useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { ExternalLink } from 'lucide-react';

export default function ApplyButton({ tournamentId, url }: { tournamentId: string, url?: string }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    // 1. 링크가 없으면 경고
    if (!url) {
        alert('신청 링크가 등록되지 않은 대회입니다 😭\n주최측에 문의해주세요.');
        return;
    }

    setLoading(true);

    // 2. 로그인 유저 체크
    const { data: { user } } = await supabase.auth.getUser();

    // 3. (옵션) 로그인했다면 '참가/관심 내역'에 기록 남기기
    // 이걸 남겨야 마이페이지 '신청 내역'에서 "아 맞다, 나 이거 보러 갔었지" 하고 확인 가능함
    if (user) {
        // 이미 기록 있는지 확인 안 하고 그냥 insert (중복 무시 or upsert)
        // 여기서는 간단하게 "기록 시도"만 하고 에러나도 링크는 띄워줌
        await supabase.from('participants').upsert({
            user_id: user.id,
            tournament_id: tournamentId,
            status: 'pending' // '외부이동' 상태로 관리하면 좋지만 일단 pending
        }, { onConflict: 'user_id, tournament_id' });
    }

    // 4. 외부 사이트로 납치(!) 🛸
    window.open(url, '_blank');
    setLoading(false);
  };

  return (
    <button
      onClick={handleLink}
      disabled={loading}
      className="w-full py-4 bg-[#3182F6] text-white font-bold text-lg rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
    >
      {loading ? '이동 중...' : (
          <>
            공식 홈페이지에서 신청하기 <ExternalLink size={20}/>
          </>
      )}
    </button>
  );
}