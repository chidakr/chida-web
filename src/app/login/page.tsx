'use client';

import { KakaoLoginBtn } from '@/components/auth';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

// ... (아래 코드는 그대로 두시면 됩니다)

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col px-5 animate-fade-in">
      
      {/* 1. 상단 뒤로가기 버튼 */}
      <div className="h-16 flex items-center">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
      </div>

      {/* 2. 메인 문구 & 버튼 영역 */}
      <div className="flex-1 flex flex-col justify-center pb-20">
        <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-4 leading-snug">
              반가워요! 👋<br />
              <span className="text-[#3182F6]">치다</span>에서 우승해볼까요?
            </h1>
            <p className="text-slate-500 text-lg font-medium">
              로그인하고 내 실력에 딱 맞는<br/>
              대회를 추천받으세요.
            </p>
        </div>

        {/* 카카오 버튼 컴포넌트 삽입 */}
        <div className="space-y-4">
            <KakaoLoginBtn />
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-300">
          회원가입 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  );
}