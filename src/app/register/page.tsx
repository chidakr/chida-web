'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Camera } from 'lucide-react';

export default function RegisterTournament() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 입력 받을 데이터들
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    location: '',
    division: '신인부', // 기본값
    court_type: 'Hard', // DB엔 영어로 저장
    fee: '',
    contact: '',
    description: '' // 상세 내용(주차 등)
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // 1. 필수값 체크
    if (!formData.title || !formData.start_date || !formData.location) {
      alert('대회명, 날짜, 장소는 필수입니다!');
      setLoading(false);
      return;
    }

    try {
      // 2. Supabase에 저장 (DB엔 영어로, 화면엔 한글로 처리할 예정)
      const { error } = await supabase
        .from('tournaments')
        .insert([
          {
            title: formData.title,
            start_date: formData.start_date,
            location: formData.location,
            division: formData.division,
            court_type: formData.court_type,
            fee: formData.fee ? parseInt(formData.fee) : 0,
            parking_desc: formData.description,
            status: '접수중',
            organization: 'Club' // 직접 등록은 일단 클럽 대회로 간주
          }
        ]);

      if (error) throw error;

      alert('대회가 성공적으로 등록되었습니다! 🔥');
      router.push('/'); // 메인으로 이동
    } catch (error) {
      console.error(error);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 h-14 flex items-center px-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg ml-2">대회/모임 개설하기</h1>
      </header>

      <main className="max-w-md mx-auto px-5 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 대회명 */}
          <div>
            <label className="block text-sm font-bold mb-2">대회명 (모임명)</label>
            <input 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="예: 제1회 치다 클럽 교류전" 
              className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-black outline-none transition-all"
            />
          </div>

          {/* 날짜 & 시간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">날짜</label>
              <input 
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">참가비(팀당)</label>
              <input 
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                placeholder="0"
                className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none"
              />
            </div>
          </div>

          {/* 장소 & 코트 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">장소</label>
              <input 
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="예: 올림픽공원"
                className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none"
              />
            </div>
            <div>
               <label className="block text-sm font-bold mb-2">코트 종류</label>
               <select 
                 name="court_type"
                 value={formData.court_type}
                 onChange={handleChange}
                 className="w-full p-4 bg-slate-50 rounded-xl border-none outline-none appearance-none"
               >
                 <option value="Hard">하드코트</option>
                 <option value="Clay">클레이</option>
                 <option value="Omni">인조잔디</option>
               </select>
            </div>
          </div>

          {/* 부서 선택 */}
          <div>
            <label className="block text-sm font-bold mb-2">모집 부서</label>
            <div className="flex gap-2 flex-wrap">
              {['신인부', '오픈부', '개나리', '국화부', '혼복', '이벤트'].map((div) => (
                <button
                  key={div}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, division: div }))}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all
                    ${formData.division === div 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-slate-400 border-slate-200'}`}
                >
                  {div}
                </button>
              ))}
            </div>
          </div>

          {/* 상세 내용 */}
          <div>
             <label className="block text-sm font-bold mb-2">추가 정보 (주차, 연락처 등)</label>
             <textarea 
               name="description"
               value={formData.description}
               onChange={handleChange}
               rows={4}
               placeholder="주차 가능 여부, 문의 오픈채팅방 링크 등을 적어주세요."
               className="w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-black outline-none resize-none"
             />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white h-14 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 transition-colors disabled:bg-slate-300"
          >
            {loading ? '등록 중...' : '대회 등록 완료'}
          </button>

        </form>
      </main>
    </div>
  );
}