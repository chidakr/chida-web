'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  tournamentId: string;
  variant?: 'default' | 'outline';
}

export default function BookmarkButton({ tournamentId, variant = 'default' }: BookmarkButtonProps) {
  const supabase = createClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

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
  }, [tournamentId]);

  const toggleBookmark = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('로그인이 필요한 기능입니다 🔒');
      setLoading(false);
      return;
    }

    if (isBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('tournament_id', tournamentId);
      setIsBookmarked(false);
    } else {
      await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, tournament_id: tournamentId });
      setIsBookmarked(true);
    }
    setLoading(false);
  };

  // 스타일 variant
  const baseStyles = variant === 'outline'
    ? 'h-11 flex items-center justify-center gap-2 border rounded-lg font-bold text-sm transition-colors'
    : 'w-14 h-14 flex items-center justify-center border rounded-xl transition-all active:scale-95';

  const activeStyles = variant === 'outline'
    ? isBookmarked
      ? 'border-blue-500 bg-blue-50 text-blue-600'
      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
    : isBookmarked
      ? 'bg-blue-50 border-blue-200 text-[#3182F6]'
      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600';

  const iconSize = variant === 'outline' ? 16 : 24;

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`${baseStyles} ${activeStyles}`}
    >
      <Bookmark
        size={iconSize}
        fill={isBookmarked ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
      {variant === 'outline' && (isBookmarked ? '북마크됨' : '북마크')}
    </button>
  );
}
