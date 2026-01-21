'use client';

import { createClient } from '@/src/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // 입력받을 상태값들
  const [nickname, setNickname] = useState('');
  const [ntrp, setNtrp] = useState('2.5'); // 기본값

  const handleSubmit = async () => {
    setLoading(true);
    
    // 1. 현재 로그인된 유저 ID 가져오기
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('로그인 정보가 없습니다.');
      return;
    }

    // 2. DB에 저장 (public.users)
    const { error } = await supabase.from('users').insert({
      id: user.id,          // 필수: auth.users와 연결고리
      email: user.email,
      nickname: nickname,
      tennis_level: ntrp,
      marketing_agree: true, // 일단 동의 처리 (나중에 체크박스 추가)
    });

    if (error) {
      console.error(error);
      alert('저장에 실패했습니다.');
    } else {
      // 3. 저장 성공하면 메인으로 이동!
      alert('환영합니다! 가입이 완료되었습니다. 🎾');
      router.push('/');
      router.refresh(); // 헤더 상태 갱신
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12">
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          마지막 단계에요! 🚀
        </h1>
        <p className="text-slate-500 mb-8">
          치다 랭킹에 올라갈 프로필을 설정해주세요.
        </p>

        <div className="space-y-6">
          {/* 닉네임 입력 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="코트 위의 별명"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
            />
          </div>

          {/* 구력(NTRP) 선택 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              테니스 레벨 (NTRP)
            </label>
            <select
              value={ntrp}
              onChange={(e) => setNtrp(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3182F6] bg-white"
            >
              <option value="1.0">1.0 (입문자)</option>
              <option value="2.0">2.0 (초보자)</option>
              <option value="2.5">2.5 (랠리 가능)</option>
              <option value="3.0">3.0 (게임 가능)</option>
              <option value="4.0">4.0 (중상급자)</option>
              <option value="5.0">5.0 (선수급)</option>
            </select>
          </div>

          {/* 완료 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={loading || !nickname}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all ${
              loading || !nickname 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-[#3182F6] hover:bg-[#2563EB] shadow-lg active:scale-95'
            }`}
          >
            {loading ? '저장 중...' : '치다 시작하기'}
          </button>
        </div>
      </div>
    </div>
  );
}