'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Camera, ChevronRight, Trophy, Activity, Zap } from 'lucide-react';

export default function ProfileSetupPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 입력 받을 데이터 상태
  const [formData, setFormData] = useState({
    ntrp: '2.5',
    years: '',
    style: '올라운더',
    motto: '',
  });

  // 유저 정보 확인 (로그인 안했으면 튕겨내기)
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.replace('/login');
    }
    checkUser();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // 1. 프로필 테이블에 데이터 업데이트 (upsert)
      const { error } = await supabase
        .from('profiles') // ⚠️ 이 테이블이 있어야 합니다 (아래 SQL 참고)
        .upsert({
          id: user.id,
          ntrp: formData.ntrp,
          years: formData.years,
          style: formData.style,
          motto: formData.motto,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        alert('저장에 실패했습니다. 다시 시도해주세요.');
        console.error(error);
      } else {
        // 2. 저장 성공 시 -> '나의 플레이어 카드' 페이지로 이동!
        router.push('/my-card'); 
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* 헤더 */}
      <header className="p-5 flex items-center justify-center relative">
        <h1 className="font-bold text-lg">선수 등록</h1>
      </header>

      <main className="flex-1 px-6 pb-10 max-w-lg mx-auto w-full flex flex-col justify-center">
        
        <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-2">
                나만의 선수 카드를<br/>완성해주세요 🎾
            </h2>
            <p className="text-slate-500 text-sm">
                입력하신 정보를 바탕으로<br/>공식 플레이어 ID 카드가 발급됩니다.
            </p>
        </div>

        {/* 폼 입력 영역 */}
        <div className="space-y-6">
            
            {/* 1. NTRP 선택 */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    <Activity size={16} className="text-[#3182F6]"/> NTRP 레벨
                </label>
                <select 
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#3182F6] outline-none font-bold text-lg appearance-none"
                    value={formData.ntrp}
                    onChange={(e) => setFormData({...formData, ntrp: e.target.value})}
                >
                    <option value="1.0">1.0 (입문)</option>
                    <option value="2.0">2.0 (초보)</option>
                    <option value="2.5">2.5 (초중수)</option>
                    <option value="3.0">3.0 (중수)</option>
                    <option value="3.5">3.5 (중고수)</option>
                    <option value="4.0">4.0 (고수)</option>
                    <option value="4.5">4.5 (선수급)</option>
                    <option value="5.0">5.0 (프로급)</option>
                </select>
            </div>

            {/* 2. 구력 입력 */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    <Trophy size={16} className="text-yellow-500"/> 테니스 구력 (년)
                </label>
                <input 
                    type="number" 
                    placeholder="예: 3" 
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#3182F6] outline-none font-bold text-lg"
                    value={formData.years}
                    onChange={(e) => setFormData({...formData, years: e.target.value})}
                />
            </div>

            {/* 3. 플레이 스타일 */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    <Zap size={16} className="text-purple-500"/> 플레이 스타일
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {['올라운더', '베이스라이너', '서브앤발리', '발리러'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setFormData({...formData, style: s})}
                            className={`p-3 rounded-xl text-sm font-bold border transition-all
                                ${formData.style === s 
                                    ? 'bg-blue-50 border-[#3182F6] text-[#3182F6]' 
                                    : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. 한줄 각오 */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">카드에 들어갈 한줄 각오</label>
                <input 
                    type="text" 
                    placeholder="중요한 건 꺾이지 않는 마음" 
                    maxLength={20}
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#3182F6] outline-none font-medium"
                    value={formData.motto}
                    onChange={(e) => setFormData({...formData, motto: e.target.value})}
                />
                <div className="text-right text-xs text-slate-400">{formData.motto.length}/20</div>
            </div>

        </div>

        {/* 완료 버튼 */}
        <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-10 bg-[#3182F6] text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-blue-200 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
        >
            {loading ? '카드 발급중...' : '선수 등록 완료'}
        </button>

      </main>
    </div>
  );
}