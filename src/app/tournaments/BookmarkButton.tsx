'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { Bookmark } from 'lucide-react'; // 👈 하트 대신 북마크 아이콘 사용

export default function BookmarkButton({ tournamentId }: { tournamentId: string }) {
  const supabase = createClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. 초기 상태 확인 (이미 북마크 했는지?)
  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('tournament_id', tournamentId)
        .maybeSingle();

      if (data) setIsBookmarked(true);
    }
    checkStatus();
  }, [tournamentId, supabase]);

  // 2. 버튼 클릭 핸들러 (토글)
  const toggleBookmark = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('로그인이 필요한 기능입니다 🔒');
      setLoading(false);
      return;
    }

    if (isBookmarked) {
      // 삭제 (해제)
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('tournament_id', tournamentId);
      setIsBookmarked(false);
    } else {
      // 추가 (저장)
      await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, tournament_id: tournamentId });
      setIsBookmarked(true);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={toggleBookmark}
      disabled={loading}
      className={`w-14 h-14 flex items-center justify-center border rounded-xl transition-all active:scale-95 ${
        isBookmarked 
          ? 'bg-blue-50 border-blue-200 text-[#3182F6]' // 저장됐을 때: 파란색 배경
          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600' // 안 됐을 때: 회색
      }`}
    >
      {/* fill 속성으로 아이콘 색칠하기 */}
      <Bookmark 
        size={24} 
        fill={isBookmarked ? "currentColor" : "none"} 
        strokeWidth={2}
      />
    </button>
  );
}