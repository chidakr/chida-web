'use client';

// 🔴 기존 (에러남): import { createClient } from '@/utils/supabase/client';
// 🟢 수정 (해결됨): 점(.)으로 직접 찾아갑니다.
import { createClient } from '../../utils/supabase/client'; 

// 혹시 utils 폴더가 src 바로 밑에 있다면 위 코드가 맞습니다.
import { MessageCircle } from 'lucide-react'; 

export default function KakaoLoginBtn() {
  const supabase = createClient();
  // ... (나머지 코드는 그대로)

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
      alert('로그인 연결 실패! 다시 시도해주세요.');
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