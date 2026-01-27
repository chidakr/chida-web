'use client';

import { createClient } from '@/utils/supabase/client';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function KakaoLoginBtn() {
  const supabase = createClient();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Login error:', error);
      toast.error('로그인 연결 실패! 다시 시도해주세요.');
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#000000] py-4 rounded-2xl font-semibold text-lg hover:bg-[#FDD835] transition-all shadow-sm active:scale-95"
    >
      <MessageCircle className="fill-black border-none" size={24} />
      카카오로 3초 만에 시작하기
    </button>
  );
}
