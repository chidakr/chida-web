'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import KakaoLoginBtn from './KakaoLoginBtn';

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-white w-full max-w-[480px] rounded-3xl shadow-2xl p-8 animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-800 transition-colors bg-slate-100 rounded-full"
          aria-label="닫기"
        >
          <X size={24} />
        </button>

        <div className="mt-4 mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
            반가워요! 👋
            <br />
            <span className="text-[#3182F6]">치다</span>에서 우승해볼까요?
          </h2>
          <p className="text-slate-500 text-lg">
            로그인하고 내 실력에 딱 맞는
            <br />
            대회를 추천받으세요.
          </p>
        </div>

        <div className="space-y-4">
          <KakaoLoginBtn />
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
          로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          <br />
          (치다는 여러분의 개인정보를 소중히 다룹니다 🔒)
        </p>
      </div>
    </div>
  );
}
