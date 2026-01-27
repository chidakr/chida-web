'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Bookmark, Calendar, MapPin, Trash2 } from 'lucide-react';

export default function BookmarksPage() {
  const supabase = createClient();
  const [list, setList] = useState<import('@/types').BookmarkWithTournament[]>([]);
  const [loading, setLoading] = useState(true);

  // 데이터 불러오기
  const fetchBookmarks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // bookmarks 테이블과 tournaments 테이블을 조인(Join)해서 가져옴
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        tournaments (
          id, title, date, location, status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  // 북마크 삭제 함수 (여기서 바로 삭제 가능하게)
  const handleDelete = async (bookmarkId: string) => {
    if(!confirm('북마크를 해제하시겠습니까?')) return;
    
    await supabase.from('bookmarks').delete().eq('id', bookmarkId);
    // UI에서도 즉시 제거 (새로고침 없이)
    setList(prev => prev.filter(item => item.id !== bookmarkId));
  };

  if (loading) return <div className="text-center py-20 text-slate-400">로딩중...</div>;

  return (
    <div className="space-y-6">
       {/* 헤더 */}
       <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#3182F6]">
            <Bookmark size={20} fill="currentColor"/>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">내가 찜한 대회</h2>
            <p className="text-sm text-slate-500">관심 있는 대회를 모아뒀어요.</p>
          </div>
       </div>

       {/* 리스트 영역 */}
       {list.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
             <p className="text-slate-400 font-bold mb-2">저장된 대회가 없어요</p>
             <Link href="/tournaments" className="text-blue-500 text-sm underline font-bold">
                대회 둘러보러 가기
             </Link>
          </div>
       ) : (
          <div className="grid grid-cols-1 gap-4">
             {list.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-colors">
                    {/* 대회 정보 (클릭하면 상세페이지로) */}
                    <Link href={`/tournaments/${item.tournaments.id}`} className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.tournaments.status === 'recruiting' 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                                {item.tournaments.status === 'recruiting' ? '모집중' : '마감'}
                            </span>
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <Calendar size={12}/> {item.tournaments.date}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg truncate mb-1">
                            {item.tournaments.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin size={12}/> {item.tournaments.location}
                        </p>
                    </Link>

                    {/* 삭제 버튼 */}
                    <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        title="북마크 해제"
                    >
                        <Trash2 size={18}/>
                    </button>
                </div>
             ))}
          </div>
       )}
    </div>
  );
}