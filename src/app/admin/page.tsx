'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/src/utils/supabase/client';
import { Plus, Trash2, MapPin, Calendar, ArrowLeft } from 'lucide-react';

export default function AdminDashboard() {
  const supabase = createClient();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 대회 목록 불러오기
  const fetchList = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false }); // 최신 등록순

    if (!error) setList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  // 삭제 핸들러
  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 대회를 삭제하시겠습니까? (되돌릴 수 없습니다)')) return;

    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      alert('삭제 권한이 없거나 오류가 발생했습니다 🚨');
    } else {
      alert('깔끔하게 삭제되었습니다 🗑️');
      // 화면에서도 즉시 제거
      setList(prev => prev.filter(item => item.id !== id));
    }
  };

  if (loading) return <div className="p-10 text-center">로딩중...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <Link href="/" className="text-slate-400 text-sm font-bold flex items-center gap-1 mb-2 hover:text-slate-600">
                    <ArrowLeft size={14}/> 메인으로
                </Link>
                <h1 className="text-2xl font-black text-slate-900">관리자 대시보드</h1>
                <p className="text-slate-500 text-sm">등록된 대회를 관리합니다.</p>
            </div>
            
            {/* 등록 버튼 */}
            <Link href="/admin/write" className="bg-[#3182F6] hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-200">
                <Plus size={20}/> 대회 등록하기
            </Link>
        </div>

        {/* 리스트 */}
        <div className="space-y-4">
            {list.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl text-center text-slate-400 border border-slate-200 border-dashed">
                    등록된 대회가 없습니다.
                </div>
            ) : (
                list.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                        
                        {/* 정보 영역 */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    item.status === 'recruiting' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {item.status === 'recruiting' ? '모집중' : '마감'}
                                </span>
                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                    <Calendar size={12}/> {item.date}
                                </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <MapPin size={12}/> {item.location}
                            </p>
                        </div>

                        {/* 액션 버튼 */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="삭제하기"
                            >
                                <Trash2 size={20}/>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
}