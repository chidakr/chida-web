'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Camera, Trophy, Activity, Zap, User, Quote, CheckCircle2 } from 'lucide-react';

export default function ProfileSetupPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 입력 받을 데이터 상태
  const [formData, setFormData] = useState({
    full_name: '', // 닉네임
    ntrp: '2.5',
    years: '',
    style: '올라운더',
    motto: '',
  });

  // 유저 정보 확인
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.replace('/login');
    }
    checkUser();
  }, [router, supabase]);

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.years) {
      alert('닉네임과 구력을 입력해주세요!');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          ntrp: formData.ntrp,
          years: formData.years,
          style: formData.style,
          motto: formData.motto || '오늘도 즐테!', // 각오 없으면 기본값
          updated_at: new Date().toISOString(),
        });

      if (error) {
        alert('저장에 실패했습니다. 다시 시도해주세요.');
        console.error(error);
      } else {
        // 저장 성공 시 -> '나의 플레이어 카드' 페이지로 이동해서 결과물 보여주기!
        router.push('/my-card'); 
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* 헤더 (심플하게) */}
      <header className="p-6 flex items-center justify-center border-b border-slate-50">
        <h1 className="font-bold text-slate-900">선수 등록</h1>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-10 pb-24 flex flex-col">
        
        {/* 타이틀 영역 */}
        <div className="mb-10">
            <span className="text-[#3182F6] font-bold text-sm tracking-wide mb-2 block animate-pulse">STEP 1. 프로필 작성</span>
            <h2 className="text-3xl font-black text-slate-900 mb-3 leading-tight">
                공식 선수로<br/>등록해 주세요 📝
            </h2>
            <p className="text-slate-500 text-sm">
                입력하신 정보를 바탕으로<br/>
                <span className="font-bold text-slate-700">공식 플레이어 ID 카드</span>가 즉시 발급됩니다.
            </p>
        </div>

        {/* 폼 입력 영역 */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 1. 닉네임 */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <User size={18} className="text-slate-400"/> 활동명 (실명 권장)
                </label>
                <input 
                    type="text" 
                    placeholder="예: 김테니스" 
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 focus:border-[#3182F6] focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none font-bold text-lg transition-all"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
            </div>

            {/* 2. NTRP & 구력 (한 줄에 배치) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Activity size={18} className="text-[#3182F6]"/> NTRP
                    </label>
                    <div className="relative">
                        <select 
                            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 focus:border-[#3182F6] outline-none font-bold text-lg appearance-none"
                            value={formData.ntrp}
                            onChange={(e) => setFormData({...formData, ntrp: e.target.value})}
                        >
                            <option value="1.0">1.0 (입문)</option>
                            <option value="2.0">2.0 (초보)</option>
                            <option value="2.5">2.5 (초중수)</option>
                            <option value="3.0">3.0 (중수)</option>
                            <option value="3.5">3.5 (고수)</option>
                            <option value="4.0">4.0 (선수급)</option>
                            <option value="4.5">4.5 (코치급)</option>
                            <option value="5.0">5.0 (프로)</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <Trophy size={18} className="text-yellow-500"/> 구력 (년)
                    </label>
                    <input 
                        type="number" 
                        placeholder="숫자만" 
                        className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 focus:border-[#3182F6] outline-none font-bold text-lg"
                        value={formData.years}
                        onChange={(e) => setFormData({...formData, years: e.target.value})}
                    />
                </div>
            </div>

            {/* 3. 플레이 스타일 */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Zap size={18} className="text-purple-500"/> 플레이 스타일
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {['올라운더', '베이스라이너', '서브앤발리', '발리러'].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setFormData({...formData, style: s})}
                            className={`p-3 rounded-xl text-sm font-bold border transition-all relative overflow-hidden
                                ${formData.style === s 
                                    ? 'bg-blue-50 border-[#3182F6] text-[#3182F6] shadow-sm' 
                                    : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                        >
                            {formData.style === s && <CheckCircle2 size={14} className="absolute top-2 right-2 text-[#3182F6]"/>}
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. 한줄 각오 */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Quote size={18} className="text-slate-400"/> 카드에 적힐 한마디
                </label>
                <input 
                    type="text" 
                    placeholder="중요한 건 꺾이지 않는 마음" 
                    maxLength={20}
                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 focus:border-[#3182F6] outline-none font-medium"
                    value={formData.motto}
                    onChange={(e) => setFormData({...formData, motto: e.target.value})}
                />
                <div className="text-right text-xs text-slate-400 font-medium">{formData.motto.length}/20</div>
            </div>

        </div>

        {/* 완료 버튼 (하단 고정 느낌) */}
        <div className="mt-auto pt-10">
            <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#3182F6] text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-blue-200 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
                {loading ? '등록 중입니다...' : '선수 등록 완료하기'}
            </button>
        </div>

      </main>
    </div>
  );
}