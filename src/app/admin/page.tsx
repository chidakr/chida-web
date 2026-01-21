'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/src/utils/supabase/client';
import { Trash2, Plus, RefreshCw, MapPin, Calendar } from 'lucide-react';

export default function AdminPage() {
  const supabase = createClient();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 입력 폼 상태 (DB 컬럼과 일치시킴)
  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    date: '',
    location: '',
    level: '',
    status: '접수중',
    fee: '',
    image_url: '' // poster_url -> image_url로 변경
  });

  // 1. 대회 목록 불러오기
  const fetchTournaments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setTournaments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // 2. 대회 추가하기
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return alert('대회명과 날짜는 필수입니다!');

    const { error } = await supabase
      .from('tournaments')
      .insert([formData]);

    if (error) {
      alert('추가 실패: ' + error.message);
    } else {
      alert('대회가 추가되었습니다! 🎾');
      setFormData({ // 폼 초기화
        title: '', organizer: '', date: '', location: '', level: '', status: '접수중', fee: '', image_url: ''
      });
      fetchTournaments(); // 목록 새로고침
    }
  };

  // 3. 대회 삭제하기 (여기가 안 되던 부분!)
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) {
      alert('삭제 실패 (참가자가 있는 대회일 수 있습니다): ' + error.message);
    } else {
      alert('삭제되었습니다.');
      fetchTournaments();
    }
  };

  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          🛠️ 관리자 페이지 (대회 관리)
        </h1>

        {/* 1. 대회 등록 폼 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus size={20} className="text-[#3182F6]" /> 새 대회 등록
          </h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="title" placeholder="대회명 (예: 제1회 치다 오픈)" value={formData.title} onChange={handleChange} className="p-3 border rounded-xl" required />
            <input name="organizer" placeholder="주최 (예: 윌슨)" value={formData.organizer} onChange={handleChange} className="p-3 border rounded-xl" />
            <input name="date" placeholder="날짜 (예: 2026.03.01)" value={formData.date} onChange={handleChange} className="p-3 border rounded-xl" required />
            <input name="location" placeholder="장소 (예: 올림픽공원)" value={formData.location} onChange={handleChange} className="p-3 border rounded-xl" />
            <input name="level" placeholder="레벨 (예: 개나리부 / NTRP 3.0)" value={formData.level} onChange={handleChange} className="p-3 border rounded-xl" />
            <input name="fee" placeholder="참가비 (예: 50,000원)" value={formData.fee} onChange={handleChange} className="p-3 border rounded-xl" />
            <input name="image_url" placeholder="이미지 주소 (URL)" value={formData.image_url} onChange={handleChange} className="p-3 border rounded-xl md:col-span-2" />
            
            <select name="status" value={formData.status} onChange={handleChange} className="p-3 border rounded-xl bg-white">
              <option value="접수중">접수중</option>
              <option value="마감임박">마감임박</option>
              <option value="마감">마감</option>
              <option value="접수예정">접수예정</option>
            </select>

            <button type="submit" className="md:col-span-2 bg-[#3182F6] text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-colors">
              대회 등록하기
            </button>
          </form>
        </div>

        {/* 2. 대회 목록 리스트 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">등록된 대회 목록 ({tournaments.length})</h2>
            <button onClick={fetchTournaments} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><RefreshCw size={20} /></button>
          </div>

          <div className="space-y-4">
            {loading ? <div className="text-center py-10 text-slate-400">로딩 중...</div> : tournaments.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors bg-white">
                <div className="flex items-center gap-4">
                  {/* 이미지 썸네일 */}
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {t.image_url ? <img src={t.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">No Img</div>}
                  </div>
                  
                  {/* 텍스트 정보 */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold ${
                        t.status === '접수중' ? 'bg-blue-500' : 'bg-slate-500'
                      }`}>{t.status}</span>
                      <h3 className="font-bold text-slate-900">{t.title}</h3>
                    </div>
                    <div className="text-xs text-slate-500 flex gap-3">
                      <span className="flex items-center gap-1"><Calendar size={12}/> {t.date}</span>
                      <span className="flex items-center gap-1"><MapPin size={12}/> {t.location}</span>
                      <span>| {t.level}</span>
                    </div>
                  </div>
                </div>

                {/* 삭제 버튼 */}
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="삭제"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}