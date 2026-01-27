'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ExternalLink } from 'lucide-react';

export default function ApplyButton({
  tournamentId,
  url,
}: {
  tournamentId: string;
  url?: string;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLink = async () => {
    if (!url) {
      alert('신청 링크가 등록되지 않은 대회입니다 😭\n주최측에 문의해주세요.');
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('participants').upsert(
        {
          user_id: user.id,
          tournament_id: tournamentId,
          status: 'pending',
        },
        { onConflict: 'user_id,tournament_id' }
      );
    }

    window.open(url, '_blank');
    setLoading(false);
  };

  return (
    <button
      onClick={handleLink}
      disabled={loading}
      className="w-full py-4 bg-[#3182F6] text-white font-bold text-lg rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
    >
      {loading ? (
        '이동 중...'
      ) : (
        <>
          공식 홈페이지에서 신청하기 <ExternalLink size={20} />
        </>
      )}
    </button>
  );
}
