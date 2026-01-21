'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import KakaoLoginBtn from './KakaoLoginBtn';

interface LoginModalProps {
  onClose: () => void; // 닫기 함수를 밖에서 받아옵니다.
}

export default function LoginModal({ onClose }: LoginModalProps) {
  // 모달이 떴을 때 뒷배경 스크롤 막기 (UX 향상)
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    // 1. 가장 바깥쪽 레이어 (전체 화면 덮기, 정중앙 정렬)
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      
      {/* 2. 어두운 배경 (Backdrop) - 클릭하면 닫힘 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* 3. 실제 로그인 하얀 박스 (Modal Window) */}
      <div className="relative bg-white w-full max-w-[480px] rounded-3xl shadow-2xl p-8 animate-scale-up">
        
        {/* 우측 상단 닫기 버튼 */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 transition-colors bg-slate-100 rounded-full"
        >
          <X size={24} />
        </button>

        <div className="mt-4 mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
            반가워요! 👋<br />
            <span className="text-[#3182F6]">치다</span>에서 우승해볼까요?
            </h2>
            <p className="text-slate-500 text-lg">
            로그인하고 내 실력에 딱 맞는<br/>
            대회를 추천받으세요.
            </p>
        </div>

        {/* 카카오 버튼 */}
        <div className="space-y-4">
            <KakaoLoginBtn />
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
          로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.<br/>
          (치다는 여러분의 개인정보를 소중히 다룹니다 🔒)
        </p>
      </div>
    </div>
  );
}