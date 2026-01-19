'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, ArrowLeft, MapPin, Calendar, Layers } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 데이터 가져오기 (최신 등록순)
  const fetchTournaments = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setTournaments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // 대회 삭제 기능
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? (복구 불가)')) return;

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('삭제되었습니다.');
      fetchTournaments(); // 목록 새로고침
    } catch (err: any) {
      alert('삭제 실패: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-5 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
              🎛️ 관리자 대시보드
            </h1>
            <p className="text-slate-500 text-sm">현재 등록된 대회 목록을 관리합니다.</p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => router.push('/')} 
               className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-bold shadow-sm"
             >
                <ArrowLeft size={16}/> 메인으로
             </button>
             <button 
               onClick={() => router.push('/admin/write')} // <--- [핵심] 아까 만든 등록 페이지로 이동
               className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 text-sm font-bold shadow-lg hover:-translate-y-0.5"
             >
                <Plus size={18}/> 새 대회 등록
             </button>
          </div>
        </div>

        {/* List Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                <tr>
                  <th className="p-4 w-20 text-center">포스터</th>
                  <th className="p-4">대회명 / 단체</th>
                  <th className="p-4">날짜 / 장소</th>
                  <th className="p-4">부서 / 코트</th>
                  <th className="p-4">상태</th>
                  <th className="p-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400">
                      데이터를 불러오는 중입니다...
                    </td>
                  </tr>
                )}
                
                {!loading && tournaments.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    {/* 1. 포스터 썸네일 */}
                    <td className="p-4 text-center">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 mx-auto relative">
                        {t.poster_url ? (
                          <img src={t.poster_url} alt="썸네일" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-300">No Img</div>
                        )}
                      </div>
                    </td>

                    {/* 2. 대회명 & 단체 */}
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-base mb-1">{t.title}</div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {t.organization}
                      </span>
                    </td>

                    {/* 3. 날짜 & 장소 */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                        <Calendar size={14} className="text-slate-400"/>
                        {t.start_date}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin size={14} className="text-slate-400"/>
                        {t.location}
                      </div>
                    </td>

                    {/* 4. 부서 & 코트 */}
                    <td className="p-4">
                       <div className="flex gap-1 flex-wrap">
                         <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600 border border-slate-200">
                           {t.division}
                         </span>
                         <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600 border border-slate-200">
                           {t.court_type === 'Hard' ? '하드' : t.court_type === 'Clay' ? '클레이' : '인조잔디'}
                         </span>
                       </div>
                    </td>

                    {/* 5. 상태 */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border 
                        ${t.status === '접수중' 
                          ? 'bg-blue-50 text-blue-600 border-blue-100' 
                          : t.status === '마감' 
                            ? 'bg-slate-100 text-slate-400 border-slate-200' 
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                        {t.status}
                      </span>
                    </td>

                    {/* 6. 삭제 버튼 */}
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        title="대회 삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!loading && tournaments.length === 0 && (
             <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400">
               <Layers size={48} className="mb-4 text-slate-200"/>
               <p>아직 등록된 대회가 없습니다.</p>
               <p className="text-sm mt-2">우측 상단 '새 대회 등록' 버튼을 눌러보세요!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
