'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

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
      toast.error('로그인이 필요한 기능입니다 🔒');
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
      toast.success('북마크가 해제되었습니다');
    } else {
      await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, tournament_id: tournamentId });
      setIsBookmarked(true);
      toast.success('북마크에 저장되었습니다 ⭐');
    }
    setLoading(false);
  };

  // 스타일 variant
  const baseStyles = variant === 'outline'
    ? 'h-11 flex items-center justify-center gap-2 border rounded-lg font-bold text-sm transition-colors'
    : 'w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110 active:scale-95 backdrop-blur-sm';

  const activeStyles = variant === 'outline'
    ? isBookmarked
      ? 'border-blue-500 bg-blue-50 text-blue-600'
      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
    : isBookmarked
      ? 'bg-white/90 text-blue-600'
      : 'bg-white/70 text-slate-400 hover:text-slate-700 hover:bg-white/90';

  const iconSize = variant === 'outline' ? 16 : 18;

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
