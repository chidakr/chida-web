'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, AlertCircle, Trash2 } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // 회원 탈퇴 핸들러
  const handleWithdraw = async () => {
    // 1. 진짜 탈퇴할 건지 물어봄 (브라우저 기본 confirm 창)
    if (!window.confirm('정말로 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      return;
    }

    setLoading(true);

    try {
      // 2. 탈퇴 API 호출 (우리가 만들 서버 API)
      const res = await fetch('/api/withdraw', {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('탈퇴 처리에 실패했습니다.');

      // 3. 로그아웃 처리 및 메인으로 추방
      await supabase.auth.signOut();
      alert('그동안 치다를 이용해주셔서 감사합니다.\n탈퇴가 완료되었습니다.');
      window.location.href = '/';
      
    } catch (error) {
      console.error(error);
      alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans">
      
      {/* 헤더 */}
      <header className="bg-white px-5 py-4 flex items-center gap-4 border-b border-slate-100 sticky top-0 z-10">
        <Link href="/mypage" className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors">
            <ChevronLeft size={24} className="text-slate-800"/>
        </Link>
        <h1 className="text-lg font-bold text-slate-900">개인정보 설정</h1>
      </header>

      <main className="max-w-md mx-auto p-5 space-y-8">
        
        {/* 안내 문구 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="font-bold text-lg mb-2">계정 관리</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
                회원 탈퇴 시 작성하신 프로필, 참가 내역, 구력 정보 등 모든 데이터가 즉시 삭제됩니다.
            </p>
        </div>

        {/* 데드존 (Danger Zone) */}
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 px-1">DANGER ZONE</h3>
            
            <button 
                onClick={handleWithdraw}
                disabled={loading}
                className="w-full bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex items-center justify-between group hover:bg-red-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <Trash2 size={20} className="text-red-500"/>
                    </div>
                    <div className="text-left">
                        <div className="font-bold text-red-600">회원 탈퇴</div>
                        <div className="text-xs text-red-400">계정을 영구적으로 삭제합니다</div>
                    </div>
                </div>
                <AlertCircle size={20} className="text-red-300 group-hover:text-red-500 transition-colors"/>
            </button>
        </div>

      </main>
    </div>
  );
}